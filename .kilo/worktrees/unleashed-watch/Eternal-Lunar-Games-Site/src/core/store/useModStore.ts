import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

export interface Mod {
  id: string;
  name: string;
  urlSlug: string;
  summary: string;
  description: string;
  type: 'client' | 'server' | 'both';
  tags: string[];
  iconBase64: string | null;
  fileInfo: {
    name: string;
    size: number;
    uploadedAt: string;
  } | null;
  createdAt: string;
}

interface ModStore {
  mods: Mod[];
  addMod: (mod: Omit<Mod, 'id' | 'createdAt'>) => void;
  updateMod: (id: string, updates: Partial<Mod>) => void;
  deleteMod: (id: string) => void;
  getMod: (id: string) => Mod | undefined;
}

// Адаптер localforage для Zustand persist
const localforageStore = {
  getItem: async (name: string): Promise<string | null> => {
    return (await localforage.getItem(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

export const useModStore = create<ModStore>()(
  persist(
    (set, get) => ({
      mods: [],
      addMod: (modData) => set((state) => ({
        mods: [
          ...state.mods,
          {
            ...modData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
          }
        ]
      })),
      updateMod: (id, updates) => set((state) => ({
        mods: state.mods.map((mod) =>
          mod.id === id ? { ...mod, ...updates } : mod
        )
      })),
      deleteMod: (id) => set((state) => ({
        mods: state.mods.filter((mod) => mod.id !== id)
      })),
      getMod: (id) => get().mods.find((mod) => mod.id === id),
    }),
    {
      name: 'eternal-lunar-mods-storage',
      storage: createJSONStorage(() => localforageStore),
    }
  )
);
