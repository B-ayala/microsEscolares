import { create } from 'zustand';
import type { ReactNode } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string | null;
  content: ReactNode | null;
  openModal: (title: string, content: ReactNode) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: null,
  content: null,
  openModal: (title, content) => set({ isOpen: true, title, content }),
  closeModal: () => set({ isOpen: false, title: null, content: null }),
}));
