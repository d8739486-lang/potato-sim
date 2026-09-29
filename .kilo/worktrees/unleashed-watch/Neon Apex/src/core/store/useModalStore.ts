import { create } from 'zustand';

export const ModalType = {
  UPDATE_LOGS: 'UPDATE_LOGS',
} as const;
export type ModalType = typeof ModalType[keyof typeof ModalType];

interface ModalData {
  id: ModalType;
  props?: Record<string, unknown>;
}

interface ModalStore {
  modals: ModalData[];
  openModal: (id: ModalType, props?: Record<string, unknown>) => void;
  closeModal: (id: ModalType) => void;
  closeTopModal: () => void;
  closeAll: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modals: [],
  openModal: (id, props) => set((state) => {
    if (state.modals.some(m => m.id === id)) return state;
    return { modals: [...state.modals, { id, props }] };
  }),
  closeModal: (id) => set((state) => ({
    modals: state.modals.filter((m) => m.id !== id)
  })),
  closeTopModal: () => set((state) => ({
    modals: state.modals.slice(0, -1)
  })),
  closeAll: () => set({ modals: [] })
}));
