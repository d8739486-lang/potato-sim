import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Download } from 'lucide-react';
import {
  fetchMods,
  createMod,
  updateMod,
  deleteMod,
  subscribeToMods,
} from '../../../core/services/dataService';
import { realtime } from '../../../core/services/realtime';
import type { Mod } from '../../../core/data/localDb';

export function ModsTab() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [editingMod, setEditingMod] = useState<Mod | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetchMods().then((data) => {
      setMods(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    const unsub = subscribeToMods(() => {
      load();
    });
    return unsub;
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Удалить мод "${title}"?`)) {
      const ok = deleteMod(id);
      if (ok) {
        setMods((prev) => prev.filter((m) => m.id !== id));
        realtime.sendNotification({
          title: 'Удалено',
          body: `Мод "${title}" удалён`,
        });
      }
      load();
    }
  };

  if (editingMod || showCreateForm) {
    return (
      <ModEditor
        mod={editingMod ?? null}
        onCancel={() => { setEditingMod(null); setShowCreateForm(false); }}
        onSaved={() => { setEditingMod(null); setShowCreateForm(false); load(); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#f4f4f5]">Моды Minecraft</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать мод
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#38bdf8]">Загрузка...</div>
      ) : mods.length === 0 ? (
        <div className="text-center py-16 bg-[#121215] border border-[#27272a] rounded-xl text-[#71717a]">
          Модов пока нет.
        </div>
      ) : (
        <div className="space-y-3">
          {mods.map((mod) => (
            <div key={mod.id} className="bg-[#121215] border border-[#27272a] rounded-xl p-4 flex items-center justify-between hover:border-[#3f3f46] transition-all">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {mod.icon_url ? (
                  <img src={mod.icon_url} alt={mod.title} className="w-12 h-12 object-cover rounded-xl border border-[#27272a] shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-[#38bdf8]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#f4f4f5] text-sm truncate">{mod.title}</div>
                  <div className="text-xs text-[#71717a] flex items-center gap-2 mt-0.5">
                    <span className="truncate">{mod.short_description}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Download className="w-3 h-3 text-[#38bdf8]" />
                      {mod.downloads}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button onClick={() => setEditingMod(mod)} className="p-2 text-[#a1a1aa] hover:text-[#38bdf8] hover:bg-[#18181b] rounded-lg transition-colors cursor-pointer" title="Редактировать">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(mod.id, mod.title)} className="p-2 text-[#a1a1aa] hover:text-[#ef5350] hover:bg-[#18181b] rounded-lg transition-colors cursor-pointer" title="Удалить">
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

interface ModEditorProps {
  mod: Mod | null;
  onCancel: () => void;
  onSaved: () => void;
}

function ModEditor({ mod, onCancel, onSaved }: ModEditorProps) {
  const [title, setTitle] = useState(mod?.title || '');
  const [slug, setSlug] = useState(mod?.slug || '');
  const [shortDesc, setShortDesc] = useState(mod?.short_description || '');
  const [longDesc, setLongDesc] = useState(mod?.long_description || '');
  const [iconUrl, setIconUrl] = useState(mod?.icon_url || '');
  const [platforms, setPlatforms] = useState(mod?.platforms?.join(', ') || '');
  const [mcVersions, setMcVersions] = useState(mod?.mc_versions?.join(', ') || '');
  const [tags, setTags] = useState(mod?.tags?.join(', ') || '');
  const [fileUrl, setFileUrl] = useState(mod?.file_url || '');
  const [fileSize, setFileSize] = useState(mod?.file_size || '');

  const handleSubmit = () => {
    if (!title.trim() || !slug.trim()) return;

    const modData: Omit<Mod, 'id' | 'created_at' | 'updated_at'> = {
      slug,
      title,
      short_description: shortDesc,
      long_description: longDesc,
      icon_url: iconUrl,
      banner_url: null,
      mc_versions: mcVersions.split(',').map((v) => v.trim()).filter(Boolean),
      platforms: platforms.split(',').map((v) => v.trim()).filter(Boolean),
      tags: tags.split(',').map((v) => v.trim()).filter(Boolean),
      links: {},
      file_url: fileUrl,
      file_size: fileSize,
      buttons: [],
      changelog: '',
      downloads: mod?.downloads || 0,
      followers: mod?.followers || 0,
      status: 'Active',
    };

    if (mod) {
      updateMod(mod.id, modData);
      realtime.sendNotification({
        title: 'Обновлено',
        body: `Мод "${title}" сохранён`,
      });
    } else {
      createMod(modData);
      realtime.sendNotification({
        title: 'Создан мод',
        body: `Мод "${title}" добавлен`,
      });
    }
    onSaved();
  };

  return (
    <div className="panel mb-6 bg-[#18181b] border border-[#27272a] rounded-xl p-6">
      <div className="font-bold text-base text-[#f4f4f5] pb-4 border-b border-[#27272a] mb-6">
        {mod ? 'Редактировать мод' : 'Создать новый мод'}
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Название</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Slug (URL)</label>
            <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Краткое описание</label>
          <textarea className="input h-20" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Полное описание (Markdown)</label>
          <textarea className="input h-32" value={longDesc} onChange={(e) => setLongDesc(e.target.value)} placeholder="## Описание..." />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Ссылка на иконку</label>
          <input className="input" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="/icons/mod_icon.webp" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Платформы</label>
            <input className="input" value={platforms} onChange={(e) => setPlatforms(e.target.value)} placeholder="Fabric, Forge" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Версии Minecraft</label>
            <input className="input" value={mcVersions} onChange={(e) => setMcVersions(e.target.value)} placeholder="1.20.1, 1.21.1" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Теги</label>
          <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Magic, Tech, QoL" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">URL файла для скачивания</label>
            <input className="input" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="/files/mod.jar" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Размер файла</label>
            <input className="input" value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder="2.5 MB" />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-[#27272a]">
          <button onClick={handleSubmit} className="btn btn-primary flex-1">Сохранить</button>
          <button onClick={onCancel} className="btn">Отмена</button>
        </div>
      </div>
    </div>
  );
}
