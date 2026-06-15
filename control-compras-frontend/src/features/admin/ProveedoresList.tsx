import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Building2, Edit, Trash2, X, Loader2, Plus, Mail, Phone, MapPin, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';

interface ProvForm {
  nombre: string;
  nit: string;
  telefono: string;
  direccion: string;
  email: string;
}

const emptyForm: ProvForm = { nombre: '', nit: '', telefono: '', direccion: '', email: '' };

export const ProveedoresList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProvForm>(emptyForm);
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => (await api.get('/proveedores')).data
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) return await api.put(`/proveedores/${editingId}`, form);
      return await api.post('/proveedores', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast.success(
        editingId ? 'Proveedor actualizado' : 'Proveedor creado',
        editingId ? 'Los datos se guardaron correctamente.' : 'El proveedor fue registrado exitosamente.'
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
    mutationFn: async (id: number) => await api.delete(`/proveedores/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast.success('Proveedor inhabilitado', 'El proveedor fue marcado como inactivo.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error al inhabilitar', err.response?.data?.message || 'No se pudo inhabilitar el proveedor.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (p: any) => {
    setForm({ nombre: p.nombre, nit: p.nit || '', telefono: p.telefono || '', direccion: p.direccion || '', email: p.email || '' });
    setEditingId(p.id); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); setError(''); };
  
  const handleDelete = (id: number, nombre: string) => {
    setDeleteTarget({ id, nombre });
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h2 className="section-title">Directorio de Proveedores</h2>
          <p className="section-subtitle">Gestión de empresas asociadas a Minera Cop</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Nuevo Proveedor
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-4">
            {Array.from({length: 5}).map((_, i) => (
              <div key={i} className="h-12 bg-mining-50 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium w-full">
              <thead className="bg-mining-50/80 border-b border-mining-100">
                <tr>
                  <th className="pl-6">Proveedor</th>
                  <th>Contacto</th>
                  <th>NIT</th>
                  <th>Estado</th>
                  <th className="pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {data?.map((p: any) => (
                  <motion.tr variants={tableRowVariant} key={p.id} className="group">
                    <td className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 text-mining-300 flex items-center justify-center font-bold text-sm">
                          {p.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{p.nombre}</p>
                          <p className="text-xs text-mining-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {p.direccion || 'Sin dirección'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <p className="text-sm text-mining-250 flex items-center gap-2">
                          <Phone size={14} className="text-copper-500" />
                          {p.telefono || '-'}
                        </p>
                        <p className="text-xs text-mining-400 flex items-center gap-2">
                          <Mail size={14} className="text-copper-500" />
                          {p.email || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="font-mono text-mining-400 text-sm">
                      <div className="flex items-center gap-1">
                        <Hash size={12} className="text-mining-400" />
                        {p.nit || '-'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.estado ? 'badge-success' : 'badge-danger'}`}>
                        {p.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="btn-icon">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.nombre)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {(!data || data.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Building2 size={48} className="text-mining-200 mx-auto mb-4" />
                      <p className="text-mining-500 font-medium">No hay proveedores registrados en el sistema.</p>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Inhabilitar Proveedor"
        message={`¿Estás seguro de que deseas inhabilitar al proveedor "${deleteTarget?.nombre}"?`}
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
              className="glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl w-full max-w-lg shadow-elevated border border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-copper-500/10 text-copper-400 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
                </div>
                <button onClick={closeModal} className="text-mining-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"><X size={20} /></button>
              </div>
              
              <div className="p-6">
                {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</div>}
                
                <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Nombre o Razón Social *</label>
                    <input className="input-field" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">NIT / RUC</label>
                      <input className="input-field" value={form.nit} onChange={e => setForm({...form, nit: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Teléfono</label>
                      <input className="input-field" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Email</label>
                    <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Dirección</label>
                    <textarea className="input-field" rows={2} value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})}></textarea>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
                    <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
                    <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                      {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Guardar Cambios' : 'Registrar Proveedor')}
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
