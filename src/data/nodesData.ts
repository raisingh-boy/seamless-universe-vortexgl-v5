import { SomaticNode, SomaticLink, CommunityUser, CommunityQuestion, ActivityLog } from '../types';

export const SAMPLE_AUDIO = [
  {
    id: 'audio-1',
    title: 'Intelligent Body Lesson',
    titleRu: 'Урок Мудрого Тела',
    duration: 340,
    timelineNodes: [
      { nodeId: 'soma-hanna', time: 10 },
      { nodeId: 'pattern-bateson', time: 45 },
      { nodeId: 'field-gaze', time: 120 }
    ]
  },
  {
    id: 'audio-2',
    title: 'Embodiement and Cybernetics',
    titleRu: 'Эмбодимент и Кибернетика',
    duration: 210,
    timelineNodes: [
      { nodeId: 'conceptual-cybernetics', time: 15 },
      { nodeId: 'embodied-ai', time: 90 }
    ]
  }
];

export const INITIAL_NODES: SomaticNode[] = [
  {
    id: 'central-me',
    nameRu: 'Я',
    nameEn: 'Me',
    type: 'concept',
    level: 'macro',
    domain: 'hybrid',
    world: 'me',
    status: 'rooted',
    resonances: 150,
    descriptionRu: 'Центр вашей личной вселенной',
    descriptionEn: 'The center of your personal universe',
    epochEn: 'Present Day',
    epochRu: 'Современность',
    carriesCount: 24,
    connectionsCount: 8,
    trajectory: 'growing',
    score: 95,
    rank: 1,
    createdAt: Date.now() - 10 * 24 * 3600 * 1000,
    stories: [
      { id: 'st-me-1', author: 'botovroman45@gmail.com', text: 'Исследую пересечение соматических практик и глубоких нейронных сетей.', createdAt: Date.now() - 4 * 24 * 3600 * 1000 }
    ],
    materials: [
      { id: 'm-me-1', title: 'Mycelium of Somatics', type: 'article', year: 2025, summary: 'A research log combining biofeedback and neural network routing.', url: 'https://ais.studio/build' }
    ]
  },
  {
    id: 'soma-hanna',
    nameRu: 'Соматика Ханны',
    nameEn: 'Hanna Somatics',
    type: 'practice',
    level: 'macro',
    domain: 'body',
    world: 'atlas',
    status: 'rooted',
    resonances: 95,
    descriptionRu: 'Система нервно-мышечного переобучения, направленная на освобождение от хронического напряжения.',
    descriptionEn: 'A system of neuromuscular education designed to release chronic physical tension patterns.',
    epochEn: '1970s',
    epochRu: '1970-е годы',
    authorRu: 'Томас Ханна',
    authorEn: 'Thomas Hanna',
    carriesCount: 42,
    connectionsCount: 12,
    trajectory: 'stable',
    score: 87,
    rank: 3,
    createdAt: Date.now() - 50 * 24 * 3600 * 1000,
    lastActiveAt: Date.now() - 2 * 24 * 3600 * 1000,
    stories: [
      { id: 'st-sh-1', author: 'Elena V.', text: 'После трех уроков на коврике я впервые за два года почувствовала лопатки расслабленными.', createdAt: Date.now() - 15 * 24 * 3600 * 1000 },
      { id: 'st-sh-2', author: 'botovroman45@gmail.com', text: 'Удивительно, как рефлекс "зеленого света" влияет на нижнюю часть спины.', createdAt: Date.now() - 5 * 24 * 3600 * 1000 }
    ],
    materials: [
      { id: 'm-sh-1', title: 'Somatics: Reawakening The Mind\'s Control', type: 'book', year: 1988, summary: 'Классический труд Томаса Ханны об избавлении от сенсомоторной амнезии.', url: 'https://archive.org' },
      { id: 'm-sh-2', title: 'Hanna Somatics Daily Flow', type: 'video', year: 2021, summary: 'Полный 30-минутный комплекс соматических уроков кошачьих потягиваний.', url: 'https://youtube.com' }
    ]
  },
  {
    id: 'pattern-bateson',
    nameRu: 'Паттерны Бейтсона',
    nameEn: 'Batesonian Patterns',
    type: 'concept',
    level: 'meso',
    domain: 'philosophy',
    world: 'atlas',
    status: 'alive',
    resonances: 72,
    descriptionRu: 'Разум как системный экологический процесс, соединяющий человека, общество и природу.',
    descriptionEn: 'Mind as a system-wide ecological process connecting humans, society, and the living world.',
    epochEn: '1950s',
    epochRu: '1950-е годы',
    authorRu: 'Грегори Бейтсон',
    authorEn: 'Gregory Bateson',
    carriesCount: 18,
    connectionsCount: 11,
    trajectory: 'stable',
    score: 79,
    rank: 5,
    createdAt: Date.now() - 100 * 24 * 3600 * 1000,
    lastActiveAt: Date.now() - 1 * 24 * 3600 * 1000,
    stories: [
      { id: 'st-pb-1', author: 'Dmitry K.', text: 'Идея о "паттерне, который связывает" стала фундаментом нашей распределенной базы.', createdAt: Date.now() - 10 * 24 * 3600 * 1000 }
    ],
    materials: [
      { id: 'm-pb-1', title: 'Steps to an Ecology of Mind', type: 'book', year: 1972, summary: 'Сборник эссе Грегори Бейтсона по кибернетике сознания и антропологии.', url: 'https://archive.org' }
    ]
  },
  {
    id: 'field-gaze',
    nameRu: 'Глубинный взгляд',
    nameEn: 'Deep Field Gaze',
    type: 'practice',
    level: 'micro',
    domain: 'cognition',
    world: 'field',
    status: 'sprout',
    resonances: 24,
    descriptionRu: 'Практика созерцания пространства, позволяющая расширить фокус восприятия.',
    descriptionEn: 'A practice of open gazing designed to expand cognitive focus and awareness.',
    epochEn: 'Renaissance',
    epochRu: 'Ренессанс',
    addedBy: 'Elena V.',
    carriesCount: 9,
    connectionsCount: 4,
    trajectory: 'growing',
    score: 55,
    rank: 12,
    createdAt: Date.now() - 12 * 24 * 3600 * 1000,
    lastActiveAt: Date.now() - 5 * 24 * 3600 * 1000,
    stories: [
      { id: 'st-fg-1', author: 'Elena V.', text: 'Использую во время перерывов в программировании. Включает парасимпатику за три минуты.', createdAt: Date.now() - 3 * 24 * 3600 * 1000 }
    ],
    materials: [
      { id: 'm-fg-1', title: 'Open Focus Handbook', type: 'book', year: 2007, summary: 'Техника расширения визуального и ментального внимания Леса Феми.', url: 'https://openfocus.info' }
    ]
  },
  {
    id: 'conceptual-cybernetics',
    nameRu: 'Кибернетика человека',
    nameEn: 'Human Cybernetics',
    type: 'concept',
    level: 'macro',
    domain: 'science',
    world: 'atlas',
    status: 'rooted',
    resonances: 110,
    descriptionRu: 'Исследование регуляции и обратной связи в живых организмах и искусственных системах.',
    descriptionEn: 'The study of feedback loops and self-regulation in organic and mechanical systems.',
    epochEn: '1940s',
    epochRu: '1940-е годы',
    authorRu: 'Норберт Винер',
    authorEn: 'Norbert Wiener',
    carriesCount: 31,
    connectionsCount: 9,
    trajectory: 'stable',
    score: 89,
    rank: 2,
    createdAt: Date.now() - 150 * 24 * 3600 * 1000,
    lastActiveAt: Date.now() - 8 * 24 * 3600 * 1000,
    stories: [],
    materials: [
      { id: 'm-cc-1', title: 'Cybernetics: Or Control and Communication in the Animal and the Machine', type: 'book', year: 1948, summary: 'Фундаментальный труд, положивший начало кибернетике.', url: 'https://mitpress.mit.edu' }
    ]
  },
  {
    id: 'embodied-ai',
    nameRu: 'Воплощенный ИИ',
    nameEn: 'Embodied AI',
    type: 'concept',
    level: 'meso',
    domain: 'science',
    world: 'field',
    status: 'alive',
    resonances: 88,
    descriptionRu: 'Разработка искусственного интеллекта, обладающего физической формой и взаимодействующего с миром.',
    descriptionEn: 'Artificial intelligence that operates within a physical body, generating sensory-motor feedback.',
    epochEn: 'Modernity',
    epochRu: 'Современность',
    addedBy: 'Dmitry K.',
    carriesCount: 15,
    connectionsCount: 7,
    trajectory: 'growing',
    score: 84,
    rank: 4,
    createdAt: Date.now() - 25 * 24 * 3600 * 1000,
    lastActiveAt: Date.now() - 1 * 24 * 3600 * 1000,
    stories: [
      { id: 'st-eai-1', author: 'botovroman45@gmail.com', text: 'Чат-боты умны, но пока у них нет сенсомоторной петли с окружающей средой, это лишь имитация.', createdAt: Date.now() - 6 * 24 * 3600 * 1000 }
    ],
    materials: [
      { id: 'm-eai-1', title: 'Embodiment and Cognitive Science', type: 'book', year: 2005, summary: 'Анализ того, как тело формирует структуры нашего мышления.', url: 'https://cambridge.org' }
    ]
  },
  {
    id: 'socrates-dialogue',
    nameRu: 'Сократический диалог',
    nameEn: 'Socratic Dialogue',
    type: 'practice',
    level: 'macro',
    domain: 'philosophy',
    world: 'atlas',
    status: 'rooted',
    resonances: 130,
    descriptionRu: 'Метод майевтики — извлечения скрытых истин через последовательное обсуждение вопросов.',
    descriptionEn: 'A dialectic inquiry method used to uncover foundational truths from internal beliefs.',
    epochEn: 'Antiquity',
    epochRu: 'Античность',
    authorRu: 'Сократ',
    authorEn: 'Socrates',
    carriesCount: 47,
    connectionsCount: 10,
    trajectory: 'stable',
    score: 91,
    rank: 1,
    createdAt: Date.now() - 300 * 24 * 3600 * 1000,
    lastActiveAt: Date.now() - 1 * 24 * 3600 * 1000,
    stories: [
      { id: 'st-sd-1', author: 'Kenzo T.', text: 'Сократическая манера задавать вопросы удивительно ложится на системную инженерию требований.', createdAt: Date.now() - 15 * 24 * 3600 * 1000 }
    ],
    materials: [
      { id: 'm-sd-1', title: 'Dialogues of Plato', type: 'book', year: -380, summary: 'Записи бесед Сократа, собранные Платоном.', url: 'https://gutenberg.org' }
    ]
  },
  {
    id: 'decaying-relic',
    nameRu: 'Забытый кинетический трактат',
    nameEn: 'Decaying Kinetic Treatise',
    type: 'observation',
    level: 'micro',
    domain: 'movement',
    world: 'field',
    status: 'seed',
    resonances: 3,
    descriptionRu: 'Архивный манускрипт о балетных жестах, заброшенный более месяца назад и угасающий в тумане.',
    descriptionEn: 'An archival choreographic manuscript neglected for 30+ days, gracefully decaying into mist.',
    epochEn: '19th Century',
    epochRu: 'XIX Век',
    addedBy: 'Sarah G.',
    carriesCount: 1,
    connectionsCount: 1,
    trajectory: 'decaying',
    score: 12,
    rank: 45,
    createdAt: Date.now() - 40 * 24 * 3600 * 1000,
    lastActiveAt: Date.now() - 35 * 24 * 3600 * 1000, // 35 days ago = decaying!
    stories: [],
    materials: []
  },
  {
    id: 'contact-improv',
    nameRu: 'Контактная Импровизация',
    nameEn: 'Contact Improvisation',
    type: 'practice',
    level: 'macro',
    domain: 'movement',
    world: 'field',
    status: 'rooted',
    resonances: 115,
    descriptionRu: 'Танец-исследование физических гравитационных взаимодействий двух и более тел.',
    descriptionEn: 'A dance form highlighting physical interaction, momentum, and shared weight between bodies.',
    epochEn: '1970s',
    epochRu: '1970-е годы',
    addedBy: 'Steve Paxton',
    carriesCount: 39,
    connectionsCount: 8,
    trajectory: 'growing',
    score: 88,
    rank: 6,
    createdAt: Date.now() - 80 * 24 * 3600 * 1000,
    lastActiveAt: Date.now() - 3 * 24 * 3600 * 1000,
    stories: [
      { id: 'st-ci-1', author: 'Sarah G.', text: 'Каждый джем — это урок физики в реальном времени, написанный телами в пространстве.', createdAt: Date.now() - 9 * 24 * 3600 * 1000 }
    ],
    materials: [
      { id: 'm-ci-1', title: 'Contact Quarterly Journal', type: 'article', year: 1975, summary: 'Профессиональный журнал о современном танце и соматических практиках.', url: 'https://contactquarterly.com' }
    ]
  },
  {
    id: 'feldenkrais-method',
    nameRu: 'Метод Фельденкрайза',
    nameEn: 'Feldenkrais Method',
    type: 'practice',
    level: 'macro',
    domain: 'body',
    world: 'atlas',
    status: 'rooted',
    resonances: 120,
    descriptionRu: 'Метод осознания через движение для расширения функциональной пластичности мозга.',
    descriptionEn: 'Somatic system focusing on awareness through movement to expand neurological plasticity.',
    epochEn: '1960s',
    epochRu: '1960-е годы',
    authorRu: 'Моше Фельденкрайз',
    authorEn: 'Moshe Feldenkrais',
    carriesCount: 45,
    connectionsCount: 14,
    trajectory: 'stable',
    score: 93,
    rank: 2,
    createdAt: Date.now() - 200 * 24 * 3600 * 1000,
    lastActiveAt: Date.now() - 1 * 24 * 3600 * 1000,
    stories: [
      { id: 'st-fm-1', author: 'Kenzo T.', text: 'Удивительно, как микро-движения таза перепрошивают всю структуру ходьбы всего за час.', createdAt: Date.now() - 14 * 24 * 3600 * 1000 }
    ],
    materials: [
      { id: 'm-fm-1', title: 'Awareness Through Movement', type: 'book', year: 1967, summary: 'Главная книга Моше Фельденкрайза с описанием двенадцати базовых уроков.', url: 'https://archive.org' }
    ]
  }
];

