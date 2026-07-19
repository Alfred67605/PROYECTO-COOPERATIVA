import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Map, Edit, Trash2, X, Loader2, Plus, MapPin, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';
import { useAuth } from '../auth/AuthContext';

interface BocaminaForm {
  nombre: string;
  ubicacion: string;
}

const emptyForm: BocaminaForm = { nombre: '', ubicacion: '' };

export const BocaminasList = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BocaminaForm>(emptyForm);
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['bocaminas'],
    queryFn: async () => (await api.get('/bocaminas')).data
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) return await api.put(`/bocaminas/${editingId}`, form);
      return await api.post('/bocaminas', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bocaminas'] });
      toast.success(
        editingId ? 'Bocamina actualizada' : 'Bocamina registrada',
        editingId ? 'Los datos se guardaron correctamente.' : 'La bocamina fue añadida al sistema.'
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
    mutationFn: async (id: number) => await api.delete(`/bocaminas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bocaminas'] });
      toast.success('Bocamina inhabilitada', 'El registro fue marcado como inactivo.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error al inhabilitar', err.response?.data?.message || 'No se pudo inhabilitar la bocamina.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (b: any) => {
    setForm({ nombre: b.nombre, ubicacion: b.ubicacion || '' });
    setEditingId(b.id); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); setError(''); };
  const handleDelete = (id: number, nombre: string) => { setDeleteTarget({ id, nombre }); setConfirmOpen(true); };
  const confirmDelete = () => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Bocaminas</h1>
          <p className="section-subtitle">Gestión de bocaminas y frentes de trabajo</p>
        </div>
        {canWrite('bocaminas') && (
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={18} />
            Nueva Bocamina
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
                  <th className="pl-6 w-20">ID</th>
                  <th>Nombre</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th className="pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {data?.map((b: any) => (
                  <motion.tr variants={tableRowVariant} key={b.id} className="group">
                    <td className="pl-6 font-mono text-mining-400 text-sm">
                      <div className="flex items-center gap-1">
                        <Hash size={12} /> {b.id.toString().padStart(3, '0')}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                          <Map size={20} />
                        </div>
                        <p className="font-bold text-white">{b.nombre}</p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-mining-400 flex items-center gap-2">
                        <MapPin size={14} className="text-copper-500" />
                        {b.ubicacion || <span className="italic text-mining-500">Sin especificar</span>}
                      </p>
                    </td>
                    <td>
                      <span className={`badge ${b.estado ? 'badge-success' : 'badge-danger'}`}>
                        {b.estado ? 'Operativa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canWrite('bocaminas') && (
                          <>
                            <button onClick={() => openEdit(b)} className="btn-icon">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(b.id, b.nombre)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10">
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
                      <Map size={48} className="text-mining-200 mx-auto mb-4" />
                      <p className="text-mining-500 font-medium">No hay bocaminas registradas en el sistema.</p>
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
          title="Inhabilitar Bocamina"
          message={`¿Estás seguro de que deseas inhabilitar la bocamina "${deleteTarget?.nombre}"?`}
          confirmLabel="Inhabilitar"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={confirmDelete}
          onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        />,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto" onClick={closeModal}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl w-full max-w-md shadow-elevated border border-white/10 overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Map size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Bocamina' : 'Nueva Bocamina'}</h3>
                  </div>
                  <button onClick={closeModal} className="text-mining-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"><X size={20} /></button>
                </div>

                <div className="p-6">
                  {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</div>}

                  <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Nombre de Bocamina *</label>
                      <input className="input-field" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Bocamina San José Nivel 4" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Ubicación Geográfica</label>
                      <input className="input-field" value={form.ubicacion} onChange={e => setForm({...form, ubicacion: e.target.value})} placeholder="Coordenadas o descripción de acceso..." />
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
                      <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
                      <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                        {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Guardar Cambios' : 'Guardar Bocamina')}
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
