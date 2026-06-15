import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Building2,
  LogOut,
  Settings,
  Activity,
  Pickaxe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

export const Sidebar = ({ isOpen, setIsOpen, isMobile }: SidebarProps) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.rol?.nombre === 'Administrador General';

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, reqAdmin: false },
    { name: 'Bocaminas', path: '/bocaminas', icon: <Settings size={20} />, reqAdmin: true },
    { name: 'Proveedores', path: '/proveedores', icon: <Building2 size={20} />, reqAdmin: true },
    { name: 'Materiales', path: '/inventario', icon: <Package size={20} />, reqAdmin: false },
    { name: 'Compras', path: '/compras', icon: <ShoppingCart size={20} />, reqAdmin: false },
    { name: 'Reportes', path: '/reportes', icon: <Activity size={20} />, reqAdmin: false },
    { name: 'Usuarios', path: '/usuarios', icon: <Users size={20} />, reqAdmin: true },
    { name: 'Auditoría', path: '/historial', icon: <Activity size={20} />, reqAdmin: true }
  ];

  const visibleItems = allNavItems.filter(item => !item.reqAdmin || isAdmin);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
      x: isMobile ? '-100%' : 0,
      width: isMobile ? '16rem' : '5rem',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-20 flex items-center justify-center border-b border-white/5 px-4 relative">
        <motion.div
          animate={{ rotate: isOpen || isMobile ? 0 : 360 }}
          transition={{ duration: 0.5 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper-500 to-copper-600 flex items-center justify-center shrink-0 shadow-glow-copper relative z-10"
        >
          <Pickaxe size={24} className="text-white" />
        </motion.div>
        
        <AnimatePresence>
          {(isOpen || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 whitespace-nowrap overflow-hidden"
            >
              <h1 className="text-lg font-bold tracking-wider text-white">MINERA COP</h1>
              <p className="text-[10px] text-copper-300 font-medium tracking-widest uppercase">Sistema Empresarial</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {(!isOpen && !isMobile) && <div className="text-[10px] font-bold text-mining-500 uppercase tracking-widest text-center mb-2">Menú</div>}
        {(isOpen || isMobile) && <div className="px-3 text-xs font-bold text-mining-500 uppercase tracking-widest mb-2">Menú Principal</div>}
        
        {visibleItems.map((item) => (
          <NavLink
            key={item.path + item.name}
            to={item.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'text-white'
                  : 'text-mining-400 hover:text-white hover:bg-white/[0.04]'
              } ${!isOpen && !isMobile ? 'justify-center' : 'gap-3'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-white/10 border border-white/5 shadow-glass-inset rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative ${isActive ? 'text-copper-400 drop-shadow-[0_0_8px_rgba(234,119,64,0.5)]' : 'group-hover:scale-110 group-hover:text-white transition-all'}`}>
                  {item.icon}
                  {item.name === 'Dashboard' && isActive && (
                     <span className="absolute -top-1 -right-1 w-2 h-2 bg-copper-500 rounded-full shadow-glow-copper animate-pulse-glow" />
                  )}
                </div>
                {(isOpen || isMobile) && (
                  <span className="font-medium truncate">{item.name}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 bg-obsidian-900/50 backdrop-blur-md relative z-10">
        <div className={`flex items-center gap-3 ${!isOpen && !isMobile ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-obsidian-800 to-obsidian-700 border border-white/10 flex items-center justify-center shrink-0 shadow-glass-inset">
            <span className="text-white font-bold text-sm">
              {user?.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          {(isOpen || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.nombre}</p>
              <p className="text-xs text-mining-400 truncate">{user?.rol?.nombre}</p>
            </div>
          )}
        </div>
        
        {(isOpen || isMobile) && (
          <button
            onClick={logout}
            className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 hover:shadow-glow-sm rounded-xl border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        )}
        {(!isOpen && !isMobile) && (
           <button
             onClick={logout}
             title="Cerrar Sesión"
             className="mt-4 w-full flex justify-center py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:shadow-glow-sm border border-transparent hover:border-red-500/20 rounded-xl transition-all"
           >
             <LogOut size={20} />
           </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-obsidian-900/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isOpen || !isMobile ? "open" : "closed"}
        className={`fixed left-0 top-0 h-screen bg-obsidian-900/60 backdrop-blur-xl text-white z-50 border-r border-white/5 shadow-glass ${
          isMobile ? 'w-64' : (isOpen ? 'w-64' : 'w-20')
        } overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <SidebarContent />
      </motion.aside>
    </>
  );
};