export const INITIAL_LINKS: SomaticLink[] = [
  { id: 'l1', source: 'soma-hanna', target: 'pattern-bateson', activity: 3, resonanceWeight: 1.5, type: 'conceptual' },
  { id: 'l2', source: 'pattern-bateson', target: 'field-gaze', activity: 1, resonanceWeight: 1.2, type: 'resonance' },
  { id: 'l3', source: 'soma-hanna', target: 'field-gaze', activity: 4, resonanceWeight: 2.0, type: 'resonance' },
  { id: 'l4', source: 'conceptual-cybernetics', target: 'embodied-ai', activity: 5, resonanceWeight: 2.2, type: 'practical' },
  { id: 'l5', source: 'pattern-bateson', target: 'conceptual-cybernetics', activity: 8, resonanceWeight: 2.8, type: 'conceptual' },
  { id: 'l6', source: 'embodied-ai', target: 'pattern-bateson', activity: 2, resonanceWeight: 1.4, type: 'resonance' },
  { id: 'l7', source: 'socrates-dialogue', target: 'pattern-bateson', activity: 1, resonanceWeight: 0.9, type: 'historical' },
  { id: 'l10', source: 'contact-improv', target: 'soma-hanna', activity: 6, resonanceWeight: 1.9, type: 'practical' },
  { id: 'l11', source: 'contact-improv', target: 'feldenkrais-method', activity: 5, resonanceWeight: 2.0, type: 'practical' },
  { id: 'l12', source: 'feldenkrais-method', target: 'soma-hanna', activity: 10, resonanceWeight: 3.5, type: 'resonance' }
];

