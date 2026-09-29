const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const newHomeComponent = `
import { useEffect } from 'react';
import { supabase } from './core/supabase';

function Home() {
  const [activeTab, setActiveTab] = useState<'games' | 'mods'>('games');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  const activeProjects = projects.filter(p => p.type === (activeTab === 'games' ? 'game' : 'mod'));

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6 md:p-12 space-y-10 bg-[#080c14] text-white relative animate-fade-in">
      {/* Декоративный фон главной страницы */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-150 h-150 bg-sky-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-10 w-125 h-125 bg-lime-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Шапка */}
      <div className="bg-white/2 p-8 md:p-10 rounded-3xl backdrop-blur-2xl text-center mt-6 max-w-2xl w-full relative z-10 shadow-2xl transition-all duration-500">
        <div className="inline-flex p-3 rounded-2xl bg-linear-to-tr from-sky-500/20 to-lime-500/20 mb-4">
          <Sparkles className="w-12 h-12 text-sky-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3 bg-linear-to-r from-sky-400 via-teal-300 to-lime-400 bg-clip-text text-transparent">
          Eternal Lunar
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
          Добро пожаловать в мой мир творчества! Здесь собраны мои авторские проекты.
        </p>
      </div>

      {/* Переключатель вкладок */}
      <div className="flex items-center gap-2 md:gap-4 bg-white/5 p-2 rounded-2xl backdrop-blur-md relative z-10 w-full max-w-fit mx-auto shadow-xl">
        <button
          onClick={() => setActiveTab('games')}
          className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 cursor-pointer \${
            activeTab === 'games'
              ? 'bg-sky-500/20 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }\`}
        >
          <Gamepad2 className="w-5 h-5" />
          Игры
        </button>
        <button
          onClick={() => setActiveTab('mods')}
          className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 cursor-pointer \${
            activeTab === 'mods'
              ? 'bg-orange-500/20 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }\`}
        >
          <Terminal className="w-5 h-5" />
          Моды Minecraft
        </button>
      </div>

      {/* Контент */}
      <div className="w-full max-w-7xl relative z-10 space-y-6 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className={\`inline-flex items-center justify-center p-2 rounded-xl mb-2 \${activeTab === 'games' ? 'bg-sky-500/10' : 'bg-orange-500/10'}\`}>
            {activeTab === 'games' ? <Gamepad2 className="w-8 h-8 text-sky-400" /> : <Terminal className="w-8 h-8 text-orange-400" />}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-wide">
            {activeTab === 'games' ? 'Игры' : 'Моды'}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {activeTab === 'games' 
              ? 'Вселенная авторских игр. Каждая игра со своей уникальной атмосферой и стилем.' 
              : 'Уникальные модификации для Minecraft, созданные для расширения геймплея.'}
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-10">Загрузка проектов...</div>
        ) : activeProjects.length === 0 ? (
          <div className="text-center text-slate-500 py-10">Проекты не найдены. Вы можете добавить их в панели API Keys (Projects).</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {activeProjects.map(project => {
              const isGame = project.type === 'game';
              const accentColor = isGame ? 'sky' : 'orange';
              const gradientFrom = isGame ? 'from-[#0c1829]' : 'from-[#29180c]';
              const gradientTo = isGame ? 'to-[#070e1a]' : 'to-[#1a0f07]';
              const isExternal = project.link?.startsWith('http');
              
              const CardContent = (
                <>
                  <div className={\`absolute -top-20 -right-20 w-60 h-60 bg-\${accentColor}-500/15 rounded-full blur-3xl group-hover:bg-\${accentColor}-400/30 transition-all duration-700 pointer-events-none\`}></div>

                  <div className={\`aspect-video w-full sm:w-5/12 shrink-0 rounded-2xl overflow-hidden relative bg-linear-to-br \${isGame ? 'from-[#0e223d] to-[#081324]' : 'from-[#3d230e] to-[#241308]'} flex flex-col items-center justify-center text-center\`}>
                    <div className="absolute top-3 right-3 z-20">
                      <span className={\`flex items-center gap-1.5 px-3 py-1 bg-\${accentColor}-950/80 text-\${accentColor}-300 rounded-full text-xs font-bold backdrop-blur-md\`}>
                        {isGame ? <Terminal className={\`w-3.5 h-3.5 text-\${accentColor}-400\`} /> : <Terminal className="w-3.5 h-3.5 text-orange-400" />}
                        Доступно
                      </span>
                    </div>
                    
                    {project.cover_url ? (
                      <img 
                        src={project.cover_url} 
                        alt={project.title} 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 relative z-10"
                      />
                    ) : (
                      <div className={\`flex flex-col items-center justify-center absolute inset-0 z-0 p-6 space-y-3 bg-linear-to-b \${isGame ? 'from-sky-950/40 to-[#070e1a]' : 'from-orange-950/40 to-[#1a0f07]'}\`}>
                        <div className={\`w-16 h-16 rounded-2xl bg-\${accentColor}-500/15 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.25)] group-hover:scale-110 transition-transform duration-500\`}>
                          {isGame ? <Gamepad2 className={\`w-9 h-9 text-\${accentColor}-400\`} /> : <Terminal className="w-9 h-9 text-orange-400" />}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-6 px-1 pb-1 flex-1 flex flex-col relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className={\`text-2xl font-black text-white tracking-wide group-hover:text-\${accentColor}-400 transition-colors\`}>
                        {project.title}
                      </h2>
                      <Sparkles className={\`w-5 h-5 text-\${accentColor}-400/50 group-hover:text-\${accentColor}-400 transition-colors\`} />
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className={\`inline-block px-4 py-1.5 bg-\${accentColor}-500/15 text-\${accentColor}-300 rounded-xl text-xs font-bold uppercase tracking-wider group-hover:bg-\${accentColor}-500/25 transition-colors\`}>
                        {isGame ? 'Играть' : 'Версия 1.20+'}
                      </span>
                      <span className={\`text-\${accentColor}-400 text-sm font-bold flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform\`}>
                        {isGame ? 'Запустить' : 'Скачать .jar'}
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
                    className={\`group relative bg-linear-to-b \${gradientFrom} \${gradientTo} rounded-3xl p-6 hover:shadow-[0_20px_50px_rgba(56,189,248,0.25)] transition-all duration-500 flex flex-col sm:flex-row gap-6 cursor-pointer transform hover:-translate-y-2 overflow-hidden\`}
                  >
                    {CardContent}
                  </a>
                );
              } else {
                return (
                  <Link 
                    key={project.id}
                    to={project.link}
                    className={\`group relative bg-linear-to-b \${gradientFrom} \${gradientTo} rounded-3xl p-6 hover:shadow-[0_20px_50px_rgba(56,189,248,0.25)] transition-all duration-500 flex flex-col sm:flex-row gap-6 cursor-pointer transform hover:-translate-y-2 overflow-hidden\`}
                  >
                    {CardContent}
                  </Link>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
`;

// We must extract the App function as well to preserve it.
const appFuncMatch = content.match(/function App\(\) \{[\s\S]*?\}\n\nexport default App;/);

// Also preserve imports that are top level
// I will just read the original file, rip out \`function Home() { ... }\` and replace it.

const startIdx = content.indexOf('function Home() {');
const endIdx = content.indexOf('function App() {');

if (startIdx !== -1 && endIdx !== -1) {
    let result = content.substring(0, startIdx) + newHomeComponent + '\n\n' + content.substring(endIdx);
    
    // Add \`useEffect\` to imports if not there
    if (!result.includes('import { useEffect')) {
        result = result.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");
    }
    // Add supabase import
    if (!result.includes("import { supabase }")) {
        result = result.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { supabase } from './core/supabase';");
    }
    
    fs.writeFileSync(path, result, 'utf8');
    console.log('App.tsx patched.');
} else {
    console.log('Could not find boundaries.');
}
