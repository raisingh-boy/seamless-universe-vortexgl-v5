import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Orbit, Compass, Globe, Sparkles, Volume2, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  language: 'ru' | 'en';
  onComplete: () => void;
}

export default function Onboarding({ language, onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      titleRu: 'Добро пожаловать в Seamless Universe',
      titleEn: 'Welcome to Seamless Universe',
      descRu: 'Интерактивная трехмерная среда смысловых резонансов, объединяющая тело, сознание, науку и движение в единый биоморфный ландшафт.',
      descEn: 'An interactive 3D dimension mapping somatic, cognitive, and philosophical concepts into a single self-organizing biomorphic landscape.',
      icon: <Orbit className="w-12 h-12 text-indigo-400 animate-spin" />,
      color: 'from-indigo-600/25 to-violet-600/5'
    },
    {
      titleRu: 'Три Измерения Смыслов',
      titleEn: 'Three Dimensions of Meaning',
      descRu: 'Исследуйте ATLAS (научный архив), FIELD (живое поле со-творчества, наполняемое сообществом) и ваше личное ME пространство для кристаллизации инсайтов.',
      descEn: 'Traverse ATLAS (archival registry), FIELD (living community space of co-creation), and your personal ME space to collect customized insights.',
      icon: <Globe className="w-12 h-12 text-teal-400 animate-pulse" />,
      color: 'from-teal-600/25 to-cyan-600/5'
    },
    {
      titleRu: 'Живые Потоки и Созвучия',
      titleEn: 'Living Flows & Sonification',
      descRu: 'Связи дышат и переливаются частицами. Соприкасайтесь с биоморфной топологией, вызывайте резонансы, слушайте тональность пространства и наполняйте свой карман смыслами.',
      descEn: 'Connections breathe and flow with particles. Interact with topological fields, vote on resonances, listen to the generative sounds, and accumulate pockets.',
      icon: <Volume2 className="w-12 h-12 text-amber-400 animate-bounce" />,
      color: 'from-amber-600/25 to-yellow-600/5'
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_100%)]" />
      
      <motion.div 
        id="onboarding-card"
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-slate-900/80 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative backdrop-blur-2xl"
      >
        {/* Progress indicator */}
        <div className="flex h-1.5 w-full bg-white/5">
          {slides.map((_, idx) => (
            <div 
              key={idx}
              className={`h-full transition-all duration-300 ${
                idx <= currentSlide ? 'bg-indigo-500' : 'bg-transparent'
              }`}
              style={{ width: `${100 / slides.length}%` }}
            />
          ))}
        </div>

        <div className={`p-8 md:p-12 bg-gradient-to-b ${slide.color} transition-all duration-500 flex flex-col items-center text-center`}>
          {/* Animated Icon Container */}
          <div className="mb-6 p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
            {slide.icon}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                {language === 'ru' ? slide.titleRu : slide.titleEn}
              </h2>
              <p className="mt-4 text-xs md:text-sm text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
                {language === 'ru' ? slide.descRu : slide.descEn}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Bullet dots */}
          <div className="flex gap-2.5 mt-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                id={`onboarding-dot-${idx}`}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-indigo-400 w-6' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between w-full mt-10 border-t border-white/5 pt-6 gap-3">
            <button
              onClick={onComplete}
              id="onboarding-skip-btn"
              className="text-xs font-mono text-slate-400 hover:text-white px-4 py-2 hover:bg-white/5 rounded-xl transition cursor-pointer"
            >
              {language === 'ru' ? 'Пропустить' : 'Skip Intro'}
            </button>

            {currentSlide < slides.length - 1 ? (
              <button
                onClick={() => setCurrentSlide(prev => prev + 1)}
                id="onboarding-next-btn"
                className="flex items-center gap-1.5 text-xs font-mono bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition active:scale-95 cursor-pointer font-bold"
              >
                <span>{language === 'ru' ? 'Далее' : 'Continue'}</span>
                <AnimatePresence mode="wait">
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.div>
                </AnimatePresence>
              </button>
            ) : (
              <button
                onClick={onComplete}
                id="onboarding-start-btn"
                className="flex items-center gap-1.5 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl transition active:scale-95 cursor-pointer font-bold shadow-lg shadow-emerald-500/10"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>{language === 'ru' ? 'Войти во вселенную' : 'Enter Universe'}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
