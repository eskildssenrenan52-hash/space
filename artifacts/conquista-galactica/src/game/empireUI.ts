import { create } from 'zustand';

export type PanelId =
  | 'industry' | 'market' | 'missions' | 'war' | 'build' | 'engineering'
  | 'colonies' | 'tasks' | 'components' | 'colonization' | null;

interface UIState {
  panel: PanelId;
  setPanel: (p: PanelId) => void;
}

export const useEmpireUI = create<UIState>((set) => ({
  panel: null,
  setPanel: (panel) => set((s) => ({ panel: s.panel === panel ? null : panel })),
}));
