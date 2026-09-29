// Mod system types

export interface ModVersion {
  id: string;
  mod_id: string;
  version_number: string;
  mc_version: string;
  platform: string;
  download_url: string;
  file_size: string;
  release_type: 'Release' | 'Beta' | 'Alpha';
  release_date: string;
  changelog: string;
  created_at: string;
}

export interface ModGalleryImage {
  id: string;
  mod_id: string;
  image_url: string;
  caption: string;
  sort_order: number;
}

export interface ModLinks {
  source_url?: string;
  issues_url?: string;
  discord_url?: string;
  wiki_url?: string;
}

export interface ModButton {
  label: string;
  url: string;
  enabled: boolean;
  style: 'primary' | 'secondary';
}

export const DEFAULT_MOD_BUTTONS: ModButton[] = [
  { label: 'Скачать мод', url: '', enabled: true, style: 'primary' },
  { label: 'Посмотреть на GitHub', url: '', enabled: false, style: 'secondary' },
  { label: 'Поддержать автора', url: '', enabled: false, style: 'secondary' },
];

export interface Mod {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string;
  icon_url: string | null;
  banner_url: string | null;
  mc_versions: string[];   // parsed from JSON
  platforms: string[];     // parsed from JSON
  tags: string[];          // parsed from JSON
  links: ModLinks;         // parsed from JSON
  file_url: string | null;
  file_size: string | null;
  buttons: ModButton[];   // parsed from JSON
  changelog: string;
  downloads: number;
  followers: number;
  status: string;
  created_at: string;
  updated_at: string;
  // joined
  versions?: ModVersion[];
  gallery?: ModGalleryImage[];
}

// Raw DB row (JSON fields are strings)
export interface ModRow {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string;
  icon_url: string | null;
  banner_url: string | null;
  mc_versions: string;
  platforms: string;
  tags: string;
  links: string;
  file_url: string | null;
  file_size: string | null;
  buttons: string | null;
  changelog: string;
  downloads: number;
  followers: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function parseModRow(row: ModRow): Mod {
  const parse = <T>(val: string, fallback: T): T => {
    try { return JSON.parse(val) as T; }
    catch { return fallback; }
  };
  return {
    ...row,
    mc_versions: parse<string[]>(row.mc_versions, []),
    platforms:   parse<string[]>(row.platforms, []),
    tags:        parse<string[]>(row.tags, []),
    links:       parse<ModLinks>(row.links, {}),
    buttons:     parse<ModButton[]>(row.buttons ?? '', DEFAULT_MOD_BUTTONS),
  };
}
