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

export const VehiculosList = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    tipo: 'Camioneta',
    placa: '',
    marca: '',
    modelo: '',
    estado: 'operativo'
  });
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: async () => (await api.get('/vehiculos')).data
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) return await api.put(`/vehiculos/${editingId}`, form);
      return await api.post('/vehiculos', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(
        editingId ? 'Vehículo actualizado' : 'Vehículo registrado',
        editingId ? 'Los datos se guardaron correctamente.' : 'El vehículo fue añadido al sistema.'
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
    mutationFn: async (id: number) => await api.delete(`/vehiculos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Vehículo eliminado', 'El vehículo fue eliminado de manera definitiva.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error al eliminar', err.response?.data?.message || 'No se pudo eliminar el vehículo.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const openCreate = () => { 
    setForm({ tipo: 'Camioneta', placa: '', marca: '', modelo: '', estado: 'operativo' }); 
    setEditingId(null); setError(''); setShowModal(true); 
  };
  const openEdit = (v: any) => {
    setForm({ 
      tipo: v.tipo || 'Camioneta', placa: v.placa || '', 
      marca: v.marca || '', modelo: v.modelo || '', estado: v.estado 
    });
    setEditingId(v.id); setError(''); setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const handleDelete = (id: number, placa: string) => { setDeleteTarget({ id, nombre: placa }); setConfirmOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Catálogo de Vehículos</h2>
        {canWrite('servicios') && (
          <button className="btn-primary py-2 text-sm" onClick={openCreate}>
            <Plus size={16} />
            Registrar Vehículo
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
                  <th className="pl-6">Placa</th>
                  <th>Tipo</th>
                  <th>Marca / Modelo</th>
                  <th>Estado</th>
                  <th className="pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {data?.map((v: any) => (
                  <motion.tr variants={tableRowVariant} key={v.id} className="group">
                    <td className="pl-6 font-bold text-white">
                      {v.placa}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-copper-500/10 text-copper-400 flex items-center justify-center">
                          <Truck size={20} />
                        </div>
                        <p className="font-medium text-mining-200">{v.tipo}</p>
                      </div>
                    </td>
                    <td className="text-sm text-mining-300">{v.marca} {v.modelo}</td>
                    <td>
                      <span className={`badge ${
                        v.estado === 'operativo' ? 'badge-success' : 
                        v.estado === 'en_mantenimiento' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'badge-danger'
                      }`}>
                        {v.estado.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canWrite('servicios') && (
                          <>
                            <button onClick={() => openEdit(v)} className="btn-icon">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(v.id, v.placa)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10">
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
                      <Truck size={48} className="text-mining-200 mx-auto mb-4" />
                      <p className="text-mining-500 font-medium">No hay vehículos registrados.</p>
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
          title="Eliminar Vehículo"
          message={`¿Estás seguro de que deseas eliminar el vehículo con placa "${deleteTarget?.nombre}" de manera definitiva? Esta acción no se puede deshacer.`}
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
                  <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h3>
                  <button onClick={closeModal} className="text-mining-400 hover:text-white p-2"><X size={20} /></button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</div>}

                  <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Placa *</label>
                        <input className="input-field" required value={form.placa} onChange={e => setForm({...form, placa: e.target.value})} placeholder="Ej: ABC-123" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Tipo *</label>
                        <input className="input-field" required value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} placeholder="Camioneta, Volqueta..." />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Marca</label>
                        <input className="input-field" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Modelo</label>
                        <input className="input-field" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Estado *</label>
                      <select className="input-field" required value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                        <option value="operativo">Operativo</option>
                        <option value="en_mantenimiento">En Mantenimiento</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
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
