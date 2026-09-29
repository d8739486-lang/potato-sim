import {
  fetchProjects as fetchFromDataService,
  subscribeToProjects as subscribeFromDataService,
  createProject as createFromDataService,
  updateProject as updateFromDataService,
  deleteProject as deleteFromDataService,
  type ProjectItem,
} from '../../core/services/dataService';

export type { ProjectItem };

export const DEFAULT_FALLBACK_PROJECTS: ProjectItem[] = [
  {
    id: 'pc-master-default',
    title: 'PC Master',
    description: 'Станьте мастером сборки ПК! Собирайте мощнейшие конфигурации, тестируйте железо и развивайте свой компьютерный бизнес.',
    type: 'game',
    cover_url: '/pc_master_cover.webp',
    link: '/games/pc-master',
    status: 'Active',
    display_type: 'chapters',
    chapters: [
      {
        title: 'Глава 1',
        subtitle: 'Начало пути',
        description: 'Игрок успешно справился с вирусом и устроился работать, но что-то пошло не так...',
        link: 'https://pc-master-chapter1.vercel.app',
        cover_url: '',
        available: true,
      },
      {
        title: 'Глава 2',
        subtitle: 'Digital Dreams',
        description: 'Компания Digital Dreams захватила компьютер главного героя, но ему помог его друг... но это не конец.',
        link: 'https://pc-master-chapter2.vercel.app',
        cover_url: '',
        available: true,
      },
      {
        title: 'Глава 3',
        subtitle: 'Сомнения',
        description: 'Подозрение, что друг с этим как-то замешан...',
        link: '',
        cover_url: '',
        available: false,
      },
    ],
    action_text: 'Запустить',
    chapters_text: '3 главы',
  },
];

export async function fetchProjects(): Promise<ProjectItem[]> {
  const data = await fetchFromDataService();
  if (data.length > 0) return data;
  return DEFAULT_FALLBACK_PROJECTS;
}

export function subscribeToProjects(onUpdate: (projects: ProjectItem[]) => void): () => void {
  return subscribeFromDataService(onUpdate);
}

export const createProject = createFromDataService;
export const updateProject = updateFromDataService;
export const deleteProject = deleteFromDataService;
