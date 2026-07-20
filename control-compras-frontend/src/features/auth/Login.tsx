import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../lib/axios';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, AlertCircle, Loader2, ShieldCheck, Pickaxe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Dynamic background component removed in favor of image background

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  const texts = [
    "Control Eficiente de Producción",
    "Trazabilidad de Minerales",
    "Logística y Despachos Seguros",
    "Gestión de Inventario Minero"
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
      
      await api.get((import.meta.env.VITE_API_BASE || 'http://localhost:8000') + '/sanctum/csrf-cookie', { baseURL: '' });
      const response = await api.post('/login', data);
      
      login(response.data.user);
      const user = response.data.user;
      const isAdmin = user.rol?.nombre === 'Administrador General' || user.permisos?.some((p: any) => p.nombre === 'dashboard');
      if (isAdmin) {
        navigate('/dashboard');
      } else if (user.rol?.nombre === 'Supervisor Bocamina') {
        navigate('/inventario');
      } else if (['Gerencia', 'Compras', 'Contabilidad'].includes(user.rol?.nombre)) {
        navigate('/compras');
      } else {
        navigate('/reportes');
      }
    } catch (err: unknown) {
      const errorResponse = err as any;
      setError(errorResponse.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundImages = [
    '/mining-bg-1.png',
    '/mining-bg-2.png',
    '/mining-bg-3.png',
    '/mining-bg-4.png',
    '/mining-bg-5.png'
  ];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 10000);
    return () => clearInterval(bgInterval);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans antialiased select-none text-white">
      {/* Animated Slideshow Background with Ken Burns Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.09 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 3, ease: "easeInOut" },
              scale: { duration: 10, ease: "linear" }
            }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImages[bgIndex]})` }}
          />
        </AnimatePresence>
        {/* Denser field of embers and ashes for the login page */}
        <AnimatedBackground dotCount={280} />
        {/* Dark mineral overlay to ensure contrast */}
        <div className="absolute inset-0 bg-black/65 pointer-events-none z-10" />
      </div>

      <div className="w-full max-w-[420px] mx-4 relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-apple-card w-full p-8 md:p-10 shadow-2xl relative"
        >
          {/* Glass shine visual sweep effect */}
          <motion.div
            className="absolute inset-0 w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] pointer-events-none z-10"
            initial={{ left: '-100%' }}
            animate={{ left: '200%' }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
          />

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10 relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ea7740]/80 to-[#92400e]/80 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30 relative overflow-hidden mb-5 group hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
              <Pickaxe size={32} className="text-[#FFFFFF] relative z-10 drop-shadow-md" />
            </motion.div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">
              Sistema de Control de Productos
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              Cooperativa Minera
            </h1>

            {/* Rotating subtitle with medical benefits */}
            <div className="h-5 overflow-hidden relative w-full flex justify-center mt-2">
              <AnimatePresence mode="wait">
                <motion.p
                  key={textIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-[13px] text-white/80 font-medium absolute text-center whitespace-nowrap"
                >
                  {texts[textIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded-xl flex items-center gap-3 relative z-10">
                  <AlertCircle size={18} className="shrink-0" />
                  <span className="text-[13px] font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-2 ml-1 drop-shadow-sm">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors duration-300" size={18} />
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full pl-12 pr-4 py-3.5 glass-apple-input text-sm text-white placeholder-white/40 ${
                    errors.email ? 'border-[#EF4444]/50 focus:border-[#EF4444]/50 focus:ring-[#EF4444]/20' : ''
                  }`}
                  placeholder="admin@cooperativaminera.com"
                />
              </div>
              {errors.email && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 ml-1 text-[12px] text-[#ff6b6b] font-medium drop-shadow-sm">
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">
                  Contraseña
                </label>
                <a
                  href="#"
                  className="text-[11px] font-medium text-white/70 hover:text-white transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors duration-300" size={18} />
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full pl-12 pr-4 py-3.5 glass-apple-input text-sm text-white placeholder-white/40 ${
                    errors.password ? 'border-[#EF4444]/50 focus:border-[#EF4444]/50 focus:ring-[#EF4444]/20' : ''
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 ml-1 text-[12px] text-[#ff6b6b] font-medium drop-shadow-sm">
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full relative py-3.5 glass-apple-btn text-[14px] mt-6 disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2 group"
            >
              {/* Button light gloss sweep */}
              <motion.div
                className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] pointer-events-none"
                initial={{ left: '-100%' }}
                animate={{ left: '200%' }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 4 }}
              />
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>Iniciar Sesión Segura</span>
                    <ShieldCheck size={18} />
                  </>
                )}
              </div>
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-center text-white/50 text-[12px] font-medium mt-8"
        >
          &copy; {new Date().getFullYear()} Cooperativa Minera. Todos los derechos reservados.
        </motion.p>
      </div>
    </div>
  );
};

