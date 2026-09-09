import { create } from 'zustand';

export const useGalleryStore = create((set) => ({
  activeProjectIndex: null,
  activeShape: 'DEFAULT_FIELD',
  isIntroFinished: false,
  isGravityEnabled: false,
  setActiveProject: (index, shape) => set({ activeProjectIndex: index, activeShape: shape }),
  setIntroFinished: (finished) => set({ isIntroFinished: finished }),
  setGravity: (enabled) => set({ isGravityEnabled: enabled }),
}));
