import {
  fetchMods as fetchFromDataService,
  fetchModBySlug as fetchSlugFromDataService,
  formatDownloads as formatDownloadsUtil,
  formatFileSize as formatFileSizeUtil,
  incrementModDownloads as incrementDownloadsUtil,
  type Mod,
  type ModVersion,
  type ModGalleryImage,
} from '../../core/services/dataService';

export type { Mod, ModVersion, ModGalleryImage };

export async function fetchMods(): Promise<Mod[]> {
  return await fetchFromDataService();
}

export async function fetchModBySlug(slug: string): Promise<Mod | null> {
  return fetchSlugFromDataService(slug);
}

export const formatDownloads = formatDownloadsUtil;
export const formatFileSize = formatFileSizeUtil;
export const incrementModDownloads = incrementDownloadsUtil;
