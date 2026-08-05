import { create } from 'zustand';

export const useStore = create((set) => ({
  isPanelOpen: false,
  setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
}));