export const INITIAL_USERS: CommunityUser[] = [
  { 
    id: 'user-me', 
    name: 'Roman Botov', 
    email: 'botovroman45@gmail.com', 
    reputation: 235, 
    dominantDomain: 'hybrid', 
    resonances: ['soma-hanna', 'embodied-ai'],
    spawnedCount: 14,
    storiesCount: 8,
    linksCount: 12,
    atlasCount: 4,
    archetype: 'BRIDGE',
    privacySettings: { graphVisibility: 'public', resonancesVisible: true }
  },
  { 
    id: 'user-elena', 
    name: 'Elena V.', 
    email: 'elena@seamless.net', 
    reputation: 120, 
    dominantDomain: 'body', 
    resonances: ['soma-hanna', 'feldenkrais-method'],
    spawnedCount: 5,
    storiesCount: 4,
    linksCount: 8,
    atlasCount: 1,
    archetype: 'STORYTELLER',
    privacySettings: { graphVisibility: 'overlay', resonancesVisible: true }
  },
  { 
    id: 'user-dmitry', 
    name: 'Dmitry K.', 
    email: 'dmitry@systems.io', 
    reputation: 180, 
    dominantDomain: 'science', 
    resonances: ['conceptual-cybernetics', 'embodied-ai'],
    spawnedCount: 18,
    storiesCount: 3,
    linksCount: 15,
    atlasCount: 6,
    archetype: 'CONNECTOR',
    privacySettings: { graphVisibility: 'public', resonancesVisible: true }
  },
  { 
    id: 'user-sarah', 
    name: 'Sarah G.', 
    email: 'sarah@danceflow.org', 
    reputation: 140, 
    dominantDomain: 'movement', 
    resonances: ['contact-improv', 'decaying-relic'],
    spawnedCount: 9,
    storiesCount: 11,
    linksCount: 6,
    atlasCount: 2,
    archetype: 'RESONATOR',
    privacySettings: { graphVisibility: 'private', resonancesVisible: false }
  }
];

