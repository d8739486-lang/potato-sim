import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../../../core/store/useSettingsStore';
import { ChevronLeft, ChevronRight, Terminal, Lock, Cpu, ArrowLeft } from 'lucide-react';
import { fetchProjects, subscribeToProjects, type ProjectItem } from '../../projects/projectsService';
import chapter1Cover from '../../../assets/pc_master_game/chapter1_cover.webp';
import chapter2Cover from '../../../assets/pc_master_game/chapter2_cover.webp';
import chapter3Cover from '../../../assets/pc_master_game/chapter3_cover.webp';

interface ChapterItem {
  id: number | string;
  title: string;
  subtitle: string;
  description: string;
  link: string;
  cover: string;
  badgeColor?: string;
  available: boolean;
  buttonText?: string;
}

const DEFAULT_CHAPTERS: ChapterItem[] = [
  {
    id: 1,
    title: 'Глава 1',
    subtitle: 'Начало пути',
    description: 'Игрок успешно справился с вирусом и устроился работать, но что-то пошло не так...',
    link: 'https://pc-master-chapter1.vercel.app',
    cover: chapter1Cover,
    badgeColor: 'bg-sky-500/90 text-black font-black',
    available: true,
    buttonText: 'Играть в Главу 1',
  },
  {
    id: 2,
    title: 'Глава 2',
    subtitle: 'Digital Dreams',
    description: 'Компания Digital Dreams захватила компьютер главного героя, но ему помог его друг... но это не конец.',
    link: 'https://pc-master-chapter2.vercel.app',
    cover: chapter2Cover,
    badgeColor: 'bg-cyan-400/90 text-black font-black',
    available: true,
    buttonText: 'Играть в Главу 2',
  },
  {
    id: 3,
    title: 'Глава 3',
    subtitle: 'Сомнения',
    description: 'Подозрение, что друг с этим как-то замешан...',
    link: '',
    cover: chapter3Cover,
    badgeColor: 'bg-white/20 text-white',
    available: false,
    buttonText: 'В разработке',
  },
];

