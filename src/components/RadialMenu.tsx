import React from 'react';
import { motion } from 'motion/react';
import { Flame, Plus, Pocket, History } from 'lucide-react';
import { SomaticNode, Domain } from '../types';
import { DOMAIN_COLORS } from './MyceliumGraph';

interface RadialMenuProps {
  node: SomaticNode;
  x: number;
  y: number;
  language: 'ru' | 'en';
  onAction: (action: 'resonate' | 'link' | 'carry' | 'story') => void;
  onClose: () => void;
  isResonated?: boolean;
}

const RadialMenu: React.FC<RadialMenuProps> = ({ node, x, y, language, onAction, onClose, isResonated }) => {
  const BUTTON_SIZE = 44;
  const RADIUS = 60;

  interface Action {
    id: 'resonate' | 'link' | 'carry' | 'story';
    icon: any;
    pos: { top: number; left: number };
    label: string;
    disabled?: boolean;
  }

  const actions: Action[] = [
    { id: 'resonate', icon: Flame, pos: { top: -RADIUS, left: 0 }, label: language === 'ru' ? 'резонирую' : 'resonate', disabled: isResonated },
    { id: 'link', icon: Plus, pos: { top: 0, left: RADIUS }, label: language === 'ru' ? 'связать' : 'link' },
    { id: 'carry', icon: Pocket, pos: { top: RADIUS, left: 0 }, label: language === 'ru' ? 'нести' : 'carry' },
    { id: 'story', icon: History, pos: { top: 0, left: -RADIUS }, label: language === 'ru' ? 'история' : 'story' },
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" onClick={onClose}>
      <div
        className="absolute pointer-events-auto"
        style={{ top: y, left: x }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Central Anchor */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-12 h-12 -ml-6 -mt-6 bg-slate-900 border-2 rounded-full flex items-center justify-center shadow-2xl relative"
          style={{ borderColor: DOMAIN_COLORS[node.domain] || '#DFB757' }}
        >
           <div
            className="w-full h-full rounded-full opacity-20 animate-ping absolute"
            style={{ backgroundColor: DOMAIN_COLORS[node.domain] || '#DFB757' }}
          />
          <span className="text-[10px] font-mono font-black text-white text-center tracking-tighter uppercase px-1 truncate">
            {language === 'ru' ? node.nameRu.slice(0, 5) : node.nameEn.slice(0, 5)}
          </span>
        </motion.div>

        {/* Action Buttons */}
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.id}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ scale: 1, x: action.pos.left, y: action.pos.top }}
              transition={{ delay: i * 0.05, type: 'spring', damping: 15 }}
              style={{
                position: 'absolute',
                width: BUTTON_SIZE,
                height: BUTTON_SIZE,
                marginLeft: -BUTTON_SIZE / 2,
                marginTop: -BUTTON_SIZE / 2
              }}
            >
              <button
                onClick={() => {
                  if (!action.disabled) onAction(action.id);
                  onClose();
                }}
                disabled={action.disabled}
                className={`w-full h-full rounded-full bg-slate-950/90 border border-white/10 flex flex-col items-center justify-center shadow-xl transition-all active:scale-90 group ${
                  action.disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-indigo-500 cursor-pointer'
                }`}
              >
                <Icon className={`w-4 h-4 ${action.disabled ? 'text-slate-500' : 'text-slate-300 group-hover:text-white'}`} />
                <span className="text-[7px] font-mono uppercase font-black text-slate-500 group-hover:text-indigo-400 absolute -bottom-4 whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RadialMenu;
