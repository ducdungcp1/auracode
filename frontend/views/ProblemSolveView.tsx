
import React, { useState, useEffect, useRef } from 'react';
import { Problem } from '../types';
import { locales } from '../locales';
import { GoogleGenAI, Type } from "@google/genai";

interface TestCaseResult {
  id: number;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Compilation Error' | 'Runtime Error';
  runtime: string;
  memory: string;
  stdout?: string;
  stderr?: string;
  expected?: string;
}

interface ProblemSolveViewProps {
  problem: Problem;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  onBack: () => void;
}

export const ProblemSolveView: React.FC<ProblemSolveViewProps> = ({ problem, theme, language, onBack }) => {
  const [code, setCode] = useState(`#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    if (cin >> a >> b) {\n        cout << a + b << endl;\n    }\n    return 0;\n}`);
  const [languageName, setLanguageName] = useState('C++');
  const [isJudging, setIsJudging] = useState(false);
  const [judgingProgress, setJudgingProgress] = useState(0);
  const [results, setResults] = useState<TestCaseResult[] | null>(null);
  const [compilationLog, setCompilationLog] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState<string>(problem.description);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const t = locales[language].solve;
  const isLight = theme === 'light';

  useEffect(() => {
    if (language === 'vi' && problem.description) {
      const translateDescription = async () => {
        setIsTranslating(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Dịch nội dung bài tập lập trình này sang tiếng Việt, giữ nguyên các thuật ngữ kỹ thuật: \n\n${problem.description}`,
          });
          setTranslatedDesc(response.text || problem.description);
        } catch (e) {
          console.error("Translation error", e);
        } finally {
          setIsTranslating(false);
        }
      };
      translateDescription();
    } else {
      setTranslatedDesc(problem.description);
    }
  }, [language, problem.description]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runJudge = async () => {
    if (isJudging) return;
    
    setIsJudging(true);
    setResults([]);
    setLogs([]);
    setCompilationLog(null);
    setJudgingProgress(0);
    
    addLog("System: Connecting to Virtual Sandbox...");
    addLog(`System: Initializing ${languageName} environment...`);

    const timeoutId = setTimeout(() => {
      addLog("System: Connection interrupted - Request timed out.");
      setIsJudging(false);
    }, 30000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `ACT AS A REAL ONLINE JUDGE SYSTEM. 
        Evaluate this solution for problem: "${problem.title}".
        Problem description: ${problem.description}
        Limits: Time ${problem.timeLimit}, Memory ${problem.memoryLimit}
        Code (${languageName}):
        ${code}
        
        TASK:
        1. Perform strict compilation. If fails, return "Compilation Error" and detailed compiler output.
        2. Run 5 test cases. If code logic is wrong, return "Wrong Answer".
        3. If execution likely exceeds ${problem.timeLimit} (e.g., infinite loop, inefficient complexity O(N^2) for N=10^5), return "Time Limit Exceeded".
        4. Provide stdout and stderr for each case. 
        5. Return ONLY JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              compiler_output: { type: Type.STRING },
              testCases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    status: { type: Type.STRING },
                    runtime: { type: Type.STRING },
                    memory: { type: Type.STRING },
                    stdout: { type: Type.STRING },
                    stderr: { type: Type.STRING },
                    expected: { type: Type.STRING }
                  },
                  required: ["id", "status", "runtime", "memory"]
                }
              }
            },
            required: ["status", "testCases"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      
      if (data.compiler_output) {
        setCompilationLog(data.compiler_output);
        addLog("Compiler: " + (data.status === 'Compilation Error' ? "Failed" : "Success"));
      }

      if (data.status === 'Compilation Error') {
        setResults([{ id: 1, status: 'Compilation Error', runtime: '0ms', memory: '0MB' }]);
        setIsJudging(false);
        return;
      }

      const testCases: TestCaseResult[] = data.testCases || [];
      for (let i = 0; i < testCases.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        setResults(prev => [...(prev || []), testCases[i]]);
        setJudgingProgress(((i + 1) / testCases.length) * 100);
        addLog(`Executing TC #${testCases[i].id}: ${testCases[i].status}`);
      }
    } catch (error) {
      addLog("Fatal: Judge Engine disconnected.");
      setResults([{ id: 1, status: 'Runtime Error', runtime: '0ms', memory: '0MB' }]);
    } finally {
      clearTimeout(timeoutId);
      setIsJudging(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'text-emerald-500';
      case 'Wrong Answer': return 'text-rose-500';
      case 'Time Limit Exceeded': return 'text-amber-500';
      case 'Memory Limit Exceeded': return 'text-orange-500';
      case 'Compilation Error': return 'text-sky-500';
      default: return 'text-gray-400';
    }
  };

  const getFinalVerdict = () => {
    if (!results || results.length === 0) return null;
    const failedCase = results.find(r => r.status !== 'Accepted');
    if (failedCase) return failedCase;
    if (results.length === 5) return { status: 'Accepted' as const };
    return null;
  };

  const verdict = getFinalVerdict();

  return (
    <div className={`flex h-full transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-transparent'}`}>
      {/* Left Panel */}
      <div className={`w-1/2 flex flex-col border-r ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
        <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="text-[10px] font-black text-gray-400 hover:text-current transition-all uppercase tracking-[0.2em] flex items-center gap-2 group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> {t.return}
            </button>
            <div className="flex gap-4">
              <div className="text-right">
                 <p className="text-[8px] font-black opacity-30 uppercase">{t.timeLimit}</p>
                 <p className="text-[10px] font-bold">{problem.timeLimit}</p>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-black opacity-30 uppercase">{t.memLimit}</p>
                 <p className="text-[10px] font-bold">{problem.memoryLimit}</p>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-black tracking-tighter mb-4">{problem.title}</h1>
          <div className={`prose prose-sm max-w-none font-medium mb-12 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            {isTranslating ? <div className="animate-pulse text-[10px] font-black uppercase opacity-40">Translating...</div> : <p className="text-lg leading-relaxed whitespace-pre-wrap">{translatedDesc}</p>}
          </div>

          <div className="space-y-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t.examples}</h2>
            {problem.samples.map((s, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-30">{t.input}</p>
                  <pre className={`p-4 rounded-xl font-mono text-xs overflow-x-auto ${isLight ? 'bg-gray-50 border border-gray-100' : 'bg-white/5 border border-white/5'}`}>{s.input}</pre>
                </div>
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-30">{t.output}</p>
                  <pre className={`p-4 rounded-xl font-mono text-xs overflow-x-auto ${isLight ? 'bg-gray-50 border border-gray-100' : 'bg-white/5 border border-white/5'}`}>{s.output}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={`w-1/2 flex flex-col ${isLight ? 'bg-white' : 'bg-[#050505]'}`}>
        <div className={`h-14 border-b flex items-center justify-between px-8 flex-shrink-0 ${isLight ? 'bg-gray-50 border-gray-100' : 'bg-[#0a0a0a] border-white/5'}`}>
          <div className="relative">
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-current/5 text-[10px] font-black uppercase tracking-widest transition-all">
              {languageName}
            </button>
            {isLangOpen && (
              <div className={`absolute top-full left-0 mt-2 w-40 rounded-xl shadow-2xl py-2 z-50 border animate-fadeInScale ${isLight ? 'bg-white border-gray-100' : 'bg-zinc-900 border-white/10'}`}>
                {['C++', 'C', 'Python 3', 'Java', 'Pascal'].map(lang => (
                  <button key={lang} onClick={() => { setLanguageName(lang); setIsLangOpen(false); }} className="w-full px-5 py-2.5 text-left text-[10px] font-black uppercase tracking-widest hover:bg-current/5 transition-colors">
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col relative">
          <textarea
            className={`w-full h-full bg-transparent font-mono text-sm p-10 focus:outline-none resize-none leading-relaxed custom-scrollbar ${isLight ? 'text-gray-800' : 'text-gray-300'}`}
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {/* New Integrated Console Output */}
          {(isJudging || results || compilationLog) && (
            <div className={`w-full max-h-[60%] overflow-y-auto border-t transition-all duration-300 custom-scrollbar ${isLight ? 'bg-white border-gray-200 shadow-2xl' : 'bg-black border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]'}`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Judgement Console</span>
                  {isJudging && <div className="text-[10px] font-black text-sky-500 animate-pulse">Processing... {Math.round(judgingProgress)}%</div>}
                </div>

                {compilationLog && (
                  <div className={`mb-6 p-4 rounded-xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed border max-h-48 overflow-y-auto custom-scrollbar ${isLight ? 'bg-gray-50 text-gray-600 border-gray-100' : 'bg-[#121212] text-white/50 border-white/5'}`}>
                    <span className="text-sky-500 font-black mb-2 block uppercase tracking-widest text-[9px]">Compiler Output:</span>
                    {compilationLog}
                  </div>
                )}

                {results && results.length > 0 && (
                  <div className="space-y-4">
                    {results.map((r) => (
                      <div key={r.id} className={`p-4 rounded-xl border animate-fadeIn ${isLight ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex justify-between items-center mb-3">
                           <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Case #{r.id}</span>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(r.status)}`}>{r.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                           <div className="overflow-hidden">
                              <p className="text-[8px] font-black opacity-30 uppercase mb-1">Stdout</p>
                              <div className="max-h-24 overflow-y-auto custom-scrollbar">
                                <pre className="text-[11px] font-mono opacity-80 whitespace-pre-wrap">{r.stdout || ' '}</pre>
                              </div>
                           </div>
                           <div className="overflow-hidden">
                              <p className="text-[8px] font-black opacity-30 uppercase mb-1">Stderr</p>
                              <div className="max-h-24 overflow-y-auto custom-scrollbar">
                                <pre className="text-[11px] font-mono text-rose-400 whitespace-pre-wrap">{r.stderr || ' '}</pre>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-4 border-t border-current/5 pt-2">
                           <span className="text-[9px] font-black opacity-30">{r.runtime}</span>
                           <span className="text-[9px] font-black opacity-30">{r.memory}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isJudging && verdict && (
                  <div className="mt-8 p-6 text-center border-t border-current/5 animate-fadeInScale">
                    <h3 className={`text-4xl font-black tracking-tighter uppercase mb-2 ${getStatusColor(verdict.status)}`}>
                      {verdict.status}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                      {verdict.status === 'Accepted' ? 'Solution passed all test scenarios.' : `Evaluation stopped at Case #${(verdict as any).id || 1}.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`h-20 border-t flex items-center justify-between px-10 flex-shrink-0 ${isLight ? 'bg-gray-50 border-gray-100' : 'bg-[#0a0a0a] border-white/5'}`}>
          <button 
            onClick={() => { setResults(null); setCompilationLog(null); setLogs([]); setJudgingProgress(0); }}
            className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            Clear Environment
          </button>
          <div className="flex gap-4">
            <button className="text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all hover:bg-current/5">
              Run Sample Cases
            </button>
            <button 
              onClick={runJudge}
              disabled={isJudging}
              className={`px-10 py-4 font-black rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl ${isLight ? 'bg-black text-white' : 'bg-white text-black shadow-white/10'} ${isJudging ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
              {isJudging ? 'Evaluating...' : 'Submit Solution'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
