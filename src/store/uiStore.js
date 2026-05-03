import { create } from "zustand";

// Zustand is reserved for UI state only.
// Server state belongs in TanStack Query; auth state belongs in features/auth.
export const useUIStore = create((set) => ({
  isSidebarOpen: false,
  theme: "light",

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebar: (isSidebarOpen) => set({ isSidebarOpen }),
  setTheme: (theme) => set({ theme }),
}));
