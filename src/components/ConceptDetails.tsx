import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SomaticNode, SomaticLink, Story, Material } from '../types';
import { DOMAIN_COLORS } from './MyceliumGraph';
import { 
  Flame, Heart, History, BookOpen, ExternalLink, 
  ChevronRight, Compass, Volume2, Pocket, Plus, Sparkles, AlertCircle, Share2,
  ArrowUpRight
} from 'lucide-react';

interface ConceptDetailsProps {
  node: SomaticNode;
  links: SomaticLink[];
  stories: Story[];
  allNodes: SomaticNode[];
  language: 'ru' | 'en';
  onSelectNode: (nodeId: string) => void;
  onResonate: (nodeId: string) => void;
  onCarryPocket: (nodeId: string) => void;
  onAddStory: (nodeId: string, text: string) => void;
  isResonated: boolean;
  isCarried: boolean;
  playAudio: (nodeId: string) => void;
  isActiveAudio: boolean;
  onAddLink: (source: string, target: string, relationType: any) => void;
}

export default function ConceptDetails({
  node,
  links,
  stories,
  allNodes,
  language,
  onSelectNode,
  onResonate,
  onCarryPocket,
  onAddStory,
  isResonated,
  isCarried,
  playAudio,
  isActiveAudio,
  onAddLink
}: ConceptDetailsProps) {
  const [newStoryText, setNewStoryText] = useState('');
  const [isLinkCreatorOpen, setIsLinkCreatorOpen] = useState(false);
  const [targetLinkId, setTargetLinkId] = useState('');
  const [relationType, setRelationType] = useState('conceptual');

  // Extract neighbor list from links
  const neighbors = links
    .filter(l => l.source === node.id || l.target === node.id)
    .map(l => {
      const neighborId = l.source === node.id ? l.target : l.source;
      const neighborNode = allNodes.find(n => n.id === neighborId);
      return {
        node: neighborNode,
        link: l
      };
    })
    .filter(n => n.node !== undefined) as { node: SomaticNode; link: SomaticLink }[];

  const getDomainText = (dom: string) => {
    const map = {
      ru: { body: 'Тело', science: 'Наука', philosophy: 'Философия', movement: 'Движение', cognition: 'Когнитография', hybrid: 'Гибрид' },
      en: { body: 'Body', science: 'Science', philosophy: 'Philosophy', movement: 'Movement', cognition: 'Cognition', hybrid: 'Hybrid' }
    };
    return map[language][dom as keyof typeof map[typeof language]] || dom;
  };

  const getTypeText = (type: string) => {
    const map = {
      ru: { concept: 'Концепт ⬤', practice: 'Практика ■', person: 'Личность ▲', movement: 'Движение ⬡', event: 'Событие ♦', observation: 'Наблюдение ★', question: 'Вопрос ▼' },
      en: { concept: 'Concept ⬤', practice: 'Practice ■', person: 'Person ▲', movement: 'Movement ⬡', event: 'Event ♦', observation: 'Observation ★', question: 'Question ▼' }
    };
    return map[language][type as keyof typeof map[typeof language]] || type;
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'seed': return { percent: 15, next: 'sprout' };
      case 'sprout': return { percent: 40, next: 'alive' };
      case 'alive': return { percent: 70, next: 'rooted' };
      case 'rooted': return { percent: 90, next: 'atlas' };
      case 'atlas': return { percent: 100, next: 'fully realized' };
      default: return { percent: 50, next: 'unknown' };
    }
  };

  const statusProgress = getStatusProgress(node.status);
  const domainColor = DOMAIN_COLORS[node.domain] || '#FFFFFF';

  const handleStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryText.trim()) return;
    onAddStory(node.id, newStoryText);
    setNewStoryText('');
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLinkId) return;
    onAddLink(node.id, targetLinkId, relationType);
    setIsLinkCreatorOpen(false);
    setTargetLinkId('');
  };

  const defaultMaterials: Material[] = [
    {
      id: 'mat-d-1',
      title: language === 'ru' ? 'Нейробиология воплощенного познания' : 'Neurobiology of Embodied Cognition',
      type: 'article',
      year: 2024,
      summary: language === 'ru' ? 'Анализ активности височных областей мозга при выполнении соматических движений.' : 'An analysis of temporal cortical activity patterns during somatic rehabilitation exercises.',
      url: 'https://ais.studio/build'
    }
  ];

  const nodeMaterials = node.materials && node.materials.length > 0 ? node.materials : defaultMaterials;

  return (
    <div className="flex flex-col gap-5 px-1 pb-6 relative text-slate-200">
      
      {/* 1. DOMAIN ACCENT FLAG HEADER */}
      <div className="flex items-center gap-1.5 border-b border-white/5 pb-3">
        <span 
          className="w-2.5 h-2.5 rounded-full animate-ping mr-1"
          style={{ backgroundColor: domainColor }}
        />
        <span 
          className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border font-bold"
          style={{ color: domainColor, borderColor: `${domainColor}22`, backgroundColor: `${domainColor}05` }}
        >
          {getDomainText(node.domain)}
        </span>
        <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">
          {getTypeText(node.type)} • {node.level}
        </span>
      </div>

      {/* 2. TITLE & TEXT CONTENT */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
          {language === 'ru' ? node.nameRu : node.nameEn}
        </h2>
        
        {node.authorRu && (
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            <span className="text-slate-600">{language === 'ru' ? 'Веха заложена: ' : 'Author landmark: '}</span>
            {language === 'ru' ? node.authorRu : node.authorEn} ({node.epochEn || 'Present'})
          </p>
        )}

        <p className="mt-3.5 text-xs text-slate-300 leading-relaxed font-sans font-medium antialiased">
          {language === 'ru' ? node.descriptionRu : node.descriptionEn}
        </p>

        {node.addedBy && (
          <div className="mt-2 text-[10px] font-mono text-indigo-400/80">
            <span>{language === 'ru' ? 'Взброшено исследователем: ' : 'Injected by explorer: '}</span>
            <span className="font-bold underline">{node.addedBy}</span>
          </div>
        )}
      </div>

      {/* 3. CONCEPT HEALTH & EVOLUTION */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase font-black">
          <span>{language === 'ru' ? 'Состояние концепта' : 'Concept Health'}</span>
          <span className="text-indigo-400">{node.status}</span>
        </div>

        {/* Progress bars for Health metrics */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div className="grow h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, (node.resonances / 100) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-amber-400 w-6 text-right">{node.resonances}</span>
          </div>
          <div className="flex items-center gap-3">
            <Share2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <div className="grow h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, ((node.connectionsCount || 0) / 10) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-indigo-400 w-6 text-right">{node.connectionsCount || 0}</span>
          </div>
          <div className="flex items-center gap-3">
            <ArrowUpRight className={`w-3.5 h-3.5 shrink-0 ${node.trajectory === 'growing' ? 'text-teal-500' : 'text-slate-500'}`} />
            <span className="text-[10px] font-mono uppercase font-bold text-slate-300">
              {language === 'ru' ? 'Рост' : 'Growth'}
              <span className={`ml-2 ${node.trajectory === 'growing' ? 'text-teal-400' : 'text-slate-500'}`}>
                {node.trajectory === 'growing' ? '↑' : node.trajectory === 'decaying' ? '↓' : '→'}
              </span>
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5">
          <p className="text-[10px] font-mono text-slate-400">
            <span className="text-indigo-400 font-black">{node.resonances} resonances</span> → {node.status.toUpperCase()}
          </p>
        </div>
      </div>

      {/* 4. RAPID QUICK ACTION PANEL */}
      <div className="grid grid-cols-4 gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/5 mt-auto sticky bottom-0 z-10 backdrop-blur-md -mx-1 -mb-1">
        
        {/* ACTION: RESONATE */}
        <button
          onClick={() => onResonate(node.id)}
          disabled={isResonated}
          id="btn-action-resonate"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition active:scale-95 cursor-pointer border ${
            isResonated 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
              : 'hover:bg-white/5 text-slate-400 hover:text-white border-transparent'
          }`}
          title={language === 'ru' ? 'Резонанс' : 'Resonate'}
        >
          <Flame className="w-4 h-4 mb-1" />
          <span className="text-[9px] font-mono font-bold uppercase">{node.resonances}</span>
        </button>

        {/* ACTION: POCKET */}
        <button
          onClick={() => onCarryPocket(node.id)}
          id="btn-action-pocket"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition active:scale-95 cursor-pointer border ${
            isCarried 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
              : 'hover:bg-white/5 text-slate-400 hover:text-white border-transparent'
          }`}
          title={language === 'ru' ? 'В карман' : 'Pocket'}
        >
          <Pocket className="w-4 h-4 mb-1" />
          <span className="text-[9px] font-mono font-bold uppercase">{node.carriesCount || 0}</span>
        </button>

        {/* ACTION: DEFINE LINK */}
        <button
          onClick={() => setIsLinkCreatorOpen(!isLinkCreatorOpen)}
          id="btn-action-link"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition active:scale-95 cursor-pointer border ${
            isLinkCreatorOpen 
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
              : 'hover:bg-white/5 text-slate-400 hover:text-white border-transparent'
          }`}
          title={language === 'ru' ? 'Связать' : 'Connect'}
        >
          <Share2 className="w-4 h-4 mb-1" />
          <span className="text-[9px] font-mono font-bold uppercase">{node.connectionsCount || 0}</span>
        </button>

        {/* ACTION: STORIES / HISTORY */}
        <button
          onClick={() => {}}
          id="btn-action-history"
          className="flex flex-col items-center justify-center p-2 rounded-lg transition active:scale-95 cursor-pointer border border-transparent hover:bg-white/5 text-slate-400 hover:text-white"
          title={language === 'ru' ? 'История' : 'History'}
        >
          <History className="w-4 h-4 mb-1" />
          <span className="text-[9px] font-mono font-bold uppercase">{stories.filter(s => s.edgeId ? links.some(l => l.id === s.edgeId && (l.source === node.id || l.target === node.id)) : (s as any).nodeId === node.id).length}</span>
        </button>
      </div>

      {/* QUICK LINK INTEGRATOR COMPONENT FROM SELECTED NODE */}
      <AnimatePresence>
        {isLinkCreatorOpen && (
          <motion.form 
            onSubmit={handleLinkSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-950/20 border border-indigo-500/10 p-3 rounded-lg overflow-hidden flex flex-col gap-2.5"
          >
            <p className="text-[10px] font-mono font-bold text-indigo-300">
              {language === 'ru' ? 'СОЗДАТЬ СВЯЗЬ ИЗ ЭТОГО УЗЛА:' : 'CREATE CONNECTED FLOW FROM THIS NODE:'}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[8px] font-mono text-slate-500 block uppercase mb-1">{language === 'ru' ? 'Куда:' : 'Target Node:'}</label>
                <select
                  value={targetLinkId}
                  onChange={(e) => setTargetLinkId(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-white/5 rounded text-[10.5px] p-1 focus:outline-none text-white focus:border-indigo-500"
                >
                  <option value="">-- select target --</option>
                  {allNodes.filter(n => n.id !== node.id).map(n => (
                    <option key={n.id} value={n.id}>
                      {language === 'ru' ? n.nameRu : n.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[8px] font-mono text-slate-500 block uppercase mb-1">{language === 'ru' ? 'Смысл:' : 'Flow Type:'}</label>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded text-[10.5px] p-1 focus:outline-none text-white"
                >
                  <option value="conceptual">{language === 'ru' ? 'Резонансная conceptual' : 'Resonance conceptual'}</option>
                  <option value="historical">{language === 'ru' ? 'Историческая historical' : 'Historical'}</option>
                  <option value="practical">{language === 'ru' ? 'Практическая practical' : 'Practical'}</option>
                  <option value="resonance">{language === 'ru' ? 'Поточная resonance' : 'Active resonance'}</option>
                  <option value="opposition">{language === 'ru' ? 'Противоположная opposition' : 'Opposition'}</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold rounded transition cursor-pointer"
            >
              ПОДТВЕРДИТЬ СВЯЗЬ
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 4. STATUS & METABOLIC PROGRESS CHART */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
        <h3 className="text-[10px] font-mono font-extrabold tracking-wider text-slate-400 uppercase mb-2 flex items-center justify-between">
          <span>{language === 'ru' ? 'СТАТУС И ТРАЕКТОРИЯУЗЛА' : 'STATUS & METABOLISM'}</span>
          <span className="font-bold text-indigo-400 uppercase text-[9px]">
            {node.status} ➔ {statusProgress.next}
          </span>
        </h3>
        
        {/* PROGRESS BAR */}
        <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5 relative">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 bg-gradient-to-r from-indigo-500 to-indigo-300"
            style={{ width: `${statusProgress.percent}%` }}
          />
        </div>

        {/* TRAJECTORY FLAGS METRICS */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 text-center leading-tight">
          <div className="py-2.5 bg-black/20 rounded-lg border border-white/5">
            <p className="text-[8px] font-mono text-slate-500 uppercase">{language === 'ru' ? 'Резонансы' : 'Resonances'}</p>
            <p className="text-sm font-black text-amber-400 mt-1">♦ {node.resonances}</p>
          </div>
          <div className="py-2.5 bg-black/20 rounded-lg border border-white/5">
            <p className="text-[8px] font-mono text-slate-500 uppercase">{language === 'ru' ? 'Карманы (Carries)' : 'Pocketed'}</p>
            <p className="text-sm font-black text-emerald-400 mt-1">📥 {node.carriesCount || 0}</p>
          </div>
          <div className="py-2.5 bg-black/20 rounded-lg border border-white/5">
            <p className="text-[8px] font-mono text-slate-500 uppercase">{language === 'ru' ? 'Динамика' : 'Maturity'}</p>
            <p className={`text-[10.5px] font-mono font-bold mt-1 uppercase ${
              node.trajectory === 'growing' ? 'text-teal-400' :
              node.trajectory === 'stable' ? 'text-indigo-300' : 'text-rose-400 animate-pulse'
            }`}>
              {node.trajectory === 'growing' ? (language === 'ru' ? 'Растёт' : 'Growing') :
               node.trajectory === 'stable' ? (language === 'ru' ? 'Стабильно' : 'Stable') : 
               (language === 'ru' ? 'Угасает' : 'Decaying')}
            </p>
          </div>
        </div>

        {node.trajectory === 'decaying' && (
          <div className="mt-3 flex gap-1.5 items-center p-2 rounded bg-rose-500/10 border border-rose-500/20 text-[9.5px] font-mono text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {language === 'ru' ? 'Узел сух более 30 дней и постепенно растворяется в тумане.' : 'Node inactive for 30+ days; decaying from neglect.'}
            </span>
          </div>
        )}
      </div>

      {/* 5. CONCEPT NEIGHBORS (MINI-MAP TRANSITIONS) */}
      <div>
        <h3 className="text-[10px] font-mono font-extrabold tracking-wider text-slate-400 uppercase mb-2">
          {language === 'ru' ? 'СОСЕДНИЕ КОНЦЕПЦИИ (МИНИ-КАРТА)' : 'NEIGHBORING CONCEPTS (MINIMAP LINK)'}
        </h3>
        
        {neighbors.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {/* GRAPH FLOW MINIMAP REPRESENTATION */}
            <div className="p-3 bg-black/50 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-around mb-2 h-16 shadow-inner select-none">
              <div 
                className="w-8 h-8 rounded-full border flex items-center justify-center text-[8px] font-mono font-bold shrink-0 truncate p-0.5 relative z-10 text-center cursor-pointer hover:scale-110 duration-200"
                style={{ borderColor: domainColor, backgroundColor: `${domainColor}20` }}
                onClick={() => onSelectNode(node.id)}
              >
                {language === 'ru' ? node.nameRu.slice(0, 4) : node.nameEn.slice(0, 4)}
              </div>
              <div className="grow border-t border-dashed border-white/10 relative h-1 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-ping absolute" />
              </div>
              <div className="flex gap-2 shrink-0">
                {neighbors.slice(0, 3).map((n, i) => {
                  const nColor = DOMAIN_COLORS[n.node.domain] || '#FFFFFF';
                  return (
                    <div 
                      key={n.node.id} 
                      className="w-7 h-7 rounded-sm border flex items-center justify-center text-[7.5px] font-mono text-center cursor-pointer hover:scale-110 shrink-0 truncate p-0.5 duration-200"
                      style={{ borderColor: nColor, backgroundColor: `${nColor}15` }}
                      onClick={() => onSelectNode(n.node.id)}
                      title={language === 'ru' ? n.node.nameRu : n.node.nameEn}
                    >
                      {language === 'ru' ? n.node.nameRu.slice(0, 3) : n.node.nameEn.slice(0, 3)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NEIGHBORS TRAVERSAL ACTIONS */}
            <div className="grid grid-cols-1 gap-1.5">
              {neighbors.map(({ node: n, link }) => (
                <button
                  key={n.id}
                  onClick={() => onSelectNode(n.id)}
                  id={`btn-neighbor-${n.id}`}
                  className="w-full text-left p-2.5 bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl transition flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: DOMAIN_COLORS[n.domain] }}
                    />
                    <span className="font-semibold truncate text-[11.5px] text-slate-200 group-hover:text-white">
                      {language === 'ru' ? n.nameRu : n.nameEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 font-mono text-[9px] text-slate-500">
                    <span className="rounded bg-white/5 px-1 py-0.2 border border-white/5">{link.type}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-slate-500 border border-dashed border-white/5 p-3 rounded-lg text-center">
            {language === 'ru' ? 'Нет установленных связей в этой плоскости.' : 'No active flows linked to this concept.'}
          </p>
        )}
      </div>

      {/* 6. EXPERIENTIAL STORIES (ИСТОРИЯ КОНЦЕПЦИИ) */}
      <div className="border-t border-white/5 pt-5">
        <h3 className="text-[10px] font-mono font-extrabold tracking-wider text-slate-400 uppercase mb-3.5 flex items-center gap-1">
          <History className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'ru' ? 'ИСТОРИИ И ОПЫТ (STORIES LOG)' : 'SENSORY EXPERIERENCES LOG'}</span>
        </h3>

        {/* Stories list */}
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto custom-scrollbar mb-3 pr-1">
          {stories.filter(s => s.edgeId ? links.some(l => l.id === s.edgeId && (l.source === node.id || l.target === node.id)) : (s as any).nodeId === node.id).length > 0 ? (
            stories.filter(s => s.edgeId ? links.some(l => l.id === s.edgeId && (l.source === node.id || l.target === node.id)) : (s as any).nodeId === node.id).map((st) => (
              <div key={st.id} className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs flex flex-col gap-1 shadow-inner leading-relaxed">
                <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
                  <span className="font-bold underline text-indigo-400/95">{st.author}</span>
                  <span>{new Date(st.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[11.5px] text-slate-200 italic font-sans">{st.text}</p>
                {st.edgeId && (
                  <div className="text-[8px] font-mono text-indigo-300 mt-1 uppercase opacity-60">
                    Linked via connection
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs italic text-slate-500 text-center py-2 border border-dashed border-white/5 rounded-lg">
              {language === 'ru' ? 'Пока никто не оставил историй. Станьте первым!' : 'This concept has no logs yet. Leave yours!'}
            </p>
          )}
        </div>

        {/* Add story Form */}
        <form onSubmit={handleStorySubmit} className="flex gap-1.5">
          <input
            type="text"
            placeholder={language === 'ru' ? 'Поделитесь соматическим опытом...' : 'Log your somatic feedback...'}
            value={newStoryText}
            onChange={(e) => setNewStoryText(e.target.value)}
            required
            className="grow bg-slate-900 border border-white/15 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            id="story-submit-btn"
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 7. BIBLIOGRAPHY / SCIENTIFIC MATERIALS */}
      <div className="border-t border-white/5 pt-5">
        <h3 className="text-[10px] font-mono font-extrabold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'ru' ? 'МАТЕРИАЛЫ И КНИГИ (REFERENCES)' : 'BIBLIOGRAPHIC SOURCES'}</span>
        </h3>

        <div className="flex flex-col gap-2.5">
          {nodeMaterials.map((mat) => (
            <div key={mat.id} className="p-3 bg-slate-905 bg-slate-900/40 rounded-xl border border-white/5 shadow-md flex flex-col gap-1">
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 uppercase">
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 font-bold text-indigo-300">{mat.type}</span>
                <span>{mat.year > 0 ? mat.year : 'Ancient text'}</span>
              </div>
              <h4 className="text-[11.5px] font-bold text-white mt-1 leading-snug">
                {mat.title}
              </h4>
              <p className="text-[10px] text-slate-400 italic mt-0.5 leading-relaxed">
                {mat.summary}
              </p>
              {mat.url && (
                <a 
                  href={mat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 self-start text-[9px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>{language === 'ru' ? 'Читать источник' : 'Open resource'}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
