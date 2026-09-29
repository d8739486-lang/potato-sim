import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download, ChevronLeft, ChevronDown, X,
  GitBranch, Bug, MessageCircle, BookOpen,
  Package, Tag, Layers,
  ExternalLink, ChevronRight
} from 'lucide-react';
import { fetchModBySlug, formatDownloads, formatFileSize } from './modsService';
import type { Mod, ModVersion } from './types';
import { DEFAULT_MOD_BUTTONS } from './types';
import { DownloadModal } from './DownloadModal';

// ─── Platform badge colours ──────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  Fabric: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Forge: 'bg-red-500/15 text-red-300 border-red-500/30',
  NeoForge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Paper: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Spigot: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
  Quilt: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
};

function PlatformBadge({ name }: { name: string }) {
  const cls = PLATFORM_COLORS[name] ?? 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {name}
    </span>
  );
}


// ─── Gallery Lightbox ─────────────────────────────────────────────────────────
function GalleryLightbox({ images, startIdx, onClose }: {
  images: { image_url: string; caption: string }[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer">
        <X className="w-5 h-5 text-white" />
      </button>
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}
      <div className="max-w-5xl w-full">
        <img src={images[idx].image_url} alt={images[idx].caption} className="w-full max-h-[80vh] object-contain rounded-2xl" />
        {images[idx].caption && (
          <p className="text-center text-slate-400 text-sm mt-3">{images[idx].caption}</p>
        )}
      </div>
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderInline(text: string): string {
  // Use [^<>] to prevent matching across already generated HTML tags
  return text
    // Inline code: `code`
    .replace(/`([^`<>]+)`/g, '<code class="px-1.5 py-0.5 bg-white/8 text-orange-300 rounded text-[0.85em] font-mono">$1</code>')
    // Bold: **text** or __text__
    .replace(/\*\*([^*<>]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/__([^_<>]+)__/g, '<strong class="text-white font-bold">$1</strong>')
    // Strikethrough: ~~text~~ or -text-
    .replace(/~~([^~<>]+)~~/g, '<s class="text-slate-500 line-through">$1</s>')
    // Safe hyphen strikethrough (must be surrounded by space/punct to avoid matching words/classes)
    .replace(/(?<=^|[\s.,!?])-([^\-\n<>]+)-(?=$|[\s.,!?])/g, '<s class="text-slate-500 line-through">$1</s>')
    // Italic: *text* or _text_
    .replace(/\*([^*\n<>]+)\*/g, '<em class="italic text-slate-200">$1</em>')
    .replace(/(?<=^|[\s.,!?])_([^_\n<>]+)_(?=$|[\s.,!?])/g, '<em class="italic text-slate-200">$1</em>');
}

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactElement[] = [];
  let listItems: { text: string; ordered: boolean; num?: number }[] = [];
  let isOrdered = false;
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    if (isOrdered) {
      elements.push(
        <ol key={key++} className="list-decimal list-inside space-y-1.5 text-slate-300 my-3 pl-2">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderInline(item.text) }} />
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={key++} className="space-y-1.5 text-slate-300 my-3 pl-2">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed flex gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400/70 shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: renderInline(item.text) }} />
            </li>
          ))}
        </ul>
      );
    }
    listItems = [];
  };

  for (const line of lines) {
    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={key++} className="border-white/10 my-4" />);
      continue;
    }
    // Blockquote
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={key++} className="border-l-2 border-orange-500/50 pl-4 my-2 italic text-slate-400 text-sm">
          <span dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />
        </blockquote>
      );
      continue;
    }
    // H1
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      flushList();
      elements.push(
        <h1 key={key++} className="text-2xl font-black text-white mt-8 mb-3 leading-tight"
          dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />
      );
      continue;
    }
    // H2
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-white mt-6 mb-2 leading-tight"
          dangerouslySetInnerHTML={{ __html: renderInline(line.slice(3)) }} />
      );
      continue;
    }
    // H3
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-base font-semibold text-slate-200 mt-4 mb-1"
          dangerouslySetInnerHTML={{ __html: renderInline(line.slice(4)) }} />
      );
      continue;
    }
    // Ordered list: "1. " "2. " etc.
    const ordMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (ordMatch) {
      if (listItems.length > 0 && !isOrdered) flushList();
      isOrdered = true;
      listItems.push({ text: ordMatch[2], ordered: true, num: parseInt(ordMatch[1]) });
      continue;
    }
    // Unordered list: "- " or "* " (but not "---")
    if ((line.startsWith('- ') || line.startsWith('* ')) && line.length > 2) {
      if (listItems.length > 0 && isOrdered) flushList();
      isOrdered = false;
      listItems.push({ text: line.slice(2), ordered: false });
      continue;
    }
    // Blank line
    if (line.trim() === '') {
      flushList();
      elements.push(<div key={key++} className="h-2" />);
      continue;
    }
    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} className="text-sm text-slate-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
    );
  }

  flushList();
  return <div className="space-y-1">{elements}</div>;
}

// ─── Main ModDetailPage ───────────────────────────────────────────────────────
export function ModDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [mod, setMod] = useState<Mod | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'description' | 'changelog' | 'versions'>('description');
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [selectedMc, setSelectedMc] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetchModBySlug(slug).then(data => {
      setMod(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400 text-lg">Мод не найден</p>
        <Link to="/mods" className="text-orange-400 hover:underline flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Назад к модам
        </Link>
      </div>
    );
  }

  const gallery = mod.gallery ?? [];
  const versions = mod.versions ?? [];

  const linkItems = [
    { icon: GitBranch, label: 'Исходный код', url: mod.links.source_url },
    { icon: Bug, label: 'Сообщить об ошибке', url: mod.links.issues_url },
    { icon: MessageCircle, label: 'Discord', url: mod.links.discord_url },
    { icon: BookOpen, label: 'Вики', url: mod.links.wiki_url },
  ].filter(l => l.url);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] font-mono text-[#e0e0e0]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-slate-300 transition-colors">Главная</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/mods" className="hover:text-slate-300 transition-colors">Моды</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">{mod.title}</span>
        </div>

        {/* ── Mod header ── */}
        <div className="main-card relative p-6 mb-6 overflow-hidden">
          {/* Accent glow behind icon */}
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row gap-5 relative">
            {/* Icon */}
            <div className="shrink-0">
              {mod.icon_url ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                  <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-md" />
                  <img src={mod.icon_url} alt={mod.title} className="relative w-full h-full rounded-2xl object-cover border-2 border-white/15 shadow-xl" />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-orange-500/25 to-orange-600/10 border border-orange-500/30 flex items-center justify-center shadow-lg">
                  <Package className="w-10 h-10 text-orange-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{mod.title}</h1>
                  <p className="text-slate-400 mt-1 text-sm leading-relaxed max-w-2xl">{mod.short_description}</p>
                </div>
                {/* ─── Version / Platform selectors + Download ─── */}
                {(() => {
                  const vers = mod.versions ?? [];
                  const hasVersions = vers.length > 0;

                  if (!hasVersions && !mod.file_url) return null;

                  if (!hasVersions) {
                    // Simple direct download from file_url
                    return (
                      <a
                        href={mod.file_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center px-6 py-2.5 text-white shrink-0 cursor-pointer"
                        style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: '20px', boxShadow: '0 0 24px rgba(249,115,22,0.35)' }}
                      >
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Download className="w-4 h-4" />
                          Скачать мод
                        </div>
                        {mod.file_size && <span className="text-[10px] font-semibold opacity-75 mt-0.5 tracking-wide">{formatFileSize(mod.file_size)}</span>}
                      </a>
                    );
                  }

                  // Multi-version selectors
                  const allMcVersions = [...new Set(vers.map(v => v.mc_version))];
                  const effectiveMc = selectedMc || allMcVersions[0] || '';
                  const availablePlatforms = [...new Set(vers.filter(v => v.mc_version === effectiveMc).map(v => v.platform))];
                  const effectivePlatform = selectedPlatform || availablePlatforms[0] || '';
                  const matched = vers.find(v => v.mc_version === effectiveMc && v.platform === effectivePlatform);

                  return (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* MC Version selector */}
                      {allMcVersions.length > 1 && (
                        <div className="relative">
                          <select
                            value={effectiveMc}
                            onChange={e => { setSelectedMc(e.target.value); setSelectedPlatform(''); }}
                            className="appearance-none bg-white/8 border border-white/15 text-white text-sm font-semibold pr-7 pl-3 py-2 cursor-pointer outline-none hover:bg-white/12 transition-colors"
                            style={{ borderRadius: '14px' }}
                          >
                            {allMcVersions.map(v => <option key={v} value={v} className="bg-[#111827] text-white">{v}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      )}
                      {/* Platform selector */}
                      {availablePlatforms.length > 1 && (
                        <div className="relative">
                          <select
                            value={effectivePlatform}
                            onChange={e => setSelectedPlatform(e.target.value)}
                            className="appearance-none bg-white/8 border border-white/15 text-white text-sm font-semibold pr-7 pl-3 py-2 cursor-pointer outline-none hover:bg-white/12 transition-colors"
                            style={{ borderRadius: '14px' }}
                          >
                            {availablePlatforms.map(p => <option key={p} value={p} className="bg-[#111827] text-white">{p}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      )}
                      {/* Single platform badge (if only one) */}
                      {availablePlatforms.length === 1 && (
                        <span className="text-xs font-bold px-3 py-1.5 border border-[#2a2a2a] bg-[#1a1a1a] text-[#aaaaaa] rounded-none mono">{effectivePlatform}</span>
                      )}
                      {/* Download button */}
                      <a
                        href={matched?.download_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => !matched?.download_url && e.preventDefault()}
                        className={`flex flex-col items-center justify-center px-6 py-2.5 font-bold transition-colors cursor-pointer border rounded-none mono ${
                          matched?.download_url
                            ? 'bg-[#4fc3f7] hover:bg-[#29b6f6] text-black border-[#4fc3f7]'
                            : 'bg-[#1a1a1a] text-[#888888] border-[#2a2a2a] cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-black text-sm">
                          <Download className="w-4 h-4 text-current" />
                          Скачать
                        </div>
                        {matched?.file_size && <span className="text-[10px] font-bold mt-0.5 tracking-wide">{formatFileSize(matched.file_size)}</span>}
                      </a>
                    </div>
                  );
                })()}
                {/* Secondary action buttons */}
                {(mod.buttons ?? DEFAULT_MOD_BUTTONS).filter(b => b.style !== 'primary' && b.enabled && b.url).map((btn, i) => (
                  <a
                    key={i}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] text-[#e0e0e0] border border-[#2a2a2a] transition-colors shrink-0 text-sm font-semibold rounded-none mono"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {btn.label}
                  </a>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-none px-3 py-1 text-xs text-[#888888] mono">
                  <Download className="w-3 h-3 text-[#4fc3f7]" />
                  <span>{formatDownloads(mod.downloads)} скачиваний</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mod.platforms.map(p => <PlatformBadge key={p} name={p} />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

          {/* Left: tabs */}
          <div className="space-y-4">
            {/* Tab bar */}
            <div className="tab-container flex gap-1 p-1.5 w-fit">
              {(['description', 'changelog', 'versions'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 font-semibold transition-all cursor-pointer theme-tab-btn mono rounded-none ${
                    tab === t
                      ? 'theme-tab-btn-active bg-[#1a1a1a] text-[#4fc3f7] border border-[#4fc3f7]'
                      : 'text-[#888888] hover:text-[#e0e0e0] hover:bg-[#1a1a1a]'
                  }`}
                >
                  {{ description: 'Описание', changelog: 'Changelog', versions: 'Версии' }[t]}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="main-card p-6">
              {tab === 'description' && (
                <MarkdownContent text={mod.long_description || '*Описание не добавлено.*'} />
              )}

              {tab === 'changelog' && (
                <MarkdownContent text={mod.changelog || '*Changelog пуст.*'} />
              )}

              {tab === 'versions' && (
                <div className="overflow-x-auto">
                  {versions.length === 0 ? (
                    <p className="text-slate-500 text-sm">Версии не добавлены.</p>
                  ) : (
                    <table className="w-full min-w-[500px] text-sm">
                      <thead>
                        <tr className="text-xs text-slate-500 border-b border-white/5">
                          <th className="pb-3 text-left font-semibold">Файл/Версия</th>
                          <th className="pb-3 text-left font-semibold">MC</th>
                          <th className="pb-3 text-left font-semibold">Платформа</th>
                          <th className="pb-3 text-left font-semibold">Дата</th>
                          <th className="pb-3 text-right font-semibold"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {versions.map((v: ModVersion) => {
                          let cleanName = v.version_number;
                          if (cleanName) {
                            cleanName = cleanName.replace(/^\d{13}_/, '');
                            cleanName = cleanName.replace(/\.jar$/, '');
                          }
                          return (
                            <tr key={v.id} className="hover:bg-white/2 transition-colors">
                              <td className="py-3 font-mono font-semibold text-white truncate max-w-[200px]" title={v.version_number}>{cleanName}</td>
                              <td className="py-3 text-slate-300">{v.mc_version}</td>
                              <td className="py-3"><PlatformBadge name={v.platform} /></td>
                              <td className="py-3 text-slate-500">{v.release_date}</td>
                              <td className="py-3 text-right">
                                {v.download_url && (
                                  <a href={v.download_url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 rounded-lg text-xs font-semibold transition-colors">
                                    <Download className="w-3 h-3" /> .jar
                                  </a>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="main-card p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-400" /> Галерея
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gallery.map((img, i) => (
                    <button key={img.id} onClick={() => setLightbox(i)}
                      className="aspect-video rounded-xl overflow-hidden bg-white/5 hover:ring-2 hover:ring-orange-500/50 transition-all cursor-pointer group"
                    >
                      <img src={img.image_url} alt={img.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-4">

            {/* Compatibility */}
            <div className="main-card p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Совместимость
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Minecraft</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mod.mc_versions.map(v => (
                      <span key={v} className="px-2.5 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-full text-xs font-semibold">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Платформы</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mod.platforms.map(p => <PlatformBadge key={p} name={p} />)}
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            {linkItems.length > 0 && (
              <div className="main-card p-5">
                <h3 className="text-sm font-bold text-white mb-3">Ссылки</h3>
                <div className="space-y-1">
                  {linkItems.map(({ icon: Icon, label, url }) => (
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors group text-sm"
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {mod.tags.length > 0 && (
              <div className="main-card p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-orange-400" /> Теги
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {mod.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-white/5 text-slate-400 rounded-lg text-xs font-medium border border-white/8">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>

      {downloadOpen && <DownloadModal mod={mod} isOpen={downloadOpen} onClose={() => setDownloadOpen(false)} />}
      {lightbox !== null && (
        <GalleryLightbox images={gallery} startIdx={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
