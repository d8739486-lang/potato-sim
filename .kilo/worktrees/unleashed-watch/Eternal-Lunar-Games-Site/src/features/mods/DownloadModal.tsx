import { useState, useEffect, useCallback } from 'react';
import { Download, ChevronDown, X, Package, HardDrive, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from './modsService';
import type { Mod } from './types';

const PLATFORM_COLORS: Record<string, string> = {
  Fabric:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Forge:    'bg-red-500/15 text-red-300 border-red-500/30',
  NeoForge: 'bg-[#4fc3f7]/15 text-[#4fc3f7] border-[#4fc3f7]/30',
  Paper:    'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Spigot:   'bg-lime-500/15 text-lime-300 border-lime-500/30',
  Quilt:    'bg-violet-500/15 text-violet-300 border-violet-500/30',
};

const RELEASE_TYPE_COLORS: Record<string, string> = {
  Release: 'bg-[#4fc3f7]/20 text-[#4fc3f7] border-[#4fc3f7]/30',
  Beta:    'bg-amber-500/20 text-amber-300 border-amber-500/25',
  Alpha:   'bg-red-500/20 text-red-300 border-red-500/25',
};

function PlatformBadge({ name }: { name: string }) {
  const cls = PLATFORM_COLORS[name] ?? 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-xs font-semibold border mono ${cls}`}>
      {name}
    </span>
  );
}

function filenameFromUrl(url: string): string {
  let name = url;
  try {
    const u = new URL(url);
    const seg = u.pathname.split('/').filter(Boolean).pop() ?? '';
    name = decodeURIComponent(seg) || url;
  } catch {
    const seg = url.split('/').pop() ?? url;
    name = decodeURIComponent(seg);
  }
  return name;
}

interface DownloadModalProps {
  mod: Mod;
  isOpen?: boolean;
  onClose: () => void;
  onDownloadStart?: () => void;
}

export function DownloadModal({ mod, isOpen = true, onClose, onDownloadStart }: DownloadModalProps) {
  const versions = mod.versions ?? [];
  const hasVersions = versions.length > 0;

  const allMcVersions = Array.from(
    new Set(versions.map(v => v.mc_version))
  );

  const [selectedMc, setSelectedMc] = useState<string>(
    allMcVersions[0] ?? mod.mc_versions[0] ?? ''
  );

  const availablePlatforms = Array.from(
    new Set(
      versions
        .filter(v => v.mc_version === selectedMc)
        .map(v => v.platform)
    )
  );

  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    availablePlatforms[0] ?? mod.platforms[0] ?? ''
  );

  const [mcOpen, setMcOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!availablePlatforms.includes(selectedPlatform)) {
      setSelectedPlatform(availablePlatforms[0] ?? '');
    }
  }, [selectedMc, availablePlatforms, selectedPlatform]);

  useEffect(() => {
    if (isOpen) {
      const mc = allMcVersions[0] ?? mod.mc_versions[0] ?? '';
      setSelectedMc(mc);
      const plats = versions.filter(v => v.mc_version === mc).map(v => v.platform);
      setSelectedPlatform(plats[0] ?? mod.platforms[0] ?? '');
      setDone(false);
      setDownloading(false);
      setMcOpen(false);
      setPlatformOpen(false);
    }
  }, [isOpen, mod]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const matched = hasVersions
    ? versions.find(v => v.mc_version === selectedMc && v.platform === selectedPlatform)
    : null;

  const downloadUrl = matched?.download_url ?? mod.file_url ?? '';
  const rawFileSize = matched?.file_size ?? mod.file_size;
  const fileSize = formatFileSize(rawFileSize);
  const filename = downloadUrl ? filenameFromUrl(downloadUrl) : '';

  const handleDownload = () => {
    setDownloading(true);
    onDownloadStart?.();
    setTimeout(() => {
      setDownloading(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 mono"
      style={{ animation: 'backdropIn 0.2s ease both' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full sm:max-w-lg bg-[#121212] border border-[#2a2a2a] shadow-2xl overflow-visible z-10 mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-4 border-b border-[#1a1a1a]">
          {mod.icon_url ? (
            <img
              src={mod.icon_url}
              alt={mod.title}
              className="w-12 h-12 object-cover border border-[#2a2a2a]"
            />
          ) : (
            <div className="w-12 h-12 border border-[#2a2a2a] flex items-center justify-center bg-[#1a1a1a]">
              <Package className="w-6 h-6 text-[#4fc3f7]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-[#4fc3f7] uppercase tracking-widest mb-0.5">
              DOWNLOAD // MOD
            </p>
            <h3 className="text-lg font-bold text-[#e0e0e0] truncate">{mod.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="w-8 h-8 border border-[#2a2a2a] hover:border-[#ef5350] hover:text-[#ef5350] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-column selectors */}
        {hasVersions && (
          <div className="px-6 pt-5 pb-2 grid grid-cols-2 gap-3">
            {/* MC Version */}
            <div>
              <p className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2">
                Версия MC
              </p>
              <div className="relative">
                <button
                  type="button"
                  id="mc-version-btn"
                  onClick={e => { e.stopPropagation(); setMcOpen(v => !v); setPlatformOpen(false); }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-xs font-bold text-[#4fc3f7] hover:border-[#4fc3f7] transition-colors cursor-pointer"
                >
                  <span className="truncate">{selectedMc || '–'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#888888] transition-transform ${mcOpen ? 'rotate-180' : ''}`} />
                </button>
                {mcOpen && (
                  <div className="absolute z-30 mt-1 w-full bg-[#141414] border border-[#2a2a2a] shadow-xl">
                    <div className="max-h-48 overflow-y-auto">
                      {allMcVersions.map(v => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => { setSelectedMc(v); setMcOpen(false); }}
                          className={`w-full px-3 py-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                            v === selectedMc
                              ? 'bg-[#1a1a1a] text-[#4fc3f7] font-bold'
                              : 'text-[#888888] hover:bg-[#1a1a1a] hover:text-[#e0e0e0]'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Platform */}
            <div>
              <p className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2">
                Платформа
              </p>
              <div className="relative">
                <button
                  type="button"
                  id="platform-btn"
                  onClick={e => { e.stopPropagation(); setPlatformOpen(v => !v); setMcOpen(false); }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-xs font-bold text-[#4fc3f7] hover:border-[#4fc3f7] transition-colors cursor-pointer"
                >
                  <span className="truncate">{selectedPlatform || '–'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#888888] transition-transform ${platformOpen ? 'rotate-180' : ''}`} />
                </button>
                {platformOpen && (
                  <div className="absolute z-30 mt-1 w-full bg-[#141414] border border-[#2a2a2a] shadow-xl">
                    <div className="max-h-48 overflow-y-auto">
                      {availablePlatforms.map(p => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => { setSelectedPlatform(p); setPlatformOpen(false); }}
                          className={`w-full px-3 py-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                            p === selectedPlatform
                              ? 'bg-[#1a1a1a] text-[#4fc3f7] font-bold'
                              : 'text-[#888888] hover:bg-[#1a1a1a] hover:text-[#e0e0e0]'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Simple mode: badges */}
        {!hasVersions && (mod.mc_versions.length > 0 || mod.platforms.length > 0) && (
          <div className="px-6 pt-5 pb-2 grid grid-cols-2 gap-4">
            {mod.mc_versions.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2">Minecraft</p>
                <div className="flex flex-wrap gap-1.5">
                  {mod.mc_versions.map(v => (
                    <span key={v} className="px-2 py-0.5 bg-[#1a1a1a] text-[#4fc3f7] border border-[#2a2a2a] text-xs font-bold">{v}</span>
                  ))}
                </div>
              </div>
            )}
            {mod.platforms.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2">Платформа</p>
                <div className="flex flex-wrap gap-1.5">
                  {mod.platforms.map(p => <PlatformBadge key={p} name={p} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* File info row */}
        <div className="px-6 pt-3 pb-6">
          {(matched || (!hasVersions && mod.file_url)) && (
            <div className="flex items-center justify-between px-4 py-3 mb-4 bg-[#141414] border border-[#2a2a2a]">
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <p className="text-[10px] text-[#888888] font-bold uppercase tracking-wider mb-0.5">Файл</p>
                  <p className="text-xs font-bold text-[#e0e0e0] truncate" title={filename}>{filename}</p>
                </div>
                {fileSize && (
                  <div className="border-l border-[#2a2a2a] pl-4 shrink-0">
                    <p className="text-[10px] text-[#888888] font-bold uppercase tracking-wider mb-0.5">Размер</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#4fc3f7]">
                      <HardDrive className="w-3.5 h-3.5" />
                      {fileSize}
                    </div>
                  </div>
                )}
              </div>
              {matched?.release_type && (
                <span className={`text-[11px] px-2 py-0.5 font-bold shrink-0 ml-3 border ${RELEASE_TYPE_COLORS[matched.release_type] ?? 'border-[#2a2a2a] text-[#888888]'}`}>
                  {matched.release_type}
                </span>
              )}
            </div>
          )}

          {/* Download button */}
          {downloadUrl ? (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 w-full py-3 font-bold text-sm bg-[#4fc3f7] hover:bg-[#29b6f6] text-[#000000] border border-[#4fc3f7] transition-colors cursor-pointer"
            >
              {done ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Готово!
                </>
              ) : (
                <>
                  <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                  {downloading ? 'Загрузка...' : 'Скачать файл'}
                </>
              )}
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full py-3 font-bold text-xs text-[#888888] bg-[#141414] border border-[#2a2a2a]">
              <Download className="w-4 h-4" />
              {hasVersions ? 'Выберите версию и платформу' : 'Файл недоступен'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