export const INITIAL_QUESTIONS: CommunityQuestion[] = [
  {
    id: 'q-1',
    textRu: 'Каким образом паттерны дыхания могут транслироваться в топологическую структуру нейронных синапсов?',
    textEn: 'How can breath inhalation/exhalation flows map directly to micro-topologies of artificial neural network nodes?',
    domains: ['hybrid', 'cognition', 'science'],
    participants: 12,
    answers: [
      { id: 'ans-1-1', author: 'Elena V.', text: 'Через гармонические волновые частоты (метод Римана). Мы можем регулировать силу связей в #soma-hanna дыханием!', createdAt: Date.now() - 3 * 24 * 3600 * 1000 },
      { id: 'ans-1-2', author: 'Roman Botov', text: 'По сути, это реализация жидкой самоорганизации в #embodied-ai. Тело диктует частоту.', createdAt: Date.now() - 1 * 24 * 3600 * 1000 }
    ]
  },
  {
    id: 'q-2',
    textRu: 'Оправдано ли применение кибернетической обратной связи к практике созерцания и терапевтическому диалогу?',
    textEn: 'Is second-order cybernetics applicable to deep field gazing and therapeutic dialogue methodologies?',
    domains: ['philosophy', 'science'],
    participants: 8,
    answers: [
      { id: 'ans-2-1', author: 'Dmitry K.', text: 'Абсолютно, это классическая #conceptual-cybernetics , когда терапевт сам является частью системы.', createdAt: Date.now() - 5 * 24 * 3600 * 1000 }
    ]
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  { id: 'act-1', author: 'Elena V.', textRu: 'Вызвала резонанс в узле "Соматика Ханны"', textEn: 'Triggered resonance on "Hanna Somatics"', timestamp: Date.now() - 10 * 60 * 1000, type: 'resonance' },
  { id: 'act-2', author: 'Dmitry K.', textRu: 'Связал "Воплощенный ИИ" и "Соматика Ханны"', textEn: 'Linked "Embodied AI" and "Hanna Somatics"', timestamp: Date.now() - 44 * 60 * 1000, type: 'link' },
  { id: 'act-3', author: 'Sarah G.', textRu: 'Добавила историю "Преодоление зажима шеи через соматику"', textEn: 'Added new story "Overcoming neck block via Somatics"', timestamp: Date.now() - 2 * 3600 * 1000, type: 'story' },
  { id: 'act-4', author: 'Roman Botov', textRu: 'Положил в карман веху "Паттерны Бейтсона"', textEn: 'Pocketed landmark "Batesonian Patterns"', timestamp: Date.now() - 5 * 3600 * 1000, type: 'pocket' }
];
