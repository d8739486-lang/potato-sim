import { create } from 'zustand';

export enum MODAL_TYPES {
  SETTINGS = 'SETTINGS',
}

interface ModalState {
  activeModals: { id: MODAL_TYPES; props?: any }[];
  openModal: (id: MODAL_TYPES, props?: any) => void;
  closeModal: (id?: MODAL_TYPES) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModals: [],
  
  openModal: (id, props) => set((state) => ({
    activeModals: [...state.activeModals, { id, props }]
  })),
  
  closeModal: (id) => set((state) => {
    if (!id) {
      return { activeModals: state.activeModals.slice(0, -1) };
    }
    return {
      activeModals: state.activeModals.filter((m) => m.id !== id)
    };
  }),
}));
