import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../../lib/axios';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  avatar?: string;
  avatar_url?: string | null;
  rol?: {
    id: number;
    nombre: string;
  };
  permisos?: Array<{
    id: number;
    nombre: string;
    descripcion?: string;
  }>;
}

interface EmpresaSettings {
  id: number;
  nombre_empresa: string;
  subtitulo: string | null;
  logo: string | null;
  logo_url: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (perm: string) => boolean;
  canAccess: (module: string) => boolean;
  canWrite: (module: string) => boolean;
  empresaSettings: EmpresaSettings | null;
  refreshEmpresaSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [empresaSettings, setEmpresaSettings] = useState<EmpresaSettings | null>(null);

  const refreshEmpresaSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/empresa/settings');
      setEmpresaSettings(data);
    } catch {
      // Ignore — settings not available
    }
  }, []);

  useEffect(() => {
    // Try to fetch user on load to verify session cookie
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        setUser(response.data);
        // Also load empresa settings
        await refreshEmpresaSettings();
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [refreshEmpresaSettings]);

  const login = (newUser: User) => {
    setUser(newUser);
    refreshEmpresaSettings();
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const hasPermission = (permName: string): boolean => {
    if (!user) return false;
    if (user.rol?.nombre === 'Administrador General') return true;
    return user.permisos?.some((p: any) => p.nombre === permName) || false;
  };

  const canAccess = (module: string): boolean => {
    if (!user) return false;
    const roleName = user.rol?.nombre || '';
    if (roleName === 'Administrador General') return true;

    // Default access per role (without extra permissions)
    const roleDefaults: Record<string, string[]> = {
      'Gerencia':            ['materiales', 'compras', 'servicios', 'reportes', 'auditoria'],
      'Compras':             ['proveedores', 'materiales', 'compras'],
      'Contabilidad':        ['materiales', 'compras', 'reportes'],
      'Supervisor Bocamina': ['bocaminas', 'materiales', 'servicios'],
      'Consulta':            ['reportes', 'auditoria'],
    };

    // Admin-only modules (cannot be granted via permissions unless explicitly defined)
    if (['usuarios', 'dashboard'].includes(module)) {
      return hasPermission(module);
    }

    // Check role default access OR extra permission
    const defaults = roleDefaults[roleName] || [];
    return defaults.includes(module) || hasPermission(module);
  };

  const canWrite = (module: string): boolean => {
    if (!user) return false;
    if (user.rol?.nombre === 'Administrador General') return true;
    if (user.rol?.nombre === 'Consulta') return false;
    if (user.permisos?.some((p: any) => p.nombre === 'solo_lectura')) return false;
    return canAccess(module);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        hasPermission,
        canAccess,
        canWrite,
        empresaSettings,
        refreshEmpresaSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getDefaultRedirect = (user: any, canAccess: (module: string) => boolean): string => {
  if (!user) return '/login';
  if (user.rol?.nombre === 'Administrador General' || canAccess('dashboard')) return '/dashboard';
  if (canAccess('compras')) return '/compras';
  if (canAccess('materiales')) return '/inventario';
  if (canAccess('reportes')) return '/reportes';
  if (canAccess('servicios')) return '/servicios/mantenimientos';
  if (canAccess('bocaminas')) return '/bocaminas';
  if (canAccess('proveedores')) return '/proveedores';
  return '/perfil';
};
