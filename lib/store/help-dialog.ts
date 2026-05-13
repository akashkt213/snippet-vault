import { create } from "zustand";

export const useHelpDialog = create<HelpDialogStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));

export type HelpDialogStore = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};