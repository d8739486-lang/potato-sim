import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Globe, Save, X } from 'lucide-react';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  subscribeToProjects,
} from '../../../core/services/dataService';
import { realtime } from '../../../core/services/realtime';
import type { ProjectItem } from '../../../core/data/localDb';

export function ProjectsTab() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formCover, setFormCover] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Disabled'>('Active');
  const [formDisplayType, setFormDisplayType] = useState<'simple' | 'chapters'>('simple');

  const load = () => {
    fetchProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    const unsub = subscribeToProjects(() => {
      load();
    });
    return unsub;
  }, []);

  const openCreate = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormDesc('');
    setFormLink('');
    setFormCover('');
    setFormStatus('Active');
    setFormDisplayType('simple');
    setShowCreateForm(true);
  };

  const openEdit = (p: ProjectItem) => {
    setEditingProject(p);
    setFormTitle(p.title);
    setFormDesc(p.description);
    setFormLink(p.link || '');
    setFormCover(p.cover_url || '');
    setFormStatus(p.status);
    setFormDisplayType(p.display_type || 'simple');
    setShowCreateForm(true);
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingProject(null);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;

    if (editingProject) {
      updateProject(editingProject.id, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        link: formLink.trim(),
        cover_url: formCover.trim(),
        status: formStatus,
        display_type: formDisplayType,
      });
      realtime.sendNotification({
        title: 'Обновлено',
        body: `Проект "${formTitle.trim()}" сохранён`,
      });
    } else {
      createProject({
        title: formTitle.trim(),
        description: formDesc.trim(),
        type: 'game',
        link: formLink.trim(),
        cover_url: formCover.trim(),
        status: formStatus,
        display_type: formDisplayType,
        chapters_text: formDisplayType === 'chapters' ? 'Главы' : 'Играть онлайн',
        action_text: 'Запустить',
        chapters: [],
      });
      realtime.sendNotification({
        title: 'Создан проект',
        body: `Проект "${formTitle.trim()}" добавлен`,
      });
    }
    closeForm();
    load();
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Удалить проект "${title}"?`)) {
      const ok = deleteProject(id);
      if (ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        realtime.sendNotification({
          title: 'Удалено',
          body: `Проект "${title}" удалён`,
        });
      }
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#f4f4f5]">Проекты и игры</h1>
        <button
          onClick={openCreate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать проект
        </button>
      </div>

      {showCreateForm && (
        <div className="panel mb-6 bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#27272a] mb-6">
            <h3 className="font-bold text-base text-[#f4f4f5]">{editingProject ? 'Редактировать проект' : 'Новый проект'}</h3>
            <button onClick={closeForm} className="text-[#71717a] hover:text-[#f4f4f5] p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Название</label>
              <input
                className="input"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Название проекта"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Описание</label>
              <textarea
                className="input h-24"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Описание проекта..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Ссылка</label>
              <input
                className="input"
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
                placeholder="/games/pc-master или https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Ссылка на обложку</label>
              <input
                className="input"
                value={formCover}
                onChange={(e) => setFormCover(e.target.value)}
                placeholder="/project_cover.webp"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Статус</label>
                <select
                  className="select w-full"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Disabled')}
                >
                  <option value="Active">Активен (Active)</option>
                  <option value="Disabled">Отключен (Disabled)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Тип отображения</label>
                <select
                  className="select w-full"
                  value={formDisplayType}
                  onChange={(e) => setFormDisplayType(e.target.value as 'simple' | 'chapters')}
                >
                  <option value="simple">Простая ссылка</option>
                  <option value="chapters">С главами (Chapters)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-[#27272a]">
              <button onClick={handleSave} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {editingProject ? 'Сохранить изменения' : 'Создать проект'}
              </button>
              <button onClick={closeForm} className="btn">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-[#38bdf8]">Загрузка...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-[#121215] border border-[#27272a] rounded-xl text-[#71717a]">
          Проектов пока нет.
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="bg-[#121215] border border-[#27272a] rounded-xl p-4 flex items-center justify-between hover:border-[#3f3f46] transition-all">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {project.cover_url ? (
                  <img src={project.cover_url} alt={project.title} className="w-12 h-12 object-cover rounded-lg border border-[#27272a] shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-[#38bdf8]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#f4f4f5] text-sm truncate">{project.title}</div>
                  <div className="text-xs text-[#71717a] truncate mt-0.5">{project.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${project.status === 'Active' ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-[#71717a]/10 text-[#71717a]'}`}>
                  {project.status}
                </span>
                <button
                  onClick={() => openEdit(project)}
                  className="p-2 text-[#a1a1aa] hover:text-[#38bdf8] hover:bg-[#18181b] rounded-lg transition-colors cursor-pointer"
                  title="Редактировать"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(project.id, project.title)}
                  className="p-2 text-[#a1a1aa] hover:text-[#ef5350] hover:bg-[#18181b] rounded-lg transition-colors cursor-pointer"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
