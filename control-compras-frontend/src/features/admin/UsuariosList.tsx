import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { UserPlus, Edit, Trash2, X, Loader2, Mail, Shield, CircleDot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';

interface UserForm {
  nombre: string;
  email: string;
  password: string;
  rol_id: string;
  estado: boolean;
}

const emptyForm: UserForm = { nombre: '', email: '', password: '', rol_id: '', estado: true };

export const UsuariosList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => (await api.get('/usuarios')).data
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await api.get('/roles')).data
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, rol_id: parseInt(form.rol_id) };
      if (editingId && !payload.password) delete payload.password;
      if (editingId) return await api.put(`/usuarios/${editingId}`, payload);
      return await api.post('/usuarios', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success(
        editingId ? 'Usuario actualizado' : 'Usuario creado',
        editingId ? 'Los datos del usuario se guardaron correctamente.' : 'El usuario fue registrado exitosamente.'
      );
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al guardar';
      setError(msg);
      toast.error('Error al guardar', msg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await api.delete(`/usuarios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario inhabilitado', 'El usuario fue marcado como inactivo.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error al inhabilitar', err.response?.data?.message || 'No se pudo inhabilitar el usuario.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (u: any) => {
    setForm({ nombre: u.nombre, email: u.email, password: '', rol_id: String(u.rol_id), estado: u.estado });
    setEditingId(u.id); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); setError(''); };
  const handleDelete = (id: number, nombre: string) => { setDeleteTarget({ id, nombre }); setConfirmOpen(true); };
  const confirmDelete = () => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); };

  const getRoleBadge = (roleName: string) => {
    if (roleName.includes('Administrador')) return <span className="badge badge-copper"><Shield size={12} /> {roleName}</span>;
    return <span className="badge badge-neutral">{roleName}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h2 className="section-title">Gestión de Usuarios</h2>
          <p className="section-subtitle">Control de acceso y roles del sistema</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <UserPlus size={18} />
          Nuevo Usuario
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-4">
            {Array.from({length: 4}).map((_, i) => (
              <div key={i} className="h-12 bg-mining-50 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium w-full">
              <thead className="bg-mining-50/80 border-b border-mining-100">
                <tr>
                  <th className="pl-6">Usuario</th>
                  <th>Rol / Permisos</th>
                  <th>Estado</th>
                  <th className="pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {data?.map((u: any) => (
                  <motion.tr variants={tableRowVariant} key={u.id} className="group">
                    <td className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-mining-700 to-mining-600 text-white flex items-center justify-center font-bold shadow-md">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{u.nombre}</p>
                          <p className="text-xs text-mining-500 flex items-center gap-1 mt-0.5">
                            <Mail size={10} /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(u.rol?.nombre)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <CircleDot size={10} className={u.estado ? 'text-emerald-400 animate-pulse' : 'text-red-400'} />
                        <span className={`text-sm font-semibold ${u.estado ? 'text-emerald-400' : 'text-red-400'}`}>
                          {u.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(u)} className="btn-icon">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(u.id, u.nombre)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10" disabled={u.id === 1}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Inhabilitar Usuario"
        message={`¿Estás seguro de que deseas inhabilitar al usuario "${deleteTarget?.nombre}"? El usuario perderá acceso al sistema.`}
        confirmLabel="Inhabilitar"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
      />

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl w-full max-w-md shadow-elevated border border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <UserPlus size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                </div>
                <button onClick={closeModal} className="text-mining-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"><X size={20} /></button>
              </div>

              <div className="p-6">
                {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</div>}

                <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Nombre Completo *</label>
                    <input className="input-field" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Email corporativo *</label>
                    <input type="email" className="input-field" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Contraseña {editingId ? '(opcional)' : '*'}</label>
                    <input type="password" className="input-field" required={!editingId} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editingId ? 'Dejar vacío para mantener la actual' : ''} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Rol Asignado *</label>
                    <select className="input-field" required value={form.rol_id} onChange={e => setForm({...form, rol_id: e.target.value})}>
                      <option value="">Seleccione un rol</option>
                      {roles?.map((r: any) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                  </div>
                  {editingId && (
                    <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 mt-2">
                      <div className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" id="estado" className="peer sr-only" checked={form.estado} onChange={e => setForm({...form, estado: e.target.checked})} />
                        <div className="h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white/10 after:bg-white after:transition-all after:content-[''] peer-checked:bg-copper-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                      </div>
                      <label htmlFor="estado" className="text-sm font-semibold text-white cursor-pointer select-none">
                        Cuenta de usuario activa
                      </label>
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
                    <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
                    <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                      {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Guardar Cambios' : 'Crear Usuario')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
