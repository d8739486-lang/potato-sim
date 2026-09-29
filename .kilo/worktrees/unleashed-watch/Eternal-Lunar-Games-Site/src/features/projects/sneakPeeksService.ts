import {
  fetchSneakPeeks as fetchFromDataService,
  subscribeToSneakPeeks as subscribeFromDataService,
  createSneakPeek as createFromDataService,
  updateSneakPeek as updateFromDataService,
  deleteSneakPeek as deleteFromDataService,
  type SneakPeek,
} from '../../core/services/dataService';

export type { SneakPeek };

export async function fetchSneakPeeks(): Promise<SneakPeek[]> {
  return await fetchFromDataService();
}

export function subscribeToSneakPeeks(onUpdate: (peeks: SneakPeek[]) => void): () => void {
  return subscribeFromDataService(onUpdate);
}

export const createSneakPeek = createFromDataService;
export const updateSneakPeek = updateFromDataService;
export const deleteSneakPeek = deleteFromDataService;
