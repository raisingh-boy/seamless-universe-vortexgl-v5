/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Domain = 'body' | 'science' | 'philosophy' | 'movement' | 'cognition' | 'hybrid';

export type World = 'atlas' | 'field' | 'me';

export type NodeStatus = 'seed' | 'sprout' | 'alive' | 'rooted' | 'atlas';

export type SomaticNodeType = 'concept' | 'practice' | 'person' | 'movement' | 'event' | 'observation' | 'question';

export type LinkType = 'conceptual' | 'historical' | 'practical' | 'resonance' | 'opposition';

export interface Story {
  id: string;
  edgeId?: string; // New field for edge-bound narratives
  author: string;
  text: string;
  createdAt: number;
}

export interface Material {
  id: string;
  title: string;
  type: 'article' | 'book' | 'video';
  year: number;
  summary: string;
  url: string;
}

export interface SomaticNode {
  id: string;
  nameRu: string;
  nameEn: string;
  type: SomaticNodeType;
  level: 'micro' | 'meso' | 'macro';
  domain: Domain;
  world: World;
  status: NodeStatus;
  resonances: number;
  descriptionRu?: string;
  descriptionEn?: string;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  targetX?: number;
  targetY?: number;
  targetZ?: number;
  breathPhase?: number;
  breathSpeed?: number;
  baseRadius?: number;
  currentRadius?: number;
  lastActiveAt?: number;
  addedBy?: string;
  authorRu?: string;
  authorEn?: string;
  isPrivate?: boolean;
  epochEn?: string;
  epochRu?: string;
  carriesCount?: number;
  connectionsCount?: number;
  trajectory?: 'growing' | 'stable' | 'decaying';
  score?: number;
  rank?: number;
  storiesCount?: number;
  audioUrl?: string;
  createdAt?: number;
  stories?: Story[];
  materials?: Material[];
}

export interface SomaticLink {
  id: string;
  source: string;
  target: string;
  activity: number;
  resonanceWeight: number;
  type: LinkType;
}

export interface CommunityUser {
  id: string;
  name: string;
  email: string;
  reputation: number;
  dominantDomain: Domain;
  resonances: string[];
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  spawnedCount: number;
  storiesCount: number;
  linksCount: number;
  atlasCount: number;
  archetype: 'CONNECTOR' | 'STORYTELLER' | 'RESONATOR' | 'PIONEER' | 'BRIDGE';
  privacySettings: {
    graphVisibility: 'public' | 'overlay' | 'private';
    resonancesVisible: boolean;
  };
}

export interface CommunityQuestion {
  id: string;
  textRu: string;
  textEn: string;
  domains: Domain[];
  participants: number;
  answers: {
    id: string;
    author: string;
    text: string;
    createdAt: number;
  }[];
}

export interface ActivityLog {
  id: string;
  author: string;
  textRu: string;
  textEn: string;
  timestamp: number;
  type: 'resonance' | 'sprout' | 'story' | 'link' | 'pocket';
}

export interface MyceliumGraphProps {
  nodes: SomaticNode[];
  links: SomaticLink[];
  currentWorld: World;
  language: 'ru' | 'en';
  onNodeSelect: (node: SomaticNode) => void;
  selectedNodeId: string | null;
  overlayUser: string | null;
  resonatedNodeIds?: Set<string> | string[];
  carriedNodeIds?: Set<string> | string[];
  currentUserName?: string;
  activeAudioNodeId?: string | null;
  visibleLayers?: {
    atlas: boolean;
    field: boolean;
    hot: boolean;
    withAudio: boolean;
  };
  selectedEpoch?: number;
  vibeMode?: 'colour' | 'mono' | 'cinematic';
  ascendingNodeId?: string | null;
  communityUsers?: CommunityUser[];
  fieldSubMode?: 'ideas' | 'people';
  onUserSelect?: (user: CommunityUser) => void;
  onLongPressNode?: (node: SomaticNode, cursorX: number, cursorY: number) => void;
}
