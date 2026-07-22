import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { UserPlus, Edit, Trash2, X, Loader2, Mail, Shield, CircleDot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';

const isTest = typeof window !== 'undefined' && !!(window as any).Cypress;

interface UserForm {
  nombre: string;
  email: string;
  password: string;
  rol_id: string;
  estado: boolean;
  permisos: number[];
}

const emptyForm: UserForm = { nombre: '', email: '', password: '', rol_id: '', estado: true, permisos: [] };

// Default module access per role — these define general access (read or write)
const ROLE_DEFAULT_MODULES: Record<string, string[]> = {
  'Administrador General': ['bocaminas', 'proveedores', 'materiales', 'compras', 'servicios', 'reportes', 'auditoria'],
  'Gerencia':              ['materiales', 'compras', 'servicios', 'reportes', 'auditoria'],
  'Compras':               ['proveedores', 'materiales', 'compras'],
  'Contabilidad':          ['materiales', 'compras', 'reportes'],
  'Supervisor Bocamina':   ['bocaminas', 'materiales', 'servicios'],
  'Consulta':              ['reportes', 'auditoria'],
};


export const UsuariosList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => (await api.get('/usuarios')).data
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await api.get('/roles')).data
  });

  const { data: permisos } = useQuery({
    queryKey: ['permisos'],
    queryFn: async () => (await api.get('/permisos')).data
  });


  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, rol_id: parseInt(form.rol_id) };
      if (editingId && !payload.password) delete payload.password;

      // Auto-assign solo_lectura for Consulta role
      const selectedRole = roles?.find((r: any) => String(r.id) === String(form.rol_id));
      if (selectedRole?.nombre === 'Consulta') {
        const soloLecturaPerm = permisos?.find((p: any) => p.nombre === 'solo_lectura');
        if (soloLecturaPerm && !payload.permisos.includes(soloLecturaPerm.id)) {
          payload.permisos = [...payload.permisos, soloLecturaPerm.id];
        }
      }

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
      toast.success('Usuario eliminado', 'El usuario fue eliminado de manera definitiva.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error al eliminar', err.response?.data?.message || 'No se pudo eliminar el usuario.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedRole = roles?.find((r: any) => String(r.id) === String(form.rol_id));

    if (selectedRole && selectedRole.nombre !== 'Administrador General') {
      const roleDefaults = ROLE_DEFAULT_MODULES[selectedRole.nombre] || [];
      const extraPermNames: string[] = [];

      form.permisos.forEach(id => {
        const perm = permisos?.find((p: any) => p.id === id);
        if (perm && !roleDefaults.includes(perm.nombre) && perm.nombre !== 'solo_lectura') {
          const labels: Record<string, string> = {
            bocaminas: 'Bocaminas', proveedores: 'Proveedores', materiales: 'Materiales',
            compras: 'Compras', servicios: 'Servicios', reportes: 'Reportes', auditoria: 'Auditoría',
          };
          extraPermNames.push(labels[perm.nombre] || perm.nombre);
        }
      });

      if (extraPermNames.length > 0) {
        setWarningMessage(`¿Estás seguro de darle acceso adicional a ${extraPermNames.join(', ')} al usuario "${form.nombre || 'Nuevo Usuario'}" con rol ${selectedRole.nombre}?`);
        setShowWarningModal(true);
        return;
      }
    }

    saveMutation.mutate();
  };

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (u: any) => {
    setForm({ 
      nombre: u.nombre, 
      email: u.email, 
      password: '', 
      rol_id: String(u.rol_id), 
      estado: u.estado,
      permisos: u.permisos?.map((p: any) => p.id) || []
    });
    setEditingId(u.id); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); setError(''); };
  const handleDelete = (id: number, nombre: string) => { setDeleteTarget({ id, nombre }); setConfirmOpen(true); };
  const confirmDelete = () => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); };

  const getRoleBadge = (u: any) => {
    const roleName = u.rol?.nombre || 'Sin Rol';
    const numPermisos = u.permisos?.length || 0;
    
    return (
      <div className="flex flex-col gap-1">
        {roleName.includes('Administrador') ? (
          <span className="badge badge-copper w-fit"><Shield size={12} /> {roleName}</span>
        ) : (
          <span className="badge badge-neutral w-fit">{roleName}</span>
        )}
        {numPermisos > 0 && (
          <span className="text-[10px] text-mining-400">+{numPermisos} permisos esp.</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Gestión de Usuarios</h1>
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
                    <td>{getRoleBadge(u)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <CircleDot size={10} className={u.estado ? 'text-emerald-400 animate-pulse' : 'text-red-400'} />
                        <span className={`text-sm font-semibold ${u.estado ? 'text-emerald-400' : 'text-red-400'}`}>
                          {u.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
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

      {createPortal(
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Eliminar Usuario"
          message={`¿Estás seguro de que deseas eliminar al usuario "${deleteTarget?.nombre}" de manera definitiva? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={confirmDelete}
          onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        />,
        document.body
      )}

      {createPortal(
        <ConfirmDialog
          isOpen={showWarningModal}
          title="Elevación de Accesos Especiales"
          message={warningMessage}
          confirmLabel="Aceptar"
          cancelLabel="Cerrar"
          variant="warning"
          onConfirm={() => {
            setShowWarningModal(false);
            saveMutation.mutate();
          }}
          onCancel={() => setShowWarningModal(false)}
        />,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div initial={isTest ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto" onClick={closeModal}>
              <motion.div initial={isTest ? false : { scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl w-full max-w-3xl shadow-elevated border border-white/10 overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-copper-500/10 text-copper-400 flex items-center justify-center">
                      <UserPlus size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                  </div>
                  <button onClick={closeModal} className="text-mining-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"><X size={20} /></button>
                </div>

                <div className="p-6">
                  {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</div>}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left Column: General Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-copper-400 border-b border-white/5 pb-2 mb-3">Información General</h4>
                        <div>
                          <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Nombre Completo *</label>
                          <input className="input-field" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Correo Electrónico *</label>
                          <input type="email" className="input-field" required autoComplete="new-password" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Contraseña {editingId ? '(opcional)' : '*'}</label>
                          <input type="password" className="input-field" required={!editingId} autoComplete="new-password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editingId ? 'Dejar vacío para mantener la actual' : ''} />
                          <p className="text-[10px] text-mining-400 mt-1.5 leading-normal">
                            La contraseña debe tener mínimo 8 caracteres, números, mayúsculas, minúsculas y símbolos.
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Rol del Sistema *</label>
                          <select className="input-field" required value={form.rol_id} onChange={e => setForm({...form, rol_id: e.target.value})}>
                            <option value="">Seleccione un rol</option>
                            {roles?.map((r: any) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                          </select>
                        </div>
                        
                        {editingId && (
                          <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 mt-4">
                            <div className="relative inline-flex cursor-pointer items-center">
                              <input type="checkbox" id="estado" className="peer sr-only" checked={form.estado} onChange={e => setForm({...form, estado: e.target.checked})} />
                              <div className="h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white/10 after:bg-white after:transition-all after:content-[''] peer-checked:bg-copper-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                            </div>
                            <label htmlFor="estado" className="text-sm font-semibold text-white cursor-pointer select-none">
                              Cuenta de usuario activa
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Module Access */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-copper-400 border-b border-white/5 pb-2 mb-3">Acceso a Módulos</h4>
                        {(() => {
                          const selectedRole = roles?.find((r: any) => String(r.id) === String(form.rol_id));
                          const roleName = selectedRole?.nombre || '';
                          const roleDefaults = ROLE_DEFAULT_MODULES[roleName] || [];
                          const isAdmin = roleName === 'Administrador General';

                          const moduleLabels: Record<string, string> = {
                            bocaminas: 'Bocaminas', proveedores: 'Proveedores', materiales: 'Materiales',
                            compras: 'Compras', servicios: 'Servicios', reportes: 'Reportes', auditoria: 'Auditoría',
                            solo_lectura: 'Solo Lectura',
                          };

                          if (!form.rol_id) {
                            return (
                              <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-mining-500 text-sm">
                                Seleccione un rol para ver los módulos disponibles
                              </div>
                            );
                          }

                          if (isAdmin) {
                            return (
                              <div className="bg-copper-500/5 border border-copper-500/20 rounded-xl p-4 text-sm text-copper-300">
                                <p className="font-bold text-copper-400 mb-1">Administrador General</p>
                                <p className="text-xs text-mining-400">Este rol tiene Acceso total a todos los módulos del sistema. No requiere permisos adicionales.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-1.5">
                              {/* Role defaults info */}
                              <p className="text-[10px] text-mining-500 mb-2">
                                Los módulos marcados con 🔒 son los accesos por defecto del rol <span className="text-white font-semibold">{roleName}</span>.
                              </p>

                              <div className="space-y-2 bg-white/[0.02] p-3 rounded-xl border border-white/5 max-h-[320px] overflow-y-auto">
                                {permisos?.filter((p: any) => p.nombre !== 'solo_lectura').map((p: any) => {
                                  const isDefault = roleDefaults.includes(p.nombre);
                                  const isChecked = isDefault || form.permisos.includes(p.id);

                                  return (
                                    <label key={p.id} className={`flex items-center gap-3 text-sm cursor-pointer select-none p-2.5 rounded-lg transition-colors ${
                                      isDefault ? 'bg-copper-500/5 border border-copper-500/10' : 'hover:bg-white/[0.03] border border-transparent'
                                    }`}>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isDefault}
                                        onChange={e => {
                                          if (isDefault) return;
                                          if (e.target.checked) {
                                            setForm({ ...form, permisos: [...form.permisos, p.id] });
                                          } else {
                                            setForm({ ...form, permisos: form.permisos.filter(id => id !== p.id) });
                                          }
                                        }}
                                        className={`rounded h-4 w-4 shrink-0 ${
                                          isDefault 
                                            ? 'border-copper-500/30 bg-copper-500/20 text-copper-500 cursor-not-allowed' 
                                            : 'border-white/10 bg-white/5 text-copper-500 focus:ring-copper-500/50'
                                        }`}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className={`font-semibold text-sm ${isDefault ? 'text-copper-300' : 'text-white'}`}>
                                            {moduleLabels[p.nombre] || p.nombre}
                                          </p>
                                          {isDefault && <span className="text-[10px]" title="Acceso por defecto del rol">🔒</span>}
                                          {!isDefault && isChecked && <span className="text-[9px] bg-copper-500/20 text-copper-400 px-1.5 py-0.5 rounded-full font-bold">EXTRA</span>}
                                        </div>
                                        <p className="text-xs text-mining-500 leading-normal mt-0.5">{p.descripcion}</p>
                                      </div>
                                    </label>
                                  );
                                })}

                                 {/* Solo Lectura separator */}
                                 {permisos?.filter((p: any) => p.nombre === 'solo_lectura').map((p: any) => {
                                   const isConsulta = roleName === 'Consulta';
                                   const isSoloLecturaChecked = isConsulta || form.permisos.includes(p.id);

                                   return (
                                     <div key={p.id} className="mt-2 pt-2 border-t border-white/5">
                                       <label className={`flex items-center gap-3 text-sm p-2.5 rounded-lg border border-transparent transition-colors ${
                                         isConsulta ? 'bg-red-500/5 border-red-500/10 cursor-not-allowed' : 'cursor-pointer hover:bg-red-500/5'
                                       }`}>
                                         <input
                                           type="checkbox"
                                           checked={isSoloLecturaChecked}
                                           disabled={isConsulta}
                                           onChange={e => {
                                             if (isConsulta) return;
                                             if (e.target.checked) {
                                               setForm({ ...form, permisos: [...form.permisos, p.id] });
                                             } else {
                                               setForm({ ...form, permisos: form.permisos.filter(id => id !== p.id) });
                                             }
                                           }}
                                           className={`rounded h-4 w-4 shrink-0 border-red-500/30 text-red-500 focus:ring-red-500/50 ${
                                             isConsulta ? 'bg-red-500/20 cursor-not-allowed' : 'bg-red-500/10'
                                           }`}
                                         />
                                         <div>
                                           <p className="font-semibold text-sm text-red-400">Solo Lectura</p>
                                           <p className="text-xs text-mining-500 leading-normal mt-0.5">{p.descripcion}</p>
                                         </div>
                                       </label>
                                     </div>
                                   );
                                 })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
                      <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
                      <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                        {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Guardar Cambios' : 'Guardar Usuario')}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
