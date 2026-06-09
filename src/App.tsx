/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MyceliumGraph, { DOMAIN_COLORS } from './components/MyceliumGraph';
import { SomaticNode, SomaticLink, World, Domain, CommunityUser, CommunityQuestion, ActivityLog, Story } from './types';
import { INITIAL_NODES, INITIAL_LINKS, INITIAL_USERS, INITIAL_QUESTIONS, INITIAL_ACTIVITIES, SAMPLE_AUDIO } from './data/nodesData';

// Subcomponents
import Onboarding from './components/Onboarding';
import ConceptDetails from './components/ConceptDetails';
import AddSenseModal from './components/AddSenseModal';
import CommunityAgenda from './components/CommunityAgenda';
import UserProfile from './components/UserProfile';
import RadialMenu from './components/RadialMenu';

// Icons
import {
  Compass, Globe, User, Play, Pause, Volume2, Sparkles, Plus,
  Info, Layers, Flame, Settings, Sliders, Shuffle, Eye, Search,
  BookOpen, Orbit, ExternalLink, Menu, X, Check, Heart, Shield, Radio, Activity, Pocket
} from 'lucide-react';

export default function App() {
  // Persistence states
  const [nodes, setNodes] = useState<SomaticNode[]>(INITIAL_NODES);
  const [ascendingNodeId, setAscendingNodeId] = useState<string | null>(null);
  const [links, setLinks] = useState<SomaticLink[]>(INITIAL_LINKS);
  const [users, setUsers] = useState<CommunityUser[]>(INITIAL_USERS);
  const [questions, setQuestions] = useState<CommunityQuestion[]>(INITIAL_QUESTIONS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);

  useEffect(() => {
    const initialStories: Story[] = INITIAL_NODES.flatMap(n => (n.stories || []).map(s => ({...s, nodeId: n.id})));
    setStories(initialStories);
  }, []);

  // Global settings
  const [currentWorld, setCurrentWorld] = useState<World>('atlas');
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('soma-hanna');
  const [vibeMode, setVibeMode] = useState<'colour' | 'mono' | 'cinematic'>('colour');
  const [selectedEpoch, setSelectedEpoch] = useState<number>(0);
  
  // UI Panels states
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [isAddSenseOpen, setIsAddSenseOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'card' | 'audio' | 'profile' | 'agenda' | null>('card');
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false); // Collapses all sidebars for pure 3D canvas interaction on phones
  const [stories, setStories] = useState<Story[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [fieldMode, setFieldMode] = useState<'graph' | 'stream'>('graph');

  // Search overlay state
  const [searchQuery, setSearchQuery] = useState('');
  const [overlayUser, setOverlayUser] = useState<string | null>(null);

  // Audio Playback Engine
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [activeAudioNodeId, setActiveAudioNodeId] = useState<string | null>(null);

  // Authenticated User Profile mockup
  const [currentUser, setCurrentUser] = useState<CommunityUser>(INITIAL_USERS[0]);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // Mobile touch interface and gesture states
  const [mobileCardState, setMobileCardState] = useState<'closed' | 'minimized' | 'expanded'>('minimized');
  const [mobileCardTab, setMobileCardTab] = useState<'core' | 'stories' | 'materials' | 'map'>('core');
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [radialMenu, setRadialMenu] = useState<{
    node: SomaticNode;
    x: number;
    y: number;
  } | null>(null);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Swiping detectors and handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent, handlers: {
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
  }) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const threshold = 40;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      }
    } else {
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    }
  };

  const switchMobileTab = (dir: 'left' | 'right') => {
    const tabs: ('core' | 'stories' | 'materials' | 'map')[] = ['core', 'stories', 'materials', 'map'];
    const currentIndex = tabs.indexOf(mobileCardTab);
    if (dir === 'left') {
      if (currentIndex < tabs.length - 1) {
        setMobileCardTab(tabs[currentIndex + 1]);
      }
    } else {
      if (currentIndex > 0) {
        setMobileCardTab(tabs[currentIndex - 1]);
      }
    }
  };

  const handleCardSwipeUp = () => {
    if (mobileCardState === 'minimized') {
      setMobileCardState('expanded');
    }
  };

  const handleCardSwipeDown = () => {
    if (mobileCardState === 'expanded') {
      setMobileCardState('minimized');
    } else if (mobileCardState === 'minimized') {
      setMobileCardState('closed');
      setSelectedNodeId(null);
    }
  };

  const handleCardSwipeLeft = () => {
    if (mobileCardState === 'expanded') {
      switchMobileTab('left');
    }
  };

  const handleCardSwipeRight = () => {
    if (mobileCardState === 'expanded') {
      switchMobileTab('right');
    }
  };

  const handleLongPressNode = (node: SomaticNode, cursorX: number, cursorY: number) => {
    setRadialMenu({
      node,
      x: cursorX,
      y: cursorY
    });
    setSelectedNodeId(node.id);
  };

  const handleAddingStoryFromMobile = (nodeId: string, text: string) => {
    handleAddStory(nodeId, text);
  };

  // Sync mobileCardState and activePanel on node selection changes
  useEffect(() => {
    if (selectedNodeId) {
      setMobileCardState('minimized');
      setActivePanel('card');
    } else {
      if (activePanel === 'card') {
        setMobileCardState('closed');
        setActivePanel(null);
      }
    }
  }, [selectedNodeId]);

  useEffect(() => {
    if (activePanel === null) {
      setSelectedNodeId(null);
      setMobileCardState('closed');
    } else if (activePanel === 'card') {
      if (!selectedNodeId) {
        setSelectedNodeId('soma-hanna');
      }
      setMobileCardState('minimized');
    } else {
      setMobileCardState('minimized');
    }
  }, [activePanel]);

  // Temporary spawn pulse tracking
  const [customAscendingNode, setCustomAscendingNode] = useState<string | null>(null);

  // Try real backend fetching but gracefully work locally offline
  useEffect(() => {
    async function loadBackendData() {
      try {
        const resNodes = await fetch('/api/nodes');
        if (resNodes.ok) {
          const fetchedNodes = await resNodes.json();
          if (fetchedNodes.length > 0) setNodes(fetchedNodes);
        }
        const resLinks = await fetch('/api/links');
        if (resLinks.ok) {
          const fetchedLinks = await resLinks.json();
          if (fetchedLinks.length > 0) setLinks(fetchedLinks);
        }
      } catch (e) {
        console.log('Using robust local state engine for offline preview.');
      }
    }
    loadBackendData();
  }, []);

  // Post changes helper to try endpoint sync if server routes are active
  const syncWithBackend = async (type: string, payload: any) => {
    try {
      await fetch(`/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // quiet fallback
    }
  };

  // Audio Progress Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          const currentAudio = SAMPLE_AUDIO[currentAudioIndex];
          const nextVal = prev + 1;
          
          if (nextVal >= currentAudio.duration) {
            setIsPlayingAudio(false);
            setActiveAudioNodeId(null);
            return 0;
          }

          // Search matching timeline node to activate glowing target
          const activeTimelineNode = currentAudio.timelineNodes
            .slice()
            .reverse()
            .find(t => nextVal >= t.time);

          if (activeTimelineNode) {
            setActiveAudioNodeId(activeTimelineNode.nodeId);
            setSelectedNodeId(activeTimelineNode.nodeId);
          } else {
            setActiveAudioNodeId(null);
          }

          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, currentAudioIndex]);

  // Handle click on audio timeline color dots
  const handleTimelineDotClick = (time: number, nodeId: string) => {
    setAudioProgress(time);
    setActiveAudioNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setIsPlayingAudio(true);
  };

  // Resonating Action
  const handleResonateNode = (id: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const resonances = n.resonances + 1;
        const score = Math.log10(Math.max(resonances * 1 + (n.connectionsCount || 0) * 5 + (n.carriesCount || 0) * 3 + (n.stories?.length || 0) * 2, 1));
        let status = n.status;
        if (status !== 'atlas') {
          if (score >= 2) status = 'rooted'; // log10(100) = 2
          else if (score >= 1.7) status = 'alive'; // log10(50) = ~1.7
          else if (score >= 1) status = 'sprout'; // log10(10) = 1
        }
        if (status !== n.status && status === 'rooted') {
          setAscendingNodeId(id);
          setTimeout(() => setAscendingNodeId(null), 3000);
        }
        return {
          ...n,
          resonances,
          score,
          status,
          trajectory: 'growing',
          lastActiveAt: Date.now()
        };
      }
      return n;
    }));

    // Trigger log activity
    const targetNode = nodes.find(n => n.id === id);
    const nodeName = targetNode ? (language === 'ru' ? targetNode.nameRu : targetNode.nameEn) : 'node';
    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      author: currentUser.name,
      textRu: `Вызвал резонанс в узле "${nodeName}"`,
      textEn: `Triggered resonance on "${nodeName}"`,
      timestamp: Date.now(),
      type: 'resonance'
    };
    setActivities(prev => [log, ...prev]);

    // Update user stats
    setCurrentUser(prev => ({
      ...prev,
      reputation: prev.reputation + 5,
      archetype: recalculateArchetype(prev.spawnedCount, prev.storiesCount, prev.linksCount, prev.reputation + 5)
    }));

    syncWithBackend('resonate', { nodeId: id, userName: currentUser.name });
  };

  // Pocket Landmarks
  const handlePocketNode = (id: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const carriesCount = (n.carriesCount || 0) + 1;
        const score = Math.log10(Math.max(n.resonances * 1 + (n.connectionsCount || 0) * 5 + carriesCount * 3 + (n.stories?.length || 0) * 2, 1));
        let status = n.status;
        if (status !== 'atlas') {
          if (score >= 2) status = 'rooted';
          else if (score >= 1.7) status = 'alive';
          else if (score >= 1) status = 'sprout';
        }
        if (status !== n.status && status === 'rooted') {
          setAscendingNodeId(id);
          setTimeout(() => setAscendingNodeId(null), 3000);
        }
        return {
          ...n,
          carriesCount,
          score,
          status,
          trajectory: 'growing',
          lastActiveAt: Date.now()
        };
      }
      return n;
    }));

    // Alert / Log activity
    const targetNode = nodes.find(n => n.id === id);
    const nodeName = targetNode ? (language === 'ru' ? targetNode.nameRu : targetNode.nameEn) : 'node';
    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      author: currentUser.name,
      textRu: `Положил в свой кармашек веху "${nodeName}"`,
      textEn: `Pocketed concept landmark "${nodeName}"`,
      timestamp: Date.now(),
      type: 'pocket'
    };
    setActivities(prev => [log, ...prev]);

    setCurrentUser(prev => ({
      ...prev,
      reputation: prev.reputation + 2
    }));

    syncWithBackend('pocket', { nodeId: id, userName: currentUser.name });
  };

  // Add Story Log Action
  const handleAddStory = (id: string, text: string) => {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      author: currentUser.name,
      text,
      createdAt: Date.now()
    };

    setStories(prev => [newStory, ...prev]);

    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const storiesCount = (n.storiesCount || 0) + 1;
        const score = Math.log10(Math.max(n.resonances * 1 + (n.connectionsCount || 0) * 5 + (n.carriesCount || 0) * 3 + storiesCount * 2, 1));
        let status = n.status;
        if (status !== 'atlas') {
          if (score >= 2) status = 'rooted';
          else if (score >= 1.7) status = 'alive';
          else if (score >= 1) status = 'sprout';
        }
        if (status !== n.status && status === 'rooted') {
          setAscendingNodeId(id);
          setTimeout(() => setAscendingNodeId(null), 3000);
        }
        return {
          ...n,
          storiesCount,
          score,
          status,
          trajectory: 'growing',
          lastActiveAt: Date.now()
        };
      }
      return n;
    }));

    const targetNode = nodes.find(n => n.id === id);
    const nodeName = targetNode ? (language === 'ru' ? targetNode.nameRu : targetNode.nameEn) : 'node';
    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      author: currentUser.name,
      textRu: `Написал историю опыта к "${nodeName}"`,
      textEn: `Wrote sensory experience story for "${nodeName}"`,
      timestamp: Date.now(),
      type: 'story'
    };
    setActivities(prev => [log, ...prev]);

    setCurrentUser(prev => {
      const nextCount = prev.storiesCount + 1;
      return {
        ...prev,
        storiesCount: nextCount,
        reputation: prev.reputation + 15,
        archetype: recalculateArchetype(prev.spawnedCount, nextCount, prev.linksCount, prev.reputation + 15)
      };
    });

    syncWithBackend('story', { nodeId: id, text, author: currentUser.name });
  };

  // Add Link/Connected Flow Action
  const handleAddLink = (source: string, target: string, type: any) => {
    const linkId = `link-${Date.now()}`;
    const newLink: SomaticLink = {
      id: linkId,
      source,
      target,
      activity: 5,
      resonanceWeight: 1.5,
      type
    };

    setLinks(prev => [...prev, newLink]);

    setNodes(prev => prev.map(n => {
      if (n.id === source || n.id === target) {
        const connectionsCount = (n.connectionsCount || 0) + 1;
        const score = Math.log10(Math.max(n.resonances * 1 + connectionsCount * 5 + (n.carriesCount || 0) * 3 + (n.stories?.length || 0) * 2, 1));
        let status = n.status;
        if (status !== 'atlas') {
          if (score >= 2) status = 'rooted';
          else if (score >= 1.7) status = 'alive';
          else if (score >= 1) status = 'sprout';
        }
        if (status !== n.status && status === 'rooted') {
          setAscendingNodeId(n.id);
          setTimeout(() => setAscendingNodeId(null), 3000);
        }
        return {
          ...n,
          connectionsCount,
          score,
          status,
          trajectory: 'growing',
          lastActiveAt: Date.now()
        };
      }
      return n;
    }));

    const srcNode = nodes.find(n => n.id === source);
    const tNode = nodes.find(n => n.id === target);
    const srcName = srcNode ? (language === 'ru' ? srcNode.nameRu : srcNode.nameEn) : 'A';
    const tName = tNode ? (language === 'ru' ? tNode.nameRu : tNode.nameEn) : 'B';

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      author: currentUser.name,
      textRu: `Запустил поток связи между "${srcName}" и "${tName}" [${type}]`,
      textEn: `Launched connected flow between "${srcName}" and "${tName}" [${type}]`,
      timestamp: Date.now(),
      type: 'link'
    };
    setActivities(prev => [log, ...prev]);

    setCurrentUser(prev => {
      const nextCount = prev.linksCount + 1;
      return {
        ...prev,
        linksCount: nextCount,
        reputation: prev.reputation + 10,
        archetype: recalculateArchetype(prev.spawnedCount, prev.storiesCount, nextCount, prev.reputation + 10)
      };
    });

    syncWithBackend('link', { source, target, type });
  };

  // Answer Questions on Community Board
  const handleAddAnswer = (qId: string, answerText: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const newAns = {
          id: `ans-${Date.now()}`,
          author: currentUser.name,
          text: answerText,
          createdAt: Date.now()
        };
        return {
          ...q,
          participants: q.participants + 1,
          answers: [...q.answers, newAns]
        };
      }
      return q;
    }));

    setCurrentUser(prev => ({
      ...prev,
      reputation: prev.reputation + 8
    }));
  };

  // Recalculates user archetype dynamically based on action stats
  const recalculateArchetype = (spawned: number, stories: number, linksCount: number, rep: number) => {
    const maxVal = Math.max(spawned, stories, linksCount);
    if (maxVal === 0) return 'BRIDGE';
    
    // Check balanced spreads
    const average = (spawned + stories + linksCount) / 3;
    const dev = (Math.abs(spawned - average) + Math.abs(stories - average) + Math.abs(linksCount - average)) / 3;
    if (dev < 1.8 && (spawned > 2 || stories > 2)) return 'BRIDGE';

    if (maxVal === spawned) return 'PIONEER';
    if (maxVal === stories) return 'STORYTELLER';
    if (maxVal === linksCount) return 'CONNECTOR';
    return 'RESONATOR';
  };

  // NLP Spawner Actions
  const handleConfirmSpawnConcept = (newNode: SomaticNode) => {
    // Generate organic physical coordinates in 3D
    const enriched: SomaticNode = {
      ...newNode,
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 40,
      z: (Math.random() - 0.5) * 15,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      vz: (Math.random() - 0.5) * 1.5
    };

    setNodes(prev => [...prev, enriched]);
    setSelectedNodeId(enriched.id);

    // Dynamic logging
    const nodeName = language === 'ru' ? enriched.nameRu : enriched.nameEn;
    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      author: currentUser.name,
      textRu: `Укоренил живой росток концепта "${nodeName}"`,
      textEn: `Sprouted concept landmark "${nodeName}"`,
      timestamp: Date.now(),
      type: 'pocket'
    };
    setActivities(prev => [log, ...prev]);

    // Update profile stats
    setCurrentUser(prev => {
      const nextCount = prev.spawnedCount + 1;
      return {
        ...prev,
        spawnedCount: nextCount,
        reputation: prev.reputation + 25,
        archetype: recalculateArchetype(nextCount, prev.storiesCount, prev.linksCount, prev.reputation + 25)
      };
    });

    setCustomAscendingNode(enriched.id);
    setTimeout(() => setCustomAscendingNode(null), 2000);
  };

  // Sign in and simulate Google Login defaults
  const handleGoogleLogin = () => {
    setIsLoggedOut(false);
    setCurrentUser(INITIAL_USERS[0]); // Roman Botov botovroman45@gmail.com
  };

  useEffect(() => {
    const hintsShown = localStorage.getItem('su_hints_shown');
    if (!hintsShown) {
      setShowHints(true);
      const timer = setTimeout(() => {
        setShowHints(false);
        localStorage.setItem('su_hints_shown', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedAudio = SAMPLE_AUDIO[currentAudioIndex];

  // Map Filter: check matching world spaces
  const filteredNodes = nodes.filter(n => {
    if (overlayUser && n.addedBy !== overlayUser && n.authorRu !== overlayUser && n.authorEn !== overlayUser) {
      if (!n.id.includes(overlayUser)) return false;
    }
    return n.world === currentWorld;
  });

  const epochsListRu = [
    'Канонические Эпохи (Все)',
    'Античность & Древность (Планка 1)',
    'Средневековье (Планка 2)',
    'Ренессанс & Новое время (Планка 3)',
    'XIX Век (Планка 4)',
    'Начало XX Века (Планка 5)',
    'Середина XX Века (Планка 6)',
    'Конец XX Века (Планка 7)',
    'Современность & ИИ (Планка 8)'
  ];

  const epochsListEn = [
    'All Historical Epochs',
    'Antiquity & Origins (Tier 1)',
    'Middle Ages (Tier 2)',
    'Renaissance & Modernity (Tier 3)',
    '19th Century (Tier 4)',
    'Early 20th Century (Tier 5)',
    'Mid 20th Century (Tier 6)',
    'Late 20th Century (Tier 7)',
    'Present Day & AI (Tier 8)'
  ];

  const epochsList = language === 'ru' ? epochsListRu : epochsListEn;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030306] text-slate-100 font-sans antialiased select-none">
      
      {/* 1. VISUAL ONBOARDING STORY */}
      {showOnboarding && (
        <Onboarding 
          language={language}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* 2. ADD SENSE CREATION INPUT MODAL */}
      {isAddSenseOpen && (
        <AddSenseModal
          language={language}
          allNodes={nodes}
          onConfirmSpawnConcept={handleConfirmSpawnConcept}
          onConfirmSpawnLink={handleAddLink}
          onConfirmAppendStory={handleAddStory}
          onClose={() => setIsAddSenseOpen(false)}
        />
      )}

      {/* 3. SIMULATED GOOGLE ACCOUNT LOCKSCREEN */}
      {isLoggedOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md">
          <div className="max-w-xs w-full bg-slate-900 border border-white/5 p-6 rounded-2xl text-center flex flex-col gap-5">
            <Orbit className="w-10 h-10 text-indigo-400 mx-auto animate-spin" />
            <div>
              <h3 className="text-sm font-mono uppercase tracking-widest font-black text-white">Google Workspace</h3>
              <p className="text-xs text-slate-400 mt-1">{language === 'ru' ? 'Введите аккаунт для синхронизации' : 'Sign in to sync your biomorphic notes'}</p>
            </div>
            <button
              onClick={handleGoogleLogin}
              id="google-login-btn"
              className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <span>botovroman45@gmail.com</span>
            </button>
            <p className="text-[10px] text-gray-500 font-mono">Seamless Universe v13</p>
          </div>
        </div>
      )}

      {/* ==========================================
          PRIMARY SCREEN MASTER LAYOUT 
          ========================================== */}
      
      {/* RIGHT SLIDING PANEL OVERLAY (DESKTOP) */}
      <aside 
        className={`w-[420px] shrink-0 md:flex hidden flex-col border-l border-white/5 bg-slate-950/80 backdrop-blur-xl z-30 fixed inset-y-0 right-0 overflow-y-auto custom-scrollbar transition-transform duration-300 ${
          activePanel ? 'translate-x-0' : 'translate-x-full'
        } ${isZenMode ? '!translate-x-full' : ''}`}
      >
        
        {/* PANEL HEADER WITH SWITCH SELECTORS & CLOSE CONTROLS */}
        <div className="p-5 border-b border-white/5 bg-black/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {activePanel === 'card' && <Compass className="w-5 h-5 text-indigo-400" />}
            {activePanel === 'audio' && <Radio className="w-5 h-5 text-amber-400 animate-pulse" />}
            {activePanel === 'agenda' && <BookOpen className="w-5 h-5 text-indigo-400" />}
            {activePanel === 'profile' && <User className="w-5 h-5 text-teal-400" />}
            <span className="font-mono text-xs font-black uppercase text-white tracking-widest">
              {activePanel === 'card' && (language === 'ru' ? 'Веха' : 'Landmark')}
              {activePanel === 'audio' && (language === 'ru' ? 'Аудио-Станция' : 'Sound Station')}
              {activePanel === 'agenda' && (language === 'ru' ? 'Повестка' : 'Agenda')}
              {activePanel === 'profile' && (language === 'ru' ? 'Мой профайл' : 'Explorer Profile')}
            </span>
          </div>

          <button
            onClick={() => setActivePanel(null)}
            className="p-1 px-2 border border-white/10 rounded-lg text-slate-400 bg-white/5 hover:text-white transition active:scale-95 cursor-pointer"
            title="Close Panel (Esc / Swipe)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ULTRA-MINIMALIST SIDEBAR TAB SELECTOR GIVING EXPLORERS DIRECT DESKTOP SWAP */}
        <div className="px-5 py-3 border-b border-white/5 bg-slate-950/90 flex gap-1 select-none shrink-0">
          {([
            { id: 'card', label: language === 'ru' ? 'Карточка' : 'Landmark', icon: Compass, color: 'text-indigo-400' },
            { id: 'audio', label: language === 'ru' ? 'Звук' : 'Sound', icon: Radio, color: 'text-amber-400' },
            { id: 'agenda', label: language === 'ru' ? 'Повестка' : 'Agenda', icon: BookOpen, color: 'text-indigo-400' },
            { id: 'profile', label: language === 'ru' ? 'Профиль' : 'Profile', icon: User, color: 'text-teal-400' }
          ] as const).map((tab) => {
            const isSelected = activePanel === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={`flex-1 py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer duration-200 ${
                  isSelected 
                    ? 'bg-slate-900 border-white/10 text-white shadow-lg' 
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={tab.label}
              >
                <Icon className={`w-4 h-4 ${tab.color} ${isSelected && tab.id === 'audio' ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''}`} />
                <span className="text-[8.5px] font-mono tracking-wider font-extrabold uppercase">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTAINER CONTENT INSIDE DYNAMIC VIEWPORTS */}
        <div className="grow p-5 overflow-y-auto custom-scrollbar flex flex-col gap-5 text-left">
          {activePanel === 'card' && (
            selectedNode ? (
              <ConceptDetails
                node={selectedNode}
                links={links}
                stories={stories}
                allNodes={nodes}
                language={language}
                onSelectNode={(id) => setSelectedNodeId(id)}
                onResonate={handleResonateNode}
                onCarryPocket={handlePocketNode}
                onAddStory={handleAddStory}
                isResonated={selectedNode ? true : false}
                isCarried={selectedNode ? true : false}
                playAudio={(id) => {
                  setActiveAudioNodeId(id);
                  setIsPlayingAudio(true);
                }}
                isActiveAudio={activeAudioNodeId === selectedNodeId}
                onAddLink={handleAddLink}
              />
            ) : (
              <p className="text-xs text-slate-500 italic text-center border border-dashed border-white/5 p-8 rounded-2xl">
                {language === 'ru' ? 'Выберите любую соматическую сферу на 3D графе, чтобы запустить инспектор.' : 'Select any somatic sphere in the 3D grid layout to inspect.'}
              </p>
            )
          )}

          {activePanel === 'agenda' && (
            <div className="flex flex-col gap-5">
              <CommunityAgenda
                language={language}
                questions={questions}
                onSelectNode={(id) => { setSelectedNodeId(id); setActivePanel('card'); }}
                onAddAnswerToQuestion={handleAddAnswer}
              />
              
              <div className="border-t border-white/5 pt-4 mt-2 flex flex-col gap-3">
                <h3 className="text-[10px] font-mono font-extrabold tracking-wider text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>{language === 'ru' ? 'ЛОГ АКТИВНОСТИ ВСЕЛЕННОЙ' : 'LIVE EXPERIENCE STREAMS'}</span>
                </h3>
                
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {activities.map((act) => (
                    <div key={act.id} className="p-3 bg-slate-900/40 border border-white/5 rounded-xl text-left flex flex-col gap-0.5 leading-snug">
                      <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-500">
                        <span className="font-extrabold text-indigo-400">{act.author}</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] text-slate-200 mt-1 font-sans font-medium">
                        {language === 'ru' ? act.textRu : act.textEn}
                      </p>
                      <span className="text-[8px] font-mono uppercase text-gray-500 mt-1 font-bold">➔ type {act.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePanel === 'audio' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-2xl border border-white/5 text-center leading-snug">
                <div className="relative w-24 h-24 mb-4 rounded-full border border-indigo-500/20 flex items-center justify-center bg-black/60 shadow-xl overflow-hidden">
                  <div className={`absolute inset-1 rounded-full border border-dashed border-indigo-400/30 ${isPlayingAudio ? 'animate-[spin_12s_linear_infinite]' : ''}`} />
                  <Radio className={`w-8 h-8 text-indigo-400 ${isPlayingAudio ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''}`} />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{language === 'ru' ? selectedAudio.titleRu : selectedAudio.title}</h3>
                <p className="text-[9.5px] font-mono text-indigo-400 uppercase tracking-widest mt-1.5">Soma Channel Broadcaster</p>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => {
                      setIsPlayingAudio(!isPlayingAudio);
                      if (!isPlayingAudio && !activeAudioNodeId) {
                        setActiveAudioNodeId('soma-hanna');
                      }
                    }}
                    className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition shadow-md"
                  >
                    {isPlayingAudio ? (language === 'ru' ? 'ПАУЗА' : 'PLAY') : (language === 'ru' ? 'СТАРТ' : 'PLAY')}
                  </button>
                  <button
                    onClick={() => {
                      setIsPlayingAudio(false);
                      setAudioProgress(0);
                      setActiveAudioNodeId(null);
                      setCurrentAudioIndex(p => (p + 1) % SAMPLE_AUDIO.length);
                    }}
                    className="p-1 px-2 border border-white/10 rounded-lg text-slate-400 hover:bg-white/5 active:scale-95 transition"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                <h4 className="text-[10px] font-mono font-extrabold uppercase tracking-wide text-slate-400">{language === 'ru' ? 'БИОМОРФНЫЙ ПЛЕЙЛИСТ' : 'BIOMORPHIC MUSIC CASTS'}</h4>
                <div className="flex flex-col gap-2">
                  {SAMPLE_AUDIO.map((aud, index) => {
                    const isSelected = index === currentAudioIndex;
                    return (
                      <button
                        key={aud.id}
                        onClick={() => {
                          setCurrentAudioIndex(index);
                          setAudioProgress(0);
                          setIsPlayingAudio(true);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition ${
                          isSelected ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-slate-900/30 border-white/5 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-[10px] font-mono text-indigo-400">0{index + 1}</span>
                          <span className={`text-xs font-bold leading-tight truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>{language === 'ru' ? aud.titleRu : aud.title}</span>
                        </div>
                        {isSelected && isPlayingAudio ? (
                          <span className="text-[9px] font-mono text-indigo-400">PLAYING</span>
                        ) : (
                          <Play className="w-3 h-3 text-slate-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activePanel === 'profile' && (
            <UserProfile
              language={language}
              user={currentUser}
              onUpdatePrivacy={(settings) => setCurrentUser(prev => ({ ...prev, privacySettings: settings }))}
              onLogout={() => setIsLoggedOut(true)}
            />
          )}
        </div>

      </aside>

      {/* DETACHED MAIN VISUAL CANVAS WRAPPER */}
      <main className={`grow flex flex-col relative h-full overflow-hidden bg-[#050508] transition-all duration-300 ${activePanel && mobileCardState === 'expanded' ? 'md:mr-[420px]' : ''}`}>
        
        {/* TOP HUD BAR - NAVIGATION SEARCH & AUDIO */}
        <header className="absolute top-6 left-6 right-6 z-35 pointer-events-none flex justify-between items-start select-none">
          
          {/* LEFT PORTION HUD: AVATAR & ZEN (MINIMAL) */}
          <div className="flex gap-4 pointer-events-auto">
            {/* AVATAR PROFILE BUTTON TRIGGER (TOP LEFT HUD) */}
            <button
              onClick={() => setActivePanel(activePanel === 'profile' ? null : 'profile')}
              id="avatar-hud-trigger-btn"
              className="w-10 h-10 bg-slate-950/80 backdrop-blur-md rounded-full border border-white/10 text-white flex items-center justify-center hover:bg-slate-900 active:scale-95 transition cursor-pointer shadow-xl"
              title="UserProfile panel"
            >
              <div className="w-7 h-7 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-mono font-black text-teal-400 text-xs">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
            </button>
          </div>

          {/* RIGHT PORTION HUD: FILTERS & LANGUAGE (MINIMAL) */}
          <div className="flex gap-4 pointer-events-auto select-none">
            {/* LANGUAGE TOGGLER CAPSULE */}
            <button
              onClick={() => setLanguage(l => l === 'ru' ? 'en' : 'ru')}
              className="w-10 h-10 bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-black text-white uppercase rounded-full border border-white/10 hover:bg-slate-900 cursor-pointer active:scale-95 transition flex items-center justify-center shadow-xl"
              title="Change Language"
            >
              {language === 'ru' ? 'EN' : 'RU'}
            </button>

            {/* DYNAMIC FILTERS CURTAIN BUTTON (TOP RIGHT HUD) */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              id="filters-curtain-trigger-btn"
              className="w-10 h-10 bg-slate-950/80 backdrop-blur-md rounded-full border border-white/10 text-slate-350 hover:bg-slate-900 active:scale-95 transition cursor-pointer flex items-center justify-center shadow-xl"
              title="Seismic Filters Dropdown Curtain"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
            </button>
          </div>

        </header>

        {/* FIELD MODE TABS (ONLY IN FIELD WORLD) */}
        {currentWorld === 'field' && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-white/5 flex gap-1 shadow-2xl">
            <button
              onClick={() => setFieldMode('graph')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer ${fieldMode === 'graph' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {language === 'ru' ? 'ГРАФ' : 'GRAPH'}
            </button>
            <button
              onClick={() => setFieldMode('stream')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer ${fieldMode === 'stream' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {language === 'ru' ? 'ПОТОК' : 'STREAM'}
            </button>
          </div>
        )}

        {/* 3D GRAPH CANVAS VISUALIZER COMPONENT */}
        <div className={`grow w-full h-full relative z-0 ${currentWorld === 'field' && fieldMode === 'stream' ? 'hidden' : 'block'}`}>
          <MyceliumGraph
            nodes={filteredNodes}
            links={links}
            currentWorld={currentWorld}
            language={language}
            onNodeSelect={(n) => { setSelectedNodeId(n.id); setIsMobilePanelOpen(false); }}
            selectedNodeId={selectedNodeId}
            overlayUser={overlayUser}
            resonatedNodeIds={new Set(nodes.filter(n => n.resonances > 50).map(n => n.id))}
            carriedNodeIds={new Set(nodes.filter(n => (n.carriesCount || 0) > 0).map(n => n.id))}
            currentUserName={currentUser.name}
            activeAudioNodeId={activeAudioNodeId}
            selectedEpoch={selectedEpoch}
            vibeMode={vibeMode}
            ascendingNodeId={ascendingNodeId || customAscendingNode}
            communityUsers={users}
            fieldSubMode="ideas"
            onUserSelect={() => {}}
            onLongPressNode={handleLongPressNode}
          />
        </div>

        {/* FIELD STREAM MODE COMPONENT */}
        {currentWorld === 'field' && fieldMode === 'stream' && (
          <div className="grow w-full h-full overflow-y-auto custom-scrollbar bg-[#050508] p-6 pt-36">
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              {filteredNodes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map(node => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => { setSelectedNodeId(node.id); setActivePanel('card'); setMobileCardState('minimized'); }}
                  className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[node.domain] }} />
                      <span className="text-[10px] font-mono uppercase font-black text-slate-500">{node.domain}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600">{new Date(node.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{language === 'ru' ? node.nameRu : node.nameEn}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">{language === 'ru' ? node.descriptionRu : node.descriptionEn}</p>
                  <div className="flex gap-4 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-black">{node.resonances}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-400">
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-black">{node.connectionsCount || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* COMPACT FLOATING AUDIO & CHRONO HUD (BOTTOM LEFT) */}
        <footer 
          className={`absolute bottom-6 left-6 z-15 pointer-events-none md:flex hidden flex-col gap-2.5 max-w-[320px] w-full transition-all duration-300 ${
            isZenMode ? 'translate-y-44 opacity-0 scale-95' : 'translate-y-0 opacity-100'
          }`}
        >
          
          {/* CORE PLAYLIST AND DOT TIMELINES COLLIDER */}
          <div className="bg-slate-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto flex flex-col gap-2 w-full text-left">
            <div className="flex items-center justify-between gap-2.5 text-xs font-mono">
              <div className="flex items-center gap-1.5 truncate grow">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                <span className="text-gray-300 font-bold truncate text-[10.5px]">
                  {language === 'ru' ? selectedAudio.titleRu : selectedAudio.title}
                </span>
              </div>

              {/* Control audio buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] font-black rounded-lg transition active:scale-95 flex items-center gap-0.5 cursor-pointer"
                >
                  {isPlayingAudio ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                  <span>{isPlayingAudio ? 'PAUSE' : 'PLAY'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsPlayingAudio(false);
                    setAudioProgress(0);
                    setActiveAudioNodeId(null);
                    setCurrentAudioIndex(p => (p + 1) % SAMPLE_AUDIO.length);
                  }}
                  className="p-1 px-1.5 border border-white/5 rounded-lg text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 transition"
                  title="Next Sound"
                >
                  <Shuffle className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* TIMELINE SLIDER TRACK WRAPPED WITH METRIC POINTS COHERENCE */}
            <div className="relative mt-1">
              <div className="w-full h-1 bg-white/5 rounded-full relative p-0 flex items-center">
                
                {/* Simulated dynamic play fill bar */}
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300 bg-gradient-to-r from-indigo-500 to-indigo-300"
                  style={{ width: `${(audioProgress / selectedAudio.duration) * 100}%` }}
                />

                {/* DOMAIN COLORED CLICKABLE TIMELINE DOT TARGETS */}
                {selectedAudio.timelineNodes.map((tNode) => {
                  const nodeObj = nodes.find(n => n.id === tNode.nodeId);
                  const color = nodeObj ? (DOMAIN_COLORS[nodeObj.domain] || '#FFFFFF') : '#FFFFFF';
                  const percent = (tNode.time / selectedAudio.duration) * 100;

                  return (
                    <button
                      key={tNode.nodeId}
                      onClick={() => handleTimelineDotClick(tNode.time, tNode.nodeId)}
                      className="absolute w-3 h-3 rounded-full border border-black p-0 focus:outline-none -translate-x-1/2 hover:scale-135 transition z-10 cursor-pointer shadow-lg shadow-black/80"
                      style={{ 
                        left: `${percent}%`, 
                        backgroundColor: color,
                        boxShadow: `0 0 6px ${color}88` 
                      }}
                      title={`Jump to ${nodeObj ? (language === 'ru' ? nodeObj.nameRu : nodeObj.nameEn) : tNode.nodeId}`}
                    />
                  );
                })}

              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1.5 leading-none">
                <span>{Math.floor(audioProgress / 60)}:{(audioProgress % 60) < 10 ? '0' : ''}{audioProgress % 60}</span>
                <span>{Math.floor(selectedAudio.duration / 60)}:{selectedAudio.duration % 60}</span>
              </div>
            </div>
          </div>

          {/* HISTORICAL TIMES SECULAR SLIDER RANGE */}
          <div className="bg-slate-950/80 backdrop-blur-md p-3 px-4 rounded-2xl border border-white/5 shadow-2xl pointer-events-auto flex flex-col gap-1 w-full text-left">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono uppercase text-gray-400 shrink-0 flex items-center gap-1.5 font-bold">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'ru' ? 'Эпохи:' : 'Epochs:'}</span>
              </span>
              <span className="text-[10.5px] font-mono text-indigo-450 font-extrabold text-right">
                {selectedEpoch === 0 ? 'ALL' : `T${selectedEpoch}`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 select-none text-center">
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={selectedEpoch}
                onChange={(e) => setSelectedEpoch(parseInt(e.target.value))}
                className="grow accent-indigo-500 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="text-[9px] font-mono text-slate-400 leading-tight border-t border-white/5 pt-1.5 mt-0.5 truncate">
              {epochsList[selectedEpoch]}
            </div>
          </div>

        </footer>

        {/* ==========================================
            UNIFIED BOTTOM DOCK HUD (ALL SCREENS)
            ========================================== */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-35 pointer-events-none flex items-center gap-6 select-none transition-all duration-300 ${
          isZenMode ? 'translate-y-28 opacity-0 scale-95' : 'translate-y-0 opacity-100'
        }`}>
          {/* ATLAS ● FIELD ● ME world switching navigation dots */}
          <div className="pointer-events-auto bg-slate-950/90 border border-white/10 backdrop-blur-md p-2 px-4 rounded-full shadow-2xl flex items-center gap-4">
            {([
              { id: 'atlas', label: 'ATLAS' },
              { id: 'field', label: 'FIELD' },
              { id: 'me', label: 'ME' }
            ] as const).map((w) => {
              const isActive = currentWorld === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    setCurrentWorld(w.id);
                    setActivePanel(null); // Close active panels on world switch
                    if (w.id === 'atlas') setSelectedNodeId('soma-hanna');
                    else if (w.id === 'field') setSelectedNodeId('field-gaze');
                    else if (w.id === 'me') setSelectedNodeId('central-me');
                  }}
                  className="flex items-center justify-center p-1 cursor-pointer group"
                  title={w.label}
                >
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-indigo-500 scale-125 shadow-[0_0_10px_#6366f1]' : 'bg-slate-600 hover:bg-slate-400'
                  }`} />
                </button>
              );
            })}

            {/* ADD SENSE PLUS BUTTON (Inline with navigation) */}
            <button
              onClick={() => setIsAddSenseOpen(true)}
              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 border border-white/10 shadow-lg flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer ml-1"
              title="Add Sense (+)"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TEMPORARY CONTROL HINTS */}
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
            >
              <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl text-center">
                <p className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase font-black">
                  {language === 'ru'
                    ? 'Зажми узел для меню • Свайп вверх для деталей'
                    : 'Long press node for menu • Swipe up for details'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* ==========================================
            UNIFIED RADIAL MENU (LONG PRESS ACTION)
            ========================================== */}
        {radialMenu && (
          <RadialMenu
            node={radialMenu.node}
            x={radialMenu.x}
            y={radialMenu.y}
            language={language}
            onClose={() => setRadialMenu(null)}
            onAction={(action) => {
              if (action === 'resonate') handleResonateNode(radialMenu.node.id);
              if (action === 'carry') handlePocketNode(radialMenu.node.id);
              if (action === 'link') {
                setActivePanel('card');
                setMobileCardState('expanded');
                setMobileCardTab('map');
              }
              if (action === 'story') {
                setActivePanel('card');
                setMobileCardState('expanded');
                setMobileCardTab('stories');
              }
            }}
          />
        )}

        {/* ==========================================
            UNIFIED BOTTOM SHEET PANEL (MOBILE)
            ========================================== */}
        {activePanel && (
          <div 
            className={`md:hidden fixed inset-x-0 bottom-0 z-30 bg-slate-950/95 border-t border-white/10 rounded-t-3xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
              mobileCardState === 'expanded' ? 'h-[90vh]' : mobileCardState === 'minimized' ? 'h-[30vh]' : 'h-0'
            }`}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, {
              onSwipeUp: () => setMobileCardState('expanded'),
              onSwipeDown: () => {
                if (mobileCardState === 'expanded') {
                  setMobileCardState('minimized');
                } else {
                  setActivePanel(null);
                }
              }
            })}
          >
            {/* iOS drag indicator handle */}
            <div 
              className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3 shrink-0 cursor-pointer"
              onClick={() => setMobileCardState(mobileCardState === 'expanded' ? 'minimized' : 'expanded')}
            />

            {/* SLEEK MOBILE TAB BAR SWITCHER INSIDE SHEET */}
            <div className="flex border-b border-white/5 px-4 pb-2.5 gap-1 shrink-0 select-none">
              {([
                { id: 'card', label: language === 'ru' ? 'Веха' : 'Card', icon: Compass, color: 'text-indigo-400' },
                { id: 'audio', label: language === 'ru' ? 'Звук' : 'Sound', icon: Radio, color: 'text-amber-400' },
                { id: 'agenda', label: language === 'ru' ? 'Повестка' : 'Agenda', icon: BookOpen, color: 'text-indigo-400' },
                { id: 'profile', label: language === 'ru' ? 'Профиль' : 'Profile', icon: User, color: 'text-teal-400' }
              ] as const).map((tab) => {
                const isSelected = activePanel === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActivePanel(tab.id);
                      setMobileCardState('minimized');
                    }}
                    className={`flex-1 py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all text-xs border duration-200 active:scale-95 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 border-white/10 text-white shadow-lg' 
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${tab.color} ${isSelected && tab.id === 'audio' ? 'animate-pulse' : ''}`} />
                    <span className="text-[8.5px] font-mono tracking-wider font-extrabold uppercase">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* MINIMIZED STATE BODY */}
            {mobileCardState === 'minimized' ? (
              <div className="px-5 pb-5 pt-3.5 flex flex-col justify-between grow h-full text-left overflow-hidden">
                {activePanel === 'card' && selectedNode && (
                  <div className="flex flex-col gap-0.5 cursor-pointer" onClick={() => setMobileCardState('expanded')}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DOMAIN_COLORS[selectedNode.domain] || '#DFB757' }} />
                      <span className="text-[9px] font-mono uppercase tracking-widest font-extrabold" style={{ color: DOMAIN_COLORS[selectedNode.domain] || '#DFB757' }}>{selectedNode.domain}</span>
                      <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">• {selectedNode.type}</span>
                    </div>
                    <h2 className="text-[17px] font-extrabold text-white tracking-tight leading-tight mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{language === 'ru' ? selectedNode.nameRu : selectedNode.nameEn}</h2>
                  </div>
                )}
                {activePanel === 'card' && !selectedNode && (
                  <div className="flex flex-col gap-0.5 cursor-pointer" onClick={() => setMobileCardState('expanded')}>
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span className="text-[9px] font-mono uppercase tracking-widest font-extrabold text-indigo-400">{language === 'ru' ? 'ВЫБЕРИТЕ ВЕХУ' : 'SELECT A LANDMARK'}</span>
                    </div>
                    <h2 className="text-[15px] font-extrabold text-slate-450 mt-1">{language === 'ru' ? 'Выберите сферу на 3D сцене' : 'Tap any node on 3D scene to inspect'}</h2>
                  </div>
                )}
                {activePanel === 'audio' && (
                  <div className="flex flex-col gap-0.5 cursor-pointer" onClick={() => setMobileCardState('expanded')}>
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span className="text-[9px] font-mono uppercase tracking-widest font-extrabold text-amber-500">{language === 'ru' ? 'АУДИО СТАНЦИЯ' : 'SOUND STATION'}</span>
                    </div>
                    <h2 className="text-[17px] font-extrabold text-white tracking-tight leading-tight mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{language === 'ru' ? selectedAudio.titleRu : selectedAudio.title}</h2>
                  </div>
                )}
                {activePanel === 'profile' && (
                  <div className="flex flex-col gap-0.5 cursor-pointer" onClick={() => setMobileCardState('expanded')}>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-[9px] font-mono uppercase tracking-widest font-extrabold text-teal-400">{language === 'ru' ? 'МОЙ КАБИНЕТ' : 'EXPLORER PROFILE'}</span>
                    </div>
                    <h2 className="text-[17px] font-extrabold text-white tracking-tight leading-tight mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{currentUser.name} ({currentUser.archetype})</h2>
                  </div>
                )}
                {activePanel === 'agenda' && (
                  <div className="flex flex-col gap-0.5 cursor-pointer" onClick={() => setMobileCardState('expanded')}>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[9px] font-mono uppercase tracking-widest font-extrabold text-indigo-400">{language === 'ru' ? 'СОВМЕСТНАЯ ПОВЕСТКА' : 'COMMUNITY AGENDA'}</span>
                    </div>
                    <h2 className="text-[17px] font-extrabold text-white tracking-tight leading-tight mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{language === 'ru' ? 'Живая повестка событий' : 'Questions & Streams'}</h2>
                  </div>
                )}

                {/* BOTTOM QUICK ACTIONS RAIL */}
                <div className="grid grid-cols-4 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 mt-auto select-none shrink-0 w-full">
                  {activePanel === 'card' && selectedNode ? (
                    <>
                      <button onClick={() => handleResonateNode(selectedNode.id)} className={`flex flex-col items-center justify-center py-2 rounded-lg active:scale-95 text-center cursor-pointer ${selectedNode.resonances > 50 ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400'}`}>
                        <Flame className="w-4 h-4 mb-0.5" />
                        <span className="text-[8px] font-mono font-bold uppercase">{selectedNode.resonances}</span>
                      </button>
                      <button onClick={() => handlePocketNode(selectedNode.id)} className={`flex flex-col items-center justify-center py-2 rounded-lg active:scale-95 text-center cursor-pointer ${(selectedNode.carriesCount || 0) > 0 ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-400'}`}>
                        <Pocket className="w-4 h-4 mb-0.5" />
                        <span className="text-[8px] font-mono font-bold uppercase">{language === 'ru' ? 'Карман' : 'Pocket'}</span>
                      </button>
                      <button onClick={() => { setMobileCardState('expanded'); setMobileCardTab('map'); }} className="flex flex-col items-center justify-center py-2 rounded-lg active:scale-95 text-center text-slate-400 cursor-pointer">
                        <Plus className="w-4 h-4 mb-0.5" />
                        <span className="text-[8px] font-mono font-bold uppercase">{language === 'ru' ? 'Связать' : 'Connect'}</span>
                      </button>
                      <button onClick={() => { setActiveAudioNodeId(selectedNode.id); setIsPlayingAudio(!isPlayingAudio); }} className={`flex flex-col items-center justify-center py-2 rounded-lg active:scale-95 text-center cursor-pointer ${activeAudioNodeId === selectedNode.id && isPlayingAudio ? 'bg-indigo-505/10 text-indigo-300 animate-pulse' : 'text-slate-400'}`}>
                        <Volume2 className="w-4 h-4 mb-0.5" />
                        <span className="text-[8px] font-mono font-bold uppercase truncate max-w-full">{isPlayingAudio && activeAudioNodeId === selectedNode.id ? (language === 'ru' ? 'Слушаю' : 'Somatic') : (language === 'ru' ? 'Звук' : 'Sonify')}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setMobileCardState('expanded')} className="col-span-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] font-bold rounded-lg transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'ru' ? 'РАЗВЕРНУТЬ ПОДРОБНОСТИ' : 'EXPAND INFO'}</span>
                      </button>
                      <button onClick={() => setActivePanel(null)} className="py-2 border border-white/10 text-slate-400 font-mono text-[9px] font-bold rounded-lg transition active:scale-95 flex items-center justify-center cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* EXPANDED STATE BODY */
              <div className="px-5 pb-6 pt-3 overflow-y-auto custom-scrollbar flex flex-col grow h-full max-h-[70vh]">
                
                {/* ACTIVE VIEW CARD VIEWPORT */}
                {activePanel === 'card' && (
                  selectedNode ? (
                    <div className="flex flex-col grow">
                      {/* Header title */}
                      <div className="border-b border-white/5 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: DOMAIN_COLORS[selectedNode.domain] || '#DFB757' }}
                          />
                          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                            {selectedNode.domain} • {selectedNode.type}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight mt-1 leading-none">
                          {language === 'ru' ? selectedNode.nameRu : selectedNode.nameEn}
                        </h2>
                      </div>

                      {/* TABS SELECTOR (Core, Stories, Science, Map) */}
                      <div className="flex border border-white/5 bg-slate-900 font-mono text-[9.5px] uppercase font-bold tracking-widest my-4 rounded-xl p-1 shrink-0 select-none">
                        {([
                          { id: 'core', ru: 'Суть', en: 'Core' },
                          { id: 'stories', ru: 'Истории', en: 'Stories' },
                          { id: 'materials', ru: 'Наука', en: 'Science' },
                          { id: 'map', ru: 'Карта', en: 'Map' }
                        ] as const).map((tb) => (
                          <button
                            key={tb.id}
                            onClick={() => setMobileCardTab(tb.id)}
                            className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                              mobileCardTab === tb.id 
                                ? 'bg-indigo-600 text-white shadow-md font-black' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {language === 'ru' ? tb.ru : tb.en}
                          </button>
                        ))}
                      </div>

                      {/* ACTIVE TAB CONTENT WINDOW */}
                      <div className="grow overflow-y-auto pr-1">
                        
                        {/* TAB 1: CORE (Суть) */}
                        {mobileCardTab === 'core' && (
                          <div className="flex flex-col gap-4 font-sans text-xs text-slate-300 leading-relaxed font-medium">
                            <p className="text-[13px] text-white leading-relaxed font-sans">
                              {language === 'ru' ? selectedNode.descriptionRu : selectedNode.descriptionEn}
                            </p>
                            {selectedNode.authorRu && (
                              <p className="font-mono text-[10.5px] text-slate-400 bg-white/5 p-2 rounded-lg border border-white/5">
                                <span className="text-slate-500 font-bold">{language === 'ru' ? 'Автор вехи: ' : 'Author landmark: '}</span>
                                {language === 'ru' ? selectedNode.authorRu : selectedNode.authorEn}
                                {selectedNode.epochEn ? ` (${selectedNode.epochEn})` : ''}
                              </p>
                            )}
                            {selectedNode.addedBy && (
                              <p className="font-mono text-[10.5px] text-indigo-400">
                                <span>{language === 'ru' ? 'Взброшено исследователем: ' : 'Injected by explorer: '}</span>
                                <span className="font-bold underline">{selectedNode.addedBy}</span>
                              </p>
                            )}

                            {/* Status metrics integration progress */}
                            <div className="border border-white/5 bg-slate-900/40 p-4 rounded-xl mt-1 flex flex-col gap-2.5">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-slate-400 uppercase font-bold">{language === 'ru' ? 'СТАТУС И ТРАЕКТОРИЯ' : 'STATUS & TRAJECTORY'}</span>
                                <span className="text-indigo-400 font-black uppercase">{selectedNode.status}</span>
                              </div>
                              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-0.5 relative">
                                <div 
                                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 bg-gradient-to-r from-indigo-500 to-indigo-300"
                                  style={{
                                    width: `${
                                      selectedNode.status === 'seed' ? 15 :
                                      selectedNode.status === 'sprout' ? 40 :
                                      selectedNode.status === 'alive' ? 70 :
                                      selectedNode.status === 'rooted' ? 90 : 100
                                    }%`
                                  }}
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center mt-1">
                                <div className="bg-black/20 py-2 rounded border border-white/5">
                                  <div className="text-[8px] font-mono text-slate-500 uppercase">{language === 'ru' ? 'Резонансы' : 'Resonances'}</div>
                                  <div className="text-xs font-bold text-amber-400 mt-1">♦ {selectedNode.resonances}</div>
                                </div>
                                <div className="bg-black/20 py-2 rounded border border-white/5">
                                  <div className="text-[8px] font-mono text-slate-500 uppercase">{language === 'ru' ? 'Карман' : 'Pocketed'}</div>
                                  <div className="text-xs font-bold text-emerald-400 mt-1">📥 {selectedNode.carriesCount || 0}</div>
                                </div>
                                <div className="bg-black/20 py-2 rounded border border-white/5">
                                  <div className="text-[8px] font-mono text-slate-500 uppercase">{language === 'ru' ? 'Динамика' : 'Maturity'}</div>
                                  <div className={`text-[10px] font-mono font-black uppercase mt-1 ${selectedNode.trajectory === 'growing' ? 'text-teal-400' : 'text-slate-400'}`}>
                                    {selectedNode.trajectory || 'stable'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 2: STORIES (Истории) */}
                        {mobileCardTab === 'stories' && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                              {selectedNode.stories && selectedNode.stories.length > 0 ? (
                                selectedNode.stories.map((st) => (
                                  <div key={st.id} className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs flex flex-col gap-1 leading-relaxed">
                                    <div className="flex items-center justify-between font-mono text-[9px] text-indigo-400/80">
                                      <span className="font-black underline">{st.author}</span>
                                      <span className="text-slate-500">{new Date(st.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <p className="italic text-slate-300 font-sans">{st.text}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs italic text-slate-500 text-center py-4 border border-dashed border-white/5 rounded-lg">
                                  {language === 'ru' ? 'Пока никто не оставил историй. Станьте первым!' : 'This concept has no logs yet. Leave yours!'}
                                </p>
                              )}
                            </div>
                            {/* Appending story mobile form */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const txt = formData.get('storyText') as string;
                                if (txt?.trim()) {
                                  handleAddingStoryFromMobile(selectedNode.id, txt);
                                  e.currentTarget.reset();
                                }
                              }}
                              className="flex gap-1.5 mt-2"
                            >
                              <input
                                name="storyText"
                                type="text"
                                placeholder={language === 'ru' ? 'Поделитесь соматическим опытом...' : 'Log your somatic feedback...'}
                                required
                                className="grow bg-slate-900 border border-white/15 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-lg transition duration-200 active:scale-95"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </form>
                          </div>
                        )}

                        {/* TAB 3: MATERIALS / SCIENCE */}
                        {mobileCardTab === 'materials' && (
                          <div className="flex flex-col gap-3">
                            {selectedNode.materials && selectedNode.materials.length > 0 ? (
                              selectedNode.materials.map((mat) => (
                                <div key={mat.id} className="p-3.5 bg-slate-900/40 rounded-xl border border-white/5 flex flex-col gap-1">
                                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase">
                                    <span className="font-bold text-indigo-300 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{mat.type}</span>
                                    <span>{mat.year > 0 ? mat.year : 'Ancient text'}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-white mt-1">{mat.title}</h4>
                                  <p className="text-[10.5px] text-slate-400 italic leading-relaxed mt-0.5">{mat.summary}</p>
                                  {mat.url && (
                                    <a 
                                      href={mat.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="self-start text-[9px] font-mono text-indigo-400 hover:underline flex items-center gap-1 mt-2.5"
                                    >
                                      <span>{language === 'ru' ? 'Читать источник' : 'Open resource'}</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs italic text-slate-500 text-center py-4 border border-dashed border-white/5 rounded-lg">
                                {language === 'ru' ? 'Нет привязанных научных материалов.' : 'No bibliographic sources linked.'}
                              </p>
                            )}
                          </div>
                        )}

                        {/* TAB 4: NEIGHBORS / MAPS CONNECTIONS */}
                        {mobileCardTab === 'map' && (
                          <div className="flex flex-col gap-4">
                            {/* Interactive neighbors links listing */}
                            <div className="flex flex-col gap-1.5">
                              <h4 className="text-[9.5px] font-mono uppercase text-slate-500 font-bold block mb-1">
                                {language === 'ru' ? 'АКТИВНЫЕ СВЯЗИ:' : 'ACTIVE PATHWAYS:'}
                              </h4>
                              {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).map(l => {
                                const targetId = l.source === selectedNode.id ? l.target : l.source;
                                const targetNd = nodes.find(n => n.id === targetId);
                                if (!targetNd) return null;
                                return (
                                  <button
                                    key={targetNd.id}
                                    onClick={() => setSelectedNodeId(targetNd.id)}
                                    className="text-left w-full p-2.5 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-white/10 group active:scale-98 transition duration-200"
                                  >
                                    <span className="font-bold text-slate-200 group-hover:text-white truncate max-w-[180px]">
                                      {language === 'ru' ? targetNd.nameRu : targetNd.nameEn}
                                    </span>
                                    <span className="text-[8.5px] font-mono uppercase text-indigo-400 px-1 py-0.2 rounded bg-indigo-500/5 border border-indigo-500/10">
                                      {l.type}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Connection Creator Form */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const targetId = formData.get('targetId') as string;
                                const rel = formData.get('relation') as any;
                                if (targetId) {
                                  handleAddLink(selectedNode.id, targetId, rel);
                                  e.currentTarget.reset();
                                }
                              }}
                              className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col gap-3 mt-3 shadow-inner"
                            >
                              <h4 className="text-[10px] font-mono font-extrabold text-indigo-300 uppercase tracking-widest">{language === 'ru' ? 'ЗАПУСТИТЬ ПОТОК СВЯЗИ' : 'LAUNCH CONNECTED FLOW'}</h4>
                              <div className="flex flex-col gap-2.5 text-xs">
                                <div>
                                  <label className="text-[8px] font-mono text-slate-500 block uppercase mb-1">{language === 'ru' ? 'Смысловой ориентир:' : 'Target Landmark:'}</label>
                                  <select
                                    name="targetId"
                                    required
                                    className="w-full bg-slate-900 border border-white/15 rounded-lg p-2 focus:outline-none text-white focus:border-indigo-500 cursor-pointer"
                                  >
                                    <option value="">-- select node --</option>
                                    {nodes.filter(n => n.id !== selectedNode.id).map(n => (
                                      <option key={n.id} value={n.id}>{language === 'ru' ? n.nameRu : n.nameEn}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8px] font-mono text-slate-500 block uppercase mb-1">{language === 'ru' ? 'Тип вибрации потока:' : 'Flow Vibration:'}</label>
                                  <select
                                    name="relation"
                                    defaultValue="conceptual"
                                    className="w-full bg-slate-900 border border-white/15 rounded-lg p-2 focus:outline-none text-white cursor-pointer"
                                  >
                                    <option value="conceptual">{language === 'ru' ? 'Концептуальная conceptual' : 'Conceptual flows'}</option>
                                    <option value="historical">{language === 'ru' ? 'Историческая historical' : 'Historical path'}</option>
                                    <option value="practical">{language === 'ru' ? 'Практическая practical' : 'Practical exercise'}</option>
                                    <option value="resonance">{language === 'ru' ? 'Поточная resonance' : 'Active resonance'}</option>
                                    <option value="opposition">{language === 'ru' ? 'Оппозиция opposition' : 'Opposition'}</option>
                                  </select>
                                </div>
                                <button
                                  type="submit"
                                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-mono text-[9.5px] text-white font-bold rounded-lg transition duration-200 cursor-pointer active:scale-95"
                                >
                                  {language === 'ru' ? 'ПОДТВЕРДИТЬ СВЯЗЬ' : 'CONFIRM CONNECTION'}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl grow text-center select-none">
                      <Compass className="w-10 h-10 text-indigo-400 mb-3 animate-[spin_8s_linear_infinite]" />
                      <p className="text-xs text-slate-350 leading-relaxed max-w-xs font-semibold">
                        {language === 'ru' ? 'Выберите любую соматическую сферу на 3D графе, чтобы подробнее исследовать её суть.' : 'Select any somatic sphere in the 3D grid layout to inspect details.'}
                      </p>
                    </div>
                  )
                )}

                {/* ACTIVE AUDIO VIEWPORT */}
                {activePanel === 'audio' && (
                  <div className="flex flex-col gap-4 text-left">
                    <div className="flex flex-col items-center justify-center p-5 bg-slate-900/40 rounded-2xl border border-white/5 text-center leading-snug">
                      <div className="relative w-20 h-20 mb-3 rounded-full border border-indigo-500/20 flex items-center justify-center bg-black/60 shadow-xl overflow-hidden">
                        <div className={`absolute inset-1 rounded-full border border-dashed border-indigo-400/30 ${isPlayingAudio ? 'animate-[spin_12s_linear_infinite]' : ''}`} />
                        <Radio className={`w-7 h-7 text-indigo-400 ${isPlayingAudio ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''}`} />
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{language === 'ru' ? selectedAudio.titleRu : selectedAudio.title}</h3>
                      <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest mt-1">Soma Channel Broadcaster</p>
                      
                      <div className="flex items-center gap-3 mt-3.5 select-none">
                        <button
                          onClick={() => {
                            setIsPlayingAudio(!isPlayingAudio);
                            if (!isPlayingAudio && !activeAudioNodeId) {
                              setActiveAudioNodeId('soma-hanna');
                            }
                          }}
                          className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-505 text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition active:scale-95 duration-200"
                        >
                          {isPlayingAudio ? (language === 'ru' ? 'ПАУЗА' : 'PAUSE') : (language === 'ru' ? 'СТАРТ' : 'PLAY')}
                        </button>
                        <button
                          onClick={() => {
                            setIsPlayingAudio(false);
                            setAudioProgress(0);
                            setActiveAudioNodeId(null);
                            setCurrentAudioIndex(p => (p + 1) % SAMPLE_AUDIO.length);
                          }}
                          className="p-1.5 px-2 border border-white/10 rounded-lg text-slate-400 hover:bg-white/5 active:scale-95 transition cursor-pointer"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h4 className="text-[9px] font-mono font-extrabold uppercase tracking-wide text-slate-450">{language === 'ru' ? 'БИОМОРФНЫЙ ПЛЕЙЛИСТ' : 'BIOMORPHIC MUSIC CASTS'}</h4>
                      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {SAMPLE_AUDIO.map((aud, index) => {
                          const isSelected = index === currentAudioIndex;
                          return (
                            <button
                              key={aud.id}
                              onClick={() => {
                                setCurrentAudioIndex(index);
                                setAudioProgress(0);
                                setIsPlayingAudio(true);
                              }}
                              className={`w-full p-2.5 px-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition ${
                                isSelected ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-slate-900/30 border-white/5 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[10px] font-mono text-indigo-400">0{index + 1}</span>
                                <span className={`text-[11px] font-bold leading-tight truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>{language === 'ru' ? aud.titleRu : aud.title}</span>
                              </div>
                              {isSelected && isPlayingAudio ? (
                                <span className="text-[8px] font-mono text-indigo-400">PLAYING</span>
                              ) : (
                                <Play className="w-2.5 h-2.5 text-slate-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTIVE AGENDA VIEWPORT */}
                {activePanel === 'agenda' && (
                  <div className="flex flex-col gap-4 text-left">
                    <CommunityAgenda
                      language={language}
                      questions={questions}
                      onSelectNode={(id) => { setSelectedNodeId(id); setActivePanel('card'); setMobileCardState('expanded'); }}
                      onAddAnswerToQuestion={handleAddAnswer}
                    />
                    
                    <div className="border-t border-white/5 pt-4 mt-2 flex flex-col gap-3">
                      <h3 className="text-[10px] font-mono font-extrabold tracking-wider text-slate-450 uppercase mb-1 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        <span>{language === 'ru' ? 'ЛОГ АКТИВНОСТИ ВСЕЛЕННОЙ' : 'LIVE EXPERIENCE STREAMS'}</span>
                      </h3>
                      
                      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                        {activities.map((act) => (
                          <div key={act.id} className="p-2.5 bg-slate-900/40 border border-white/5 rounded-xl text-left flex flex-col gap-0.5 leading-snug">
                            <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-500">
                              <span className="font-extrabold text-indigo-400">{act.author}</span>
                              <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[11px] text-slate-200 mt-1 font-sans font-medium">
                              {language === 'ru' ? act.textRu : act.textEn}
                            </p>
                            <span className="text-[8px] font-mono uppercase text-gray-500 mt-1 font-bold">➔ type {act.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTIVE PROFILE VIEWPORT */}
                {activePanel === 'profile' && (
                  <div className="text-left">
                    <UserProfile
                      language={language}
                      user={currentUser}
                      onUpdatePrivacy={(settings) => setCurrentUser(prev => ({ ...prev, privacySettings: settings }))}
                      onLogout={() => setIsLoggedOut(true)}
                    />
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ==========================================
            UNIFIED TOP CURTAIN FILTER DRAWER
            ========================================== */}
        {showMobileFilter && (
          <div 
            className="fixed inset-x-0 top-[72px] md:top-[80px] z-40 bg-slate-950/95 border-b border-white/10 backdrop-blur-md shadow-2xl p-6 transition-all duration-300"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, {
              onSwipeUp: () => setShowMobileFilter(false)
            })}
          >
            <div className="max-w-xl mx-auto flex flex-col gap-5 text-sans text-slate-350 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-xs font-mono tracking-widest font-black uppercase text-indigo-400">SEISMIC FILTERS CURTAIN</h3>
                <button 
                  onClick={() => setShowMobileFilter(false)}
                  className="p-1 px-2 border border-white/10 rounded-lg text-slate-400 hover:text-white bg-slate-900 active:scale-95 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Text search input */}
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold block mb-2">{language === 'ru' ? 'ПОИСК ПО КЛЮЧЕВЫМ СЛОВАМ:' : 'KEYWORD NODE SEARCH:'}</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={language === 'ru' ? 'Найти живой концепт...' : 'Find a living concept...'}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 pl-9 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                {/* Chronology slider epochs */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-extrabold block">{language === 'ru' ? 'ВРЕМЕННЫЕ ЭПОХИ:' : 'HISTORICAL EPOCHS SLIDER:'}</label>
                    <span className="text-xs font-mono font-black text-indigo-400">
                      {selectedEpoch === 0 ? 'ALL' : `T${selectedEpoch}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="1"
                      value={selectedEpoch}
                      onChange={(e) => setSelectedEpoch(parseInt(e.target.value))}
                      className="grow accent-indigo-500 focus:outline-none cursor-pointer"
                    />
                  </div>
                  <div className="mt-2 text-[10.5px] font-mono text-slate-400 italic bg-black/30 p-2.5 rounded-xl border border-white/5 leading-snug">
                    {epochsList[selectedEpoch]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
