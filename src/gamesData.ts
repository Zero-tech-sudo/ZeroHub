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
    name: '99 Nights in the Forest',
    category: 'survival',
    rawUrl: 'https://files.vapevoidware.xyz/VapeVoidware/VW-Add/main/nightsintheforest.lua',
    emojiText: '🌳',
    description: 'Perfect survival assistance. Auto warm fireplaces, animal warning ESP, item magnetic teleports and fully integrated anti-freeze bypass.',
    status: 'Undetected',
    releaseDate: '2026-06-10',
    features: ['Walk speed changer', 'Automatic Chest Magnet', 'Campfire Auto Wood Feeder', 'Lost Children Auto Warp'],
    settings: {
      walkSpeed: 75,
      jumpPower: 120,
      extraToggles: [
        { label: 'Automatic Loot Magnet', key: 'autoCollectTreasure', val: true },
        { label: 'Chest Visual ESP highlights', key: 'espChests', val: true },
        { label: 'Dense Wood Auto Feeder', key: 'chopAllTrees', val: false },
        { label: 'NPC Teleport Lost Children', key: 'teleportLostChildren', val: false }
      ],
      extraSliders: [
        { label: 'Fly Custom Speed', key: 'flySpeed', min: 20, max: 200, val: 45, unit: 'studs/s' }
      ]
    }
  }
];

export const INITIAL_CHANGELOGS: ChangeLogEntry[] = [
  {
    id: 'cl1',
    date: '2026-06-11',
    version: 'v4.1.2',
    gameName: '99 Nights in the Forest',
    type: 'added',
    title: 'Added Auto Treasure Magnet',
    description: 'Implanted a fast thread which pulls and auto-extracts scattered gold boxes across the forest map without manual clicks.'
  },
  {
    id: 'cl2',
    date: '2026-06-10',
    version: 'v1.6.0',
    gameName: 'Global API',
    type: 'security',
    title: 'Anti-Tamper & Spoofer V2',
    description: 'Reinforced the memory spoofer to shield players from client detection. Memory scanner hook blocks Roblox server-side manual kicks.'
  }
];
