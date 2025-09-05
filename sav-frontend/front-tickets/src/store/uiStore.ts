import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

export type UiState = {
  sidebarOpen: boolean
  themeMode: ThemeMode

  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
  setThemeMode: (mode: ThemeMode) => void
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: false,
  themeMode: 'system',

  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setThemeMode: (mode) => set({ themeMode: mode }),
}))
