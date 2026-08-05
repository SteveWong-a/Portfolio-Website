import { create } from 'zustand';

export const useStore = create((set) => ({
  isPanelOpen: false,
  setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
  isHudActive: false,
  toggleHud: () => set((state) => ({ isHudActive: !state.isHudActive })),
}));
