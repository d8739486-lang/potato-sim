import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls, Reorder } from 'framer-motion';
import { Mail, Search, X, Minus, Square, MessageSquare, Monitor, Folder, Globe, Trash2, AlertTriangle, HardDrive, FileText, Wifi, Image, Maximize2, Settings, User, Shield, RefreshCw, ChevronRight, Cpu, Grid, Mic, Camera, Flame, ShieldAlert, Share2, Heart, Plus, Power, Send, Copy, ChevronDown, ChevronUp, MemoryStick, MonitorSmartphone, ClipboardPaste } from 'lucide-react';
import { playSound, AUDIO_PATHS, playButtonSound, playBootSound, playShutSound, playError2Sound, playError3Sound, playEndMusic, playPopSound, stopAllAudio, playBsodSound } from '@/core/audio';
import { cn } from '@/core/utils';
import { useGameStore } from '@/core/store';
import { t } from '@/core/i18n';

interface CleanDesktopCh1Props {
  onContinue: () => void;
}
export interface BrowserTabDef {
  id: string;
  url: string;
  urlInput: string;
  isLoading: boolean;
  progress: number;
  showContent: boolean;
  searchQuery: string;
}

export interface MailDef {
  id: number;
  from: string;
  subject: string;
  displayFrom?: string;
  displaySubject?: string;
  date: string;
  body: string;
  isSpecial?: boolean;
  type?: 'contract' | 'st_invite';
}

export interface FsItem {
  name: string;
  type: 'file' | 'folder' | 'system';
  size?: string;
  content?: string;
  children?: FsItem[];
  totalGb?: number;
  usedGb?: number;
  id?: string;
}

