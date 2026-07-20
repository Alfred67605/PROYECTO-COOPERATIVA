import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth, getDefaultRedirect } from './features/auth/AuthContext';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { InventarioList } from './features/inventario/InventarioList';
import { ComprasHistorial } from './features/compras/ComprasHistorial';
import { NuevaCompra } from './features/compras/NuevaCompra';
import { ProveedoresList } from './features/admin/ProveedoresList';
import { UsuariosList } from './features/admin/UsuariosList';
import { BocaminasList } from './features/admin/BocaminasList';
import { HistorialList } from './features/admin/HistorialList';
import { RespaldosView } from './features/admin/RespaldosView';
import { ReportesView } from './features/reportes/ReportesView';
import { ServiciosDashboard } from './features/servicios/ServiciosDashboard';
import { AlquilerGruasList } from './features/servicios/AlquilerGruasList';
import { MainLayout } from './components/layout/MainLayout';
import { Perfil } from './features/profile/Perfil';
import { ToastProvider } from './components/ui/Toast';
import { MotionConfig } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const PrivateRoute = ({ children, module }: { children: React.ReactNode, module?: string }) => {
  const { user, isAuthenticated, isLoading, canAccess } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (module && !canAccess(module)) {
    return <Navigate to={getDefaultRedirect(user, canAccess)} replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

const RootRedirect = () => {
  const { user, canAccess } = useAuth();
  return <Navigate to={getDefaultRedirect(user, canAccess)} replace />;
};

// Route wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <Routes location={location}>
      <Route path="/login" element={<Login />} />
      
      {/* Rutas Base */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/dashboard" element={<PrivateRoute module="dashboard"><Dashboard /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
      <Route path="/inventario" element={<PrivateRoute module="materiales"><InventarioList /></PrivateRoute>} />
      
      {/* Rutas Compras */}
      <Route path="/compras" element={<PrivateRoute module="compras"><ComprasHistorial /></PrivateRoute>} />
      <Route path="/compras/nueva" element={<PrivateRoute module="compras"><NuevaCompra /></PrivateRoute>} />

      {/* Rutas Admin */}
      <Route path="/proveedores" element={<PrivateRoute module="proveedores"><ProveedoresList /></PrivateRoute>} />
      <Route path="/usuarios" element={<PrivateRoute module="usuarios"><UsuariosList /></PrivateRoute>} />
      <Route path="/bocaminas" element={<PrivateRoute module="bocaminas"><BocaminasList /></PrivateRoute>} />
      <Route path="/historial" element={<PrivateRoute module="auditoria"><HistorialList /></PrivateRoute>} />
      <Route path="/admin/respaldos" element={<PrivateRoute module="usuarios"><RespaldosView /></PrivateRoute>} />
      
      <Route path="/reportes" element={<PrivateRoute module="reportes"><ReportesView /></PrivateRoute>} />
      <Route path="/servicios/*" element={<PrivateRoute module="servicios"><ServiciosDashboard /></PrivateRoute>} />
      <Route path="/alquiler-gruas" element={<PrivateRoute module="servicios"><AlquilerGruasList /></PrivateRoute>} />
      
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

const App = () => {
  const isTest = typeof window !== 'undefined' && !!(window as any).Cypress;
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig transition={isTest ? { duration: 0 } : undefined}>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <AnimatedRoutes />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
};

export default App;
