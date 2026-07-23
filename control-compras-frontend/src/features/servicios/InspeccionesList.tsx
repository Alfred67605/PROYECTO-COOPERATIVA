import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { FileCheck, Edit, Trash2, X, Loader2, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';
import { useAuth } from '../auth/AuthContext';

const isTest = typeof window !== 'undefined' && !!(window as any).Cypress;

export const InspeccionesList = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    equipo_tipo: 'App\\Models\\Maquinaria',
    equipo_id: '',
    motor_ok: true,
    frenos_ok: true,
    aceite_ok: true,
    neumaticos_ok: true,
    luces_ok: true,
    seguridad_ok: true,
    observaciones: ''
  });
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const { data: maquinaria } = useQuery({ queryKey: ['maquinaria'], queryFn: async () => (await api.get('/maquinaria')).data });
  const { data: vehiculos } = useQuery({ queryKey: ['vehiculos'], queryFn: async () => (await api.get('/vehiculos')).data });

  const { data, isLoading } = useQuery({
    queryKey: ['inspecciones'],
    queryFn: async () => (await api.get('/inspecciones')).data
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, equipo_id: Number(form.equipo_id) };
      if (editingId) return await api.put(`/inspecciones/${editingId}`, payload);
      return await api.post('/inspecciones', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspecciones'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(
        editingId ? 'Inspección actualizada' : 'Inspección registrada',
        editingId ? 'Los datos se guardaron correctamente.' : 'La inspección fue añadida al sistema.'
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
    mutationFn: async (id: number) => await api.delete(`/inspecciones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspecciones'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Inspección eliminada', 'La inspección fue eliminada de manera definitiva.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error al eliminar', err.response?.data?.message || 'No se pudo eliminar la inspección.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const openCreate = () => { 
    setForm({ 
      equipo_tipo: 'App\\Models\\Maquinaria', equipo_id: '', 
      motor_ok: true, frenos_ok: true, aceite_ok: true, neumaticos_ok: true, luces_ok: true, seguridad_ok: true, observaciones: '' 
    }); 
    setEditingId(null); setError(''); setShowModal(true); 
  };
  
  const openEdit = (i: any) => {
    setForm({ 
      equipo_tipo: i.equipo_tipo, equipo_id: i.equipo_id, 
      motor_ok: i.motor_ok, frenos_ok: i.frenos_ok, aceite_ok: i.aceite_ok, neumaticos_ok: i.neumaticos_ok, luces_ok: i.luces_ok, seguridad_ok: i.seguridad_ok, observaciones: i.observaciones || '' 
    });
    setEditingId(i.id); setError(''); setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const handleDelete = (id: number) => { setDeleteTarget({ id, nombre: `Inspección #${id}` }); setConfirmOpen(true); };

  const getEquipos = () => {
    if (form.equipo_tipo === 'App\\Models\\Maquinaria') return maquinaria || [];
    if (form.equipo_tipo === 'App\\Models\\Vehiculo') return vehiculos || [];
    return [];
  };

  const getEquipoLabel = (tipoModelo: string, equipo: any) => {
    if (!equipo) return 'Desconocido';
    if (tipoModelo === 'App\\Models\\Maquinaria') return `${equipo.nombre_codigo} (${equipo.tipo})`;
    if (tipoModelo === 'App\\Models\\Vehiculo') return `${equipo.placa} (${equipo.tipo})`;
    return 'Desconocido';
  };

  const allChecksOk = (i: any) => i.motor_ok && i.frenos_ok && i.aceite_ok && i.neumaticos_ok && i.luces_ok && i.seguridad_ok;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Registro de Inspecciones Pre-Operacionales</h2>
        {canWrite('servicios') && (
          <button className="btn-primary py-2 text-sm" onClick={openCreate}>
            <Plus size={16} />
            Nueva Inspección
          </button>
        )}
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
                  <th className="pl-6">Fecha</th>
                  <th>Equipo</th>
                  <th>Responsable</th>
                  <th>Estado Checklist</th>
                  <th className="pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {data?.map((i: any) => (
                  <motion.tr variants={tableRowVariant} key={i.id} className="group">
                    <td className="pl-6 text-sm text-mining-300">
                      {new Date(i.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <p className="font-medium text-white">{getEquipoLabel(i.equipo_tipo, i.equipo)}</p>
                      <p className="text-xs text-mining-400">{i.equipo_tipo.split('\\').pop()}</p>
                    </td>
                    <td className="text-sm text-mining-300">{i.responsable?.nombre || 'N/A'}</td>
                    <td>
                      {allChecksOk(i) ? (
                        <span className="badge badge-success"><CheckCircle size={14} className="mr-1"/>Aprobado</span>
                      ) : (
                        <span className="badge badge-danger"><AlertTriangle size={14} className="mr-1"/>Con Novedades</span>
                      )}
                    </td>
                    <td className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canWrite('servicios') && (
                          <>
                            <button onClick={() => openEdit(i)} className="btn-icon">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(i.id)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {(!data || data.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <FileCheck size={48} className="text-mining-200 mx-auto mb-4" />
                      <p className="text-mining-500 font-medium">No hay inspecciones registradas.</p>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      {createPortal(
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Eliminar Inspección"
          message={`¿Estás seguro de que deseas eliminar la ${deleteTarget?.nombre} de manera definitiva? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
          onCancel={() => setConfirmOpen(false)}
        />,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div initial={isTest ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-[60] p-4 overflow-y-auto" onClick={closeModal}>
              <motion.div initial={isTest ? false : { scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl w-full max-w-2xl shadow-elevated border border-white/10 overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Inspección' : 'Nueva Inspección'}</h3>
                  <button onClick={closeModal} className="text-mining-400 hover:text-white p-2"><X size={20} /></button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</div>}

                  <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Tipo de Equipo *</label>
                        <select className="input-field" required value={form.equipo_tipo} onChange={e => setForm({...form, equipo_tipo: e.target.value, equipo_id: ''})}>
                          <option value="App\Models\Maquinaria">Maquinaria</option>
                          <option value="App\Models\Vehiculo">Vehículo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Equipo *</label>
                        <select className="input-field" required value={form.equipo_id} onChange={e => setForm({...form, equipo_id: e.target.value})}>
                          <option value="">Seleccione Equipo</option>
                          {getEquipos().map((eq: any) => (
                            <option key={eq.id} value={eq.id}>{getEquipoLabel(form.equipo_tipo, eq)}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <h4 className="font-bold text-white mt-6 mb-2">Checklist de Revisión</h4>
                    <div className="grid grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                      {['motor', 'frenos', 'aceite', 'neumaticos', 'luces', 'seguridad'].map((check) => (
                        <label key={check} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(form as any)[`${check}_ok`]} 
                            onChange={e => setForm({...form, [`${check}_ok`]: e.target.checked})}
                            className="w-4 h-4 rounded border-white/20 bg-black/30 text-copper-500 focus:ring-copper-500/50"
                          />
                          <span className="text-sm text-mining-200 capitalize">{check === 'neumaticos' ? 'Neumáticos' : check} OK</span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Observaciones</label>
                      <textarea className="input-field" rows={3} value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} placeholder="Detalle cualquier novedad encontrada..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
                      <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
                      <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                        {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : 'Guardar'}
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
