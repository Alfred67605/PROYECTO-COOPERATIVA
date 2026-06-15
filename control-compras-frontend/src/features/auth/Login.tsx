import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../lib/axios';
import { useAuth } from './AuthContext';
import { motion } from 'framer-motion';
import { KeyRound, Mail, AlertCircle, Loader2, Pickaxe, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Background particles component
const ParticlesBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-copper-500/10 rounded-full"
          initial={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100,
            opacity: Math.random() * 0.5 + 0.1
          }}
          animate={{
            y: -200,
            x: Math.random() * window.innerWidth,
            rotate: Math.random() * 360
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ filter: 'blur(40px)' }}
        />
      ))}
    </div>
  );
};

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  const texts = [
    "Gestión de Inventario",
    "Control de Compras",
    "Administración de Bocaminas",
    "Directorio de Proveedores"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError('');
      
      await api.get('http://localhost:8000/sanctum/csrf-cookie', { baseURL: '' });
      const response = await api.post('/login', data);
      
      login(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorResponse = err as any;
      setError(errorResponse.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mining-950 flex relative overflow-hidden font-sans">
      <ParticlesBackground />

      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden border-r border-white/5 bg-gradient-to-br from-mining-950 to-mining-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-mining-950 via-mining-950/80 to-transparent"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-copper-500 to-copper-600 flex items-center justify-center shadow-glow-copper">
            <Pickaxe size={28} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-wider">MINERA COP.</span>
        </div>

        <div className="relative z-10 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Sistema Empresarial <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-copper-400 to-copper-600">
                Para Cooperativas Mineras
              </span>
            </h1>
          </motion.div>
          
          <div className="h-12 overflow-hidden relative">
            <motion.p
              key={textIndex}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              className="text-xl text-mining-300 font-medium absolute"
            >
              {texts[textIndex]}
            </motion.p>
          </div>
        </div>

        <div className="relative z-10 flex gap-8 border-t border-white/10 pt-8">
          <div>
            <div className="text-3xl font-bold text-white mb-1">100%</div>
            <div className="text-sm text-mining-400 font-medium">Trazabilidad</div>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">24/7</div>
            <div className="text-sm text-mining-400 font-medium">Control de Stock</div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-copper-500 to-copper-600 flex items-center justify-center shadow-glow-copper mb-4">
              <Pickaxe size={36} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-wider">MINERA COP</h2>
          </div>

          <div className="glass-panel-dark p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-copper-400 via-copper-500 to-copper-600"></div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de nuevo</h2>
              <p className="text-mining-400 text-sm">Ingresa tus credenciales para acceder al sistema.</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3"
              >
                <AlertCircle size={20} className="shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-mining-300 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-mining-500 group-focus-within:text-copper-400 transition-colors" size={20} />
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full pl-12 pr-4 py-3.5 bg-mining-900/50 border border-white/10 rounded-xl text-white placeholder-mining-600 focus:outline-none focus:border-copper-500 focus:ring-1 focus:ring-copper-500 transition-all ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
                    placeholder="admin@mineracop.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-mining-300 uppercase tracking-wider">Contraseña</label>
                  <a href="#" className="text-xs font-medium text-copper-400 hover:text-copper-300 transition-colors">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-mining-500 group-focus-within:text-copper-400 transition-colors" size={20} />
                  <input
                    type="password"
                    {...register('password')}
                    className={`w-full pl-12 pr-4 py-3.5 bg-mining-900/50 border border-white/10 rounded-xl text-white placeholder-mining-600 focus:outline-none focus:border-copper-500 focus:ring-1 focus:ring-copper-500 transition-all ${errors.password ? 'border-red-500/50 focus:border-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative py-3.5 bg-gradient-to-r from-copper-600 to-copper-500 hover:from-copper-500 hover:to-copper-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(234,119,64,0.3)] hover:shadow-[0_0_30px_rgba(234,119,64,0.5)] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-4 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>Iniciar Sesión Segura</span>
                      <ShieldCheck size={18} />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
          
          <p className="text-center text-mining-500 text-xs mt-8">
            &copy; {new Date().getFullYear()} Minera Cop. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
