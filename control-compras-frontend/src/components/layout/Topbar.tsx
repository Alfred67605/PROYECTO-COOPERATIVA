import { useState, useEffect } from 'react';
import { Menu, ChevronRight, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, getDefaultRedirect } from '../../features/auth/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export const Topbar = ({ onMenuClick, isSidebarOpen }: TopbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, canAccess } = useAuth();

  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = segments.length > 0
    ? segments.map(s => s.charAt(0).toUpperCase() + s.slice(1))
    : ['Dashboard'];

  const defaultRedirect = user ? getDefaultRedirect(user, canAccess) : '/dashboard';
  const showBackButton = 
    location.pathname !== '/login' && 
    location.pathname !== '/' && 
    location.pathname !== '/dashboard' && 
    location.pathname !== defaultRedirect;

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="h-20 bg-obsidian-900/40 dark:bg-obsidian-900/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-mining-400 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center"
          title={isSidebarOpen ? "Colapsar menú" : "Expandir menú"}
        >
          <Menu size={24} />
        </button>

        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-mining-400 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-1 group/back animate-fade-in"
            title="Atrás"
          >
            <ArrowLeft size={20} className="group-hover/back:-translate-x-0.5 transition-transform" />
          </button>
        )}
        
        <div className="flex items-center text-lg tracking-wide ml-1">
          {breadcrumbItems.map((item, index) => (
            <div key={index + item} className="flex items-center">
              {index > 0 && <ChevronRight size={16} className="mx-1.5 text-mining-500" />}
              <motion.span
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className={index === breadcrumbItems.length - 1 ? "text-white font-bold" : "text-mining-400 font-medium text-base"}
              >
                {item}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-mining-400 uppercase tracking-widest hidden md:inline">Tema</span>
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-16 h-8 rounded-full bg-slate-200 dark:bg-black/30 border border-slate-300 dark:border-white/10 p-0.5 relative flex items-center cursor-pointer transition-all duration-300 focus:outline-none hover:border-slate-400 dark:hover:border-white/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08),_0_1px_0_rgba(255,255,255,0.05)]"
            aria-label="Toggle theme"
          >
            <div
              className="w-7 h-7 rounded-full bg-gradient-to-br from-copper-500 to-copper-600 flex items-center justify-center text-white shadow-glow-copper transition-all duration-300 ease-in-out absolute"
              style={{
                transform: isDark ? 'translateX(30px)' : 'translateX(0px)',
                left: '2px'
              }}
            >
              {isDark ? <Moon size={14} /> : <Sun size={14} />}
            </div>
            <div className="w-full flex justify-between px-1.5 text-sm select-none pointer-events-none">
              <span>☀️</span>
              <span>🌙</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
