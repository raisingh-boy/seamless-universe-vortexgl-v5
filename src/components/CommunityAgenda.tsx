import React, { useState } from 'react';
import { CommunityQuestion, Domain } from '../types';
import { MessageSquare, Users, Plus, Hash, CornerDownRight, Check } from 'lucide-react';
import { DOMAIN_COLORS } from './MyceliumGraph';

interface CommunityAgendaProps {
  language: 'ru' | 'en';
  questions: CommunityQuestion[];
  onSelectNode: (nodeId: string) => void;
  onAddAnswerToQuestion: (questionId: string, answerText: string) => void;
}

export default function CommunityAgenda({
  language,
  questions,
  onSelectNode,
  onAddAnswerToQuestion
}: CommunityAgendaProps) {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [newAnswerText, setNewAnswerText] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionDomains, setNewQuestionDomains] = useState<Domain[]>(['hybrid']);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Parse text to convert hashtags like #id-name or #soma-hanna to clickable span links
  const renderTextWithHashtags = (text: string) => {
    // Splits text by whitespace, check for hashtag prefixed terms
    return text.split(' ').map((word, idx) => {
      if (word.startsWith('#')) {
        const cleanNodeId = word.slice(1).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""); // strip grammar
        return (
          <span 
            key={idx}
            onClick={() => onSelectNode(cleanNodeId)}
            className="text-indigo-400 font-mono font-bold underline cursor-pointer hover:text-indigo-300 mr-1"
          >
            {word}
          </span>
        );
      }
      return word + ' ';
    });
  };

  const handleAnswerSubmit = (e: React.FormEvent, qId: string) => {
    e.preventDefault();
    if (!newAnswerText.trim()) return;
    onAddAnswerToQuestion(qId, newAnswerText);
    setNewAnswerText('');
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    // Append mock question hook, here we simulate in local state in App.tsx
    // For now we can handle in App.tsx as a state mutation
    // We can just trigger a simple alert or use local simulated addition
    setIsAddingQuestion(false);
    setNewQuestionText('');
  };

  return (
    <div className="flex flex-col gap-4 text-slate-100">
      
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-[10px] font-mono font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'ru' ? 'ПОВЕСТКА СООБЩЕСТВА' : 'COMMUNITY AGENDA'}</span>
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {questions.map((q) => (
          <div 
            key={q.id}
            className={`p-4 rounded-xl border border-white/5 transition bg-slate-900/20 hover:bg-slate-900/35 relative overflow-hidden`}
          >
            {/* Domain category tags */}
            <div className="flex gap-1.5 mb-2.5">
              {q.domains.map((dom) => (
                <span 
                  key={dom}
                  className="text-[8px] font-mono uppercase font-bold px-1.5 py-0.2 rounded border"
                  style={{ color: DOMAIN_COLORS[dom], borderColor: `${DOMAIN_COLORS[dom]}22` }}
                >
                  #{dom}
                </span>
              ))}
            </div>

            {/* Question Text */}
            <h4 className="text-[12.5px] font-bold text-white tracking-tight leading-snug">
              {language === 'ru' ? q.textRu : q.textEn}
            </h4>

            {/* Meta statistics */}
            <div className="flex items-center justify-between mt-4 text-[9.5px] font-mono text-slate-500 border-t border-white/5 pt-2.5">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  <span>{q.participants} {language === 'ru' ? 'участников' : 'explorers'}</span>
                </span>
                <span>•</span>
                <span className="text-indigo-400 font-bold">{q.answers.length} {language === 'ru' ? 'ответов' : 'answers'}</span>
              </div>

              <button
                onClick={() => setActiveQuestionId(activeQuestionId === q.id ? null : q.id)}
                className="text-[10px] font-mono text-indigo-400 font-extrabold hover:text-indigo-300 underline cursor-pointer select-none"
              >
                {activeQuestionId === q.id 
                  ? (language === 'ru' ? 'Свернуть' : 'Collapse') 
                  : (language === 'ru' ? 'Смотреть ветку' : 'Open thread')}
              </button>
            </div>

            {/* EXPANDED ANSWERS THREAD PANEL */}
            {activeQuestionId === q.id && (
              <div className="mt-4 border-t border-white/5 pt-4 flex flex-col gap-3">
                
                {/* Answers log */}
                <div className="flex flex-col gap-2.5 pl-2 max-h-52 overflow-y-auto custom-scrollbar">
                  {q.answers.map((ans) => (
                    <div key={ans.id} className="text-xs flex gap-2 leading-relaxed text-slate-300">
                      <CornerDownRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[9px] text-slate-500">
                          <b className="text-indigo-400/90 underline">{ans.author}</b>
                          <span>{new Date(ans.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11.5px] text-slate-200 mt-0.5">
                          {renderTextWithHashtags(ans.text)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit new answer form */}
                <form 
                  onSubmit={(e) => handleAnswerSubmit(e, q.id)}
                  className="mt-2 flex gap-1.5"
                >
                  <input
                    type="text"
                    required
                    placeholder={language === 'ru' 
                      ? 'Ваш ответ (напишите #soma-hanna для связи)...' 
                      : 'Type answer (#soma-hanna tags automatically bind)...'}
                    value={newAnswerText}
                    onChange={(e) => setNewAnswerText(e.target.value)}
                    className="grow bg-slate-950 border border-white/10 rounded-xl p-2 text-[11px] text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 font-mono text-[10px] font-bold rounded-xl transition cursor-pointer"
                  >
                    OK
                  </button>
                </form>

              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
