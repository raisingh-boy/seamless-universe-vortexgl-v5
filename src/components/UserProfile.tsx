import React from 'react';
import { CommunityUser, Domain } from '../types';
import { User, Shield, BarChart3, Lock, Star, ChevronRight, LogOut, Check } from 'lucide-react';
import { DOMAIN_COLORS } from './MyceliumGraph';

interface UserProfileProps {
  language: 'ru' | 'en';
  user: CommunityUser;
  onUpdatePrivacy: (settings: any) => void;
  onLogout: () => void;
}

export default function UserProfile({
  language,
  user,
  onUpdatePrivacy,
  onLogout
}: UserProfileProps) {
  const getDomainText = (dom: Domain) => {
    const map = {
      ru: { body: 'Телесный интеллект', science: 'Научный метод', philosophy: 'Философия', movement: 'Движение', cognition: 'Когнитограф', hybrid: 'Гибридный паттерн' },
      en: { body: 'Somatic Intellect', science: 'Scientific Method', philosophy: 'Philosophy', movement: 'Movement Flow', cognition: 'Cognitive Science', hybrid: 'Hybrid Pattern' }
    };
    return map[language][dom];
  };

  const getArchetypeDesc = (arc: string) => {
    const map = {
      ru: {
        CONNECTOR: 'Вы связываете концепты в сложные смысловые созвездия.',
        STORYTELLER: 'Вы наполняете сухую топологию художественным опытом.',
        RESONATOR: 'Вы тонко чувствуете колебания поля и поддерживаете созвучия.',
        PIONEER: 'Вы постоянно порождаете новые семена и гипотезы.',
        BRIDGE: 'Вы гармонично балансируете между созданием, голосом и связями.'
      },
      en: {
        CONNECTOR: 'You bridge nodes together into rich multidimensional constellations.',
        STORYTELLER: 'You saturate digital topologies with human experiential logs.',
        RESONATOR: 'You vibe key harmonics and amplify community resonance vectors.',
        PIONEER: 'You continuously inject novel semantic concepts and seeds.',
        BRIDGE: 'You establish a perfect, unified balance of all actions.'
      }
    };
    return map[language][arc as keyof typeof map[typeof language]] || arc;
  };

  return (
    <div className="flex flex-col gap-4 text-slate-200">
      
      {/* 1. VISUAL PROFILE BANNER CARDS */}
      <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 relative overflow-hidden flex items-center gap-4">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full filter blur-xl" />
        
        {/* User avatar mockup */}
        <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center font-mono font-black text-sm shrink-0">
          {user.name.split(' ').map(n=>n[0]).join('')}
        </div>

        <div className="truncate">
          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
            <span>{user.name}</span>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </h4>
          <p className="text-[10px] font-mono text-slate-400 truncate">{user.email}</p>
          <p className="text-[9.5px] font-mono text-indigo-400 font-bold mt-0.5 uppercase">
            Reputation: <span className="text-white font-extrabold">{user.reputation} Pt</span>
          </p>
        </div>
      </div>

      {/* 2. DYNAMIC ARCHETYPE PROGRESS */}
      <div className="bg-indigo-950/20 border border-indigo-500/10 p-3.5 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
            {language === 'ru' ? 'АРХЕТИП И ПРИЗВАНИЕ' : 'BEHAVIORAL ARCHETYPE'}
          </span>
        </div>
        <div className="mt-2.5">
          <span className="text-xs font-mono font-black border border-indigo-500/30 px-2 py-0.5 rounded bg-indigo-500/5 text-slate-100">
            ★ {user.archetype}
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-2 italic">
            {getArchetypeDesc(user.archetype)}
          </p>
        </div>
      </div>

      {/* 3. CORE STATISTICS */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
        <h3 className="text-[10px] font-mono font-extrabold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-1">
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'ru' ? 'ВАШ ОРГАНИЧЕСКИЙ СЛЕД' : 'ORGANIC ACTION INDEX'}</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono leading-tight">
          <div className="p-2.5 bg-black/20 rounded-lg border border-white/5">
            <p className="text-[8px] text-slate-500 uppercase">{language === 'ru' ? 'Зародил вех' : 'Spawned'}</p>
            <p className="text-sm font-black text-rose-400 mt-1">{user.spawnedCount}</p>
          </div>
          <div className="p-2.5 bg-black/20 rounded-lg border border-white/5">
            <p className="text-[8px] text-slate-500 uppercase">{language === 'ru' ? 'Сплел связей' : 'Linked'}</p>
            <p className="text-sm font-black text-cyan-400 mt-1">{user.linksCount}</p>
          </div>
          <div className="p-2.5 bg-black/20 rounded-lg border border-white/5">
            <p className="text-[8px] text-slate-500 uppercase">{language === 'ru' ? 'Написал историй' : 'Stories'}</p>
            <p className="text-sm font-black text-indigo-400 mt-1">{user.storiesCount}</p>
          </div>
          <div className="p-2.5 bg-black/20 rounded-lg border border-white/5">
            <p className="text-[8px] text-slate-500 uppercase">{language === 'ru' ? 'В атласе' : 'In Atlas'}</p>
            <p className="text-sm font-black text-amber-400 mt-1">{user.atlasCount}</p>
          </div>
        </div>
      </div>

      {/* 4. PRIVACY SETTINGS FOR THE GRAPH OVERLAY */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
        <h3 className="text-[10px] font-mono font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'ru' ? 'НАСТРОЙКИ КОНФИДЕНЦИАЛЬНОСТИ' : 'VISUAL LAYERING PRIVACY'}</span>
        </h3>

        {/* Graph visibility state */}
        <div className="flex flex-col gap-1.5 font-mono text-[11px]">
          <p className="text-gray-500 text-[10px] uppercase mb-1">{language === 'ru' ? 'ВИДИМОСТЬ ВАШЕГО ГРАФА:' : 'YOUR GRAPH EXPOSURE:'}</p>
          
          {(['public', 'overlay', 'private'] as const).map((flag) => (
            <button
              key={flag}
              onClick={() => onUpdatePrivacy({ ...user.privacySettings, graphVisibility: flag })}
              className={`w-full text-left p-2 rounded-lg border flex items-center justify-between cursor-pointer ${
                user.privacySettings.graphVisibility === flag 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold' 
                  : 'bg-black/10 text-slate-400 border-transparent hover:bg-black/30'
              }`}
            >
              <span className="uppercase text-[9.5px]">{flag}</span>
              {user.privacySettings.graphVisibility === flag && <Check className="w-3 h-3 text-indigo-400" />}
            </button>
          ))}
        </div>

        <div className="border-t border-white/5 pt-3 flex items-center justify-between font-mono text-[10.5px]">
          <span className="text-slate-400">{language === 'ru' ? 'Показывать резонансы' : 'Show Resonances Visible'}</span>
          <button
            onClick={() => onUpdatePrivacy({ ...user.privacySettings, resonancesVisible: !user.privacySettings.resonancesVisible })}
            className={`px-3 py-1.5 rounded-lg border text-[9.5px] cursor-pointer ${
              user.privacySettings.resonancesVisible 
                ? 'bg-emerald-500/25 border-emerald-500/30 text-emerald-300 font-extrabold' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {user.privacySettings.resonancesVisible ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* 5. LOGOUT BUTTON */}
      <button
        onClick={onLogout}
        className="w-full py-2.5 mt-2 bg-red-600/10 hover:bg-red-600/15 border border-red-500/20 text-rose-400 font-mono text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        <span>{language === 'ru' ? 'Выйти со вселенной' : 'Sign out of universe'}</span>
      </button>

    </div>
  );
}
