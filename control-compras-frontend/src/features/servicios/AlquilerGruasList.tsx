import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Truck, Edit, Trash2, X, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';
import { useAuth } from '../auth/AuthContext';

const isTest = typeof window !== 'undefined' && !!(window as any).Cypress;

export const AlquilerGruasList = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    placa_grua: '',
    capacidad_carga: '',
    nombre_chofer: '',
    tiempo_trabajo: '',
    costo: '',
    bocamina_id: ''
  });
  
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; placa: string } | null>(null);

  // Queries
  const { data: bocaminas } = useQuery({
    queryKey: ['bocaminas'],
    queryFn: async () => (await api.get('/bocaminas')).data
  });

  const { data: alquileres, isLoading } = useQuery({
    queryKey: ['alquiler-gruas'],
    queryFn: async () => (await api.get('/alquiler-gruas')).data
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, costo: form.costo ? parseFloat(form.costo) : null };
      if (editingId) return await api.put(`/alquiler-gruas/${editingId}`, payload);
      return await api.post('/alquiler-gruas', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alquiler-gruas'] });
      toast.success(
        editingId ? 'Alquiler actualizado' : 'Alquiler registrado',
        editingId ? 'Los datos de la grúa se actualizaron correctamente.' : 'Se registró el alquiler de la grúa exitosamente.'
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
    mutationFn: async (id: number) => await api.delete(`/alquiler-gruas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alquiler-gruas'] });
      toast.success('Alquiler eliminado', 'El alquiler de grúa fue eliminado de manera definitiva.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error al eliminar', err.response?.data?.message || 'No se pudo eliminar el registro.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const openCreate = () => { 
    setForm({ placa_grua: '', capacidad_carga: '', nombre_chofer: '', tiempo_trabajo: '', costo: '', bocamina_id: '' }); 
    setEditingId(null); setError(''); setShowModal(true); 
  };
  
  const openEdit = (a: any) => {
    setForm({ 
      placa_grua: a.placa_grua, 
      capacidad_carga: a.capacidad_carga || '', 
      nombre_chofer: a.nombre_chofer, 
      tiempo_trabajo: a.tiempo_trabajo || '',
      costo: a.costo?.toString() || '',
      bocamina_id: a.bocamina_id.toString() 
    });
    setEditingId(a.id); setError(''); setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);
  const handleDelete = (id: number, placa: string) => { setDeleteTarget({ id, placa }); setConfirmOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Servicios de Alquiler de Grúas</h2>
        {canWrite('servicios') && (
          <button className="btn-primary py-2 text-sm" onClick={openCreate}>
            <Plus size={16} />
            Registrar Alquiler
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
                  <th className="pl-6">Grúa (Placa / Capacidad)</th>
                  <th>Chófer Asignado</th>
                  <th>Bocamina Destino</th>
                  <th>Tiempo Trabajo</th>
                  <th>Costo Estimado</th>
                  <th className="pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {alquileres?.map((a: any) => (
                  <motion.tr variants={tableRowVariant} key={a.id} className="group">
                    <td className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-copper-500/10 text-copper-400 flex items-center justify-center shrink-0">
                          <Truck size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white">{a.placa_grua}</p>
                          <p className="text-xs text-mining-300">{a.capacidad_carga || 'Capacidad no especificada'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium text-mining-200">{a.nombre_chofer}</td>
                    <td>
                      <span className="badge badge-outline text-mining-200">
                        {a.bocamina?.nombre || 'Bocamina Eliminada'}
                      </span>
                    </td>
                    <td className="text-mining-300">
                      {a.tiempo_trabajo || '-'}
                    </td>
                    <td className="font-medium text-emerald-400">
                      {a.costo ? `Bs. ${parseFloat(a.costo).toLocaleString()}` : 'Por definir'}
                    </td>
                    <td className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canWrite('servicios') && (
                          <>
                            <button onClick={() => openEdit(a)} className="btn-icon">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(a.id, a.placa_grua)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {(!alquileres || alquileres.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Truck size={48} className="text-mining-200 mx-auto mb-4" />
                      <p className="text-mining-500 font-medium">No hay registros de alquiler de grúas.</p>
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
          title="Eliminar Alquiler de Grúa"
          message={`¿Estás seguro de que deseas eliminar el alquiler de la grúa "${deleteTarget?.placa}" de manera definitiva? Esta acción no se puede deshacer.`}
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
              <motion.div initial={isTest ? false : { scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl w-full max-w-lg shadow-elevated border border-white/10 overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Alquiler de Grúa' : 'Nuevo Alquiler de Grúa'}</h3>
                  <button onClick={closeModal} className="text-mining-400 hover:text-white p-2"><X size={20} /></button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</div>}

                  <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Placa de la Grúa *</label>
                        <input className="input-field" required value={form.placa_grua} onChange={e => setForm({...form, placa_grua: e.target.value})} placeholder="Ej: ABC-1234" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Capacidad de Carga</label>
                        <input className="input-field" value={form.capacidad_carga} onChange={e => setForm({...form, capacidad_carga: e.target.value})} placeholder="Ej: 5 Toneladas" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Nombre del Chófer *</label>
                      <input className="input-field" required value={form.nombre_chofer} onChange={e => setForm({...form, nombre_chofer: e.target.value})} placeholder="Nombre completo" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Bocamina Destino *</label>
                      <select className="input-field" required value={form.bocamina_id} onChange={e => setForm({...form, bocamina_id: e.target.value})}>
                        <option value="">Seleccione una bocamina...</option>
                        {bocaminas?.map((b: any) => (
                          <option key={b.id} value={b.id}>{b.nombre}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Tiempo de Trabajo</label>
                        <input className="input-field" value={form.tiempo_trabajo} onChange={e => setForm({...form, tiempo_trabajo: e.target.value})} placeholder="Ej: 5 días, 10 horas" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Costo (Bs.)</label>
                        <input type="number" step="0.01" min="0" className="input-field" value={form.costo} onChange={e => setForm({...form, costo: e.target.value})} placeholder="Monto total a pagar" />
                      </div>
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
