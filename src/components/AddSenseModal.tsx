import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SomaticNode, SomaticLink, Domain, SomaticNodeType } from '../types';
import { Sparkles, FileText, Share2, Check, ArrowRight, BrainCircuit, X } from 'lucide-react';

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
  allNodes,
  onConfirmSpawnConcept,
  onConfirmSpawnLink,
  onConfirmAppendStory,
  onClose
}: AddSenseModalProps) {
  const [inputText, setInputText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedProposal, setParsedProposal] = useState<any | null>(null);
  const [stage, setStage] = useState<'input' | 'proposal' | 'success'>('input');

  // Triggering local semantic parsing
  const handleParseText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setParsing(true);
    
    setTimeout(() => {
      const text = inputText.toLowerCase();
      
      // Look for custom node ID matches in the string to bind links/stories
      const foundNodes = allNodes.filter(n => 
        text.includes(n.nameRu.toLowerCase().split(' ')[0]) || 
        text.includes(n.nameEn.toLowerCase().split(' ')[0]) ||
        text.includes(n.id)
      );

      // Proposal logic:
      // 1. Core Connection
      const isConnectionIntent = text.includes('связать') || text.includes('связь') || text.includes('link') || text.includes('connect') || text.includes('между') || text.includes('to');
      if (isConnectionIntent && foundNodes.length >= 2) {
        setParsedProposal({
          type: 'CONNECTION',
          source: foundNodes[0],
          target: foundNodes[1],
          flowType: text.includes('contrast') || text.includes('оппозиц') || text.includes('против') ? 'opposition' :
                    text.includes('практ') || text.includes('practice') ? 'practical' : 
                    text.includes('истор') || text.includes('hist') ? 'historical' : 'resonance',
          confidence: 94,
          summaryRu: `Связать "${foundNodes[0].nameRu}" и "${foundNodes[1].nameRu}" новым потоком резонанса`,
          summaryEn: `Link "${foundNodes[0].nameEn}" and "${foundNodes[1].nameEn}" with a fluid resonance flow`
        });
      }
      // 2. Core Story Log
      else if ((text.includes('история') || text.includes('опыт') || text.includes('вчера') || text.includes('чувств') || text.includes('делал') || text.includes('story') || text.includes('felt') || text.includes('experienced')) && foundNodes.length >= 1) {
        setParsedProposal({
          type: 'STORY',
          nodeTarget: foundNodes[0],
          storyText: inputText,
          confidence: 90,
          summaryRu: `Добавить новую личную историю об опыте в карточку "${foundNodes[0].nameRu}"`,
          summaryEn: `Log a new private story of somatic experience inside "${foundNodes[0].nameEn}"`
        });
      }
      // 3. New Concept Creation with auto domain classification
      else {
        // Auto detect Domain
        let detectedDomain: Domain = 'hybrid';
        if (text.includes('мышц') || text.includes('тело') || text.includes('сома') || text.includes('спин') || text.includes('body') || text.includes('soma')) {
          detectedDomain = 'body';
        } else if (text.includes('мозг') || text.includes('сознание') || text.includes('вниман') || text.includes('mind') || text.includes('cognit') || text.includes('nerv')) {
          detectedDomain = 'cognition';
        } else if (text.includes('танец') || text.includes('движ') || text.includes('кинемат') || text.includes('dance') || text.includes('move')) {
          detectedDomain = 'movement';
        } else if (text.includes('наук') || text.includes('систем') || text.includes('исслед') || text.includes('кибернет') || text.includes('science') || text.includes('cyber')) {
          detectedDomain = 'science';
        } else if (text.includes('философ') || text.includes('смысл') || text.includes('бытие') || text.includes('phenomeno') || text.includes('philosophy')) {
          detectedDomain = 'philosophy';
        }

        // Auto detect Node shape type
        let detectedType: SomaticNodeType = 'concept';
        if (text.includes('практика') || text.includes('урок') || text.includes('упражн') || text.includes('practice') || text.includes('exercise')) {
          detectedType = 'practice';
        } else if (text.includes('вопрос') || text.includes('почему') || text.includes('как') || text.includes('question') || text.includes('why')) {
          detectedType = 'question';
        } else if (text.includes('кто') || text.includes('автор') || text.includes('ученый') || text.includes('person') || text.includes('scholar')) {
          detectedType = 'person';
        } else if (text.includes('событие') || text.includes('джем') || text.includes('встреча') || text.includes('event') || text.includes('meeting')) {
          detectedType = 'event';
        } else if (text.includes('наблюден') || text.includes('заметил') || text.includes('observation') || text.includes('noticed')) {
          detectedType = 'observation';
        }

        // Clean capitalized title
        const words = inputText.trim().split(' ');
        const title = words.slice(0, 3).join(' ');
        const description = words.length > 3 ? words.slice(3).join(' ') : inputText;

        setParsedProposal({
          type: 'NEW_CONCEPT',
          nameRu: title,
          nameEn: title,
          conceptType: detectedType,
          domain: detectedDomain,
          description: description,
          confidence: 85,
          summaryRu: `Развернуть новую веху "${title}" в домене "${detectedDomain}" (${detectedType})`,
          summaryEn: `Instantiate new landmark "${title}" within the "${detectedDomain}" domain (${detectedType})`
        });
      }

      setParsing(false);
      setStage('proposal');
    }, 1200);
  };

  // Confirming and launching spawner payload
  const handleConfirmAction = () => {
    if (!parsedProposal) return;

    if (parsedProposal.type === 'CONNECTION') {
      onConfirmSpawnLink(
        parsedProposal.source.id,
        parsedProposal.target.id,
        parsedProposal.flowType
      );
    } else if (parsedProposal.type === 'STORY') {
      onConfirmAppendStory(
        parsedProposal.nodeTarget.id,
        parsedProposal.storyText
      );
    } else if (parsedProposal.type === 'NEW_CONCEPT') {
      const generatedNode: SomaticNode = {
        id: `spawned-${Date.now()}`,
        nameRu: parsedProposal.nameRu,
        nameEn: parsedProposal.nameEn,
        type: parsedProposal.conceptType,
        level: 'meso',
        domain: parsedProposal.domain,
        world: 'field', // spawning into Field
        status: 'seed',
        resonances: 1,
        descriptionRu: parsedProposal.description,
        descriptionEn: parsedProposal.description,
        addedBy: 'You (Explorer)',
        createdAt: Date.now(),
        lastActiveAt: Date.now()
      };
      onConfirmSpawnConcept(generatedNode);
    }

    setStage('success');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      
      <div className="w-full max-w-md bg-slate-900 border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden text-slate-100">
        
        {/* Closable X button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-5 border-b border-white/5 bg-black/20 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h2 className="font-mono text-sm uppercase tracking-widest font-black">
            {language === 'ru' ? 'НЕЙРОННЫЙ ВСПРЫСК' : 'SEMANTIC INJECTOR'}
          </h2>
        </div>

        {/* Modal Main Slider */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            
            {/* STAGE 1: TEXT INPUT */}
            {stage === 'input' && (
              <motion.form
                key="input"
                onSubmit={handleParseText}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col gap-4"
              >
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'ru' 
                    ? 'Глубокий синтаксический анализатор. Напишите текст своими словами — он сам создаст связь, допишет историю в карточку или породит новый узел в 3D.'
                    : 'Universal somatic text parser. Type your thoughts; the engine automatically establishes flows, appends experiences, or spawns new 3D concepts.'}
                </p>

                <textarea
                  required
                  placeholder={language === 'ru' 
                    ? 'Например: Связать Соматику Ханны и Воплощенный ИИ... или Мой вчерашний опыт с Глубоким взглядом...'
                    : 'Example: Connect Hanna Somatics with Embodied AI... or define yoga practice as breathing...'}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-none font-medium"
                />

                <button
                  type="submit"
                  disabled={parsing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-mono text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  {parsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>{language === 'ru' ? 'Парсинг ИИ смыслов...' : 'AI Semantic Parsing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>{language === 'ru' ? 'Логический Впрыск' : 'Inject Experience'}</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* STAGE 2: PARSED PROPOSAL */}
            {stage === 'proposal' && parsedProposal && (
              <motion.div
                key="proposal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-5 text-center items-center"
              >
                {/* Confidence indicator badge */}
                <div className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20 font-bold self-center flex items-center gap-1">
                  <span>Confidence Rating: </span>
                  <span className="font-extrabold text-amber-400">{parsedProposal.confidence}%</span>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 w-full flex flex-col gap-2.5">
                  <div className="flex items-center justify-center gap-2">
                    {parsedProposal.type === 'CONNECTION' && <Share2 className="w-5 h-5 text-teal-400 shrink-0" />}
                    {parsedProposal.type === 'STORY' && <FileText className="w-5 h-5 text-indigo-400 shrink-0" />}
                    {parsedProposal.type === 'NEW_CONCEPT' && <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />}
                    
                    <span className="font-mono text-[11px] uppercase text-gray-400 tracking-wider">
                      {language === 'ru' ? 'Распознанная интенция:' : 'Detected Action Pattern:'}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-white max-w-sm font-sans">
                    {language === 'ru' ? parsedProposal.summaryRu : parsedProposal.summaryEn}
                  </p>

                  {parsedProposal.type === 'NEW_CONCEPT' && (
                    <div className="flex gap-2 justify-center text-[10px] font-mono text-gray-400">
                      <span>Domain: <b className="text-yellow-400">{parsedProposal.domain}</b></span>
                      <span>•</span>
                      <span>Shape: <b className="text-teal-400">{parsedProposal.conceptType}</b></span>
                    </div>
                  )}
                </div>

                {/* Confirm Buttons */}
                <div className="flex items-center w-full gap-2.5 mt-2">
                  <button
                    onClick={() => setStage('input')}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {language === 'ru' ? 'Сброс' : 'Adjust'}
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer shadow-lg flex items-center justify-center gap-1 shadow-emerald-500/10"
                  >
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>{language === 'ru' ? 'Укоренить' : 'Confirm Sprout'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 3: SUCCESS ANIMATION TRIGGER */}
            {stage === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-4 text-center items-center py-6"
              >
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="font-bold text-white text-base">
                    {language === 'ru' ? 'Смысл успешно внедрен!' : 'Semantic Field Sprouted!'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed font-sans">
                    {language === 'ru' 
                      ? 'Данные переданы в распределенный 3D граф. Мицелий Вселенной перестроился.' 
                      : 'Nodes and vector trails compiled. Graph mycelium adjusted in real-time.'}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="mt-2.5 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl cursor-pointer"
                >
                  {language === 'ru' ? 'Готово (Продолжить)' : 'Continue Observing'}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
