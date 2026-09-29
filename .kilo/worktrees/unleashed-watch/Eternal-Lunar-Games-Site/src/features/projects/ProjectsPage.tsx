import { useState, useEffect } from 'react';
import { Sparkles, Bell, Clock, Cpu, Layers, Tag, CheckCircle2, Gamepad2, AppWindow, Package } from 'lucide-react';
import { fetchSneakPeeks, subscribeToSneakPeeks } from '../../core/services/dataService';
import type { SneakPeek } from '../../core/data/localDb';

const CATEGORY_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  mod_preview: { label: 'Мод Minecraft', color: 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/30', icon: Package },
  browser_game: { label: 'Браузерная игра', color: 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/30', icon: Gamepad2 },
  app_beta: { label: 'Приложение (Бета)', color: 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/30', icon: AppWindow },
  sneak_peek: { label: 'Сник-пик / Девлог', color: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30', icon: Sparkles },
  announcement: { label: 'Анонс', color: 'bg-[#fb923c]/10 text-[#fb923c] border-[#fb923c]/30', icon: Layers },
  notification: { label: 'Уведомление', color: 'bg-[#a1a1aa]/10 text-[#a1a1aa] border-[#a1a1aa]/30', icon: Bell },
};

function SneakPeekCard({ item }: { item: SneakPeek }) {
  const CategoryIcon = CATEGORY_LABELS[item.category]?.icon || Sparkles;

  return (
    <div className="project-card group relative p-6 md:p-8 flex flex-col md:flex-row gap-6">
      {/* Image or Category Icon Block */}
      <div className="aspect-video w-full md:w-5/12 shrink-0 rounded-lg overflow-hidden bg-[#18181b] border border-[#27272a] flex flex-col items-center justify-center relative">
        {item.cover_url ? (
          <img src={item.cover_url} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="p-4 rounded-xl bg-[#27272a] flex items-center justify-center">
              <CategoryIcon className="w-8 h-8 text-[#38bdf8]" />
            </div>
          </div>
        )}

        {/* Platform badge */}
        {(item.platform || item.mc_version) && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-[#09090b]/80 backdrop-blur-sm border border-[#27272a] rounded-md text-xs font-semibold text-[#38bdf8]">
            <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
            {[item.platform, item.mc_version].filter(Boolean).join(' ')}
          </div>
        )}

        {/* Scale badge */}
        {item.project_scale === 'major' && (
          <div className="absolute top-3 left-3 z-10">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#09090b]/80 backdrop-blur-sm border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-bold rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              Крупный проект
            </span>
          </div>
        )}
        {item.project_scale === 'medium' && (
          <div className="absolute top-3 left-3 z-10">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#09090b]/80 backdrop-blur-sm border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-bold rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              Средний проект
            </span>
          </div>
        )}
        {item.project_scale === 'mini' && (
          <div className="absolute top-3 left-3 z-10">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#09090b]/80 backdrop-blur-sm border border-[#27272a] text-[#a1a1aa] text-xs font-bold rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-[#a1a1aa]" />
              Небольшой проект
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${CATEGORY_LABELS[item.category]?.color || 'border-[#27272a] text-[#38bdf8]'}`}>
              <CategoryIcon className="w-3.5 h-3.5" />
              {CATEGORY_LABELS[item.category]?.label || item.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#27272a] bg-[#18181b] text-xs font-medium text-[#a1a1aa]">
              <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
              {item.status}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight text-[#f4f4f5]">
            {item.title}
          </h3>

          <p className="text-[#a1a1aa] text-sm md:text-base leading-relaxed mb-4 whitespace-pre-line">
            {item.short_description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mt-4 pt-4 border-t border-[#27272a]">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-[#a1a1aa] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" /> Готовность проекта
            </span>
            <span className="text-[#38bdf8] font-bold">{item.progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#18181b] rounded-full border border-[#27272a] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.max(0, item.progress))}%`,
                background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
              }}
            />
          </div>
        </div>

        {/* Tags */}
        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {item.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border border-[#27272a] bg-[#18181b] text-[#a1a1aa]">
                <Tag className="w-3 h-3 text-[#38bdf8]" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const [peeks, setPeeks] = useState<SneakPeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    fetchSneakPeeks().then((data) => {
      setPeeks(data);
      setLoading(false);
    });

    const unsubscribe = subscribeToSneakPeeks((updated) => {
      setPeeks(updated);
    });

    return () => unsubscribe();
  }, []);

  const SCALE_WEIGHT: Record<string, number> = {
    major: 3,
    medium: 2,
    mini: 1,
  };

  const sortedPeeks = [...peeks].sort((a, b) => {
    const weightA = SCALE_WEIGHT[a.project_scale || 'medium'] || 2;
    const weightB = SCALE_WEIGHT[b.project_scale || 'medium'] || 2;
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const filtered = sortedPeeks.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.category === activeFilter;
  });

  return (
    <div className="relative animate-fade-in pb-20 bg-[#09090b] min-h-screen">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-[#121215] border border-[#27272a] mb-4 shadow-sm">
            <Sparkles className="w-8 h-8 text-[#38bdf8]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-[#f4f4f5]">
            Сник-пики и Разработка
          </h1>
          <p className="text-[#a1a1aa] max-w-xl mx-auto text-base">
            Девлоги и процесс создания проектов в реальном времени: моды, игры и обновления.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'Все' },
            { id: 'sneak_peek', label: 'Сник-пики' },
            { id: 'announcement', label: 'Анонсы' },
            { id: 'mod_preview', label: 'Моды' },
            { id: 'browser_game', label: 'Игры' },
            { id: 'app_beta', label: 'Приложения' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer border ${
                activeFilter === f.id
                  ? 'bg-[#1f1f23] text-[#38bdf8] border-[#38bdf8]'
                  : 'bg-[#121215] text-[#a1a1aa] border-[#27272a] hover:border-[#3f3f46] hover:text-[#f4f4f5]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-[#18181b] border border-[#27272a] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#71717a]">
            В выбранной категории пока нет публикаций.
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((peek) => (
              <SneakPeekCard key={peek.id} item={peek} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
