import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Gamepad2, Package, ArrowRight, Sparkles, LogIn, LogOut, User } from 'lucide-react';
import { LoginModal } from './components/LoginModal';
import { NotificationCenter } from './components/NotificationCenter';
import { useAuthStore } from './core/store/useAuthStore';
import { fetchProjects, subscribeToProjects, type ProjectItem } from './core/services/dataService';
import { AVATAR_DATA_URL } from './assets/avatarData';
import { startPolling } from './core/services/onlineSync';
import { initDataStores } from './core/data/localDb';

// Lazy loaded routes
const PcMasterGame = lazy(() =>
  import('./features/games/pc-master/PcMasterGame').then((m) => ({ default: m.PcMasterGame }))
);
const ModsPage = lazy(() =>
  import('./features/mods/ModsPage').then((m) => ({ default: m.ModsPage }))
);
const ModDetailPage = lazy(() =>
  import('./features/mods/ModDetailPage').then((m) => ({ default: m.ModDetailPage }))
);
const ProjectsPage = lazy(() =>
  import('./features/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);
const AdminPanel = lazy(() => import('./features/admin/AdminPanel'));

function Home() {
  const [activeTab, setActiveTab] = useState<'games' | 'mods'>('games');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDataStores();
    fetchProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });

    const unsubscribe = subscribeToProjects((updated) => {
      setProjects(updated);
    });

    startPolling();

    return () => {
      unsubscribe();
    };
  }, []);

  const activeProjects = projects.filter(
    (p) => (activeTab === 'games' ? p.type === 'game' : p.type === 'mod')
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6 md:p-12 space-y-10 bg-[#09090b] relative transition-colors duration-300">
      {/* Hero glow */}
      <div className="hero-glow" />

      {/* Hero Header */}
      <div className="main-card p-8 md:p-12 text-center mt-6 max-w-2xl w-full relative z-10 animate-fade-in-up">
        <div className="inline-flex p-1.5 mb-6 rounded-2xl bg-[#18181b] border border-[#27272a] shadow-md">
          <img
            src={AVATAR_DATA_URL}
            alt="Eternal_Lunar Avatar"
            loading="eager"
            decoding="sync"
            className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover"
          />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 text-[#f4f4f5]">
          Eternal <span className="text-[#38bdf8]">Lunar</span>
        </h1>
        <p className="text-[#a1a1aa] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Авторские игры и модификации. Каждый проект создан с вниманием к деталям и качеству.
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-10 mt-8 pt-6 border-t border-[#27272a]">
          <div className="text-center">
            <div className="text-[#38bdf8] font-bold text-2xl">{projects.length}</div>
            <div className="text-[#71717a] text-xs uppercase font-medium tracking-wider mt-1">Проектов</div>
          </div>
          <div className="w-px h-8 bg-[#27272a]" />
          <div className="text-center">
            <div className="text-[#38bdf8] font-bold text-2xl">3+</div>
            <div className="text-[#71717a] text-xs uppercase font-medium tracking-wider mt-1">Платформы</div>
          </div>
          <div className="w-px h-8 bg-[#27272a]" />
          <div className="text-center">
            <div className="text-[#4ade80] font-bold text-2xl">100%</div>
            <div className="text-[#71717a] text-xs uppercase font-medium tracking-wider mt-1">Авторские</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-container flex items-center justify-center gap-1 relative z-10 w-full max-w-fit mx-auto animate-fade-in">
        <button
          onClick={() => setActiveTab('games')}
          className={`flex items-center gap-2 px-6 py-2.5 font-semibold transition-all duration-150 cursor-pointer theme-tab-btn ${
            activeTab === 'games'
              ? 'theme-tab-btn-active'
              : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          Игры
        </button>
        <Link
          to="/projects"
          className="flex items-center gap-2 px-6 py-2.5 font-semibold transition-all duration-150 cursor-pointer theme-tab-btn text-[#a1a1aa] hover:text-[#f4f4f5]"
        >
          <Sparkles className="w-4 h-4" />
          Сник-пики
        </Link>
        <Link
          to="/mods"
          className="flex items-center gap-2 px-6 py-2.5 font-semibold transition-all duration-150 cursor-pointer theme-tab-btn text-[#a1a1aa] hover:text-[#f4f4f5]"
        >
          <Package className="w-4 h-4" />
          Моды
        </Link>
      </div>

      {/* Content Section */}
      <div className="w-full max-w-7xl relative z-10 space-y-6 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#f4f4f5] tracking-tight">
            {activeTab === 'games' ? 'Игры' : 'Модификации'}
          </h2>
          <p className="text-[#71717a] max-w-xl text-sm md:text-base">
            {activeTab === 'games'
              ? 'Вселенная авторских игр с уникальной атмосферой и сюжетом.'
              : 'Модификации для Minecraft с поддержкой Fabric, Forge и NeoForge.'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="project-card flex flex-col sm:flex-row gap-6 p-6">
                <div className="skeleton w-full sm:w-5/12 aspect-video" />
                <div className="flex-1 space-y-3 pt-2">
                  <div className="skeleton h-6 w-3/4" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : activeProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#71717a] text-base">В этом разделе пока нет проектов.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {activeProjects.map((project, idx) => {
              const isGame = project.type === 'game';
              const isExternal = project.link?.startsWith('http');
              const chaptersText = project.chapters_text || (project.display_type === 'chapters' ? 'Несколько глав' : 'Играть');
              const actionText = project.action_text || 'Запустить';

              const CardContent = (
                <>
                  <div className="aspect-video w-full sm:w-5/12 shrink-0 rounded-lg overflow-hidden bg-[#18181b] border border-[#27272a] relative">
                    {project.cover_url ? (
                      <img
                        src={project.cover_url}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center absolute inset-0 p-6">
                        <div className="w-12 h-12 rounded-xl bg-[#27272a] flex items-center justify-center">
                          {isGame ? <Gamepad2 className="w-6 h-6 text-[#38bdf8]" /> : <Package className="w-6 h-6 text-[#38bdf8]" />}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#f4f4f5] tracking-tight mb-2 group-hover:text-[#38bdf8] transition-colors">
                        {project.title}
                      </h3>

                      <p className="text-[#a1a1aa] text-sm leading-relaxed whitespace-pre-line line-clamp-3 mb-4">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#27272a]">
                      <span className="inline-block px-2.5 py-1 bg-[#18181b] border border-[#27272a] rounded-md text-[#38bdf8] text-xs font-semibold">
                        {chaptersText}
                      </span>
                      <span className="text-[#38bdf8] text-sm font-semibold flex items-center gap-1.5 group-hover:gap-2 transition-all">
                        {actionText}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </>
              );

              if (isExternal || !project.link) {
                return (
                  <a
                    key={project.id}
                    href={project.link || '#'}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="project-card group flex flex-col sm:flex-row gap-6 cursor-pointer p-6"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {CardContent}
                  </a>
                );
              } else {
                return (
                  <Link
                    key={project.id}
                    to={project.link}
                    className="project-card group flex flex-col sm:flex-row gap-6 cursor-pointer p-6"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {CardContent}
                  </Link>
                );
              }
            })}
          </div>
        )}
      </div>

      <NotificationCenter />
    </div>
  );
}

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { username, role, logout } = useAuthStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col">
        <nav className="fixed-nav fixed top-0 w-full px-6 py-3.5 flex items-center justify-between z-50">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 font-bold text-base hover:opacity-90 transition-opacity group">
              <img
                src={AVATAR_DATA_URL}
                alt="Eternal_Lunar"
                loading="eager"
                decoding="sync"
                className="w-8 h-8 rounded-lg object-cover border border-[#27272a]"
              />
              <span className="text-[#f4f4f5] font-extrabold tracking-tight group-hover:text-[#38bdf8] transition-colors">
                Eternal Lunar
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 bg-[#121215] border border-[#27272a] rounded-lg p-1">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] transition-all"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Игры
              </Link>
              <Link
                to="/projects"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Сник-пики
              </Link>
              <Link
                to="/mods"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] transition-all"
              >
                <Package className="w-3.5 h-3.5" />
                Моды
              </Link>
            </div>
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-3">
            {role === 'admin' && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] px-3 py-1.5 rounded-md border border-[#38bdf8]/30 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 transition-colors"
              >
                Панель управления
              </Link>
            )}
            {username ? (
              <div className="flex items-center gap-2 bg-[#121215] border border-[#27272a] rounded-lg px-3 py-1.5">
                <User className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="text-xs font-medium text-[#f4f4f5]">{username}</span>
                <button
                  onClick={logout}
                  title="Выйти"
                  className="text-[#71717a] hover:text-[#f87171] transition-colors ml-1 cursor-pointer"
                  aria-label="Выйти из аккаунта"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="btn btn-primary text-xs py-1.5 px-4 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Войти
              </button>
            )}
          </div>
        </nav>

        <main className="pt-16 flex-1 flex flex-col">
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-[#38bdf8] text-sm">
                <span className="inline-block w-4 h-4 border-2 border-[#38bdf8] border-t-transparent animate-spin rounded-full" />
                Загрузка...
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games/pc-master" element={<PcMasterGame />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/mods" element={<ModsPage />} />
              <Route path="/mods/:slug" element={<ModDetailPage />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="w-full px-6 py-6 mt-auto border-t border-[#1f1f23] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#71717a] text-xs">
            © {new Date().getFullYear()} Eternal Lunar. Все авторские права защищены.
          </p>
          <div className="flex items-center gap-4 text-[#71717a] text-xs">
            <span>Игры</span>
            <span>·</span>
            <span>Модификации</span>
            <span>·</span>
            <span>Сник-пики</span>
          </div>
        </footer>

        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    </BrowserRouter>
  );
}

export default App;
