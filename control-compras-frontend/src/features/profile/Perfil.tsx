import React, { useState, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/Toast';
import api from '../../lib/axios';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Shield, Save, Loader2, Camera, Building2, Trash2, Image as ImageIcon } from 'lucide-react';

export const Perfil = () => {
  const { user, login, empresaSettings, refreshEmpresaSettings } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [empresaLoading, setEmpresaLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.rol?.nombre === 'Administrador General';

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    password: '',
    password_confirmation: ''
  });

  const [empresaForm, setEmpresaForm] = useState({
    nombre_empresa: empresaSettings?.nombre_empresa || 'MINERA COP',
    subtitulo: empresaSettings?.subtitulo || 'Sistema Empresarial'
  });

  // Sync empresa form when settings load
  React.useEffect(() => {
    if (empresaSettings) {
      setEmpresaForm({
        nombre_empresa: empresaSettings.nombre_empresa,
        subtitulo: empresaSettings.subtitulo || ''
      });
    }
  }, [empresaSettings]);

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

  // ─── Avatar Upload ───
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate on client side
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error('Formato inválido', 'Solo se permiten imágenes JPEG, PNG o WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', 'El archivo no debe superar los 5MB.');
      return;
    }

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      login(response.data.user);
      toast.success('Avatar actualizado', 'Tu foto de perfil ha sido actualizada.');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo subir la imagen.';
      toast.error('Error', msg);
    } finally {
      setAvatarLoading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleAvatarDelete = async () => {
    setAvatarLoading(true);
    try {
      const response = await api.delete('/user/avatar');
      login(response.data.user);
      toast.success('Avatar eliminado', 'Tu foto de perfil ha sido eliminada.');
    } catch (error: any) {
      toast.error('Error', 'No se pudo eliminar el avatar.');
    } finally {
      setAvatarLoading(false);
    }
  };

  // ─── Empresa Settings ───
  const handleEmpresaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmpresaLoading(true);
    try {
      await api.put('/empresa/settings', empresaForm);
      await refreshEmpresaSettings();
      toast.success('Empresa actualizada', 'La configuración de la empresa ha sido actualizada.');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo actualizar la configuración.';
      toast.error('Error', msg);
    } finally {
      setEmpresaLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      toast.error('Formato inválido', 'Solo se permiten imágenes JPEG, PNG, WebP o SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', 'El archivo no debe superar los 5MB.');
      return;
    }

    setLogoLoading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      await api.post('/empresa/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshEmpresaSettings();
      toast.success('Logo actualizado', 'El logo de la empresa ha sido actualizado.');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo subir el logo.';
      toast.error('Error', msg);
    } finally {
      setLogoLoading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleLogoDelete = async () => {
    setLogoLoading(true);
    try {
      await api.delete('/empresa/logo');
      await refreshEmpresaSettings();
      toast.success('Logo eliminado', 'El logo de la empresa ha sido eliminado.');
    } catch (error: any) {
      toast.error('Error', 'No se pudo eliminar el logo.');
    } finally {
      setLogoLoading(false);
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
            {/* Avatar with upload */}
            <div className="relative group">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <div 
                className="w-20 h-20 rounded-2xl overflow-hidden shadow-glow-copper cursor-pointer relative"
                onClick={() => avatarInputRef.current?.click()}
              >
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-copper-600 to-copper-500 text-white flex items-center justify-center font-bold text-3xl">
                    {user?.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {avatarLoading ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </div>
              </div>
              {/* Delete button */}
              {user?.avatar_url && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleAvatarDelete(); }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                  title="Eliminar avatar"
                >
                  <Trash2 size={12} />
                </button>
              )}
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
              <p className="text-[10px] text-mining-500 mt-2">Haz clic en la foto para cambiar tu avatar</p>
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

      {/* ─── Empresa Settings (Admin Only) ─── */}
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl -ml-10 -mt-10"></div>

          <form onSubmit={handleEmpresaSubmit} className="space-y-6 relative z-10">
            <div className="pb-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 size={20} className="text-teal-400" />
                Configuración de Empresa
              </h3>
              <p className="text-xs text-mining-500 mt-1">Personaliza el nombre, subtítulo y logo que aparece en el sistema.</p>
            </div>

            {/* Logo Section */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-mining-300 flex items-center gap-2">
                  <ImageIcon size={14} className="text-teal-400" />
                  Logo de Empresa
                </label>
                <div className="relative group">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <div 
                    className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-white/10 hover:border-teal-400/40 cursor-pointer transition-all duration-300 relative flex items-center justify-center bg-white/[0.02]"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {empresaSettings?.logo_url ? (
                      <img 
                        src={empresaSettings.logo_url} 
                        alt="Logo empresa" 
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon size={24} className="text-mining-500 mx-auto" />
                        <p className="text-[10px] text-mining-500 mt-1">Subir logo</p>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
                      {logoLoading ? (
                        <Loader2 size={20} className="text-white animate-spin" />
                      ) : (
                        <Camera size={20} className="text-white" />
                      )}
                    </div>
                  </div>
                  {/* Delete logo button */}
                  {empresaSettings?.logo_url && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleLogoDelete(); }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                      title="Eliminar logo"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-mining-500">PNG, JPG o WebP. Max 5MB.</p>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-mining-300 flex items-center gap-2">
                    <Building2 size={14} className="text-teal-400" />
                    Nombre de Empresa
                  </label>
                  <input
                    type="text"
                    required
                    value={empresaForm.nombre_empresa}
                    onChange={e => setEmpresaForm(prev => ({ ...prev, nombre_empresa: e.target.value }))}
                    className="input-field"
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-mining-300">Subtítulo</label>
                  <input
                    type="text"
                    value={empresaForm.subtitulo}
                    onChange={e => setEmpresaForm(prev => ({ ...prev, subtitulo: e.target.value }))}
                    className="input-field"
                    placeholder="Ej: Sistema Empresarial"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={empresaLoading}
                className="btn-primary flex items-center gap-2"
              >
                {empresaLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>Guardar Empresa</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};
