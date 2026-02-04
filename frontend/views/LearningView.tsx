
import React, { useState } from 'react';
import { Material, Problem } from '../types';
import { MOCK_MATERIALS, MOCK_PROBLEMS } from '../constants';
import { locales } from '../locales';
import { GoogleGenAI } from "@google/genai";

interface LearningViewProps {
  onProblemClick: (p: Problem) => void;
  language: 'vi' | 'en';
  theme: 'light' | 'dark';
}

export const LearningView: React.FC<LearningViewProps> = ({ onProblemClick, language, theme }) => {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [ocrContent, setOcrContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const isDark = theme === 'dark';
  const t = locales[language].academy;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setOcrContent(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: file.type } },
              { text: "Extract all text from this document, preserve formatting, and format it clearly for a web viewer. If the language is Vietnamese, provide the output in Vietnamese. Ensure it scales well for mobile devices." }
            ]
          }
        });
        setOcrContent(response.text || "No content extracted.");
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!ocrContent) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following text to English, maintaining its technical structure:\n\n${ocrContent}`
      });
      setOcrContent(response.text || ocrContent);
      setIsProcessing(false);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="pb-24 animate-fadeIn">
      <section className={`border-b pb-8 flex justify-between items-end mb-12 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">{t.title}</h1>
          <p className="text-gray-400 font-medium">AI-powered knowledge digitization engine.</p>
        </div>
        <div className="flex gap-4">
          <input type="file" className="hidden" id="doc-upload" onChange={handleFileUpload} accept="application/pdf,image/*" />
          <label htmlFor="doc-upload" className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
            {t.uploadDoc}
          </label>
        </div>
      </section>

      {isProcessing && (
        <div className="py-20 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">{t.ocrProcessing}</p>
        </div>
      )}

      {ocrContent && !isProcessing && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 animate-fadeIn">
          <div className="lg:col-span-3 space-y-8">
            <div className={`p-12 rounded-[3rem] border leading-relaxed font-medium text-lg whitespace-pre-wrap ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100 shadow-inner'}`}>
               <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-10 pb-6 border-b">{t.ocrResult}</h3>
               {ocrContent}
            </div>
          </div>
          <div className="space-y-6">
             <button 
              onClick={handleTranslate}
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white' : 'bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white'}`}
             >
               {t.translate}
             </button>
             <button className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black`}>
               {t.practice}
             </button>
          </div>
        </div>
      )}

      {!ocrContent && !isProcessing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_MATERIALS.map(m => (
            <div key={m.id} className={`p-8 rounded-[2rem] border transition-all cursor-pointer group ${isDark ? 'bg-white/5 border-white/5 hover:border-white' : 'bg-white border-gray-100 hover:border-black'}`}>
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-2xl mb-6">📄</div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{m.category}</p>
              <h3 className="text-xl font-extrabold mb-4 group-hover:text-sky-500 transition-colors">{m.title}</h3>
              <p className="text-sm text-gray-400 mb-8 font-medium">Access conceptual framework and problem-solving patterns.</p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold bg-gray-50 px-3 py-1 rounded text-gray-500 uppercase tracking-widest">Repository</span>
                <span className="text-xs font-extrabold">EXPLORE →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
