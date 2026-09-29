import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectsTab } from './tabs/ProjectsTab';
import { SneakPeeksTab } from './tabs/SneakPeeksTab';
import { ModsTab } from './tabs/ModsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { NotificationCenter } from '../../components/NotificationCenter';
import { useAuthStore } from '../../core/store/useAuthStore';
import {
  FolderGit2, Package, Sparkles, Settings, LogOut, Shield
} from 'lucide-react';

const TABS = [
  { id: 'projects', label: 'Проекты', icon: FolderGit2 },
  { id: 'sneak_peeks', label: 'Сник-пики', icon: Sparkles },
  { id: 'mods', label: 'Моды', icon: Package },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('projects');
  const { role, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/');
    }
  }, [role, navigate]);

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="text-center p-8 bg-[#121215] border border-[#27272a] rounded-2xl max-w-sm w-full">
          <Shield className="w-12 h-12 text-[#ef5350] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#f4f4f5] mb-2">Доступ ограничен</h2>
          <p className="text-[#a1a1aa] text-sm">Эта страница доступна только администратору.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#1f1f23] bg-[#0c0c0e] p-5 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#1f1f23]">
          <div className="w-8 h-8 rounded-lg bg-[#38bdf8] flex items-center justify-center text-[#000]">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#f4f4f5] tracking-tight">Eternal Studio</span>
        </div>

        <nav className="flex-1 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#38bdf8] text-[#000] shadow-sm'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-[#1f1f23]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-[#a1a1aa] hover:text-[#ef5350] hover:bg-[#18181b] rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {activeTab === 'projects' && <ProjectsTab />}
          {activeTab === 'sneak_peeks' && <SneakPeeksTab />}
          {activeTab === 'mods' && <ModsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>

      <NotificationCenter />
    </div>
  );
}

export default AdminPanel;
