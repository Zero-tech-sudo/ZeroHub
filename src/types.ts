export interface ScriptConfig {
  walkSpeed: number;
  flySpeed: number;
  jumpPower: number;
  espColor: string; // hex
  espChests: boolean;
  espSupplies: boolean;
  espRuins: boolean;
  flyEnabled: boolean;
  noclipEnabled: boolean;
  autoCollectTreasure: boolean;
  killAura: boolean;
  chopAllTrees: boolean;
  autoSaplings: boolean;
  bringItems: boolean;
  teleportLostChildren: boolean;
  executor: 'delta' | 'codex' | 'hydrogen' | 'fluxus';
  scriptTheme: 'emerald' | 'crimson' | 'cyber' | 'obsidian';
  fullyUndetectable: boolean;
  keylessMode: boolean;
}

export interface MapElement {
  id: string;
  name: string;
  type: 'chest' | 'supply' | 'ruins' | 'camp' | 'threat';
  x: number; // 0 to 100 representing percentage on grid
  y: number; // 0 to 100
  collected?: boolean;
}

export interface LogMessage {
  time: string;
  type: 'info' | 'success' | 'warn' | 'error';
  text: string;
}
