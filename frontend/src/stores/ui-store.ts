import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  activeJobId: string | null;
  isCustomizerOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveJobId: (jobId: string | null) => void;
  setCustomizerOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  activeJobId: null,
  isCustomizerOpen: false,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setActiveJobId: (jobId) => set({ activeJobId: jobId }),
  setCustomizerOpen: (isOpen) => set({ isCustomizerOpen: isOpen }),
}));