// Embeddable YouTube video IDs for the fake YouTube page
const YOUTUBE_VIDEOS = [
  { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', channel: 'Rick Astley', views: '1.5B' },
  { id: 'jNQXAC9IVRw', title: 'Me at the zoo', channel: 'jawed', views: '290M' },
  { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE', channel: 'officialpsy', views: '4.9B' },
  { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', channel: 'Luis Fonsi', views: '8.2B' },
  { id: 'RgKAFK5djSk', title: 'Wiz Khalifa - See You Again ft. Charlie Puth', channel: 'Wiz Khalifa', views: '6B' },
  { id: '60ItHLz5WEA', title: 'Alan Walker - Faded', channel: 'Alan Walker', views: '3.3B' },
];


export const CleanDesktopCh1 = ({ onContinue }: CleanDesktopCh1Props) => {
  const language = useGameStore(s => s.language);

  // --- OS STATE ---
  const [showNotification, setShowNotification] = useState(false);
  const [showMail, setShowMail] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const [selectedMailId, setSelectedMailId] = useState<number | null>(null);
  const [mailPos, setMailPos] = useState({ x: 0, y: 0 });
  const [mailMinimized, setMailMinimized] = useState(false);
  const [mailMaximized, setMailMaximized] = useState(true);
  const [powerStatus, setPowerStatus] = useState<'on' | 'off' | 'rebooting'>('on');
  const [rebootStage, setRebootStage] = useState<'black' | 'video' | 'post-video' | 'none'>('none');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [folderPositions, setFolderPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [folderMinimized, setFolderMinimized] = useState<Record<string, boolean>>({});
  const [folderMaximized, setFolderMaximized] = useState<Record<string, boolean>>({});
  const [showTrashError, setShowTrashError] = useState(false);
  const [showVideoError, setShowVideoError] = useState(false);
  const [videoErrorName, setVideoErrorName] = useState('');
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsMinimized, setSettingsMinimized] = useState(false);
  const [settingsMaximized, setSettingsMaximized] = useState(true);
  const [settingsPos, setSettingsPos] = useState({ x: 0, y: 0 });
  const [settingsTab, setSettingsTab] = useState<'system' | 'update' | 'security'>('system');
  const [photoPos, setPhotoPos] = useState({ x: 0, y: 0 });
  const [photoMinimized, setPhotoMinimized] = useState(false);
  const [photoMaximized, setPhotoMaximized] = useState(true);
  const [openPhoto, setOpenPhoto] = useState<{ name: string; url: string } | null>(null);
  const [openFile, setOpenFile] = useState<{ name: string; content: string } | null>(null);
  const [filePos, setFilePos] = useState({ x: 0, y: 0 });
  const [fileMinimized, setFileMinimized] = useState(false);
  const [fileMaximized, setFileMaximized] = useState(true);
  const [folderPaths, setFolderPaths] = useState<Record<string, string>>({});
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [trashErrorName, setTrashErrorName] = useState(t('desktop.trash'));
  const [showShutdown, setShowShutdown] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState('EN');
  const [windowStack, setWindowStack] = useState<string[]>([]);
  const [specExpanded, setSpecExpanded] = useState(true);
  const [pcName, setPcName] = useState('PC-MASTER-PRO-2026');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Browser State
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserMinimized, setBrowserMinimized] = useState(false);
  const [browserMaximized, setBrowserMaximized] = useState(true);
  const [browserPos, setBrowserPos] = useState({ x: 0, y: 0 });
  const [browserTabs, setBrowserTabs] = useState<BrowserTabDef[]>([{
    id: 'tab-1', url: 'home', urlInput: '', isLoading: false, progress: 0, showContent: true, searchQuery: ''
  }]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [userName, setUserName] = useState('');
  const [storyStep, setStoryStep] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Ending State
  const [endingActive, setEndingActive] = useState(false);
  const [endingStage, setEndingStage] = useState<'none' | 'storage_full' | 'os_corrupted' | 'bios' | 'evolution' | 'black' | 'intro' | 'author' | 'konets' | 'thanks' | 'last' | 'fade' | 'red_bsod' | 'done'>('none');
  const [endingOpacity, setEndingOpacity] = useState(0);
  const [showStorageError, setShowStorageError] = useState(false);
  const [bsodProgress, setBsodProgress] = useState(0);

  // SentinelTech State
  const [stPortalState, setStPortalState] = useState<'login' | 'diagnosis' | 'dashboard' | 'nda' | 'tasks' | 'contract'>('login');
  const [stScanProgress, setStScanProgress] = useState(0);
  const [stScannedFiles, setStScannedFiles] = useState<string[]>([]);
  const [stAuthCode, setStAuthCode] = useState('');
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [hasSignedContract, setHasSignedContract] = useState(false);

  // --- LOCALIZED DATA ---
  const getMockSearchResults = useMemo(() => (query: string) => {
    const q = query.toLowerCase();
    const results: Array<{ title: string; url: string; desc: string }> = [];
    if (q.includes('youtube') || q.includes('video') || q.includes('видео') || q.includes('ролик')) {
      results.push({ title: 'YouTube', url: `youtube:${query}`, desc: t('browser.lucky_search') });
    }
    if (q.includes('digital') || q.includes('dreams') || q.includes('dd') || q.includes('диджитал') || q.includes('дримс')) {
      results.push({ title: 'Digital Dreams', url: 'https://digital-dreams.net', desc: t('dd.tactical_desc') });
    }
    let genericUrl = q.replace(/[^a-z0-9.\-]/gi, '').replace(/\s+/g, '');
    if (!genericUrl.includes('.')) genericUrl += '.com';
    results.push({ title: `${query}`, url: `https://${genericUrl}`, desc: query });
    return results;
  }, [language]);

  // Generate random worker code on mount to prevent speedruns
  const [workerCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [stAuthError, setStAuthError] = useState(false);

  const initialMails: MailDef[] = useMemo(() => [
    {
      id: 1,
      from: t('mail.msg1.from'),
      subject: t('mail.msg1.subj'),
      displayFrom: t('mail.new_msg_simple'),
      displaySubject: t('mail.new_msg_simple'),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      body: t('mail.msg1.body')
    },
    {
      id: 2,
      from: t('mail.msg2.from'),
      subject: t('mail.msg2.subj'),
      displayFrom: t('mail.new_msg_simple'),
      displaySubject: t('mail.new_msg_simple'),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      body: t('mail.msg2.body')
    }
  ], [language]);

  const fileSystem: Record<string, { icon: React.ReactNode; title: string; items: FsItem[] }> = useMemo(() => ({
    computer: {
      icon: <Monitor className="w-4 h-4 text-blue-400" />,
      title: t('desktop.pc'),
      items: [
        {
          name: t('fs.local_disk').replace('{drive}', 'C:'), type: 'folder', totalGb: 237, usedGb: 178, children: [
            { name: "Windows", type: 'system', size: "24.3 GB" },
            {
              name: "Program Files", type: 'folder', children: [
                {
                  name: "PC Master", type: 'folder', children: [
                    { name: "config.ini", type: 'file', size: "1 KB", content: "[Settings]\nresolution=1920x1080\nfullscreen=true\nvsync=on\nfps_limit=60\n\n[Audio]\nmaster_volume=80\nsfx_volume=100\nmusic_volume=50\n\n[Network]\nauto_connect=false\nproxy=none" },
                    { name: "version.txt", type: 'file', size: "64 B", content: "PC Master Remake v1.0.4\nBuild: 2026.03.21\nEngine: Custom WebGL\nStatus: STABLE" },
                  ]
                },
                { name: "Internet Explorer", type: 'system', size: "340 MB" },
              ]
            },
            {
              name: t('fs.docs'), type: 'folder', children: [
                {
                  name: "Desktop", type: 'folder', children: [
                    { name: t('fs.notes.name'), type: 'file', size: "512 B", content: t('fs.notes.content') },
                  ]
                },
                {
                  name: "Downloads", type: 'folder', children: [
                    { name: t('fs.log.name'), type: 'file', size: "47 KB", content: "[12:00:00] SYSTEM BOOT — OK\n[12:00:01] Loading drivers... OK\n[12:00:02] Network adapter: DISCONNECTED\n[12:00:03] Firewall: ACTIVE\n[12:00:04] Antivirus scan: STARTED" },
                  ]
                },
              ]
            },
          ]
        },
        {
          name: language === 'en' ? "Local Disk (D:)" : "Локальный диск (D:)", type: 'folder', totalGb: 465, usedGb: 89, children: [
            { name: "Games", type: 'folder', children: [] },
            { name: "Media", type: 'folder', children: [] },
          ]
        },
      ]
    },
    browser: {
      icon: <Globe className="w-4 h-4 text-blue-400" />,
      title: t('desktop.browser'),
      items: [
        { name: "Favorites", type: 'folder', children: [] },
      ]
    },
    documents: {
      icon: <Folder className="w-4 h-4 text-yellow-400" />,
      title: t('desktop.docs'),
      items: [
        { name: t('fs.readme.name'), type: 'file', size: "2 KB", content: t('fs.readme.content') },
        { name: t('fs.log.name'), type: 'file', size: "47 KB", content: "BOOT_SEQ_OK\nKERNEL_LOAD_OK\nSYSTEM_PROTECTION_ENABLED\nNETWORK_INIT_OK" },
      ]
    },
    trash: {
      icon: <Trash2 className="w-4 h-4 text-blue-400" />,
      title: t('desktop.trash'),
      items: []
    }
  }), [language]);

  const [mails, setMails] = useState<MailDef[]>([]);
  useEffect(() => {
    setMails(initialMails);
    // Play boot sound on initial mount
    const timer = setTimeout(() => {
      playBootSound();
    }, 500);

    // STORYLINE TRIGGER: Send the invitation mail after 3.5 seconds
    const storyTimer = setTimeout(() => {
      addMail({
        id: 3,
        from: t('mail.msg1.from'),
        subject: t('mail.msg3.subj'),
        displayFrom: t('mail.new_msg_simple'),
        displaySubject: t('mail.new_msg_simple'),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSpecial: true,
        body: t('mail.msg3.body').replace('9921', workerCode)
      });
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(storyTimer);
    };
  }, [initialMails, workerCode]);

  // STORYLINE TRIGGER: Handle Diagnosis Progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (stPortalState === 'diagnosis') {
      interval = setInterval(() => {
        setStScanProgress(prev => {
          const next = prev + 0.8 + (Math.random() * 0.8); // Ave 1.2 per 100ms -> ~8.3 seconds to 100%
          
          // Add some fake scanned files to the list
          if (Math.random() > 0.5) {
            setStScannedFiles(f => {
              const newFiles = [...f];
              if (newFiles.length > 10) newFiles.pop();
              newFiles.unshift(`C:\\Windows\\System32\\drivers\\${Math.random().toString(36).substring(7)}.sys`);
              return newFiles;
            });
          }

          // STORYLINE: Stop at 100% and trigger the critical error
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              playError2Sound();
              setShowStorageError(true);
            }, 1000); // 1 second dramatic pause at 100%
            return 100.0000; // Stop at exactly 100 for visual effect
          }
          return next;
        });
      }, 100);
    } else {
      setStScanProgress(0);
      setStScannedFiles([]);
    }
    return () => clearInterval(interval);
  }, [stPortalState]);

  // STORYLINE TRIGGER: RSOD Progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (endingStage === 'red_bsod') {
      let p = 0;
      interval = setInterval(() => {
        p += 1;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
        }
        setBsodProgress(p);
      }, 80); // 8 seconds total
    } else {
      setBsodProgress(0);
    }
    return () => clearInterval(interval);
  }, [endingStage]);

  const handleResetDesktop = () => {
    setOpenFolders({});
    setFolderMinimized({});
    setFolderMaximized({});
    setShowMail(false);
    setMailMinimized(false);
    setMailMaximized(true);
    setShowBrowser(false);
    setBrowserMinimized(false);
    setBrowserMaximized(true);
    setBrowserTabs([{
      id: 'tab-1', url: 'home', urlInput: '', isLoading: false, progress: 0, showContent: true, searchQuery: ''
    }]);
    setActiveTabId('tab-1');
    setShowSettings(false);
    setSettingsMinimized(false);
    setSettingsMaximized(true);
    setSettingsTab('system');
    setOpenPhoto(null);
    setPhotoMinimized(false);
    setPhotoMaximized(true);
    setOpenFile(null);
    setFileMinimized(false);
    setFileMaximized(true);
    setShowNotification(false);
    setShowStartMenu(false);
    setShowShutdown(false);
    setShowTrashError(false);
    setShowVideoError(false);
    setWindowStack([]);
    setActiveWindow(null);
  };

  const bringToFront = (id: string) => {
    setWindowStack(prev => [...prev.filter(x => x !== id), id]);
    setActiveWindow(id);
  };

  const removeFromStack = (id: string) => {
    setWindowStack(prev => prev.filter(x => x !== id));
  };

  // --- DERIVED STATE ---
  const selectedMail = useMemo(() =>
    mails.find(m => m.id === selectedMailId) || null,
    [mails, selectedMailId]);

  const activeTab = useMemo(() =>
    browserTabs.find(t => t.id === activeTabId) || browserTabs[0],
    [browserTabs, activeTabId]);

  // --- WINDOW HELPERS ---
  const openMail = () => {
    playButtonSound();
    setShowMail(true);
    setMailMinimized(false);
    bringToFront('mail');
  };

  const openBrowserWindow = (url?: string) => {
    playButtonSound();
    setShowBrowser(true);
    setBrowserMinimized(false);
    bringToFront('browser');
    if (url) {
      navigateBrowserTo(url, activeTabId);
    }
  };

  const handleAddNewTab = () => {
    const newId = `tab-${Date.now()}`;
    setBrowserTabs(prev => [...prev, {
      id: newId, url: 'home', urlInput: '', isLoading: false, progress: 0, showContent: true, searchQuery: ''
    }]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string) => {
    if (browserTabs.length <= 1) {
      setShowBrowser(false);
      return;
    }
    setBrowserTabs(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (activeTabId === id) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };

  const navigateBrowserTo = (url: string, tabId: string) => {
    setBrowserTabs(prev => prev.map(t => {
      if (t.id !== tabId) return t;
      return { ...t, isLoading: true, progress: 0, urlInput: url };
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setBrowserTabs(prev => prev.map(t => {
          if (t.id !== tabId) return t;
          return { ...t, isLoading: false, url, showContent: true, progress: 100 };
        }));
      } else {
        setBrowserTabs(prev => prev.map(t => {
          if (t.id !== tabId) return t;
          return { ...t, progress };
        }));
      }
    }, 200);
  };

  const openFolder = (id: string) => {
    playButtonSound();
    setOpenFolders(prev => ({ ...prev, [id]: true }));
    setFolderMinimized(prev => ({ ...prev, [id]: false }));
    setFolderMaximized(prev => ({ ...prev, [id]: true }));
    bringToFront(id);
  };

  const handleTrashClick = () => {
    playButtonSound();
    playError2Sound();
    setTrashErrorName(t('desktop.trash'));
    setShowTrashError(true);
  };

  const handleAccept = () => {
    playButtonSound();
    // Remove the invitation mail when clicking visited site
    removeMail(3);
    
    // Open specialized page in browser
    setShowBrowser(true);
    setBrowserMinimized(false);
    bringToFront('browser');

    // Add or update the tab to the Digital Dreams site
    setBrowserTabs(prev => {
      const siteUrl = 'https://digital-dreams.net';
      // Find if we already have it or use active tab
      const existingIdx = prev.findIndex(t => t.url === siteUrl);
      if (existingIdx !== -1) {
        setActiveTabId(prev[existingIdx].id);
        return prev;
      }

      const newTabs = [...prev];
      const activeIdx = newTabs.findIndex(t => t.id === activeTabId);
      if (activeIdx !== -1) {
        newTabs[activeIdx] = {
          ...newTabs[activeIdx],
          url: siteUrl,
          urlInput: siteUrl,
          showContent: true
        };
      }
      return newTabs;
    });
  };

  const addMail = (mail: MailDef) => {
    setMails(prev => [mail, ...prev]);
    // Notify the user about the new mail
    setShowNotification(true);
    setHasShownNotification(false); // Reset to allow repeated triggers
    playPopSound();
  };

  const removeMail = (id: number) => {
    setMails(prev => prev.filter(m => m.id !== id));
    if (selectedMailId === id) setSelectedMailId(null);
  };




  // Random photo URLs for the photo viewer
  const photoUrls: Record<string, string> = {
    'IMG_31247.jpeg': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format',
    'IMG_31248.jpeg': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format',
    'IMG_31305.jpeg': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format',
    'neon_city.png': 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&auto=format',
    'space_nebula.jpg': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format',
    'mountain_sunset.jpg': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format',
    'wallpaper.jpg': 'https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf?w=800&auto=format',
  };

  const getItemsAtPath = (folderKey: string): { items: FsItem[]; breadcrumbs: string[] } => {
    const path = folderPaths[folderKey] ?? folderKey;
    const parts = path.split('/');
    const root = fileSystem[parts[0]];
    if (!root) return { items: [], breadcrumbs: [folderKey] };

    let current: FsItem[] = root.items;
    const breadcrumbs = [root.title];

    for (let i = 1; i < parts.length; i++) {
      const found = current.find(item => item.name === parts[i]);
      if (found?.children) {
        current = found.children;
        breadcrumbs.push(found.name);
      } else break;
    }
    return { items: current, breadcrumbs };
  };

  const handleItemClick = (folderKey: string, item: FsItem) => {
    playButtonSound();
    if (item.type === 'system') {
      playError2Sound();
      setTrashErrorName(item.name);
      setShowTrashError(true);
      return;
    }
    if (item.type === 'folder') {
      setFolderPaths(prev => {
        const currentPath = prev[folderKey] ?? folderKey;
        if (currentPath.endsWith('/' + item.name)) return prev;
        return { ...prev, [folderKey]: currentPath + '/' + item.name };
      });
      return;
    }
    if (item.type === 'file') {
      if (item.name.endsWith('.mp4')) {
        playError2Sound();
        setVideoErrorName(item.name);
        setShowVideoError(true);
        return;
      }
      if (item.content === 'photo') {
        const url = photoUrls[item.name] ?? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format';
        setOpenPhoto({ name: item.name, url });
        setPhotoMinimized(false);
        setPhotoMaximized(true);
        bringToFront('photo');
        return;
      }
      if (item.content) {
        setOpenFile({ name: item.name, content: item.content });
        setFileMinimized(false);
        setFileMaximized(true);
        bringToFront('file');
      }
    }
  };

  const navigateUp = (folderKey: string) => {
    playButtonSound();
    setFolderPaths(prev => {
      const current = prev[folderKey] ?? folderKey;
      const parts = current.split('/');
      if (parts.length <= 1) return prev;
      return { ...prev, [folderKey]: parts.slice(0, -1).join('/') };
    });
  };

  const FolderSidebar = ({ currentKey }: { currentKey: string }) => {
    const navigateTo = (path: string) => {
      playButtonSound();
      setFolderPaths(prev => ({ ...prev, [currentKey]: path }));
    };

    return (
      <div
        className="w-48 bg-black/20 border-r border-white/5 flex flex-col py-3 px-2 shrink-0"
        onPointerDown={e => e.stopPropagation()}
      >
        <div className="text-[9px] text-blue-300/40 uppercase tracking-widest font-bold px-3 mb-2 text-left">{t('fs.quick_access')}</div>
        <button
          type="button"
          onPointerDown={() => navigateTo('computer')}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer text-left",
            (folderPaths[currentKey] ?? currentKey) === 'computer' ? "bg-white/10 text-white" : "text-blue-300/60 hover:bg-white/5 hover:text-blue-200"
          )}
        >
          <span className="text-base leading-none shrink-0">🖥️</span>
          <span className="truncate">{t('desktop.pc')}</span>
        </button>
        <button
          type="button"
          onPointerDown={() => navigateTo('documents')}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer text-left mt-1",
            (folderPaths[currentKey] ?? currentKey) === 'documents' ? "bg-white/10 text-white" : "text-blue-300/60 hover:bg-white/5 hover:text-blue-200"
          )}
        >
          <span className="text-base leading-none shrink-0">📁</span>
          <span className="truncate">{t('desktop.docs')}</span>
        </button>
      </div>
    );
  };

  const ExplorerContent = ({ folderKey, items, breadcrumbs }: { folderKey: string, items: FsItem[], breadcrumbs: string[] }) => (
    <div className="flex flex-col h-full bg-[#0a1628]">
      {/* Toolbar */}
      <div className="h-10 bg-black/20 border-b border-white/5 flex items-center gap-1 px-3 shrink-0">
        {breadcrumbs.length > 1 && (
          <button onPointerDown={() => navigateUp(folderKey)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors cursor-pointer text-blue-300">
            ←
          </button>
        )}
        <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 mx-2">
          <span className="text-xs text-blue-200/60 flex items-center gap-1 truncate font-medium">
            {breadcrumbs.join(' › ')}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <FolderSidebar currentKey={folderKey} />
        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-blue-300/20">
              <Folder className="w-16 h-16 opacity-10 mb-3" />
              <span className="text-sm font-medium tracking-tight">{t('fs.empty')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item, i) => {
                const isDisk = item.totalGb !== undefined && item.usedGb !== undefined;
                const usedPercent = isDisk ? Math.round((item.usedGb! / item.totalGb!) * 100) : 0;
                return (
                  <div
                    key={i}
                    onPointerDown={(e) => { e.stopPropagation(); bringToFront(folderKey); handleItemClick(folderKey, item); }}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border border-transparent group",
                      item.type === 'system' ? "opacity-40 hover:bg-red-500/10" : "hover:bg-white/5 hover:border-white/5 active:bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-xl",
                      item.type === 'folder' ? (isDisk ? "bg-blue-500/15" : "bg-amber-400/15") : "bg-blue-400/10"
                    )}>
                      {isDisk ? '💽' :
                        item.type === 'folder' ? '📁' : item.type === 'system' ? '🔒' :
                          item.name.endsWith('.mp4') ? '🎬' : '📄'}
                    </div>
                    <span className="text-[11px] text-blue-100/90 text-center leading-tight truncate w-full font-bold">
                      {item.name}
                    </span>
                    {isDisk && (
                      <div className="w-full space-y-1.5 px-2">
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all", usedPercent > 85 ? "bg-red-500" : "bg-blue-500")} style={{ width: `${usedPercent}%` }} />
                        </div>
                        <span className="text-[8px] text-blue-300/40 block text-center uppercase tracking-tighter">
                          {item.totalGb! - item.usedGb!} {t('fs.gb_free')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Status bar */}
      <div className="h-7 bg-black/40 border-t border-white/5 flex items-center justify-between px-4 shrink-0">
        <span className="text-[9px] text-blue-300/30 uppercase tracking-widest font-black">{items.length} {t('fs.items')}</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-[#0078d7] z-50000 font-sans overflow-hidden select-none flex flex-col" style={{ backgroundImage: 'url("/textures/photos/wallaper.webp")', backgroundSize: 'cover', backgroundPosition: 'center' }}>

        {/* Desktop Icons Content Area */}
        <div ref={desktopRef} className="flex-1 relative z-10 w-full overflow-hidden">
          {/* Icons Wrapper with padding and flex layout */}
          <div className="p-6 flex flex-col flex-wrap gap-6 items-start content-start h-full">
            <div className="flex flex-col items-center gap-1.5 group cursor-pointer w-20" onPointerDown={(e) => { e.stopPropagation(); openFolder('computer'); }}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors text-3xl">
                🖥️
              </div>
              <span className="text-white text-[10px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium text-center leading-tight">{t('desktop.pc')}</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 group cursor-pointer w-20" onPointerDown={(e) => { e.stopPropagation(); openBrowserWindow(); }}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors text-3xl">
                🌐
              </div>
              <span className="text-white text-[10px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium text-center leading-tight">{t('desktop.browser')}</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 group cursor-pointer w-20" onPointerDown={(e) => { e.stopPropagation(); openFolder('documents'); }}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors text-3xl">
                📁
              </div>
              <span className="text-white text-[10px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium text-center leading-tight">{t('desktop.docs')}</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 group cursor-pointer w-20" onPointerDown={(e) => { e.stopPropagation(); openMail(); }}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors text-3xl">
                📧
              </div>
              <span className="text-white text-[10px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium text-center leading-tight">{t('desktop.mail')}</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 group cursor-pointer w-20" onPointerDown={(e) => { e.stopPropagation(); handleTrashClick(); }}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors text-3xl">
                🗑️
              </div>
              <span className="text-white text-[10px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium text-center leading-tight">{t('desktop.trash')}</span>
            </div>
          </div>

          {/* SYSTEM WINDOWS & EXPLORER (Moved here for barrier enforcement) */}
          {/* Mail App */}
          <AnimatePresence>
            {showMail && (
              <motion.div
                onPointerDown={() => setActiveWindow('mail')}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{
                  opacity: mailMinimized ? 0 : 1,
                  scale: mailMinimized ? 0.8 : 1,
                  y: mailMinimized ? 100 : 0,
                  x: 0,
                  pointerEvents: mailMinimized ? 'none' : 'auto'
                }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={false}
                onDragEnd={(_e, info) => setMailPos(prev => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }))}
                className={cn(
                  "flex flex-col overflow-hidden",
                  mailMaximized
                    ? "fixed inset-0 w-screen h-screen rounded-none border-none shadow-none z-60000"
                    : "absolute w-[900px] h-[600px] left-[10%] top-[10%] rounded-lg border border-white/10 shadow-2xl"
                )}
                style={{
                  zIndex: mailMaximized ? 60000 + (windowStack.indexOf('mail') !== -1 ? windowStack.indexOf('mail') * 10 : 0) : 50000 + (windowStack.indexOf('mail') !== -1 ? windowStack.indexOf('mail') * 10 : 0),
                  ...(mailMaximized ? { x: 0, y: 0, scale: 1, top: 0, left: 0, width: '100vw', height: '100vh' } : { x: mailPos.x, y: mailPos.y }),
                  background: 'linear-gradient(145deg, #0a1628 0%, #132042 40%, #1a3060 100%)'
                }}
              >
                {/* Mail Title Bar */}
                <div className="h-9 bg-black/40 backdrop-blur-md flex items-center justify-between px-3 shrink-0 border-b border-white/5 cursor-grab active:cursor-grabbing">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📧</span>
                    <span className="text-[11px] font-medium text-blue-200/80">{t('desktop.mail')}</span>
                  </div>
                  <div className="flex gap-1" onPointerDown={e => e.stopPropagation()}>
                    <button type="button" onClick={() => setMailMinimized(true)} className="w-8 h-7 flex items-center justify-center hover:bg-white/10 rounded transition-colors cursor-pointer">
                      <Minus className="w-3 h-3 text-blue-300/60" />
                    </button>
                    <button type="button" onClick={() => setShowMail(false)} className="w-8 h-7 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors cursor-pointer">
                      <X className="w-3.5 h-3.5 text-blue-300/60" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Sidebar */}
                  <div className="w-64 bg-black/20 backdrop-blur-sm border-r border-white/5 flex flex-col">
                    <div className="p-4 flex flex-col gap-2">
                      <button type="button" className="w-full flex items-center gap-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded shadow-lg text-blue-200 text-xs font-semibold cursor-default">
                        <Mail className="w-4 h-4" /> {t('mail.inbox')}
                      </button>
                      <button type="button" className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded text-blue-300/40 text-xs transition-colors cursor-not-allowed">
                        <Send className="w-4 h-4" /> {t('mail.sent')}
                      </button>
                    </div>
                  </div>

                  {/* Mail List */}
                  <div className="flex-1 bg-[#0a1628]/40 overflow-y-auto">
                    {mails.map(msg => (
                      <div
                        key={msg.id}
                        onClick={() => { playButtonSound(); setSelectedMailId(msg.id); }}
                        className={cn(
                          "p-4 border-b border-white/5 cursor-pointer transition-colors",
                          selectedMailId === msg.id ? "bg-blue-500/10 border-l-2 border-l-blue-500" : "hover:bg-white/5"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-blue-100">{msg.from}</span>
                          <span className="text-[10px] text-blue-300/30">{msg.date}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-blue-200/80 mb-1">{msg.subject}</div>
                        <div className="text-[10px] text-blue-300/40 truncate">{msg.body.substring(0, 50)}...</div>
                      </div>
                    ))}
                  </div>

                  {/* Content */}
                  <div className={cn(
                    "flex-[1.5] flex flex-col transition-all duration-700 relative",
                    selectedMail?.isSpecial ? "bg-[#020617]" : "bg-[#0a1628]/60"
                  )}>
                    {selectedMail ? (
                      selectedMail?.isSpecial && !selectedMail?.type ? (
                        <div className="flex-1 flex flex-col items-center justify-start p-6 pt-10 text-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_70%)] animate-pulse" />
                          <div className="max-w-xl w-full relative z-10 space-y-3">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col items-center mb-4">
                              <div className="w-16 h-16 mb-4 relative">
                                <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full scale-150 animate-pulse" />
                                <Shield className="w-full h-full text-blue-400 relative drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                              </div>
                              <div className="h-px w-32 bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
                              <span className="text-[9px] tracking-[0.5em] uppercase text-blue-400 font-black mt-3 opacity-70">{t('mail.invite.secure_tag')}</span>
                            </motion.div>
                            <div className="space-y-4">
                              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-blue-100/90 font-medium text-center">
                                <p>{t('mail.invite.body1')}<span className="text-blue-300 underline decoration-blue-500/50 underline-offset-4 font-bold">{t('mail.invite.body1_bold')}</span>{t('mail.invite.body1_end')}</p>
                                <p>{t('mail.invite.body2')}<span className="text-white font-black italic">{t('mail.invite.body2_bold')}</span>{t('mail.invite.body2_end')}</p>
                                <p className="text-lg sm:text-xl font-black uppercase tracking-tight pt-2 text-center w-full">{t('mail.invite.body3')}<span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse">{t('mail.invite.body3_red')}</span>{t('mail.invite.body3_end')}</p>
                              </div>
                            </div>
                            <div className="pt-2 space-y-3 flex flex-col items-center">
                              <p className="text-[10px] sm:text-xs text-blue-300/60 italic max-w-sm">{t('mail.invite.hint')} <span className="block mt-1 font-bold text-blue-400/80">{t('mail.invite.hint_bold')}</span></p>
                              <button onClick={(e) => { e.stopPropagation(); handleAccept(); }} className="group relative px-12 py-3 overflow-hidden rounded-full bg-blue-500 text-white transition-all hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(59,130,246,0.4)] cursor-pointer">
                                <span className="relative z-10 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]">{t('mail.invite.visit_site')}</span>
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 h-full flex flex-col overflow-y-auto">
                          <div className="mb-6">
                            <h2 className="text-2xl font-light text-blue-100 mb-2">{selectedMail?.subject}</h2>
                            <div className="flex items-center gap-2 text-xs text-blue-300/40">
                              <div className="w-6 h-6 bg-blue-500/15 rounded-full flex items-center justify-center text-blue-400 font-bold">{selectedMail?.from[0]}</div>
                              <span className="font-bold text-blue-200/70">{selectedMail?.from}</span>
                              <span>&lt;noreply@system.os&gt;</span>
                            </div>
                          </div>
                          <div className="text-sm text-blue-100/70 leading-relaxed flex-1 whitespace-pre-wrap select-text cursor-text">
                            {selectedMail?.body.includes(`DD-${workerCode}-WORKER`) ? (
                              <>
                                {selectedMail.body.split(`DD-${workerCode}-WORKER`)[0]}
                                <div className="inline-flex items-center gap-2 bg-blue-900/40 px-2 py-1 rounded border border-blue-500/30 my-1">
                                  <span className="font-mono font-bold text-blue-300">DD-{workerCode}-WORKER</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(`DD-${workerCode}-WORKER`);
                                      setHasCopiedCode(true);
                                      playButtonSound();
                                    }}
                                    className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors active:bg-white/20"
                                    title="Copy code"
                                  >
                                    <Copy className="w-3 h-3 text-blue-400" />
                                  </button>
                                </div>
                                {selectedMail.body.split(`DD-${workerCode}-WORKER`)[1]}
                              </>
                            ) : (
                              selectedMail?.body
                            )}

                            {selectedMail?.type === 'contract' && (
                              <div className="mt-8 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 space-y-4">
                                <h4 className="text-white font-black uppercase text-xs tracking-widest">{t('mail.contract.title')}</h4>
                                <p className="text-[11px] text-blue-200/60 leading-normal italic">
                                  {t('mail.contract.body')}
                                </p>
                                <div className="flex gap-3">
                                  <input
                                    type="text"
                                    placeholder={t('mail.contract.placeholder')}
                                    value={userName}
                                    onChange={e => setUserName(e.target.value)}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-blue-400"
                                  />
                                  <button
                                    onClick={() => {
                                      if (!userName.trim()) return;
                                      playButtonSound();
                                      // Trigger SentinelTech mail
                                      setTimeout(() => {
                                        addMail({
                                          id: 5,
                                          from: t('mail.st_invite.from'),
                                          subject: t('mail.st_invite.subj'),
                                          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                          isSpecial: true,
                                          body: t('mail.st_invite.body').replace('{user}', userName),
                                          type: 'st_invite'
                                        });
                                      }, 1000);
                                      removeMail(4);
                                    }}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg text-xs font-black uppercase hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                  >
                                    {t('mail.contract.btn')}
                                  </button>
                                </div>
                                <p className="text-[10px] text-blue-500/40 mt-4 leading-relaxed">
                                  {t('mail.contract.footer')}
                                </p>
                              </div>
                            )}

                            {selectedMail?.type === 'st_invite' && (
                              <div className="mt-8">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openBrowserWindow('https://sentinel-tech.net/worker');
                                    // Trigger final instruction mail
                                    setTimeout(() => {
                                      addMail({
                                        id: 6,
                                        from: t('mail.st_invite.from'),
                                        subject: t('mail.st_initiation.subj'),
                                        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        body: t('mail.st_initiation.body').replace('9921', workerCode)
                                      });
                                    }, 1000);
                                    removeMail(5);
                                  }}
                                  className="px-10 py-3 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-110 shadow-lg cursor-pointer transition-all"
                                >
                                  {t('mail.invite.visit_site')}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-blue-300/30">
                        <Mail className="w-16 h-16 opacity-20 mb-4" /><span className="text-sm font-medium">{t('mail.select')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Folder Windows Loop */}
          <AnimatePresence>
            {Object.entries(fileSystem).map(([key, folder]) => {
              if (!openFolders[key]) return null;
              const { items, breadcrumbs } = getItemsAtPath(key);
              const isMax = folderMaximized[key];
              const isMin = folderMinimized[key];
              const pos = folderPositions[key] || { x: 50, y: 50 };

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{
                    opacity: isMin ? 0 : 1,
                    scale: isMin ? 0.8 : 1,
                    y: isMin ? 100 : 0,
                    x: 0,
                    pointerEvents: isMin ? 'none' : 'auto'
                  }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag={false}
                  onPointerDown={() => bringToFront(key)}
                  onDragEnd={(_e, info) => setFolderPositions(prev => ({ ...prev, [key]: { x: pos.x + info.offset.x, y: pos.y + info.offset.y } }))}
                  className={cn(
                    "flex flex-col overflow-hidden",
                    isMax
                      ? "fixed inset-0 w-screen h-screen rounded-none border-none shadow-none z-60000"
                      : "absolute w-[800px] h-[550px] rounded-lg border border-white/10 shadow-2xl"
                  )}
                  style={{
                    zIndex: isMax ? 60000 + (windowStack.indexOf(key) !== -1 ? windowStack.indexOf(key) * 10 : 0) : 50000 + (windowStack.indexOf(key) !== -1 ? windowStack.indexOf(key) * 10 : 0),
                    ...(isMax ? { x: 0, y: 0, scale: 1, top: 0, left: 0, width: '100vw', height: '100vh' } : { x: pos.x, y: pos.y }),
                    background: 'linear-gradient(145deg, #0a1628 0%, #132042 40%, #1a3060 100%)'
                  }}
                >
                  <div className="h-9 bg-black/40 backdrop-blur-md flex items-center justify-between px-3 shrink-0 border-b border-white/5 cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-2 pointer-events-none">
                      {folder.icon}
                      <span className="text-[11px] font-medium text-blue-200/80">{folder.title}</span>
                    </div>
                    <div className="flex gap-1" onPointerDown={e => e.stopPropagation()}>
                      <button type="button" onClick={() => setFolderMinimized(p => ({ ...p, [key]: true }))} className="w-8 h-7 flex items-center justify-center hover:bg-white/10 rounded transition-colors cursor-pointer">
                        <Minus className="w-3 h-3 text-blue-300/60" />
                      </button>
                      <button type="button" onClick={() => setOpenFolders(p => ({ ...p, [key]: false }))} className="w-8 h-7 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5 text-blue-300/60" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden bg-[#0a1628]/95 backdrop-blur-sm flex flex-col">
                    <ExplorerContent folderKey={key} items={items} breadcrumbs={breadcrumbs} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* File Viewer */}
          <AnimatePresence>
            {openFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: fileMinimized ? 0 : 1,
                  scale: fileMinimized ? 0.8 : 1,
                  y: fileMinimized ? 100 : 0,
                  x: 0,
                  pointerEvents: fileMinimized ? 'none' : 'auto'
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={false}
                onPointerDown={() => setActiveWindow('file')}
                onDragEnd={(_e, info) => setFilePos(prev => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }))}
                className={cn(
                  "flex flex-col overflow-hidden",
                  fileMaximized
                    ? "fixed inset-0 w-screen h-screen rounded-none border-none shadow-none z-60000"
                    : "absolute w-[480px] h-[360px] rounded-lg border border-white/10 shadow-2xl"
                )}
                style={{
                  zIndex: fileMaximized ? 60000 + (windowStack.indexOf('file') !== -1 ? windowStack.indexOf('file') * 10 : 0) : 50000 + (windowStack.indexOf('file') !== -1 ? windowStack.indexOf('file') * 10 : 0),
                  ...(fileMaximized ? { x: 0, y: 0, scale: 1, top: 0, left: 0, width: '100vw', height: '100vh' } : { x: filePos.x, y: filePos.y }),
                  background: 'linear-gradient(145deg, #0a1628 0%, #132042 40%, #1a3060 100%)'
                }}
              >
                <div className="h-9 bg-black/40 backdrop-blur-md flex items-center justify-between px-3 shrink-0 border-b border-white/5 cursor-grab active:cursor-grabbing">
                  <div className="flex items-center gap-2 pointer-events-none">
                    <span className="text-base">📄</span>
                    <span className="text-[11px] font-medium text-blue-200/80">{openFile.name}</span>
                  </div>
                  <div className="flex gap-1" onPointerDown={e => e.stopPropagation()}>
                    <button type="button" onClick={() => setFileMinimized(true)} className="w-8 h-7 flex items-center justify-center hover:bg-white/10 rounded transition-colors cursor-pointer">
                      <Minus className="w-3 h-3 text-blue-300/60" />
                    </button>
                    <button type="button" onClick={() => setOpenFile(null)} className="w-8 h-7 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors cursor-pointer">
                      <X className="w-3.5 h-3.5 text-blue-300/60" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-black/40 text-blue-100 font-mono text-xs whitespace-pre-wrap leading-relaxed selection:bg-blue-500/30">
                  {openFile.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Photo Viewer */}
          <AnimatePresence>
            {openPhoto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: photoMinimized ? 0 : 1,
                  scale: photoMinimized ? 0.8 : 1,
                  y: photoMinimized ? 100 : 0,
                  x: 0,
                  pointerEvents: photoMinimized ? 'none' : 'auto'
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={false}
                onPointerDown={() => setActiveWindow('photo')}
                onDragEnd={(_e, info) => setPhotoPos(prev => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }))}
                className={cn(
                  "flex flex-col overflow-hidden",
                  photoMaximized
                    ? "fixed inset-0 w-screen h-screen rounded-none border-none shadow-none z-60000"
                    : "absolute w-[600px] h-[450px] left-[20%] top-[20%] rounded-lg border border-white/10 shadow-2xl"
                )}
                style={{
                  zIndex: photoMaximized ? 60000 + (windowStack.indexOf('photo') !== -1 ? windowStack.indexOf('photo') * 10 : 0) : 50000 + (windowStack.indexOf('photo') !== -1 ? windowStack.indexOf('photo') * 10 : 0),
                  ...(photoMaximized ? { x: 0, y: 0, scale: 1, top: 0, left: 0, width: '100vw', height: '100vh' } : { x: photoPos.x, y: photoPos.y }),
                  background: 'rgba(0,0,0,0.9)'
                }}
              >
                <div className="h-9 bg-black/40 backdrop-blur-md flex items-center justify-between px-3 shrink-0 border-b border-white/5 cursor-grab active:cursor-grabbing">
                  <div className="flex items-center gap-2 pointer-events-none">
                    <span className="text-base">🎬</span>
                    <span className="text-[11px] font-medium text-blue-200/80">{openPhoto.name}</span>
                  </div>
                  <div className="flex gap-1" onPointerDown={e => e.stopPropagation()}>
                    <button type="button" onClick={() => setPhotoMinimized(true)} className="w-8 h-7 flex items-center justify-center hover:bg-white/10 rounded transition-colors cursor-pointer">
                      <Minus className="w-3 h-3 text-blue-300/60" />
                    </button>
                    <button type="button" onClick={() => setOpenPhoto(null)} className="w-8 h-7 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors cursor-pointer">
                      <X className="w-3.5 h-3.5 text-blue-300/60" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden p-4 group">
                  <img src={openPhoto.url} alt={openPhoto.name} className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings App */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                onPointerDown={() => setActiveWindow('settings')}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{
                  opacity: settingsMinimized ? 0 : 1,
                  scale: settingsMinimized ? 0.8 : 1,
                  y: settingsMinimized ? 100 : 0,
                  x: 0,
                  pointerEvents: settingsMinimized ? 'none' : 'auto'
                }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={false}
                onDragEnd={(_e, info) => setSettingsPos(prev => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }))}
                className={cn(
                  "flex flex-col overflow-hidden backdrop-blur-xl",
                  settingsMaximized
                    ? "fixed inset-0 w-screen h-screen rounded-none border-none shadow-none z-60000"
                    : "absolute w-[900px] h-[600px] left-[15%] top-[15%] rounded-lg border border-white/10 shadow-2xl"
                )}
                style={{
                  zIndex: settingsMaximized ? 60000 + (windowStack.indexOf('settings') !== -1 ? windowStack.indexOf('settings') * 10 : 0) : 50000 + (windowStack.indexOf('settings') !== -1 ? windowStack.indexOf('settings') * 10 : 0),
                  ...(settingsMaximized ? { x: 0, y: 0, scale: 1, top: 0, left: 0, width: '100vw', height: '100vh' } : { x: settingsPos.x, y: settingsPos.y }),
                  background: 'linear-gradient(145deg, #0a1628 0%, #132042 40%, #1a3060 100%)'
                }}
              >
                <div className="h-9 bg-black/40 backdrop-blur-md flex items-center justify-between px-3 shrink-0 border-b border-white/5 cursor-grab active:cursor-grabbing">
                  <div className="flex items-center gap-2 pointer-events-none">
                    <span className="text-base leading-none">⚙️</span>
                    <span className="text-[11px] font-medium text-blue-200/80">{t('desktop.settings')}</span>
                  </div>
                  <div className="flex gap-1" onPointerDown={e => e.stopPropagation()}>
                    <button type="button" onClick={() => setSettingsMinimized(true)} className="w-8 h-7 flex items-center justify-center hover:bg-white/10 rounded transition-colors cursor-pointer">
                      <Minus className="w-3 h-3 text-blue-300/60" />
                    </button>
                    <button type="button" onClick={() => setShowSettings(false)} className="w-8 h-7 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors cursor-pointer">
                      <X className="w-3.5 h-3.5 text-blue-300/60" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex overflow-hidden">
                  {/* Settings Sidebar */}
                  <div className="w-64 bg-black/20 backdrop-blur-sm border-r border-white/5 p-4 flex flex-col gap-1">
                    <div className="flex items-center gap-3 p-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">U</div>
                      <div><div className="text-xs font-bold text-white">{t('settings.user_info.admin')}</div><div className="text-[10px] text-white/40">{t('settings.user_info.local')}</div></div>
                    </div>
                    {[
                      { id: 'system', icon: "🖥️", label: t('settings.tabs.system') },
                      { id: 'update', icon: "🔄", label: t('settings.tabs.update') },
                      { id: 'security', icon: "🛡️", label: t('settings.tabs.security') }
                    ].map(item => (
                      <button key={item.id} onClick={() => { playButtonSound(); setSettingsTab(item.id as any); }} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors", settingsTab === item.id ? "bg-blue-500/10 text-blue-200 border border-blue-500/20 shadow-lg" : "text-blue-300/50 hover:bg-white/5 hover:text-blue-200")}>
                        <span className="text-base shrink-0">{item.icon}</span> {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto bg-[#0a1628]/40">
                    {settingsTab === 'system' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Overview Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-2 text-blue-400/60 uppercase text-[9px] font-black tracking-widest font-sans">
                              <HardDrive className="w-3.5 h-3.5" /> <span>{t('hardware.drive')}</span>
                            </div>
                            <div className="text-xl font-bold text-white tracking-tight font-sans">477 {t('fs.gb')}</div>
                            <div className="text-[10px] text-white/40 font-sans">{t('settings.storage_desc_fmt').replace('{used}', '248').replace('{total}', '477')}</div>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-2 text-blue-400/60 uppercase text-[9px] font-black tracking-widest font-sans">
                              <MonitorSmartphone className="w-3.5 h-3.5" /> <span>{t('hardware.gpu')}</span>
                            </div>
                            <div className="text-xl font-bold text-white tracking-tight font-sans">12 {t('settings.memory_unit')}</div>
                            <div className="text-[10px] text-white/40 font-sans">NVIDIA GeForce RTX 4070 Ti</div>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-2 text-blue-400/60 uppercase text-[9px] font-black tracking-widest font-sans">
                              <MemoryStick className="w-3.5 h-3.5" /> <span>{t('hardware.ram')}</span>
                            </div>
                            <div className="text-xl font-bold text-white tracking-tight font-sans">32,0 {t('fs.gb')}</div>
                            <div className="text-[10px] text-white/40 font-sans">{t('settings.ram_speed')}</div>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-2 text-blue-400/60 uppercase text-[9px] font-black tracking-widest font-sans">
                              <Cpu className="w-3.5 h-3.5" /> <span>{t('hardware.cpu')}</span>
                            </div>
                            <div className="text-xl font-bold text-white tracking-tight font-sans">i9-14900K</div>
                            <div className="text-[10px] text-white/40 font-sans">6.00 GHz @ 24 Cores</div>
                          </div>
                        </div>

                        {/* Device Details Row */}
                        <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                              <Monitor className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                              {isRenaming ? (
                                <motion.div
                                  animate={isShaking ? { x: [-2, 2, -2, 2, 0] } : {}}
                                  transition={{ duration: 0.15 }}
                                  className="w-full max-w-[300px]"
                                >
                                  <input
                                    autoFocus
                                    type="text"
                                    maxLength={19}
                                    value={pcName}
                                    onChange={(e) => {
                                      // Only allow English letters, numbers and hyphens
                                      const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
                                      setPcName(val);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') setIsRenaming(false);
                                      // Trigger shake if typing more chars at limit
                                      if (pcName.length >= 19 && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                                        setIsShaking(true);
                                        playError3Sound && playError3Sound();
                                        setTimeout(() => setIsShaking(false), 500);
                                      }
                                    }}
                                    onBlur={() => setIsRenaming(false)}
                                    className={cn(
                                      "bg-white/10 border rounded px-2 py-0.5 text-xl font-bold text-white outline-none font-sans w-full transition-all duration-300",
                                      isShaking
                                        ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-1 ring-red-500"
                                        : "border-blue-500/50 focus:border-blue-400 focus:shadow-[0_0_10px_rgba(96,165,250,0.3)]"
                                    )}
                                  />
                                </motion.div>
                              ) : (
                                <h2 className="text-xl font-bold text-white tracking-tight font-sans">{pcName}</h2>
                              )}
                              <p className="text-xs text-blue-300/40 font-medium font-sans">ASUS ROG Zephyrus G14</p>
                            </div>
                          </div>
                          <button
                            onMouseDown={(e) => {
                              // Prevent blur from disabling renaming if we clicked the button
                              if (isRenaming) e.preventDefault();
                            }}
                            onClick={() => { playButtonSound(); setIsRenaming(!isRenaming); }}
                            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-semibold text-white transition-all active:scale-95 font-sans"
                          >
                            {isRenaming ? t('common.save') : t('settings.rename_hint_btn')}
                          </button>
                        </div>

                        {/* Device Specifications Section */}
                        <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                          <div
                            onClick={() => { playButtonSound(); setSpecExpanded(!specExpanded); }}
                            className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                                <AlertTriangle className="w-3 h-3 text-white/60" />
                              </div>
                              <span className="text-sm font-bold text-white font-sans">{t('settings.device_specs')}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold text-blue-300/60 uppercase tracking-widest transition-colors flex items-center gap-2 font-sans">
                                <Copy className="w-3 h-3" /> {t('common.copy')}
                              </button>
                              {specExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                            </div>
                          </div>

                          <AnimatePresence>
                            {specExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                              >
                                <div className="px-6 pb-6 pt-2 space-y-1">
                                  {[
                                    { label: t('settings.pcName'), value: pcName },
                                    { label: t('hardware.cpu'), value: "14th Gen Intel(R) Core(TM) i9-14900K (6.0 GHz)" },
                                    { label: t('hardware.ram'), value: `32,0 ${t('fs.gb')} (31,8 ${t('fs.gb')} available)` },
                                    { label: t('settings.device_id'), value: "857CBCFF-FFC6-43FD-ACF6-D68E340E72F6" },
                                    { label: t('settings.product_id'), value: "00331-10000-00001-AA978" },
                                    { label: t('settings.system_type'), value: t('settings.system_type_value') },
                                    { label: t('settings.pen_touch'), value: t('settings.pen_touch_value') },
                                  ].map((spec, i) => (
                                    <div key={i} className="flex py-2 border-t border-white/5 first:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                                      <span className="w-40 shrink-0 text-xs text-white/40 font-medium font-sans">{spec.label}</span>
                                      <span className="flex-1 text-xs text-white/90 font-medium leading-relaxed font-sans">{spec.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {settingsTab === 'update' && (
                      <div className="space-y-6">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                              <RefreshCw className="w-6 h-6 text-green-400 animate-spin-slow" />
                            </div>
                            <div>
                              <div className="text-base font-bold text-white font-sans">{t('settings.updateStatus')}</div>
                              <div className="text-xs text-green-400/60 font-medium font-sans">{t('settings.lastCheck')}: {t('fs.today')}, {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                          <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                            <span className="text-sm font-bold text-white font-sans">{t('settings.updateLog_title')}</span>
                          </div>
                          <div className="px-6 py-4 space-y-4">
                            {[
                              { title: t('settings.update_kb'), date: t('fs.yesterday'), status: t('common.success') },
                              { title: t('settings.update_av'), date: t('fs.today'), status: t('common.success') },
                              { title: t('settings.update_gpu'), date: `2 ${t('fs.days_ago')}`, status: t('common.success') },
                            ].map((item, i) => (
                              <div key={i} className="flex justify-between items-center py-1">
                                <div className="space-y-1">
                                  <div className="text-xs text-white/80 font-medium font-sans">{item.title}</div>
                                  <div className="text-[10px] text-white/30 font-sans">{item.date}</div>
                                </div>
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-sans">{item.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden shadow-2xl p-6 space-y-2">
                          <div className="text-xs text-white/40 uppercase tracking-widest font-black font-sans">{t('settings.current_build')}</div>
                          <div className="text-xl font-bold text-white font-sans">{t('settings.version_title')}</div>
                          <div className="text-[11px] text-blue-300/40 font-mono">Build 2026.03.24-STABLE (Core 1.0.4)</div>
                        </div>
                      </div>
                    )}

                    {settingsTab === 'security' && (
                      <div className="space-y-6">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-6">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                              <Shield className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <div className="text-base font-bold text-white font-sans">{t('settings.security_title')}</div>
                              <div className="text-xs text-blue-400/60 font-medium font-sans">{t('settings.security_status_ok')}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { icon: <ShieldAlert className="w-4 h-4" />, title: t('settings.security_items.virus'), status: t('settings.security_statuses.no_threats') },
                              { icon: <Wifi className="w-4 h-4" />, title: t('settings.security_items.firewall'), status: t('settings.security_statuses.network_protected') },
                              { icon: <Globe className="w-4 h-4" />, title: t('settings.security_items.browser'), status: t('settings.security_statuses.active') },
                              { icon: <HardDrive className="w-4 h-4" />, title: t('settings.security_items.device'), status: t('settings.security_statuses.status_ok') },
                            ].map((item, i) => (
                              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="text-blue-400">{item.icon}</div>
                                  <span className="text-xs font-bold text-white font-sans">{item.title}</span>
                                </div>
                                <span className="text-[10px] text-green-400 font-medium font-sans">✓ {item.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-black/20 border border-white/5 rounded-xl p-6">
                          <div className="text-xs text-white/40 mb-3 font-sans">{t('settings.last_scan')}</div>
                          <div className="text-sm font-bold text-white font-sans">{t('settings.quick_scan_fmt').replace('{time}', `today, 09:42`)}</div>
                          <div className="text-[10px] text-white/30 mt-1 font-sans">{t('settings.scan_results')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BROWSER WINDOW App */}
          <AnimatePresence>
            {showBrowser && (
              <motion.div
                onPointerDown={() => bringToFront('browser')}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{
                  opacity: browserMinimized ? 0 : 1,
                  scale: browserMinimized ? 0.8 : 1,
                  y: browserMinimized ? 100 : 0,
                  x: 0,
                  pointerEvents: browserMinimized ? 'none' : 'auto'
                }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={false}
                onDragEnd={(_e, info) => setBrowserPos(prev => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }))}
                className={cn(
                  "flex flex-col overflow-hidden",
                  browserMaximized
                    ? "fixed inset-0 w-screen h-screen rounded-none border-none shadow-none z-60000"
                    : "absolute w-[1000px] h-[650px] left-[5%] top-[5%] rounded-lg border border-white/10 shadow-2xl"
                )}
                style={{
                  zIndex: browserMaximized ? 60000 : 50000 + (windowStack.indexOf('browser') !== -1 ? windowStack.indexOf('browser') * 10 : 0),
                  ...(browserMaximized ? { x: 0, y: 0, scale: 1, top: 0, left: 0, width: '100vw', height: '100vh' } : { x: browserPos.x, y: browserPos.y }),
                  background: '#0a0a0a'
                }}
              >
                {/* Browser Title Bar */}
                <div className="bg-[#0a0a0a] flex flex-col shrink-0">
                  <div className="h-10 flex items-end px-2 pt-2 gap-1 cursor-grab active:cursor-grabbing">
                    <Reorder.Group axis="x" values={browserTabs} onReorder={setBrowserTabs} className="flex flex-1 items-end h-full gap-1 overflow-x-hidden">
                      {browserTabs.map(tab => (
                        <Reorder.Item
                          key={tab.id}
                          value={tab}
                          onPointerDown={(e) => { e.stopPropagation(); setActiveTabId(tab.id); }}
                          className={cn(
                            "relative group h-full flex items-center px-3 min-w-[120px] max-w-[200px] border-x border-t rounded-t-lg transition-colors cursor-pointer select-none",
                            activeTabId === tab.id ? "bg-[#1e1e1e] border-white/10 z-10" : "bg-[#0a0a0a] border-white/5 hover:bg-[#141414] text-white/50"
                          )}
                        >
                          <div className="flex-1 flex items-center gap-2 min-w-0 pointer-events-none">
                            <span className="text-sm shrink-0 leading-none">{activeTabId === tab.id ? "🌐" : "🌐"}</span>
                            <span className={cn("text-[11px] font-medium truncate", activeTabId === tab.id ? "text-white/80" : "text-white/50")}>
                              {tab.url === 'home' ? t('browser.new_tab') : tab.url}
                            </span>
                          </div>
                          {browserTabs.length > 1 && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }} className={cn("w-5 h-5 flex items-center justify-center rounded-sm hover:bg-white/10 transition-opacity ml-2", activeTabId === tab.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                              <X className="w-3 h-3 text-white/60" />
                            </button>
                          )}
                        </Reorder.Item>
                      ))}
                      {browserTabs.length < 2 && (
                        <div className="h-full flex items-center px-1 mb-1" onPointerDown={e => e.stopPropagation()}>
                          <button type="button" onClick={() => { playButtonSound(); handleAddNewTab(); }} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                            <Plus className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      )}
                    </Reorder.Group>

                    <div className="flex gap-1 shrink-0 pb-1.5" onPointerDown={e => e.stopPropagation()}>
                      <button type="button" onClick={() => { playButtonSound(); setBrowserMinimized(true); }} className="w-8 h-7 flex items-center justify-center hover:bg-white/10 rounded transition-colors cursor-pointer">
                        <Minus className="w-3 h-3 text-blue-300/60" />
                      </button>
                      <button type="button" onClick={() => { playButtonSound(); setShowBrowser(false); }} className="w-8 h-7 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5 text-white/80" />
                      </button>
                    </div>
                  </div>

                  {/* URL Bar */}
                  <div className="h-10 bg-[#1e1e1e] border-y border-white/10 flex items-center px-2 shrink-0">
                    <div className="flex-1 bg-black/40 rounded-md h-7 flex items-center px-3 gap-2 border border-white/5 mx-2 min-w-0" onPointerDown={e => e.stopPropagation()}>
                      {activeTab.url === 'home' ? (
                        <>
                          <span className="text-xs opacity-40 shrink-0">🔍</span>
                          <input
                            type="text"
                            value={activeTab.urlInput}
                            onChange={e => setBrowserTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, urlInput: e.target.value } : t))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = activeTab.urlInput.trim();
                                if (val) {
                                  const finalUrl = val.startsWith('http') ? val : `https://${val}`;
                                  navigateBrowserTo(finalUrl, activeTab.id);
                                }
                              }
                            }}
                            placeholder={t('browser.url_placeholder')}
                            className="flex-1 bg-transparent text-[10px] text-white/80 outline-none placeholder:text-white/30 truncate font-mono"
                          />
                        </>
                      ) : (
                        <>
                          <span className="text-xs shrink-0">🛡️</span>
                          <input
                            type="text"
                            value={activeTab.urlInput}
                            onChange={e => setBrowserTabs(prev => prev.map(t => t.id === activeTab.id ? { ...t, urlInput: e.target.value } : t))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = activeTab.urlInput.trim();
                                if (val) {
                                  const finalUrl = val.startsWith('http') ? val : `https://${val}`;
                                  navigateBrowserTo(finalUrl, activeTab.id);
                                }
                              }
                            }}
                            className="flex-1 bg-transparent text-[10px] text-white/80 outline-none truncate font-mono"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Browser Content */}
                <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden">
                  {browserTabs.map(tab => (
                    <div key={tab.id} className={cn("absolute inset-0 flex flex-col", activeTabId !== tab.id && "hidden")}>
                      <AnimatePresence mode="wait">
                        {tab.isLoading ? (
                          <motion.div
                            key={`loading-${tab.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-12 overflow-hidden bg-[#0a0a0a]"
                          >
                            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mb-4">
                              <motion.div
                                className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${tab.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-white/20 font-mono tracking-widest uppercase">{t('browser.connecting')}</span>
                          </motion.div>
                        ) : tab.url === 'home' ? (
                          /* HOME / SEARCH PAGE */
                          <motion.div
                            key={`home-${tab.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col h-full bg-[#202124] text-white overflow-y-auto w-full font-sans"
                          >
                            {/* Top Bar */}
                            <div className="flex justify-end items-center p-4 gap-4 text-[13px] text-white/90">
                              <span className="hover:underline cursor-pointer hidden sm:block">{t('desktop.mail')}</span>
                              <span className="hover:underline cursor-pointer hidden sm:block">{t('browser.images')}</span>
                              <div className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full cursor-pointer transition-colors">
                                <Grid className="w-5 h-5" />
                              </div>
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer text-white font-medium">
                                U
                              </div>
                            </div>

                            {/* Search Area */}
                            <div className="flex-1 flex flex-col items-center mt-12 px-5 shrink-0">
                              {/* Logo */}
                              <div className="mb-8 select-none">
                                <h1 className="text-7xl font-sans tracking-tight leading-none">
                                  <span className="text-[#4285F4]">G</span>
                                  <span className="text-[#EA4335]">o</span>
                                  <span className="text-[#FBBC05]">o</span>
                                  <span className="text-[#4285F4]">g</span>
                                  <span className="text-[#34A853]">l</span>
                                  <span className="text-[#EA4335]">e</span>
                                </h1>
                              </div>

                              {/* Search Bar */}
                              <div className="w-full max-w-[584px] relative group" onPointerDown={e => e.stopPropagation()}>
                                <div className="flex items-center bg-[#303134] border border-transparent rounded-full px-4 py-3 gap-3 hover:bg-[#303134] hover:shadow-[0_1px_6px_rgba(23,23,23,0.9)] hover:border-[#5f6368] focus-within:bg-[#303134] focus-within:shadow-[0_1px_6px_rgba(23,23,23,0.9)] focus-within:border-[#5f6368] transition-all">
                                  <Search className="w-4 h-4 text-[#9aa0a6] shrink-0" />
                                  <input
                                    type="text"
                                    value={tab.searchQuery}
                                    onChange={e => setBrowserTabs(prev => prev.map(t => t.id === tab.id ? { ...t, searchQuery: e.target.value } : t))}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' && tab.searchQuery.trim()) {
                                        navigateBrowserTo(`search:${tab.searchQuery.trim()}`, tab.id);
                                      }
                                    }}
                                    className="flex-1 bg-transparent text-[16px] text-[#e8eaed] outline-none min-w-0 placeholder:text-[#9aa0a6]"
                                  />
                                  <Mic className="w-5 h-5 text-[#4285F4] shrink-0 cursor-pointer" />
                                  <Camera className="w-5 h-5 text-[#34A853] shrink-0 cursor-pointer" />
                                </div>
                              </div>

                              {/* Search Buttons */}
                              <div className="mt-8 flex gap-3">
                                <button className="bg-[#303134] hover:bg-[#3c4043] border border-transparent hover:border-[#5f6368] text-[#e8eaed] text-[14px] px-4 py-2 rounded cursor-pointer transition-colors">
                                  {t('browser.google_search')}
                                </button>
                                <button className="bg-[#303134] hover:bg-[#3c4043] border border-transparent hover:border-[#5f6368] text-[#e8eaed] text-[14px] px-4 py-2 rounded cursor-pointer transition-colors">
                                  {t('browser.lucky_search_btn')}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ) : tab.url.startsWith('search:') ? (
                          /* NATIVE SEARCH RESULTS PAGE */
                          <motion.div
                            key={`search-${tab.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col h-full bg-[#202124] text-white overflow-y-auto w-full font-sans pb-12"
                          >
                            {/* Search Header */}
                            <div className="flex items-center p-6 gap-6 border-b border-[#3c4043] shrink-0">
                              <h1 className="text-2xl font-sans tracking-tight leading-none cursor-pointer select-none" onClick={() => navigateBrowserTo('home', tab.id)}>
                                <span className="text-[#4285F4]">G</span>
                                <span className="text-[#EA4335]">o</span>
                                <span className="text-[#FBBC05]">o</span>
                                <span className="text-[#4285F4]">g</span>
                                <span className="text-[#34A853]">l</span>
                                <span className="text-[#EA4335]">e</span>
                              </h1>
                              <div className="flex-1 max-w-2xl bg-[#303134] rounded-full flex items-center px-4 py-2 group hover:bg-[#303134] hover:shadow-[0_1px_6px_rgba(23,23,23,0.9)] hover:border-[#5f6368] transition-all">
                                <input
                                  type="text"
                                  value={tab.searchQuery}
                                  onChange={e => setBrowserTabs(prev => prev.map(t => t.id === tab.id ? { ...t, searchQuery: e.target.value } : t))}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && tab.searchQuery.trim()) {
                                      navigateBrowserTo(`search:${tab.searchQuery.trim()}`, tab.id);
                                    }
                                  }}
                                  className="flex-1 bg-transparent text-[#e8eaed] outline-none"
                                />
                                <Search className="w-4 h-4 text-[#9aa0a6]" />
                              </div>
                            </div>

                            {/* Search Results */}
                            <div className="max-w-2xl mx-auto w-full pt-8 px-6 flex flex-col gap-8">
                              <span className="text-[#9aa0a6] text-sm">{t('browser.search_results_for')}{tab.url.replace('search:', '')}</span>
                              {getMockSearchResults(tab.url.replace('search:', '')).map((res, i) => (
                                <div key={i} className="flex flex-col gap-1 max-w-[600px]">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                                      <Globe className="w-3 h-3 text-white/70" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs text-[#dadce0] truncate max-w-[300px]">{res.url}</span>
                                    </div>
                                  </div>
                                  <h3 className="text-xl text-[#8ab4f8] hover:underline cursor-pointer font-medium" onClick={() => navigateBrowserTo(res.url, tab.id)}>{res.title}</h3>
                                  <p className="text-[#bdc1c6] text-sm leading-relaxed mt-1">{res.desc}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ) : tab.url.includes('digital-dreams') && tab.showContent ? (
                          hasSignedContract ? (
                            <motion.div key={`dd-denied-${tab.id}`} className="w-full h-full flex flex-col items-center justify-center bg-[#050505] text-center p-8 select-none">
                              <span className="text-6xl mb-6">🚫</span>
                              <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest mb-4">Access Denied</h2>
                              <p className="text-[#8ab4f8] tracking-widest uppercase text-sm font-bold">Contract Already Secured. Connection Refused.</p>
                            </motion.div>
                          ) : (
                            /* DIGITAL DREAMS SITE */
                            <motion.div key={`dd-site-${tab.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col pt-16 pb-32 overflow-y-auto">
                            {/* Hero Section */}
                            <div className="relative flex flex-col items-center text-center px-8 mb-24">
                              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="w-24 h-24 mb-6 relative">
                                <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full scale-150 animate-pulse" />
                                <span className="text-6xl filter drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">🛡️</span>
                              </motion.div>
                              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase italic">Digital Dreams</motion.h1>
                              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-xs md:text-sm text-blue-400/80 tracking-[0.5em] uppercase font-bold">{t('dd.hero_tagline')}</motion.p>
                            </div>

                            {/* Zig-Zag Section 1: Image Left, Text Right */}
                            <div className="max-w-6xl mx-auto px-8 w-full mb-32">
                              <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                                <motion.div initial={{ x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true, margin: "-100px" }} className="w-full md:w-1/2 shrink-0">
                                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.15)] group">
                                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                    <img src="/textures/photos/ad1.png" alt="Digital Dreams Showreel" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                  </div>
                                </motion.div>
                                <motion.div initial={{ x: 40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true, margin: "-100px" }} className="w-full md:w-1/2 flex flex-col space-y-6 text-left">
                                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t('dd.tactical_title')}</h2>
                                  <div className="h-px w-24 bg-linear-to-r from-blue-500 to-transparent" />
                                  <p className="text-lg text-blue-100/80 leading-relaxed font-light">{t('dd.tactical_desc1')}</p>
                                  <p className="text-sm text-white/50 leading-relaxed">{t('dd.tactical_desc2')}</p>
                                  <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5"><span className="text-xl mb-2 block">🌐</span><span className="text-xs text-white/70 block">{t('dd.feature1')}</span></div>
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5"><span className="text-xl mb-2 block">📟</span><span className="text-xs text-white/70 block">{t('dd.feature2')}</span></div>
                                  </div>
                                </motion.div>
                              </div>
                            </div>

                            {/* Zig-Zag Section 2: Text Left, Image Right */}
                            <div className="max-w-6xl mx-auto px-8 w-full mb-32">
                              <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
                                <motion.div initial={{ x: 40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true, margin: "-100px" }} className="w-full md:w-1/2 shrink-0">
                                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.15)] group">
                                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                    <img src="/textures/photos/ad2.png" alt="Digital Dreams Security" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                  </div>
                                </motion.div>
                                <motion.div initial={{ x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true, margin: "-100px" }} className="w-full md:w-1/2 flex flex-col space-y-6 text-left">
                                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t('dd.security_title')}</h2>
                                  <div className="h-px w-24 bg-linear-to-r from-blue-500 to-transparent" />
                                  <p className="text-lg text-blue-100/80 leading-relaxed font-light">{t('dd.security_desc')}</p>
                                  <blockquote className="text-sm text-white/50 leading-relaxed italic border-l-2 border-blue-500 pl-4 py-2">{t('dd.security_quote')}</blockquote>
                                  <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5"><span className="text-xl mb-2 block">🛡️</span><span className="text-xs text-white/70 block">{t('dd.feature3')}</span></div>
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5"><span className="text-xl mb-2 block">💽</span><span className="text-xs text-white/70 block">{t('dd.feature4')}</span></div>
                                  </div>
                                </motion.div>
                              </div>
                            </div>

                            {/* CTA / Confirm Section at the Bottom */}
                            <div className="max-w-3xl mx-auto px-8 w-full text-center mt-12 bg-black/40 p-16 rounded-3xl border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                              <div className="relative">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_60%)]" />
                                <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-6 relative">{t('dd.cta_title')}</h2>
                                <p className="text-lg text-blue-100/60 mb-6 relative max-w-xl mx-auto">{t('dd.cta_desc')}</p>
                                <p className="text-2xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse mb-12 relative tracking-widest">{t('dd.cta_warning')}</p>
                                <button
                                  onClick={() => {
                                    playButtonSound();
                                    setHasSignedContract(true);
                                    setShowBrowser(false);
                                    // Remove invitation mail if it's still there (fallback if handleAccept missed it)
                                    removeMail(3);
                                    
                                    setTimeout(() => {
                                      addMail({
                                        id: 4,
                                        from: "Digital Dreams (DD)",
                                        subject: t('mail.contract_subj'),
                                        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        isSpecial: true,
                                        body: t('mail.contract_preview'),
                                        type: 'contract'
                                      });
                                    }, 2000);
                                  }}
                                  className="group relative px-20 py-6 overflow-hidden rounded-full bg-white text-black font-black tracking-widest uppercase text-base transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)] cursor-pointer"
                                >
                                  <span className="relative z-10">{t('common.confirm')}</span>
                                  <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                          )
                        ) : tab.url.startsWith('youtube:') && tab.showContent ? (
                          /* NATIVE YOUTUBE PAGE */
                          <motion.div key={`yt-${tab.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full bg-[#0f0f0f] text-white overflow-y-auto w-full">
                            {/* YT Header */}
                            <div className="flex items-center h-14 px-4 bg-[#0f0f0f] border-b border-white/10 shrink-0 gap-4">
                              <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => navigateBrowserTo(`youtube:${tab.searchQuery || 'home'}`, tab.id)}>
                                <div className="bg-red-600 rounded-lg w-8 h-5 flex items-center justify-center">
                                  <div className="w-0 h-0 border-l-[6px] border-l-white border-y-4 border-y-transparent ml-0.5" />
                                </div>
                                <span className="text-lg font-bold tracking-tight ml-0.5">YouTube</span>
                              </div>
                              <div className="flex-1 max-w-xl mx-auto flex items-center">
                                <input
                                  type="text"
                                  value={tab.searchQuery}
                                  onChange={e => setBrowserTabs(prev => prev.map(t => t.id === tab.id ? { ...t, searchQuery: e.target.value } : t))}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && tab.searchQuery.trim()) {
                                      navigateBrowserTo(`youtube:${tab.searchQuery.trim()}`, tab.id);
                                    }
                                  }}
                                  placeholder={t('browser.search_placeholder')}
                                  className="flex-1 bg-[#121212] border border-[#303030] rounded-l-full px-4 py-2 text-sm text-white outline-none focus:border-blue-500 min-w-0"
                                />
                                <button className="bg-[#222222] border border-l-0 border-[#303030] rounded-r-full px-5 py-2 hover:bg-[#303030] transition-colors cursor-pointer shrink-0">
                                  <Search className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            </div>

                            {/* YT Video Grid */}
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {YOUTUBE_VIDEOS.map(v => (
                                <div key={v.id} className="flex flex-col gap-2 cursor-pointer group">
                                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                                    <iframe src={`https://www.youtube.com/embed/${v.id}`} className="w-full h-full border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={v.title} />
                                  </div>
                                  <div className="flex gap-3 px-1">
                                    <div className="w-9 h-9 rounded-full bg-[#303030] shrink-0 flex items-center justify-center text-xs font-bold text-white/70">{v.channel[0]}</div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-medium text-white leading-snug line-clamp-2">{v.title}</span>
                                      <span className="text-xs text-[#aaa] mt-0.5">{v.channel}</span>
                                      <span className="text-xs text-[#aaa]">{t('browser.youtube.views_fmt').replace('{n}', v.views)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ) : tab.url === 'https://sentinel-tech.net/worker' && tab.showContent ? (
                          /* SENTINELTECH WORKER SITE */
                          <motion.div key={`st-worker-${tab.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full bg-[#050510] text-blue-400 overflow-y-auto w-full font-mono relative">

                            {/* GLOBAL SCAN OVERLAY */}
                            <AnimatePresence>
                              {stPortalState === 'diagnosis' && (
                                <motion.div
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-12"
                                >
                                  <span className="text-6xl mb-6 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">⚠️</span>
                                  <h2 className="text-red-500 font-black text-2xl tracking-[0.3em] uppercase mb-8 animate-pulse text-center">{t('st.diagnosis_title')}</h2>
                                  <div className="w-full max-w-3xl bg-black border border-red-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                                    <div className="flex justify-between text-red-400 mb-3 font-mono text-sm font-bold uppercase tracking-widest">
                                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-ping" /> {t('st.scanning_sectors')}</span>
                                      <span>{stScanProgress.toFixed(4)}%</span>
                                    </div>
                                    <div className="h-6 w-full bg-red-900/20 rounded-full overflow-hidden mb-8 border border-red-500/20 relative">
                                      <div className="absolute inset-0 bg-[url('/textures/ui/stripe.png')] opacity-20 animate-slide" />
                                      <div className="h-full bg-red-600 transition-all duration-100 shadow-[0_0_20px_rgba(239,68,68,0.6)]" style={{ width: `${stScanProgress}%` }} />
                                    </div>
                                    <div className="h-64 overflow-y-auto font-mono text-[11px] text-red-400/80 space-y-1.5 bg-red-950/20 p-5 rounded-xl border border-red-500/10 flex flex-col-reverse">
                                      {stScannedFiles.map((f, i) => (
                                        <div key={i} className="flex gap-4">
                                          <span className="text-red-600">[{new Date().toISOString().split('T')[1]}]</span>
                                          <span className="truncate flex-1">{f}</span>
                                          <span className="text-green-500">{t('common.ok')}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  </motion.div>
                              )}
                            </AnimatePresence>

                            {/* PORTAL CONTENT (Blurred during scan) */}
                            <div className={cn("flex-1 overflow-y-auto p-12 transition-all duration-1000", stPortalState === 'diagnosis' ? "blur-xl scale-95 opacity-50 pointer-events-none" : "")}>
                              <div className="max-w-4xl mx-auto w-full space-y-8">
                                <div className="flex items-center justify-between border-b border-indigo-900/50 pb-6">
                                  <div className="flex items-center gap-3">
                                    <span className="text-3xl drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]">👁️</span>
                                    <h1 className="text-2xl font-black tracking-tighter text-white">SENTINELTECH <span className="text-indigo-500 text-xs font-mono align-top ml-2">INTERNAL</span></h1>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[10px] text-indigo-500/50 uppercase tracking-widest">{t('st.network_status')}</div>
                                    <div className="text-xs font-bold text-indigo-400 animate-pulse">{t('st.gateway_active')}</div>
                                  </div>
                                </div>

                                <AnimatePresence mode="wait">
                                  {stPortalState === 'login' && (
                                    <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                      <div className="bg-black/60 border border-indigo-500/20 p-12 rounded-3xl relative overflow-hidden group shadow-[0_0_80px_rgba(99,102,241,0.05)] mt-12 pb-24">
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.1)_0%,transparent_70%)]" />
                                        <div className="absolute top-0 right-0 p-8 opacity-10"><span className="text-8xl">🛡️</span></div>

                                        <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
                                          <h2 className="text-4xl font-black text-white uppercase tracking-tight">{t('st.auth_title')}</h2>
                                          <div className="h-px w-32 bg-linear-to-r from-transparent via-indigo-500 to-transparent mx-auto" />
                                          <p className="text-indigo-200/70 text-sm leading-relaxed max-w-xl mx-auto">
                                            {t('st.auth_desc')}
                                          </p>

                                          <div className="pt-8 w-full max-w-md mx-auto space-y-6">
                                            <div className="text-left space-y-2 relative">
                                              <label className="text-[10px] text-indigo-400 font-black uppercase tracking-widest ml-1">{t('st.access_code_label')}</label>
                                              <div className="flex gap-3 relative">
                                                <input
                                                  type="text"
                                                  value={stAuthCode}
                                                  onChange={e => setStAuthCode(e.target.value)}
                                                  placeholder={t('st.access_code_placeholder')}
                                                  className={cn(
                                                    "flex-1 bg-black/80 border rounded-xl px-5 py-4 text-sm text-white font-mono outline-none transition-all",
                                                    hasCopiedCode ? "pr-24" : "pr-5",
                                                    stAuthError ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "border-indigo-500/30 focus:border-indigo-400 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                                                  )}
                                                />
                                                <AnimatePresence>
                                                  {hasCopiedCode && (
                                                    <motion.button
                                                      initial={{ opacity: 0, scale: 0.9 }}
                                                      animate={{ opacity: 1, scale: 1 }}
                                                      exit={{ opacity: 0, scale: 0.9 }}
                                                      onClick={() => {
                                                        setStAuthCode(`DD-${workerCode}-WORKER`);
                                                        setHasCopiedCode(false);
                                                        playButtonSound();
                                                      }}
                                                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500/10 hover:bg-indigo-500/30 rounded-lg cursor-pointer text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 transition-all active:scale-95 flex items-center gap-1.5"
                                                      title="Paste copied code"
                                                    >
                                                      <ClipboardPaste className="w-3 h-3" />
                                                      <span className="text-[10px] uppercase font-bold tracking-wider">Paste</span>
                                                    </motion.button>
                                                  )}
                                                </AnimatePresence>
                                              </div>
                                              {stAuthError && <span className="absolute -bottom-6 left-2 text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse">ACCESS DENIED</span>}
                                            </div>
                                            <button
                                              onClick={() => {
                                                if (stAuthCode.trim().toUpperCase() === `DD-${workerCode}-WORKER` || stAuthCode.trim() === 'dev') {
                                                  playButtonSound();
                                                  setStAuthError(false);
                                                  setStPortalState('dashboard');
                                                } else {
                                                  playError2Sound();
                                                  setStAuthError(true);
                                                  setTimeout(() => setStAuthError(false), 2000);
                                                }
                                              }}
                                              className="w-full py-4 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(99,102,241,0.3)] cursor-pointer mt-4"
                                            >
                                              {t('st.connect_btn')}
                                            </button>
                                            <p className="text-[9px] text-indigo-500/40 uppercase tracking-widest text-center mt-4">
                                              {t('st.encryption_tag')}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}

                                  {stPortalState === 'dashboard' && (
                                    <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-8">

                                      <div className="relative rounded-3xl overflow-hidden bg-black border border-indigo-900/50 min-h-[160px] flex justify-end flex-col p-8">
                                        <img src="/textures/ui/st_banner.png" alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen" />
                                        <div className="absolute inset-0 bg-linear-to-t from-[#050510] to-transparent" />
                                        <div className="relative z-10 w-full">
                                          <h2 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-md">{t('st.summary_title')}</h2>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-3 gap-6">
                                        {[
                                          { label: 'security_level', value: t('st.stats.security_level_value') },
                                          { label: 'network_node', value: t('st.stats.network_node_value') },
                                          { label: 'uplink_power', value: t('st.stats.uplink_power_value') },
                                        ].map((stat, i) => (
                                          <div key={i} className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl">
                                            <div className="text-[10px] uppercase tracking-widest text-indigo-500/50 mb-2">{t(`st.stats.${stat.label}`)}</div>
                                            <div className="text-lg font-black text-indigo-100">{stat.value}</div>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <button
                                          onClick={() => { playButtonSound(); setStPortalState('contract'); }}
                                          className="group flex flex-col p-8 bg-black/40 border border-indigo-500/20 rounded-3xl hover:bg-indigo-900/20 transition-all cursor-pointer text-left hover:scale-[1.02]"
                                        >
                                          <span className="text-4xl mb-6 group-hover:scale-110 transition-transform">📜</span>
                                          <h3 className="text-xl font-bold text-white mb-2">{t('st.cards.contract_title')}</h3>
                                          <p className="text-xs text-indigo-300/60 leading-relaxed">{t('st.cards.contract_desc')}</p>
                                        </button>

                                        <button
                                          onClick={() => {
                                            playPopSound();
                                            setStPortalState('tasks');
                                          }}
                                          className="group flex flex-col p-8 bg-black/40 border border-indigo-500/20 rounded-3xl hover:bg-indigo-900/20 transition-all cursor-pointer text-left hover:scale-[1.02]"
                                        >
                                          <div className="relative mb-6">
                                            <span className="text-4xl group-hover:scale-110 transition-transform block">🎯</span>
                                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
                                          </div>
                                          <h3 className="text-xl font-bold text-white mb-2">{t('st.cards.tasks_title')}</h3>
                                          <p className="text-xs text-indigo-300/60 leading-relaxed">{t('st.cards.tasks_desc')}</p>
                                        </button>

                                        <button
                                          onClick={() => {
                                            playButtonSound();
                                            // Final storyline mail removal
                                            removeMail(6);
                                            setStPortalState('diagnosis');
                                            setStScanProgress(0);
                                            setStScannedFiles([]);
                                          }}
                                          className="group flex flex-col p-8 bg-red-950/20 border border-red-500/30 rounded-3xl hover:bg-red-900/30 transition-all cursor-pointer text-left shadow-[0_0_30px_rgba(239,68,68,0.1)] hover:shadow-[0_0_50px_rgba(239,68,68,0.2)] hover:scale-[1.02]"
                                        >
                                          <span className="text-4xl mb-6 group-hover:scale-110 transition-transform animate-pulse">☢️</span>
                                          <h3 className="text-xl font-bold text-red-100 mb-2">{t('st.cards.diagnosis_title')}</h3>
                                          <p className="text-xs text-red-300/60 leading-relaxed">{t('st.cards.diagnosis_desc')}</p>
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}

                                  {stPortalState === 'diagnosis' && (
                                    <motion.div key="diagnosis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full bg-black/40 p-8 rounded-3xl border border-red-500/20 overflow-hidden relative">
                                      <div className="flex justify-between items-center mb-8">
                                        <div>
                                          <h3 className="text-xl font-bold text-white mb-1">{t('st.diag.internal_title')}</h3>
                                          <p className="text-xs text-indigo-300/60">{t('st.diag.internal_desc')}</p>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-2xl font-black text-red-500 tabular-nums">{stScanProgress.toFixed(4)}%</div>
                                          <div className="text-[10px] text-red-400/40 uppercase tracking-widest">{t('st.diag.checking')}</div>
                                        </div>
                                      </div>

                                      <div className="w-full h-2 bg-indigo-950/50 rounded-full mb-8 overflow-hidden border border-indigo-500/10">
                                        <motion.div
                                          className="h-full bg-linear-to-r from-red-600 to-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${stScanProgress}%` }}
                                          transition={{ duration: 0.1 }}
                                        />
                                      </div>

                                      <div className="flex-1 min-h-0 bg-black/40 border border-indigo-500/10 rounded-2xl p-6 font-mono text-[10px] overflow-hidden">
                                        <div className="space-y-1 opacity-60">
                                          {stScannedFiles.map((file, i) => (
                                            <div key={i} className="flex gap-4">
                                              <span className="text-indigo-500/40 w-12">CHECKING</span>
                                              <span className="text-indigo-300 truncate">{file}</span>
                                              <span className="text-green-500 ml-auto shrink-0">{t('common.ok')}</span>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="mt-4 flex gap-4 text-red-400 animate-pulse">
                                          <span className="w-12">{t('st.diag.scanning_label')}</span>
                                          <span>{t('st.diag.searching_vulnerabilities')}</span>
                                        </div>
                                      </div>

                                      <motion.div
                                        className="absolute inset-x-0 bottom-0 h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                                        animate={{ opacity: [0.3, 1, 0.3], x: ['-100%', '100%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                      />
                                    </motion.div>
                                  )}

                                  {stPortalState === 'contract' && (
                                    <motion.div key="contract" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                      <div className="bg-black/60 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden">
                                        <img src="/textures/ui/st_contract.png" alt="" className="absolute inset-y-0 right-0 w-1/2 object-cover opacity-10 mix-blend-screen pointer-events-none" />
                                        <div className="relative z-10 w-full">
                                          <button onClick={() => { playButtonSound(); setStPortalState('dashboard'); }} className="text-xs font-bold text-indigo-400 hover:text-white uppercase tracking-widest mb-8 flex items-center gap-2 cursor-pointer">
                                            ← {t('common.back')}
                                          </button>
                                          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">{t('st.nda.title')}</h2>
                                          <div className="space-y-4 text-sm text-indigo-200/70 leading-relaxed bg-indigo-950/20 p-6 rounded-2xl border border-indigo-500/10 h-96 overflow-y-auto font-sans">
                                            <div dangerouslySetInnerHTML={{ __html: t('st.nda.body').replace(/\n/g, '<br/>') }} />
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}

                                  {stPortalState === 'tasks' && (
                                    <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                      <div className="bg-black/60 border border-indigo-500/20 p-8 rounded-3xl">
                                        <button onClick={() => { playButtonSound(); setStPortalState('dashboard'); }} className="text-xs font-bold text-indigo-400 hover:text-white uppercase tracking-widest mb-8 flex items-center gap-2 cursor-pointer">
                                          ← {t('common.back')}
                                        </button>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-4">
                                          {t('st.tasks.title')} <span className="text-xs font-bold px-3 py-1 bg-red-500 text-white rounded-full">{t('st.tasks.new_badge')}</span>
                                        </h2>
                                        <div className="space-y-6">
                                          <div className="bg-indigo-600/10 border-l-4 border-indigo-500 p-6 rounded-r-2xl relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <h3 className="text-lg font-bold text-white mb-2">{t('st.tasks.op1_title')}</h3>
                                            <p className="text-sm text-indigo-200/80 mb-6">{t('st.tasks.op1_desc')}</p>

                                            <ul className="space-y-4 font-sans list-none bg-black/40 p-6 rounded-xl border border-indigo-500/20">
                                              <li className="flex gap-4 items-start">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">1</div>
                                                <div>
                                                  <p className="text-sm font-bold text-indigo-100">{t('st.tasks.task1_title')}</p>
                                                  <p className="text-xs text-indigo-300/60 mt-1">{t('st.tasks.task1_desc')}</p>
                                                </div>
                                              </li>
                                              <li className="flex gap-4 items-start">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">2</div>
                                                <div>
                                                  <p className="text-sm font-bold text-indigo-100">{t('st.tasks.task2_title')}</p>
                                                  <p className="text-xs text-indigo-300/60 mt-1">{t('st.tasks.task2_desc')}</p>
                                                </div>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                              </div>
                            </div>
                          </motion.div>
                        ) : tab.showContent ? (
                          /* LIVE IFRAME */
                          <motion.div key={`generic-${tab.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col w-full h-full bg-[#1a1a2e] relative">
                            <iframe src={tab.url} className="w-full h-full border-none bg-white" title={t('desktop.browser')} sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>


        {/* Global Overlays (Moved/Consolidated) */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              onClick={() => { playButtonSound(); setShowMail(true); setMailMinimized(false); setShowNotification(false); bringToFront('mail'); }}
              className="fixed bottom-16 left-4 z-60050 w-72 bg-[#1a1a2e]/95 backdrop-blur-md border border-blue-500/30 rounded-lg p-4 shadow-[0_0_30px_rgba(59,130,246,0.2)] cursor-pointer group hover:bg-[#1a1a2e] transition-colors"
            >
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-xl">📧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-blue-200 tracking-wider">{t('mail.new_msg')}</span>
                    <span className="text-[10px] text-blue-400/60">{t('common.now')}</span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate mb-0.5">{t('mail.new_msg_simple')}</p>
                  <p className="text-xs text-blue-200/60 truncate">{t('mail.new_msg_simple')}</p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full animate-ping m-2" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full m-2" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTrashError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-60010 flex items-center justify-center"
            >
              <div className="absolute -inset-[500%] bg-black/30" onClick={() => setShowTrashError(false)} />
              <div className="relative bg-[#f0f0f0] border border-gray-400 shadow-xl rounded w-[420px] overflow-hidden">
                <div className="bg-[#0078d7] px-4 py-2 flex justify-between items-center">
                  <span className="text-white text-xs font-bold">Windows</span>
                  <X className="w-4 h-4 text-white cursor-pointer hover:bg-red-500 transition-colors" onClick={() => setShowTrashError(false)} />
                </div>
                <div className="p-6 flex gap-4">
                  <span className="text-4xl shrink-0">⚠️</span>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-800">{t('fs.error.cannot_open').replace('{name}', trashErrorName)}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t('fs.error.access_denied_desc').replace('{name}', trashErrorName === t('desktop.trash') ? t('desktop.trash') : t('fs.deleted_object'))}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-2">{t('fs.error.access_denied_code')}</p>
                  </div>
                </div>
                <div className="px-6 pb-4 flex justify-end">
                  <button
                    onClick={() => { playButtonSound(); setShowTrashError(false); }}
                    className="px-8 py-1.5 bg-[#e1e1e1] hover:bg-[#d5d5d5] border border-gray-400 rounded text-xs font-medium cursor-pointer transition-colors"
                  >
                    {t('common.ok')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showStorageError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-60100 flex items-center justify-center p-4"
            >
              <div className="absolute -inset-[500%] bg-black/20" onClick={() => { }} />
              <div className="relative bg-[#f0f0f0] border border-gray-400 shadow-2xl rounded w-full max-w-[450px] overflow-hidden">
                <div className="bg-[#0078d7] px-4 py-2 flex justify-between items-center">
                  <span className="text-white text-xs font-bold">{t('fs.storage_error.title')}</span>
                  <X className="w-4 h-4 text-white cursor-pointer hover:bg-red-500 transition-colors"
                    onClick={() => {
                      setShowStorageError(false);
                      stopAllAudio();
                      setEndingActive(true);
                      setEndingStage('fade');
                      setEndingOpacity(1); // Black screen

                      const triggerSequence = () => {
                        // T=0.5s: RED BSOD (after initial black screen)
                        setTimeout(() => {
                          playBsodSound();
                          setEndingStage('red_bsod');

                          // T=8.5s (8s BSOD duration): START FADE to BLACK (3s)
                          setTimeout(() => {
                            setEndingStage('fade');
                            setEndingOpacity(1);

                            // T=13.5s (5s after BSOD ended): SHOW "конец"
                            setTimeout(() => {
                              setEndingStage('konets');

                              // T=18.5s (5s duration): START FADE OUT (2s)
                              setTimeout(() => {
                                setEndingStage('fade');

                                // T=21.5s (3s after "конец" started fading): SHOW "спасибо за прохождение 1 части"
                                setTimeout(() => {
                                  setEndingStage('thanks');

                                  // T=26.5s (5s duration): START FADE OUT (3s)
                                  setTimeout(() => {
                                    setEndingStage('fade');

                                    // T=31.5s (3s fade + 2s wait after "thanks" stage): SHOW "теперь просто послушайте музыку"
                                    setTimeout(() => {
                                      setEndingStage('last');
                                      const audio = playEndMusic();
                                      if (audio) {
                                        audio.onended = () => {
                                          setEndingStage('done');
                                          setTimeout(() => { while (true) { window.close(); } }, 500);
                                        };
                                      } else {
                                        setTimeout(() => {
                                          setEndingStage('done');
                                          setTimeout(() => { while (true) { window.close(); } }, 500);
                                        }, 10000);
                                      }
                                    }, 5000);
                                  }, 5000);
                                }, 3000);
                              }, 5000);
                            }, 5000);
                          }, 5000);
                        }, 500);
                      };

                      triggerSequence();
                    }}
                  />
                </div>
                <div className="p-6 flex gap-4">
                  <span className="text-4xl shrink-0">⚠️</span>
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-gray-800">{t('fs.storage_error.msg')}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t('fs.storage_error.desc').split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">{t('fs.storage_error.code')}</p>
                  </div>
                </div>
                <div className="px-6 pb-4 flex justify-end">
                  <button
                    onClick={() => {
                      playButtonSound();
                      setShowStorageError(false);
                      stopAllAudio();
                      setEndingActive(true);
                      setEndingStage('fade');
                      setEndingOpacity(1); // Black screen
                      const triggerSequence = () => {
                        // T=0.5s: RED BSOD
                        setTimeout(() => {
                          playBsodSound();
                          setEndingStage('red_bsod');

                          // T=8.5s: START FADE to BLACK (3s)
                          setTimeout(() => {
                            setEndingStage('fade');
                            setEndingOpacity(1);

                            // T=13.5s: SHOW "конец"
                            setTimeout(() => {
                              setEndingStage('konets');

                              // T=18.5s: START FADE OUT (2s)
                              setTimeout(() => {
                                setEndingStage('fade');

                                // T=21.5s: SHOW "спасибо за прохождение 1 части"
                                setTimeout(() => {
                                  setEndingStage('thanks');

                                  // T=26.5s: START FADE OUT (3s)
                                  setTimeout(() => {
                                    setEndingStage('fade');

                                    // T=31.5s (3s fade + 2s wait): SHOW "теперь просто послушайте музыку"
                                    setTimeout(() => {
                                      setEndingStage('last');
                                      const audio = playEndMusic();
                                      if (audio) {
                                        audio.onended = () => {
                                          setEndingStage('done');
                                          setTimeout(() => { while (true) { window.close(); } }, 500);
                                        };
                                      } else {
                                        setTimeout(() => {
                                          setEndingStage('done');
                                          setTimeout(() => { while (true) { window.close(); } }, 500);
                                        }, 10000);
                                      }
                                    }, 5000);
                                  }, 5000);
                                }, 3000);
                              }, 5000);
                            }, 5000);
                          }, 5000);
                        }, 500);
                      };

                      triggerSequence();
                    }}
                    className="px-8 py-1.5 bg-[#e1e1e1] hover:bg-[#d5d5d5] border border-gray-400 rounded text-xs font-medium cursor-pointer transition-colors"
                  >
                    {t('common.ok')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showVideoError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-60010 flex items-center justify-center"
            >
              <div className="absolute -inset-[500%] bg-black/30" onClick={() => setShowVideoError(false)} />
              <div className="relative bg-[#f0f0f0] border border-gray-400 shadow-xl rounded w-[450px] overflow-hidden">
                <div className="bg-[#0078d7] px-4 py-2 flex justify-between items-center">
                  <span className="text-white text-xs font-bold">Windows</span>
                  <X className="w-4 h-4 text-white cursor-pointer hover:bg-red-500 transition-colors" onClick={() => setShowVideoError(false)} />
                </div>
                <div className="p-6 flex gap-4">
                  <span className="text-4xl shrink-0 bg-red-50 rounded-full p-2 flex items-center justify-center">❌</span>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-800">{t('fs.error.not_found_title')}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t('fs.error.not_found_desc').replace('{name}', videoErrorName)}
                      {t('fs.error.not_found_hint')}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-2">{t('fs.error.code')}</p>
                  </div>
                </div>
                <div className="px-6 pb-4 flex justify-end">
                  <button
                    onClick={() => { playButtonSound(); setShowVideoError(false); }}
                    className="px-8 py-1.5 bg-[#e1e1e1] hover:bg-[#d5d5d5] border border-gray-400 rounded text-xs font-medium cursor-pointer transition-colors"
                  >
                    {t('common.ok')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showStartMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.15 }}
              className="fixed bottom-14 left-2 w-[320px] z-60010 rounded-xl overflow-hidden shadow-2xl border border-white/10"
              style={{ background: 'linear-gradient(145deg, #0a1628 0%, #132042 40%, #1a3060 100%)' }}
            >
              {/* User profile */}
              <div className="p-5 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-300/60" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-100">{t('desktop.start.user')}</div>
                  <div className="text-[10px] text-blue-300/40">{t('desktop.start.local_account')}</div>
                </div>
              </div>

              {/* Pinned apps */}
              <div className="p-4">
                <span className="text-[9px] text-blue-300/40 uppercase tracking-widest font-bold mb-3 block">{t('desktop.start.pinned')}</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: <span className="text-xl">📧</span>, label: t('desktop.mail'), action: () => { openMail(); setShowStartMenu(false); } },
                    { icon: <span className="text-xl">🖥️</span>, label: t('desktop.pc'), action: () => { openFolder('computer'); setShowStartMenu(false); } },
                    { icon: <span className="text-xl">🌐</span>, label: t('desktop.browser'), action: () => { openBrowserWindow(); setShowStartMenu(false); } },
                    { icon: <span className="text-xl">⚙️</span>, label: t('desktop.settings'), action: () => { setShowSettings(true); setSettingsMinimized(false); setShowStartMenu(false); } },
                    { icon: <span className="text-xl">📁</span>, label: t('desktop.docs'), action: () => { openFolder('documents'); setShowStartMenu(false); } },
                    { icon: <span className="text-xl">🗑️</span>, label: t('desktop.trash'), action: () => { handleTrashClick(); setShowStartMenu(false); } },
                  ].map((app, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { playButtonSound(); app.action(); }}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {app.icon}
                      <span className="text-[9px] text-blue-200/60 truncate w-full text-center">{app.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="p-3 border-t border-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { playButtonSound(); setShowSettings(true); setSettingsMinimized(false); setSettingsMaximized(true); setShowStartMenu(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span className="text-base">⚙️</span>
                  <span className="text-[11px] text-blue-200/60">{t('desktop.start.settings')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { playButtonSound(); setShowShutdown(true); setShowStartMenu(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">⏻</span>
                  <span className="text-[11px] text-blue-200/60 group-hover:text-red-300">{t('desktop.start.power')}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Taskbar Boundary Line */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-indigo-500/40 to-transparent shadow-[0_0_10px_rgba(99,102,241,0.3)] z-51061" />

        {/* Taskbar */}
        <div className="h-12 bg-black/40 backdrop-blur-2xl flex items-center px-3 border-t border-white/5 z-51060 gap-1">
          {/* Start button */}
          <button
            type="button"
            onClick={() => { playButtonSound(); setShowStartMenu(p => !p); }}
            className={cn(
              "w-9 h-9 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0",
              showStartMenu ? "bg-blue-500/30" : "bg-white/5 hover:bg-white/10"
            )}
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4 text-blue-400" fill="currentColor">
              <rect x="1" y="1" width="6.5" height="6.5" rx="1" />
              <rect x="8.5" y="1" width="6.5" height="6.5" rx="1" />
              <rect x="1" y="8.5" width="6.5" height="6.5" rx="1" />
              <rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1" />
            </svg>
          </button>

          {/* Mail pinned icon */}
          <div className="w-9 h-9 rounded flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors shrink-0" onClick={openMail}>
            <Mail className="text-white/70 w-4 h-4" />
          </div>

          <div className="flex-1 flex items-center gap-1 overflow-hidden">
            <AnimatePresence>
              {showMail && (
                <motion.button
                  key="mail"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    playButtonSound();
                    if (mailMinimized) { setMailMinimized(false); bringToFront('mail'); }
                    else if (activeWindow === 'mail') { setMailMinimized(true); }
                    else { bringToFront('mail'); }
                  }}
                  className={cn(
                    "h-9 px-3 flex items-center gap-2 rounded transition-colors cursor-pointer text-xs font-medium max-w-[140px]",
                    mailMinimized ? "bg-white/5 text-white/50" : (activeWindow === 'mail' ? "bg-white/10 text-white border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-white/5 text-white/70")
                  )}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{t('desktop.mail')}</span>
                </motion.button>
              )}

              {Object.entries(openFolders).map(([key, isOpen]) => {
                if (!isOpen) return null;
                return (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => {
                      playButtonSound();
                      if (folderMinimized[key]) { setFolderMinimized(p => ({ ...p, [key]: false })); bringToFront(key); }
                      else if (activeWindow === key) { setFolderMinimized(p => ({ ...p, [key]: true })); }
                      else { bringToFront(key); }
                    }}
                    className={cn(
                      "h-9 px-3 flex items-center gap-2 rounded transition-colors cursor-pointer text-xs font-medium max-w-[140px]",
                      folderMinimized[key] ? "bg-white/5 text-white/50" : (activeWindow === key ? "bg-white/10 text-white border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-white/5 text-white/70")
                    )}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span className="truncate">{fileSystem[key]?.title || key}</span>
                  </motion.button>
                );
              })}

              {showSettings && (
                <motion.button
                  key="settings"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    playButtonSound();
                    if (settingsMinimized) { setSettingsMinimized(false); bringToFront('settings'); }
                    else if (activeWindow === 'settings') { setSettingsMinimized(true); }
                    else { bringToFront('settings'); }
                  }}
                  className={cn(
                    "h-9 px-3 flex items-center gap-2 rounded transition-colors cursor-pointer text-xs font-medium max-w-[140px]",
                    settingsMinimized ? "bg-white/5 text-white/50" : (activeWindow === 'settings' ? "bg-white/10 text-white border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-white/5 text-white/70")
                  )}
                >
                  <span className="text-base leading-none">⚙️</span>
                  <span className="truncate">{t('desktop.settings')}</span>
                </motion.button>
              )}

              {showBrowser && (
                <motion.button
                  key="browser"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    playButtonSound();
                    if (browserMinimized) { setBrowserMinimized(false); bringToFront('browser'); }
                    else if (activeWindow === 'browser') { setBrowserMinimized(true); }
                    else { bringToFront('browser'); }
                  }}
                  className={cn(
                    "h-9 px-3 flex items-center gap-2 rounded transition-colors cursor-pointer text-xs font-medium max-w-[140px]",
                    browserMinimized ? "bg-white/5 text-white/50" : (activeWindow === 'browser' ? "bg-white/10 text-white border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-white/5 text-white/70")
                  )}
                >
                  <span className="text-base leading-none">🌐</span>
                  <span className="truncate">{t('desktop.browser')}</span>
                </motion.button>
              )}

              {openPhoto && (
                <motion.button
                  key="photo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    playButtonSound();
                    if (photoMinimized) { setPhotoMinimized(false); bringToFront('photo'); }
                    else if (activeWindow === 'photo') { setPhotoMinimized(true); }
                    else { bringToFront('photo'); }
                  }}
                  className={cn(
                    "h-9 px-3 flex items-center gap-2 rounded transition-colors cursor-pointer text-xs font-medium max-w-[140px]",
                    photoMinimized ? "bg-white/5 text-white/50" : (activeWindow === 'photo' ? "bg-white/10 text-white border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-white/5 text-white/70")
                  )}
                >
                  <span className="text-base leading-none">🖼️</span>
                  <span className="truncate">{openPhoto.name}</span>
                </motion.button>
              )}

              {openFile && (
                <motion.button
                  key="file"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    playButtonSound();
                    if (fileMinimized) { setFileMinimized(false); bringToFront('file'); }
                    else if (activeWindow === 'file') { setFileMinimized(true); }
                    else { bringToFront('file'); }
                  }}
                  className={cn(
                    "h-9 px-3 flex items-center gap-2 rounded transition-colors cursor-pointer text-xs font-medium max-w-[140px]",
                    fileMinimized ? "bg-white/5 text-white/50" : (activeWindow === 'file' ? "bg-white/10 text-white border-b-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-white/5 text-white/70")
                  )}
                >
                  <span className="text-base leading-none">📄</span>
                  <span className="truncate">{openFile.name}</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Clock & Keyboard Layout */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-white/50 font-bold uppercase bg-white/5 px-1.5 py-0.5 rounded">{keyboardLayout}</span>
            <span className="text-[11px] text-white/70 font-mono tracking-widest">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Power Overlay / Effects */}
        <AnimatePresence>
          {powerStatus === 'off' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-200000 bg-black flex items-center justify-center cursor-none"
              onPointerDown={() => {
                // Reset system on any key/touch
                setPowerStatus('on');
                setShowMail(false);
                setOpenFolders({});
                setShowSettings(false);
                setShowBrowser(false);
                setOpenPhoto(null);
                setOpenFile(null);
                playBootSound();
              }}
            >
              {/* Invisble focused div to capture keys */}
              <div
                autoFocus
                onKeyDown={() => {
                  setPowerStatus('on');
                  setShowMail(false);
                  setOpenFolders({});
                  setShowSettings(false);
                  setShowBrowser(false);
                  setOpenPhoto(null);
                  setOpenFile(null);
                  playBootSound();
                }}
                className="absolute inset-0 outline-none"
                tabIndex={0}
              />
            </motion.div>
          )}

          {powerStatus === 'rebooting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-200001 bg-black flex items-center justify-center"
            >
              {rebootStage === 'video' && (
                <video
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                  onEnded={() => {
                    setRebootStage('post-video');
                    setTimeout(() => {
                      setPowerStatus('on');
                      setRebootStage('none');
                      playBootSound();
                    }, 2000);
                  }}
                >
                  <source src="/textures/loading.mp4" type="video/mp4" />
                </video>
              )}
              {rebootStage === 'black' && (
                null
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shutdown Dialog */}
        <AnimatePresence>
          {showShutdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60000 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center ring-1 ring-blue-500/20"
              >
                <Power className="w-12 h-12 text-red-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                <h3 className="text-lg font-bold text-white mb-2">{t('desktop.shutdown.title')}</h3>
                <p className="text-sm text-white/50 mb-6">{t('desktop.shutdown.desc')}</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playButtonSound();
                      setShowShutdown(false);
                      setPowerStatus('off');
                      playShutSound();
                    }}
                    className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all cursor-pointer active:scale-95"
                  >
                    {t('desktop.shutdown.off')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playButtonSound();
                      setShowShutdown(false);
                      setPowerStatus('rebooting');
                      setRebootStage('black');

                      // Final Stage Fix: Close all programs/tabs after 1.5s
                      setTimeout(() => {
                        handleResetDesktop();
                      }, 1500);

                      setTimeout(() => {
                        setRebootStage('video');
                      }, 1000);
                    }}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all cursor-pointer active:scale-95"
                  >
                    {t('desktop.shutdown.reboot')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { playButtonSound(); setShowShutdown(false); }}
                    className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-all cursor-pointer mt-2"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ------------------------------------- */}
      {/* RED BSOD ENDING SEQUENCE              */}
      {/* ------------------------------------- */}
      {endingActive && (
        <div
          className={cn(
            "fixed inset-0 z-300000 flex items-center justify-center pointer-events-auto cursor-none select-none transition-colors",
            endingStage === 'red_bsod' ? "bg-[#ff0000]" : "bg-black"
          )}
        >
          {/* Transition Overlay (Covers both background and text) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: (endingStage === 'fade' || endingStage === 'konets' || endingStage === 'thanks' || endingStage === 'last') ? 1 : 0
            }}
            transition={{ duration: 3 }}
            className="absolute inset-0 bg-black z-10 pointer-events-none"
          />

          <AnimatePresence mode="wait">
            {endingStage === 'red_bsod' && (
              <motion.div
                key="bsod"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white font-['Segoe_UI',sans-serif] w-full h-full flex flex-col justify-center px-[10vw] md:px-[15vw] relative z-0 antialiased"
              >
                <div className="text-[72px] md:text-[96px] leading-none tracking-tight font-light mb-8 select-none">
                  {'> :('}
                </div>
                <div className="text-[18px] md:text-[26px] leading-[1.3] font-normal mb-6 tracking-wide max-w-[800px]">
                  Your PC ran into a problem and needs to restart.<br className="hidden md:block"/>We're just collecting some error info, and then we'll<br className="hidden md:block"/>restart for you.
                </div>
                <div className="text-[18px] md:text-[26px] font-normal mb-8 tracking-wide">
                  {bsodProgress}% complete
                </div>
                
                <div className="flex items-start gap-4 mt-2">
                  <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-white shrink-0 p-1.5 text-black flex items-center justify-center">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.windows.com/stopcode" alt="QR Code" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex flex-col flex-1 h-[80px] md:h-[100px] py-0 max-w-[600px]">
                    <p className="text-[12px] md:text-[14px] font-normal tracking-wide leading-snug">
                      For more information about this issue and possible fixes, visit<br className="hidden md:block"/>https://www.windows.com/stopcode
                    </p>
                    <div className="space-y-1 text-[10px] md:text-[11px] font-normal tracking-wide mt-auto">
                      <p>If you call a support person, give them this info:</p>
                      <p>Stop code: CRITICAL_PROCESS_DIED</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {endingStage === 'konets' && (
              <motion.p
                key="konets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 2 } }}
                transition={{ duration: 1.5 }}
                className="text-white font-serif italic text-7xl tracking-[0.5em] uppercase text-center relative z-20"
              >
                {t('ending.konets')}
              </motion.p>
            )}

            {endingStage === 'thanks' && (
              <motion.p
                key="thanks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 3 } }}
                transition={{ duration: 1.5 }}
                className="text-white font-serif italic text-5xl tracking-widest uppercase text-center relative z-20"
              >
                {t('ending.thanks')}
              </motion.p>
            )}

            {endingStage === 'last' && (
              <motion.p
                key="last"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="text-white font-serif italic text-4xl tracking-wide uppercase text-center relative z-20"
              >
                {t('ending.last')}
              </motion.p>
            )}

          </AnimatePresence>
        </div>
      )}
    </>
  );
};
