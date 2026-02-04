import { Language } from '../models/Submission';

export interface LanguageConfig {
    dockerImage: string;
    extension: string;
    compileCmd?: string;
    runCmd: string;
    compiled: boolean;
}

export const languageConfigs: Record<Language, LanguageConfig> = {
    c: {
        dockerImage: 'gcc:latest',
        extension: '.c',
        compileCmd: 'gcc -o program program.c -std=c11 -O2 -Wall -Wextra',
        runCmd: './program',
        compiled: true,
    },
    cpp: {
        dockerImage: 'gcc:latest',
        extension: '.cpp',
        compileCmd: 'g++ -o program program.cpp -std=c++17 -O2 -Wall -Wextra',
        runCmd: './program',
        compiled: true,
    },
    python: {
        dockerImage: 'python:3.11-slim',
        extension: '.py',
        runCmd: 'python3 program.py',
        compiled: false,
    },
    java: {
        dockerImage: 'openjdk:17-slim',
        extension: '.java',
        compileCmd: 'javac Main.java',
        runCmd: 'java Main',
        compiled: true,
    },
    javascript: {
        dockerImage: 'node:18-slim',
        extension: '.js',
        runCmd: 'node program.js',
        compiled: false,
    },
    typescript: {
        dockerImage: 'node:18-slim',
        extension: '.ts',
        compileCmd: 'npx tsc program.ts --lib es2015',
        runCmd: 'node program.js',
        compiled: true,
    },
    go: {
        dockerImage: 'golang:1.21-alpine',
        extension: '.go',
        compileCmd: 'go build -o program program.go',
        runCmd: './program',
        compiled: true,
    },
    rust: {
        dockerImage: 'rust:1.75-slim',
        extension: '.rs',
        compileCmd: 'rustc -O program.rs',
        runCmd: './program',
        compiled: true,
    },
};

export const getLanguageConfig = (language: Language): LanguageConfig => {
    const config = languageConfigs[language];
    if (!config) {
        throw new Error(`Unsupported language: ${language}`);
    }
    return config;
};

export default languageConfigs;
