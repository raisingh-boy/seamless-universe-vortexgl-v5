import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SomaticNode, Domain } from '../types';
import { Sparkles, X } from 'lucide-react';
import { DOMAIN_COLORS } from './MyceliumGraph';

interface AddSenseModalProps {
  language: 'ru' | 'en';
  allNodes: SomaticNode[];
  onConfirmSpawnConcept: (node: SomaticNode) => void;
  onConfirmSpawnLink: (sourceId: string, targetId: string, type: any) => void;
  onConfirmAppendStory: (nodeId: string, text: string) => void;
  onClose: () => void;
}

export default function AddSenseModal({
  language,
  onConfirmSpawnConcept,
  onClose
}: AddSenseModalProps) {
  const [inputText, setInputText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain>('hybrid');
  const [stage, setStage] = useState<'input' | 'success'>('input');

  const domains: Domain[] = ['body', 'science', 'philosophy', 'movement', 'cognition', 'hybrid'];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const generatedNode: SomaticNode = {
      id: `spawned-${Date.now()}`,
      nameRu: inputText.slice(0, 25),
      nameEn: inputText.slice(0, 25),
      type: 'concept',
      level: 'meso',
      domain: selectedDomain,
      world: 'field',
      status: 'seed',
      resonances: 1,
      descriptionRu: inputText,
      descriptionEn: inputText,
      addedBy: 'You (Explorer)',
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    };
    onConfirmSpawnConcept(generatedNode);
    setStage('success');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg relative text-slate-100">
        
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-slate-500 hover:text-white transition cursor-pointer p-2"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="py-8">
          <AnimatePresence mode="wait">
            {stage === 'input' && (
              <motion.form
                key="input"
                onSubmit={handleConfirm}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-10 items-center"
              >
                <h2 className="text-3xl font-bold text-white text-center tracking-tight">
                  {language === 'ru' ? 'Что ты заметил?' : 'What did you notice?'}
                </h2>

                <div className="w-full">
                  <textarea
                    autoFocus
                    required
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    rows={1}
                    className="w-full bg-transparent border-b border-white/20 pb-4 text-2xl text-white focus:outline-none focus:border-indigo-500 font-sans text-center resize-none overflow-hidden transition-colors"
                    placeholder="..."
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  {domains.map((dom) => (
                    <button
                      key={dom}
                      type="button"
                      onClick={() => setSelectedDomain(dom)}
                      className={`w-10 h-10 rounded-full transition-all duration-300 border-2 flex items-center justify-center ${
                        selectedDomain === dom ? 'scale-125 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-40 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: DOMAIN_COLORS[dom] }}
                    >
                      {selectedDomain === dom && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="mt-4 px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-sm font-black rounded-full transition-all shadow-xl active:scale-95 uppercase tracking-widest"
                >
                  {language === 'ru' ? 'Подтвердить' : 'Confirm'}
                </button>
              </motion.form>
            )}

            {stage === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6 text-center items-center py-12"
              >
                <div className="w-20 h-20 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 rounded-full flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-10 h-10 animate-pulse" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                    {language === 'ru' ? 'Проросло в Поле' : 'Sprouted in the Field'}
                  </h3>
                  <p className="text-slate-400 mt-3 text-lg">
                    {language === 'ru' 
                      ? 'Твой смысл начал свою эволюцию.'
                      : 'Your sense has begun its evolution.'}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="mt-8 px-10 py-3 border border-white/10 text-white font-mono text-xs font-black rounded-full hover:bg-white/5 transition active:scale-95 tracking-widest"
                >
                  {language === 'ru' ? 'ПРОДОЛЖИТЬ' : 'CONTINUE'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
