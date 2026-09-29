import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Search, Package, ArrowRight, Pencil, Trash2,
  Gamepad2, Sparkles, Filter, LayoutGrid, ListFilter
} from 'lucide-react';
import { fetchMods, formatDownloads, subscribeToMods } from '../../core/services/dataService';
import { localDb } from '../../core/data/localDb';
import type { Mod } from '../../core/data/localDb';
import { useAuthStore } from '../../core/store/useAuthStore';

const PLATFORM_STYLES: Record<string, string> = {
  Fabric: 'text-[#38bdf8] border-[#38bdf8]/30 bg-[#38bdf8]/5',
  Forge: 'text-[#fb923c] border-[#fb923c]/30 bg-[#fb923c]/5',
  NeoForge: 'text-[#38bdf8] border-[#38bdf8]/30 bg-[#38bdf8]/5',
  Paper: 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/5',
  Spigot: 'text-[#60a5fa] border-[#60a5fa]/30 bg-[#60a5fa]/5',
  Quilt: 'text-[#c084fc] border-[#c084fc]/30 bg-[#c084fc]/5',
};

const ALL_PLATFORMS = ['Fabric', 'Forge', 'NeoForge', 'Paper', 'Spigot', 'Quilt'];

type SortOption = 'downloads' | 'updated' | 'title';

