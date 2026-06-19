import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { InventarioList } from './features/inventario/InventarioList';
import { ComprasHistorial } from './features/compras/ComprasHistorial';
import { NuevaCompra } from './features/compras/NuevaCompra';
import { ProveedoresList } from './features/admin/ProveedoresList';
import { UsuariosList } from './features/admin/UsuariosList';
import { BocaminasList } from './features/admin/BocaminasList';
import { HistorialList } from './features/admin/HistorialList';
import { ReportesView } from './features/reportes/ReportesView';
import { ServiciosDashboard } from './features/servicios/ServiciosDashboard';
import { MainLayout } from './components/layout/MainLayout';
import { ToastProvider } from './components/ui/Toast';
import { AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const PrivateRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, token, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">Cargando...</div>;
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.rol?.nombre !== 'Administrador General') return <Navigate to="/dashboard" replace />;
  
  return <MainLayout>{children}</MainLayout>;
};

// Route wrapper for animations
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Base */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/inventario" element={<PrivateRoute><InventarioList /></PrivateRoute>} />
        
        {/* Rutas Compras */}
        <Route path="/compras" element={<PrivateRoute><ComprasHistorial /></PrivateRoute>} />
        <Route path="/compras/nueva" element={<PrivateRoute><NuevaCompra /></PrivateRoute>} />

        {/* Rutas Admin */}
        <Route path="/proveedores" element={<PrivateRoute requireAdmin><ProveedoresList /></PrivateRoute>} />
        <Route path="/usuarios" element={<PrivateRoute requireAdmin><UsuariosList /></PrivateRoute>} />
        <Route path="/bocaminas" element={<PrivateRoute requireAdmin><BocaminasList /></PrivateRoute>} />
        <Route path="/historial" element={<PrivateRoute requireAdmin><HistorialList /></PrivateRoute>} />
        
        <Route path="/reportes" element={<PrivateRoute><ReportesView /></PrivateRoute>} />
        <Route path="/servicios/*" element={<PrivateRoute><ServiciosDashboard /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
