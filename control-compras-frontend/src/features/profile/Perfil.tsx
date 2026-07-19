import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/Toast';
import api from '../../lib/axios';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Shield, Save, Loader2 } from 'lucide-react';

export const Perfil = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    password: '',
    password_confirmation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password && form.password !== form.password_confirmation) {
      toast.error('Error de validación', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/user/profile', {
        nombre: form.nombre,
        email: form.email,
        password: form.password || undefined,
        password_confirmation: form.password_confirmation || undefined
      });

      login(response.data.user);
      toast.success('Perfil actualizado', response.data.message || 'Tu información ha sido actualizada correctamente.');
      
      setForm(prev => ({
        ...prev,
        password: '',
        password_confirmation: ''
      }));
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo actualizar el perfil.';
      toast.error('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Mi Perfil</h1>
          <p className="section-subtitle">Gestiona tu información personal y de seguridad</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card relative overflow-hidden"
      >
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-copper-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-white/5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-copper-600 to-copper-500 text-white flex items-center justify-center font-bold text-3xl shadow-glow-copper">
              {user?.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-white">{user?.nombre}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-mining-300 font-medium">
                  <Shield size={12} className="text-copper-400" />
                  {user?.rol?.nombre}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-mining-300 font-medium">
                  <Mail size={12} className="text-teal-400" />
                  {user?.email}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-mining-300 flex items-center gap-2">
                <User size={14} className="text-copper-400" />
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                className="input-field"
                placeholder="Nombre completo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-mining-300 flex items-center gap-2">
                <Mail size={14} className="text-teal-400" />
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="input-field"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Lock size={16} className="text-copper-400" />
              Cambiar Contraseña
            </h3>
            <p className="text-xs text-mining-500">Dejar en blanco si no desea modificar la contraseña actual.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-mining-300">Nueva Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-mining-300">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={form.password_confirmation}
                  onChange={e => setForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
