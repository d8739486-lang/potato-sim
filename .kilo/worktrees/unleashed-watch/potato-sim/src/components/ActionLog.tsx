import { useEffect, useState } from 'react';
import { useGameStore, type LogEntry } from '../store/gameStore';
import { cn } from '../utils';

export default function ActionLog() {
  const logs = useGameStore(state => state.logs);
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Show only the 5 most recent logs
    setVisibleLogs(logs.slice(0, 5));
    
    // Auto-remove logs after 3 seconds
    const timer = setTimeout(() => {
      setVisibleLogs(prev => prev.filter(log => Date.now() - log.timestamp < 3000));
    }, 3000);

    return () => clearTimeout(timer);
  }, [logs]);

  // Keep re-evaluating which logs should disappear
  useEffect(() => {
    if (visibleLogs.length === 0) return;
    const interval = setInterval(() => {
      setVisibleLogs(prev => prev.filter(log => Date.now() - log.timestamp < 3000));
    }, 500);
    return () => clearInterval(interval);
  }, [visibleLogs]);

  if (visibleLogs.length === 0) return null;

  return (
    <div className="fixed bottom-32 right-4 z-50 flex flex-col gap-2 pointer-events-none items-end">
      {visibleLogs.map((log) => (
        <div
          key={log.id}
          className={cn(
            "px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg text-white font-bold text-sm sm:text-base animate-slide-up transition-all",
            log.type === 'success' && "bg-green-500/40 border-green-400/50",
            log.type === 'info' && "bg-black/50 border-white/10",
            log.type === 'warning' && "bg-amber-500/40 border-amber-400/50",
            log.type === 'error' && "bg-red-500/40 border-red-400/50",
          )}
        >
          {log.message}
        </div>
      ))}
    </div>
  );
}
