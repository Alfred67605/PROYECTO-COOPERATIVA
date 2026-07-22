import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PageTransition } from '../ui/PageTransition';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isReadOnly = user?.permisos?.some((p: any) => p.nombre === 'solo_lectura');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex relative z-0">
      <AnimatedBackground />
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />
      
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-64' : 'ml-20')
        }`}
      >
        <Topbar 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {isReadOnly && (
          <div className="bg-red-500/10 border-y border-red-500/20 px-6 py-3 flex items-center justify-center gap-3 text-red-400 text-sm font-semibold select-none bg-black/40 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse"></span>
            <span>Este usuario está en modo Solo Lectura. No podrá realizar ningún cambio en el sistema. Comuníquese con el administrador.</span>
          </div>
        )}
        
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden relative">
          <PageTransition key={location.pathname}>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
};
