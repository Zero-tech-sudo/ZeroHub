export interface RobloxGame {
  id: string;
  name: string;
  category: 'popular' | 'survival' | 'combat' | 'farming' | 'custom';
  rawUrl: string;
  imgUrl?: string;
  emojiText: string;
  description: string;
  status: 'Undetected' | 'Updated' | 'Testing' | 'Patching';
  releaseDate: string;
  features: string[];
  settings: {
    walkSpeed: number;
    jumpPower: number;
    extraToggles: { label: string; key: string; val: boolean }[];
    extraSliders: { label: string; key: string; min: number; max: number; val: number; unit: string }[];
  };
  published?: boolean;
  userId?: string;
  updatedAt?: string;
}

export interface ChangeLogEntry {
  id: string;
  date: string;
  version: string;
  gameName: string;
  type: 'added' | 'fixed' | 'security' | 'database';
  title: string;
  description: string;
}

export const INITIAL_GAMES: RobloxGame[] = [
  {
    id: 'nights_forest',
    name: '99 Nights in the Forest [Patched]',
    category: 'survival',
    rawUrl: 'https://example.com/zerohub/learning-sandbox.lua',
    emojiText: '🌳',
    description: 'Educational survival UI preview with local map markers, status labels, and safe configuration examples.',
    status: 'Updated',
    releaseDate: '2026-07-03',
    features: ['Movement Value Preview', 'Chest Label Preview', 'Campfire Workflow Demo', 'NPC Marker Demo'],
    settings: {
      walkSpeed: 75,
      jumpPower: 120,
      extraToggles: [
        { label: 'Loot Label Preview', key: 'autoCollectTreasure', val: true },
        { label: 'Chest Visual Labels', key: 'espChests', val: true },
        { label: 'Wood Collection Notes', key: 'chopAllTrees', val: false },
        { label: 'NPC Marker Preview', key: 'teleportLostChildren', val: false }
      ],
      extraSliders: [
        { label: 'Fly Speed Preview', key: 'flySpeed', min: 20, max: 200, val: 45, unit: 'studs/s' }
      ]
    }
  }
];

export const INITIAL_CHANGELOGS: ChangeLogEntry[] = [
  {
    id: 'cl5',
    date: '2026-07-03',
    version: 'v4.2.0',
    gameName: '99 Nights in the Forest',
    type: 'added',
    title: 'Educational Source Preview Release Update',
    description: 'Transferred 99 Nights in the Forest from coming-soon status to fully operational. Replaced long, bulky scripts with lightweight, easy-to-copy source preview examples.'
  },
  {
    id: 'cl4',
    date: '2026-07-02',
    version: 'v4.1.9',
    gameName: 'In-Game Preview',
    type: 'fixed',
    title: 'Interactive 2D Forest Simulator Preview & Owner Restriction',
    description: 'Replaced static, low-fidelity preview placeholders with a real-time interactive 2D Bypass Simulator. Secured trigger elements strictly to authorized system owners.'
  },
  {
    id: 'cl3',
    date: '2026-06-27',
    version: 'v4.1.5',
    gameName: 'Suggestions Channel',
    type: 'added',
    title: 'Cloud Suggestions & Request Channel',
    description: 'Launched a community board integrated directly with Cloud Firestore. Users can write script requests, vote on upcoming features, and share comments securely.'
  },
  {
    id: 'cl2',
    date: '2026-06-27',
    version: 'v4.1.4',
    gameName: 'UI Overhaul',
    type: 'added',
    title: 'Clean Clutter-Free Layout & Toggle Sliders',
    description: 'Hidden the customization sliders and script configurator panel by default to clean up the interface. A smart customization toggle is added to reveal sliders when tweaking walkspeed is needed.'
  },
  {
    id: 'cl1',
    date: '2026-06-27',
    version: 'v4.1.3',
    gameName: 'Global App',
    type: 'added',
    title: 'Slide-Out Navigation & AI Agent Safeguard',
    description: 'Designed a slide-out hamburger sidebar drawer holding Change Logs, Roblox guides, and suggestions. Added ZeroShield™ AI safeguard monitoring target memories.'
  }
];