function ModCard({ mod, isAdmin, onRefresh, viewMode }: { mod: Mod; isAdmin: boolean; onRefresh: () => void; viewMode: 'grid' | 'list' }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Удалить мод "${mod.title}"?`)) return;
    setDeleting(true);
    localDb.delete('mods', mod.id);
    onRefresh();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = '/admin';
  };

  if (viewMode === 'grid') {
    return (
      <Link
        to={`/mods/${mod.slug}`}
        className={`project-card group relative flex flex-col justify-between p-6 cursor-pointer overflow-hidden transition-all duration-200 ${
          deleting ? 'opacity-40 pointer-events-none' : ''
        }`}
      >
        <div className="space-y-4">
          {/* Top Row: Icon + Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="relative shrink-0">
              {mod.icon_url ? (
                <img
                  src={mod.icon_url}
                  alt={mod.title}
                  className="w-16 h-16 object-cover rounded-xl border border-[#27272a]"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center">
                  <Package className="w-8 h-8 text-[#38bdf8]" />
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleEdit}
                  title="Редактировать"
                  className="p-2 border border-[#27272a] rounded-lg text-[#a1a1aa] hover:text-[#38bdf8] hover:bg-[#1f1f23] transition-all cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  title="Удалить"
                  className="p-2 border border-[#27272a] rounded-lg text-[#a1a1aa] hover:text-[#ef5350] hover:bg-[#1f1f23] transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Title & Desc */}
          <div>
            <h2 className="text-xl font-bold text-[#f4f4f5] tracking-tight leading-snug mb-2 group-hover:text-[#38bdf8] transition-colors">
              {mod.title}
            </h2>
            <p className="text-[#a1a1aa] text-sm line-clamp-2 leading-relaxed">
              {mod.short_description || 'Нет описания'}
            </p>
          </div>

          {/* Tags */}
          {mod.tags && mod.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {mod.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 border border-[#27272a] bg-[#18181b] text-[#a1a1aa] rounded-md text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-[#27272a] space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex flex-wrap gap-1">
              {mod.platforms && mod.platforms.map((p) => {
                const color = PLATFORM_STYLES[p] || 'text-[#38bdf8] border-[#38bdf8]/20 bg-[#38bdf8]/5';
                return (
                  <span key={p} className={`px-2 py-0.5 border rounded-md font-semibold text-[11px] ${color}`}>
                    {p}
                  </span>
                );
              })}
            </div>

            {mod.mc_versions && mod.mc_versions.length > 0 && (
              <span className="text-[#71717a] font-medium text-xs">
                {mod.mc_versions[0]}
                {mod.mc_versions.length > 1 && ` +${mod.mc_versions.length - 1}`}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#a1a1aa]">
              <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
              {formatDownloads(mod.downloads)}
            </span>
            <span className="text-[#38bdf8] font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Подробнее <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // List view mode
  return (
    <Link
      to={`/mods/${mod.slug}`}
      className={`project-card group p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 ${
        deleting ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {mod.icon_url ? (
          <img src={mod.icon_url} alt={mod.title} className="w-14 h-14 object-cover rounded-xl border border-[#27272a] shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0">
            <Package className="w-7 h-7 text-[#38bdf8]" />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-[#f4f4f5] truncate group-hover:text-[#38bdf8] transition-colors">
              {mod.title}
            </h2>
            {mod.platforms && mod.platforms.map((p) => (
              <span key={p} className="px-1.5 py-0.5 border border-[#27272a] text-[#a1a1aa] rounded-md text-[10px] font-semibold hidden md:inline-block">
                {p}
              </span>
            ))}
          </div>
          <p className="text-[#a1a1aa] text-xs line-clamp-1">
            {mod.short_description || 'Нет описания'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 text-xs text-[#a1a1aa] self-end sm:self-center">
        <span className="flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
          {formatDownloads(mod.downloads)}
        </span>
        {mod.mc_versions && mod.mc_versions[0] && (
          <span className="px-2 py-0.5 border border-[#27272a] bg-[#18181b] rounded-md font-medium text-[#38bdf8]">
            {mod.mc_versions[0]}
          </span>
        )}
        <span className="text-[#38bdf8] font-semibold flex items-center gap-1">
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

export function ModsPage() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('downloads');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { role } = useAuthStore();
  const isAdmin = role === 'admin';

  const loadData = async () => {
    const data = await fetchMods();
    setMods(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToMods(() => loadData());
    return unsub;
  }, []);

  const allTags = Array.from(
    new Set(mods.flatMap((m) => m.tags || []))
  ).filter(Boolean);

  const filteredMods = mods
    .filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.short_description || '').toLowerCase().includes(search.toLowerCase());
      const matchPlatform =
        !filterPlatform || (m.platforms && m.platforms.includes(filterPlatform));
      const matchTag = !selectedTag || (m.tags && m.tags.includes(selectedTag));
      return matchSearch && matchPlatform && matchTag;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

  return (
    <div className="relative min-h-screen bg-[#09090b] pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        {/* Navigation Tabs */}
        <div className="tab-container flex flex-wrap items-center justify-center gap-1 p-1 relative z-10 w-full max-w-fit mx-auto mb-10">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2 font-semibold transition-all duration-150 cursor-pointer theme-tab-btn text-[#a1a1aa] hover:text-[#f4f4f5]"
          >
            <Gamepad2 className="w-4 h-4" />
            Игры
          </Link>
          <Link
            to="/projects"
            className="flex items-center gap-2 px-5 py-2 font-semibold transition-all duration-150 cursor-pointer theme-tab-btn text-[#a1a1aa] hover:text-[#f4f4f5]"
          >
            <Sparkles className="w-4 h-4" />
            Сник-пики
          </Link>
          <button className="flex items-center gap-2 px-5 py-2 font-semibold transition-all duration-150 cursor-pointer theme-tab-btn theme-tab-btn-active">
            <Package className="w-4 h-4" />
            Моды
          </button>
        </div>

        {/* Header */}
        <div className="main-card p-8 md:p-10 mb-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#18181b] border border-[#27272a] text-[#38bdf8] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Каталог модификаций
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#f4f4f5] tracking-tight">
              Моды для Minecraft
            </h1>
            <p className="text-[#a1a1aa] max-w-xl text-base leading-relaxed">
              Модификации для расширения механик, графики и интерфейса Minecraft. Поддержка Fabric, Forge и NeoForge.
            </p>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="panel p-4 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
              <input
                type="text"
                placeholder="Поиск по названию или описанию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Platform Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="select"
              >
                <option value="">Все платформы</option>
                {ALL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="select"
              >
                <option value="downloads">По скачиваниям</option>
                <option value="updated">По дате обновления</option>
                <option value="title">По названию (A-Z)</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center p-1 bg-[#18181b] border border-[#27272a] rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-[#27272a] text-[#38bdf8]' : 'text-[#71717a] hover:text-[#f4f4f5]'
                  }`}
                  title="Сетка"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-[#27272a] text-[#38bdf8]' : 'text-[#71717a] hover:text-[#f4f4f5]'
                  }`}
                  title="Список"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-[#27272a] overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-[#71717a] uppercase shrink-0 flex items-center gap-1.5">
                <Filter className="w-3 h-3 text-[#38bdf8]" /> Теги:
              </span>
              <button
                type="button"
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all shrink-0 cursor-pointer border ${
                  selectedTag === ''
                    ? 'bg-[#1f1f23] text-[#38bdf8] border-[#38bdf8]'
                    : 'bg-[#18181b] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#f4f4f5] border-[#27272a]'
                }`}
              >
                Все ({mods.length})
              </button>
              {allTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(isSelected ? '' : tag)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1f1f23] text-[#38bdf8] border-[#38bdf8]'
                        : 'bg-[#18181b] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#f4f4f5] border-[#27272a]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mods Listing */}
        {loading ? (
          <div className="text-center py-20 text-[#38bdf8]">Загрузка каталога...</div>
        ) : filteredMods.length === 0 ? (
          <div className="text-center py-20 text-[#71717a]">
            {search || filterPlatform || selectedTag ? 'Ничего не найдено по заданным фильтрам.' : 'Моды пока не добавлены.'}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMods.map((mod) => (
              <ModCard key={mod.id} mod={mod} isAdmin={isAdmin} onRefresh={loadData} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMods.map((mod) => (
              <ModCard key={mod.id} mod={mod} isAdmin={isAdmin} onRefresh={loadData} viewMode="list" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
