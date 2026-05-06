import { create } from "zustand";

type UiState = {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  activeDashboardFilter: string;
  setActiveDashboardFilter: (filter: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  activeDashboardFilter: "all",
  setActiveDashboardFilter: (filter) => set({ activeDashboardFilter: filter }),
}));