export function PcMasterGame() {
  const { gameSettings, setGameTheme } = useSettingsStore();
  const settings = gameSettings['pc-master'] || { theme: 'dark', textures: {} };
  const [activeChapter, setActiveChapter] = useState(0);
  const [chapters, setChapters] = useState<ChapterItem[]>(DEFAULT_CHAPTERS);

  useEffect(() => {
    if (!gameSettings['pc-master']) {
      setGameTheme('pc-master', 'dark');
    }
  }, [gameSettings, setGameTheme]);

  const loadFromProjects = (projectsList: ProjectItem[]) => {
    const pcMaster = projectsList.find(p => 
      p.title?.toLowerCase().includes('pc master') || 
      p.link === '/games/pc-master'
    );

    if (pcMaster && pcMaster.chapters) {
      try {
        const parsed = typeof pcMaster.chapters === 'string' ? JSON.parse(pcMaster.chapters) : pcMaster.chapters;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const dynamicChapters: ChapterItem[] = parsed.map((ch: any, idx: number) => ({
            id: idx + 1,
            title: ch.title || `Глава ${idx + 1}`,
            subtitle: ch.subtitle || '',
            description: ch.description || '',
            link: ch.link || '',
            cover: ch.cover_url || (idx === 0 ? chapter1Cover : idx === 1 ? chapter2Cover : chapter3Cover),
            badgeColor: idx === 0 ? 'bg-[#4fc3f7] text-black font-black' : idx === 1 ? 'bg-cyan-400/90 text-black font-black' : 'bg-[#29b6f6] text-black font-black',
            available: ch.available !== false,
            buttonText: ch.available !== false ? `Играть в ${ch.title || `Главу ${idx + 1}`}` : 'В разработке',
          }));
          setChapters(dynamicChapters);
          return;
        }
      } catch (e) {
        console.error('Error parsing pc master chapters', e);
      }
    }
    setChapters(DEFAULT_CHAPTERS);
  };

  useEffect(() => {
    fetchProjects().then(loadFromProjects);
    const unsubscribe = subscribeToProjects(loadFromProjects);
    return () => unsubscribe();
  }, []);

  const handleNext = () => {
    if (activeChapter < chapters.length - 1) {
      setActiveChapter((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeChapter > 0) {
      setActiveChapter((prev) => prev - 1);
    }
  };


  return (
    <div className={`min-h-[calc(100vh-4rem)] w-full p-4 md:p-8 flex flex-col items-center justify-center font-sans relative overflow-hidden transition-colors duration-1000 ease-in-out animate-fade-in ${settings.theme === 'light' ? 'bg-slate-900 text-sky-400' : 'bg-[#040a12] text-sky-400'}`}>
      {/* Light matrix grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] bg-size-[24px_24px] opacity-15 pointer-events-none"></div>
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-3xl w-full bg-[#081320]/90 p-5 md:p-8 rounded-3xl backdrop-blur-xl border border-sky-500/30 shadow-[0_0_60px_rgba(56,189,248,0.2)] space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-sky-900/50 border-2 border-sky-500/50 text-sky-300 text-lg font-black tracking-wide hover:bg-sky-400 hover:text-black transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
            На главную
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <Terminal className="w-4 h-4 text-sky-400" />
            Хакерская атмосфера
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2 pt-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
            Pc Master
          </h1>
          <p className="text-sky-400/70 text-sm">
            Глава {activeChapter + 1} из {chapters.length}
          </p>
        </div>
        
        {/* Chapter Slider */}
        <div className="relative group/slider px-2 md:px-6">
          <button 
            onClick={handlePrev}
            disabled={activeChapter === 0}
            className={`absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#06101c] border border-sky-500/40 text-sky-400 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300 ${activeChapter === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-sky-400 hover:text-black hover:scale-110 active:scale-95'}`}
            aria-label="Previous Chapter"
          >
            <ChevronLeft className="w-6 h-6 -ml-0.5" />
          </button>

          <button 
            onClick={handleNext}
            disabled={activeChapter === chapters.length - 1}
            className={`absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#06101c] border border-sky-500/40 text-sky-400 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300 ${activeChapter === chapters.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-sky-400 hover:text-black hover:scale-110 active:scale-95'}`}
            aria-label="Next Chapter"
          >
            <ChevronRight className="w-6 h-6 ml-0.5" />
          </button>

          {/* Slide Window */}
          <div className="overflow-hidden rounded-3xl border border-sky-500/30 shadow-[0_0_30px_rgba(56,189,248,0.15)]">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeChapter * 100}%)` }}
            >
              {chapters.map((ch) => (
                <div key={ch.id} className="w-full shrink-0 flex flex-col bg-[#050c18]">
                  {/* Cover */}
                  <div className="w-full aspect-video bg-[#070e1a] rounded-xl flex items-center justify-center border border-white/5 overflow-hidden group relative">
                    <img 
                      src={ch.cover} 
                      alt={`${ch.title} Cover`} 
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${!ch.available ? 'grayscale opacity-40' : 'opacity-90'}`}
                    />
                    <div className={`absolute top-4 left-4 ${ch.badgeColor || 'bg-sky-500 text-black'} backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg`}>
                      {ch.title}
                    </div>
                  </div>
                  
                  {/* Description & Action */}
                  <div className="p-6 md:p-8 flex flex-col justify-between bg-linear-to-b from-[#071324] to-[#040a14]">
                    <div className="mb-6 space-y-2">
                      <div className="flex items-center gap-2 text-sky-400 text-xl font-bold">
                        <Cpu className="w-5 h-5" />
                        {ch.subtitle}
                      </div>
                      <p className="text-sky-100/80 text-base leading-relaxed pt-1">
                        {ch.description}
                      </p>
                    </div>

                    {ch.available && ch.link ? (
                      <a 
                        href={ch.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-sky-400 text-slate-950 font-bold rounded-2xl text-lg tracking-wide hover:bg-sky-300 transition-all shadow-[0_0_30px_rgba(56,189,248,0.5)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {ch.buttonText || `Играть в ${ch.title}`}
                      </a>
                    ) : (
                      <button 
                        disabled
                        className="w-full py-4 bg-sky-950/40 text-sky-400/40 rounded-2xl font-bold text-lg cursor-not-allowed border border-sky-500/20 flex items-center justify-center gap-3"
                      >
                        <Lock className="w-5 h-5" />
                        {ch.buttonText || 'В разработке'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {chapters.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChapter(idx)}
                className={`transition-all duration-300 rounded-full ${activeChapter === idx ? 'w-8 h-3 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]' : 'w-3 h-3 bg-sky-950 border border-sky-500/30 hover:border-sky-500'}`}
                aria-label={`Перейти к главе ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
