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
  puede_eliminar?: boolean;
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
  canDelete: () => boolean;
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

    // Admin-only modules (cannot be granted via permissions unless explicitly defined)
    if (module === 'usuarios') {
      return hasPermission(module);
    }

    // If explicit permissions exist on the user object, use them
    if (user.permisos && user.permisos.length > 0) {
      return user.permisos.some((p: any) => p.nombre === module);
    }

    // Default access per role (fallback if no custom permissions saved)
    const roleDefaults: Record<string, string[]> = {
      'Gerencia':            ['dashboard', 'materiales', 'compras', 'servicios', 'reportes', 'auditoria'],
      'Compras':             ['dashboard', 'proveedores', 'materiales', 'compras'],
      'Contabilidad':        ['dashboard', 'materiales', 'compras', 'reportes'],
      'Supervisor Bocamina': ['dashboard', 'bocaminas', 'materiales', 'servicios'],
      'Consulta':            ['dashboard', 'reportes', 'auditoria'],
    };

    const defaults = roleDefaults[roleName] || [];
    return defaults.includes(module);
  };

  const canWrite = (module: string): boolean => {
    if (!user) return false;
    if (user.rol?.nombre === 'Administrador General') return true;
    if (user.rol?.nombre === 'Consulta') return false;
    if (user.permisos?.some((p: any) => p.nombre === 'solo_lectura')) return false;
    return canAccess(module);
  };

  const canDelete = (): boolean => {
    if (!user) return false;
    if (user.rol?.nombre === 'Administrador General') return true;
    return !!user.puede_eliminar;
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
        canDelete,
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
