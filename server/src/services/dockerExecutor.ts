import Docker from 'dockerode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Language } from '../models/Submission';
import { getLanguageConfig } from './languageConfig';

const docker = new Docker();

export interface ExecutionResult {
    success: boolean;
    output?: string;
    error?: string;
    runtime?: number; // in ms
    memory?: number; // in KB
    verdict: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
}

/**
 * Execute code in Docker container
 */
export const executeCode = async (
    code: string,
    language: Language,
    input: string,
    timeLimit: number, // in ms
    memoryLimit: number // in MB
): Promise<ExecutionResult> => {
    const startTime = Date.now();
    const config = getLanguageConfig(language);
    const workDir = path.join(__dirname, '../../temp', `exec_${Date.now()}_${Math.random()}`);

    try {
        // Create working directory
        await fs.mkdir(workDir, { recursive: true });

        // Write code to file
        const fileName = language === 'java' ? 'Main' + config.extension : 'program' + config.extension;
        const codePath = path.join(workDir, fileName);
        await fs.writeFile(codePath, code);

        // Write input to file
        const inputPath = path.join(workDir, 'input.txt');
        await fs.writeFile(inputPath, input);

        // Pull Docker image if not exists
        try {
            await docker.getImage(config.dockerImage).inspect();
        } catch {
            console.log(`Pulling image ${config.dockerImage}...`);
            await new Promise((resolve, reject) => {
                docker.pull(config.dockerImage, (err: any, stream: any) => {
                    if (err) return reject(err);
                    docker.modem.followProgress(stream, (err: any) => {
                        if (err) return reject(err);
                        resolve(true);
                    });
                });
            });
        }

        // Create container
        const container = await docker.createContainer({
            Image: config.dockerImage,
            Cmd: ['/bin/sh', '-c', ''],
            WorkingDir: '/code',
            HostConfig: {
                Binds: [`${workDir}:/code`],
                Memory: memoryLimit * 1024 * 1024, // Convert MB to bytes
                NanoCpus: 1000000000, // 1 CPU
                NetworkMode: 'none', // No network access for security
            },
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
        });

        // Compilation phase (if needed)
        if (config.compiled && config.compileCmd) {
            await container.start();
            const execCompile = await container.exec({
                Cmd: ['/bin/sh', '-c', config.compileCmd],
                AttachStdout: true,
                AttachStderr: true,
            });

            const compileStream = await execCompile.start({ hijack: true, stdin: false });
            const compileOutput = await new Promise<string>((resolve) => {
                let output = '';
                compileStream.on('data', (chunk: Buffer) => {
                    output += chunk.toString();
                });
                compileStream.on('end', () => resolve(output));
            });

            const compileInspect = await execCompile.inspect();
            if (compileInspect.ExitCode !== 0) {
                await container.stop();
                await container.remove();
                await fs.rm(workDir, { recursive: true, force: true });
                return {
                    success: false,
                    error: compileOutput,
                    verdict: 'CE',
                };
            }

            await container.stop();
            await container.remove();

            // Create new container for execution
            const execContainer = await docker.createContainer({
                Image: config.dockerImage,
                Cmd: ['/bin/sh', '-c', `${config.runCmd} < input.txt`],
                WorkingDir: '/code',
                HostConfig: {
                    Binds: [`${workDir}:/code`],
                    Memory: memoryLimit * 1024 * 1024,
                    NanoCpus: 1000000000,
                    NetworkMode: 'none',
                },
                AttachStdout: true,
                AttachStderr: true,
            });

            await execContainer.start();

            // Wait for execution with timeout
            const execPromise = execContainer.wait();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TLE')), timeLimit)
            );

            try {
                await Promise.race([execPromise, timeoutPromise]);
            } catch (error: any) {
                if (error.message === 'TLE') {
                    await execContainer.kill();
                    await execContainer.remove();
                    await fs.rm(workDir, { recursive: true, force: true });
                    return {
                        success: false,
                        verdict: 'TLE',
                        runtime: timeLimit,
                    };
                }
                throw error;
            }

            // Get output
            const logs = await execContainer.logs({ stdout: true, stderr: true });
            const output = logs.toString();

            // Get stats
            const stats = await execContainer.stats({ stream: false });
            const memory = Math.round((stats.memory_stats.usage || 0) / 1024); // Convert to KB

            const runtime = Date.now() - startTime;

            // Check runtime
            const containerInfo = await execContainer.inspect();
            const exitCode = containerInfo.State.ExitCode;

            await execContainer.remove();
            await fs.rm(workDir, { recursive: true, force: true });

            if (exitCode !== 0) {
                return {
                    success: false,
                    error: output,
                    verdict: 'RE',
                    runtime,
                    memory,
                };
            }

            return {
                success: true,
                output: output.trim(),
                verdict: 'AC',
                runtime,
                memory,
            };
        } else {
            // For interpreted languages (no compilation)
            await container.start();

            const execRun = await container.exec({
                Cmd: ['/bin/sh', '-c', `${config.runCmd} < input.txt`],
                AttachStdout: true,
                AttachStderr: true,
            });

            const runStream = await execRun.start({ hijack: true, stdin: false });

            // Wait for execution with timeout
            const outputPromise = new Promise<string>((resolve) => {
                let output = '';
                runStream.on('data', (chunk: Buffer) => {
                    output += chunk.toString();
                });
                runStream.on('end', () => resolve(output));
            });

            const timeoutPromise = new Promise<string>((_, reject) =>
                setTimeout(() => reject(new Error('TLE')), timeLimit)
            );

            let output: string;
            try {
                output = await Promise.race([outputPromise, timeoutPromise]);
            } catch (error: any) {
                if (error.message === 'TLE') {
                    await container.kill();
                    await container.remove();
                    await fs.rm(workDir, { recursive: true, force: true });
                    return {
                        success: false,
                        verdict: 'TLE',
                        runtime: timeLimit,
                    };
                }
                throw error;
            }

            const runtime = Date.now() - startTime;
            const stats = await container.stats({ stream: false });
            const memory = Math.round((stats.memory_stats.usage || 0) / 1024);

            const runInspect = await execRun.inspect();
            await container.stop();
            await container.remove();
            await fs.rm(workDir, { recursive: true, force: true });

            if (runInspect.ExitCode !== 0) {
                return {
                    success: false,
                    error: output,
                    verdict: 'RE',
                    runtime,
                    memory,
                };
            }

            return {
                success: true,
                output: output.trim(),
                verdict: 'AC',
                runtime,
                memory,
            };
        }
    } catch (error: any) {
        console.error('Docker execution error:', error);

        // Cleanup
        try {
            await fs.rm(workDir, { recursive: true, force: true });
        } catch { }

        return {
            success: false,
            error: error.message,
            verdict: 'RE',
        };
    }
};

export default { executeCode };
