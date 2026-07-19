import { useState, useEffect } from 'react';
import { Menu, ChevronRight, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TopbarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

export const Topbar = ({ onMenuClick, isMobile }: TopbarProps) => {
  const location = useLocation();
  const pathName = location.pathname.split('/')[1] || 'Dashboard';
  const title = pathName.charAt(0).toUpperCase() + pathName.slice(1);

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
      <div className="flex items-center gap-4">
        {isMobile && (
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-xl text-mining-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        
        <div className="flex items-center text-sm font-medium text-mining-500 hidden sm:flex">
          <span>Minera Cop</span>
          <ChevronRight size={14} className="mx-2" />
          <motion.span 
            key={title}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-bold tracking-wide"
          >
            {title}
          </motion.span>
        </div>
        
        {/* Mobile title */}
        <div className="sm:hidden font-bold text-white text-lg tracking-wide">
          {title}
        </div>
      </div>
      
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-mining-500 uppercase tracking-widest hidden md:inline">Tema</span>
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-12 h-6.5 rounded-full bg-black/10 dark:bg-black/30 border border-black/10 dark:border-white/5 p-0.5 relative flex items-center cursor-pointer transition-all duration-300 focus:outline-none hover:border-black/20 dark:hover:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1),_0_1px_0_rgba(255,255,255,0.05)]"
            aria-label="Toggle theme"
          >
            <div
              className="w-5.5 h-5.5 rounded-full bg-gradient-to-br from-copper-500 to-copper-600 flex items-center justify-center text-white shadow-glow-copper transition-all duration-300 absolute"
              style={{
                transform: isDark ? 'translateX(20px)' : 'translateX(0px)',
                left: '2px'
              }}
            >
              {isDark ? <Moon size={11} /> : <Sun size={11} />}
            </div>
            <div className="w-full flex justify-between px-2 text-[9px] text-mining-500 font-bold select-none pointer-events-none">
              <span>☀️</span>
              <span>🌙</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
