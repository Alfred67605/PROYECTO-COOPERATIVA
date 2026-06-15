import { Bell, Search, Menu, ChevronRight } from 'lucide-react';
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

  return (
    <header className="h-20 bg-obsidian-900/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-all">
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
        <div className="relative hidden md:block group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mining-500 group-focus-within:text-teal-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar en el sistema..." 
            className="pl-10 pr-12 py-2.5 bg-obsidian-800/50 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-obsidian-800 w-64 lg:w-80 transition-all placeholder:text-mining-600 text-mining-100 shadow-glass-inset"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden lg:inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold text-mining-500 bg-white/5 border border-white/10 rounded">⌘</kbd>
            <kbd className="hidden lg:inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold text-mining-500 bg-white/5 border border-white/10 rounded">K</kbd>
          </div>
        </div>
        
        <button className="md:hidden p-2 rounded-xl text-mining-400 hover:bg-white/5 transition-colors">
          <Search size={20} />
        </button>
        
        <div className="w-px h-6 bg-white/10 hidden md:block"></div>
        
        <button className="relative p-2 rounded-xl text-mining-400 hover:bg-white/5 hover:text-white transition-colors group">
          <Bell size={22} className="group-hover:animate-wiggle" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-copper-500 rounded-full border-2 border-obsidian-900 animate-pulse shadow-[0_0_8px_rgba(234,119,64,0.8)]"></span>
        </button>
      </div>
    </header>
  );
};
