import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Clock, Save, X } from 'lucide-react';
import {
  fetchSneakPeeks,
  createSneakPeek,
  updateSneakPeek,
  deleteSneakPeek,
  subscribeToSneakPeeks,
} from '../../../core/services/dataService';
import { realtime, addUnreadNotification } from '../../../core/services/realtime';
import type { SneakPeek } from '../../../core/data/localDb';

const CATEGORIES: { value: SneakPeek['category']; label: string }[] = [
  { value: 'sneak_peek', label: 'Сник-пик / Девлог' },
  { value: 'announcement', label: 'Анонс' },
  { value: 'notification', label: 'Уведомление' },
  { value: 'mod_preview', label: 'Мод Minecraft' },
  { value: 'browser_game', label: 'Браузерная игра' },
  { value: 'app_beta', label: 'Приложение (Бета)' },
];

const STATUSES: SneakPeek['status'][] = ['Planned', 'In Development', 'Testing', 'Released'];

export function SneakPeeksTab() {
  const [peeks, setPeeks] = useState<SneakPeek[]>([]);
  const [editingPeek, setEditingPeek] = useState<SneakPeek | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetchSneakPeeks().then((data) => {
      setPeeks(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    const unsub = subscribeToSneakPeeks(() => {
      load();
    });
    return unsub;
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Удалить публикацию "${title}"?`)) {
      const ok = deleteSneakPeek(id);
      if (ok) {
        setPeeks((prev) => prev.filter((p) => p.id !== id));
        realtime.sendNotification({
          title: 'Удалено',
          body: `Публикация "${title}" успешно удалена`,
        });
      }
      load();
    }
  };

  const handlePublishNotification = (peek: SneakPeek) => {
    addUnreadNotification({
      title: 'Новая публикация: ' + peek.title,
      body: peek.short_description || peek.full_content || '',
      url: `/projects#${peek.slug}`,
      timestamp: Date.now(),
    });

    realtime.sendNotification({
      title: 'Новая публикация',
      body: peek.title,
    });
  };

  const handleSavePeek = (peekData: SneakPeek | Omit<SneakPeek, 'id' | 'created_at'>) => {
    if ('id' in peekData && peekData.id) {
      updateSneakPeek(peekData.id, peekData);
      realtime.sendNotification({
        title: 'Обновлено',
        body: `Публикация "${peekData.title}" сохранена`,
      });
    } else {
      const created = createSneakPeek(peekData as Omit<SneakPeek, 'id' | 'created_at'>);
      handlePublishNotification(created);
    }
    setEditingPeek(null);
    setShowCreateForm(false);
    load();
  };

  const SneakPeekEditor = ({
    peek,
    onSave,
    onCancel,
  }: {
    peek: SneakPeek | null;
    onSave: (peek: SneakPeek | Omit<SneakPeek, 'id' | 'created_at'>) => void;
    onCancel: () => void;
  }) => {
    const [title, setTitle] = useState(peek?.title || '');
    const [slug, setSlug] = useState(peek?.slug || '');
    const [category, setCategory] = useState<SneakPeek['category']>(peek?.category || 'sneak_peek');
    const [status, setStatus] = useState<SneakPeek['status']>(peek?.status || 'In Development');
    const [progress, setProgress] = useState(peek?.progress ?? 0);
    const [shortDesc, setShortDesc] = useState(peek?.short_description || '');
    const [fullContent, setFullContent] = useState(peek?.full_content || '');
    const [coverUrl, setCoverUrl] = useState(peek?.cover_url || '');
    const [tagsInput, setTagsInput] = useState(peek?.tags?.join(', ') || '');
    const [mcVersion, setMcVersion] = useState(peek?.mc_version || '');
    const [platform, setPlatform] = useState(peek?.platform || '');
    const [projectScale, setProjectScale] = useState<SneakPeek['project_scale']>(peek?.project_scale || 'medium');

    const handleFormSubmit = () => {
      if (!title.trim()) return;

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const generatedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (peek) {
        onSave({
          ...peek,
          title: title.trim(),
          slug: generatedSlug,
          category,
          status,
          progress,
          short_description: shortDesc.trim(),
          full_content: fullContent.trim(),
          cover_url: coverUrl.trim(),
          tags,
          mc_version: mcVersion.trim(),
          platform: platform.trim(),
          project_scale: projectScale,
        });
      } else {
        onSave({
          title: title.trim(),
          slug: generatedSlug,
          category,
          status,
          progress,
          short_description: shortDesc.trim(),
          full_content: fullContent.trim(),
          cover_url: coverUrl.trim(),
          tags,
          mc_version: mcVersion.trim(),
          platform: platform.trim(),
          project_scale: projectScale,
        });
      }
    };

    return (
      <div className="panel mb-6 bg-[#18181b] border border-[#27272a] rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#27272a] mb-6">
          <h3 className="font-bold text-base text-[#f4f4f5]">{peek ? 'Редактировать публикацию' : 'Новая публикация'}</h3>
          <button onClick={onCancel} className="text-[#71717a] hover:text-[#f4f4f5] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Заголовок</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название сник-пика"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">URL-идентификатор (slug)</label>
              <input
                className="input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="cold-forest"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Категория</label>
              <select
                className="select w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value as SneakPeek['category'])}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Статус</label>
              <select
                className="select w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value as SneakPeek['status'])}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-[#a1a1aa]">
                Прогресс разработки
              </label>
              <span className="text-xs font-bold text-[#38bdf8]">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-[#38bdf8]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Краткое описание</label>
            <textarea
              className="input h-20"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Краткое описание публикации..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Полное описание (Markdown)</label>
            <textarea
              className="input h-32"
              value={fullContent}
              onChange={(e) => setFullContent(e.target.value)}
              placeholder="Подробное описание..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Ссылка на изображение</label>
              <input
                className="input"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="/cover.webp"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Масштаб проекта</label>
              <select
                className="select w-full"
                value={projectScale}
                onChange={(e) => setProjectScale(e.target.value as SneakPeek['project_scale'])}
              >
                <option value="mini">Небольшой</option>
                <option value="medium">Средний</option>
                <option value="major">Крупный</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Версия Minecraft (если мод)</label>
              <input
                className="input"
                value={mcVersion}
                onChange={(e) => setMcVersion(e.target.value)}
                placeholder="1.21.1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Платформа</label>
              <input
                className="input"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="NeoForge / Web"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Теги (через запятую)</label>
            <input
              className="input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Minecraft, NeoForge, Мод"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#27272a]">
            <button
              onClick={handleFormSubmit}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {peek ? 'Сохранить изменения' : 'Опубликовать'}
            </button>
            <button onClick={onCancel} className="btn">
              Отмена
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#f4f4f5]">Сник-пики и публикации</h1>
        <button
          onClick={() => {
            setEditingPeek(null);
            setShowCreateForm(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Новая публикация
        </button>
      </div>

      {(showCreateForm || editingPeek) && (
        <SneakPeekEditor
          peek={editingPeek}
          onSave={handleSavePeek}
          onCancel={() => {
            setEditingPeek(null);
            setShowCreateForm(false);
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-10 text-[#38bdf8]">Загрузка...</div>
      ) : peeks.length === 0 ? (
        <div className="text-center py-16 bg-[#121215] border border-[#27272a] rounded-xl text-[#71717a]">
          Публикаций пока нет. Нажмите «Новая публикация», чтобы создать.
        </div>
      ) : (
        <div className="space-y-3">
          {peeks.map((peek) => (
            <div key={peek.id} className="bg-[#121215] border border-[#27272a] rounded-xl p-4 flex items-center justify-between hover:border-[#3f3f46] transition-all">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#f4f4f5] text-sm flex items-center gap-2 truncate">
                    <span>{peek.title}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#18181b] text-[#38bdf8] border border-[#27272a]">
                      {peek.category}
                    </span>
                  </div>
                  <div className="text-xs text-[#71717a] flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Прогресс: {peek.progress}%</span>
                    <span>·</span>
                    <span>{peek.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-4">
                <button
                  onClick={() => {
                    setEditingPeek(peek);
                    setShowCreateForm(false);
                  }}
                  className="p-2 text-[#a1a1aa] hover:text-[#38bdf8] hover:bg-[#18181b] rounded-lg transition-colors cursor-pointer"
                  title="Редактировать"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(peek.id, peek.title)}
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
