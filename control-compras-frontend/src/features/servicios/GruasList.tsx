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

export const GruasList = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    tipo: 'Grúa Telescópica',
    codigo: '',
    capacidad_carga: 0,
    estado: 'operativa'
  });
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['gruas'],
    queryFn: async () => (await api.get('/gruas')).data
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) return await api.put(`/gruas/${editingId}`, form);
      return await api.post('/gruas', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gruas'] });
      toast.success(
        editingId ? 'Grúa actualizada' : 'Grúa registrada',
        editingId ? 'Los datos se guardaron correctamente.' : 'La grúa fue añadida al sistema.'
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
    mutationFn: async (id: number) => await api.delete(`/gruas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gruas'] });
      toast.success('Grúa eliminada', 'El registro fue eliminado.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error', err.response?.data?.message || 'No se pudo eliminar.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const openCreate = () => { 
    setForm({ tipo: 'Grúa Telescópica', codigo: '', capacidad_carga: 0, estado: 'operativa' }); 
    setEditingId(null); setError(''); setShowModal(true); 
  };
  const openEdit = (g: any) => {
    setForm({ 
      tipo: g.tipo || 'Grúa Telescópica', codigo: g.codigo || '', 
      capacidad_carga: g.capacidad_carga || 0, estado: g.estado 
    });
    setEditingId(g.id); setError(''); setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const handleDelete = (id: number, codigo: string) => { setDeleteTarget({ id, nombre: codigo }); setConfirmOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Catálogo de Grúas</h2>
        {canWrite('servicios') && (
          <button className="btn-primary py-2 text-sm" onClick={openCreate}>
            <Plus size={16} />
            Registrar Grúa
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
                  <th className="pl-6">Código</th>
                  <th>Tipo</th>
                  <th>Capacidad Carga</th>
                  <th>Estado</th>
                  <th className="pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {data?.map((g: any) => (
                  <motion.tr variants={tableRowVariant} key={g.id} className="group">
                    <td className="pl-6 font-bold text-white">
                      {g.codigo}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                          <Truck size={20} />
                        </div>
                        <p className="font-medium text-mining-200">{g.tipo}</p>
                      </div>
                    </td>
                    <td className="text-sm text-mining-300">{g.capacidad_carga ? `${g.capacidad_carga} Ton` : 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        g.estado === 'operativa' ? 'badge-success' : 
                        g.estado === 'en_mantenimiento' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'badge-danger'
                      }`}>
                        {g.estado.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canWrite('servicios') && (
                          <>
                            <button onClick={() => openEdit(g)} className="btn-icon">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(g.id, g.codigo)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10">
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
                      <p className="text-mining-500 font-medium">No hay grúas registradas.</p>
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
          title="Eliminar Grúa"
          message={`¿Estás seguro de que deseas eliminar la grúa "${deleteTarget?.nombre}"?`}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-[60] p-4 overflow-y-auto" onClick={closeModal}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl w-full max-w-lg shadow-elevated border border-white/10 overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Grúa' : 'Nueva Grúa'}</h3>
                  <button onClick={closeModal} className="text-mining-400 hover:text-white p-2"><X size={20} /></button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</div>}

                  <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Código *</label>
                        <input className="input-field" required value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="Ej: GRU-001" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Tipo *</label>
                        <input className="input-field" required value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} placeholder="Grúa Telescópica..." />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Capacidad de Carga (Ton)</label>
                        <input type="number" step="0.01" className="input-field" value={form.capacidad_carga} onChange={e => setForm({...form, capacidad_carga: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Estado *</label>
                        <select className="input-field" required value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                          <option value="operativa">Operativa</option>
                          <option value="en_mantenimiento">En Mantenimiento</option>
                          <option value="inactiva">Inactiva</option>
                        </select>
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
