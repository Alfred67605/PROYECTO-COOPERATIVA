import { useState } from 'react';
import { SearchableMaterialSelect } from '../../components/ui/SearchableMaterialSelect';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuth } from '../auth/AuthContext';
import { Wrench, Edit, Trash2, X, Loader2, Plus, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';

interface RepuestoItem {
  material_id: string | number;
  material_nombre?: string;
  cantidad: number;
  costo_unitario: number;
}

const isTest = typeof window !== 'undefined' && !!(window as any).Cypress;

const getTodayLocalDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ServiciosList = () => {
  const { user, canWrite } = useAuth();
  const canEdit = canWrite('servicios');
  const canDelete = canWrite('servicios');
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    codigo: '',
    fecha: getTodayLocalDate(),
    hora: new Date().toTimeString().substring(0,5),
    estado: 'Pendiente',
    equipo_tipo: 'App\\Models\\Maquinaria',
    equipo_id: '',
    boca_mina_id: '',
    costo_mano_obra: '',
    descripcion: '',
    observaciones: '',
    repuestos: [] as RepuestoItem[]
  });
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const { data: maquinaria } = useQuery({ queryKey: ['maquinaria'], queryFn: async () => (await api.get('/maquinaria')).data });
  const { data: vehiculos } = useQuery({ queryKey: ['vehiculos'], queryFn: async () => (await api.get('/vehiculos')).data });
  const { data: materiales } = useQuery({ queryKey: ['materiales'], queryFn: async () => (await api.get('/materiales')).data });
  const { data: bocaminas } = useQuery({ queryKey: ['bocaminas'], queryFn: async () => (await api.get('/bocaminas')).data });

  const { data, isLoading } = useQuery({
    queryKey: ['servicios'],
    queryFn: async () => (await api.get('/servicios')).data
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const costosPayload = form.costo_mano_obra && parseFloat(form.costo_mano_obra) > 0
        ? [{ tipo_costo: 'Mano de Obra / Servicio', monto: parseFloat(form.costo_mano_obra), descripcion: 'Costo del servicio' }]
        : [];

      const payload = {
        ...form,
        equipo_id: Number(form.equipo_id),
        boca_mina_id: form.boca_mina_id ? Number(form.boca_mina_id) : null,
        costos: costosPayload,
        usuario_registro_id: user?.id,
      };
      if (editingId) return await api.put(`/servicios/${editingId}`, payload);
      return await api.post('/servicios', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(
        editingId ? 'Servicio actualizado' : 'Servicio registrado',
        editingId ? 'Los datos se guardaron correctamente.' : 'El servicio fue añadido al sistema.'
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
    mutationFn: async (id: number) => await api.delete(`/servicios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Servicio eliminado', 'El mantenimiento fue eliminado de manera definitiva.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error al eliminar', err.response?.data?.message || 'No se pudo eliminar el servicio.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const openCreate = () => { 
    setForm({ 
      codigo: `SRV-${new Date().getTime().toString().slice(-4)}`, 
      fecha: getTodayLocalDate(),
      hora: new Date().toTimeString().substring(0,5),
      estado: 'Pendiente',
      equipo_tipo: 'App\\Models\\Maquinaria',
      equipo_id: '',
      boca_mina_id: '',
      costo_mano_obra: '',
      descripcion: '',
      observaciones: '',
      repuestos: []
    }); 
    setEditingId(null); setError(''); setShowModal(true); 
  };
  
  const openEdit = (s: any) => {
    const manoObra = s.costos?.find((c: any) => c.tipo_costo === 'Mano de Obra / Servicio')?.monto || s.costos?.[0]?.monto || '';
    setForm({ 
      codigo: s.codigo, fecha: s.fecha, hora: s.hora?.substring(0,5) || '08:00', estado: s.estado,
      equipo_tipo: s.equipo_tipo, equipo_id: String(s.equipo_id),
      boca_mina_id: s.boca_mina_id ? String(s.boca_mina_id) : '',
      costo_mano_obra: manoObra ? String(manoObra) : '',
      descripcion: s.descripcion || '', observaciones: s.observaciones || '',
      repuestos: s.repuestos?.map((r: any) => ({
        material_id: r.material_id,
        material_nombre: r.material?.nombre || r.material?.descripcion || '',
        cantidad: r.cantidad,
        costo_unitario: r.costo_unitario
      })) || []
    });
    setEditingId(s.id); setError(''); setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);
  const handleDelete = (id: number, codigo: string) => { setDeleteTarget({ id, nombre: codigo }); setConfirmOpen(true); };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Historial de Mantenimientos</h2>
        {canEdit && (
          <button className="btn-primary py-2 text-sm" onClick={openCreate}>
            <Plus size={16} />
            Nuevo Mantenimiento
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
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  {canEdit && <th className="pr-6 text-right">Acciones</th>}
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {data?.map((s: any) => (
                  <motion.tr variants={tableRowVariant} key={s.id} className="group">
                    <td className="pl-6 font-mono text-mining-400 text-sm">
                      <div className="flex items-center gap-1"><Hash size={12}/>{s.codigo}</div>
                    </td>
                    <td className="text-sm text-mining-300">{s.fecha} {s.hora}</td>
                    <td>
                      <p className="font-medium text-white">{getEquipoLabel(s.equipo_tipo, s.equipo)}</p>
                      <p className="text-xs text-mining-400">{s.equipo_tipo.split('\\').pop()}</p>
                    </td>
                    <td className="text-sm text-mining-300">{s.usuario_registro?.nombre || 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        s.estado === 'Finalizado' ? 'badge-success' : 
                        s.estado === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'badge-danger'
                      }`}>
                        {s.estado}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(s)} className="btn-icon">
                            <Edit size={16} />
                          </button>
                          {canDelete && (
                            <button onClick={() => handleDelete(s.id, s.codigo)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
                {(!data || data.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Wrench size={48} className="text-mining-200 mx-auto mb-4" />
                      <p className="text-mining-500 font-medium">No hay mantenimientos registrados.</p>
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
          title="Eliminar Servicio"
          message={`¿Estás seguro de que deseas eliminar el servicio "${deleteTarget?.nombre}" de manera definitiva? Esta acción no se puede deshacer.`}
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
            <motion.div initial={isTest ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4 overflow-y-auto" onClick={closeModal}>
              <motion.div initial={isTest ? false : { scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl w-full max-w-2xl shadow-elevated border border-white/10 overflow-hidden flex flex-col max-h-[85vh] my-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/[0.02] shrink-0">
                  <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}</h3>
                  <button onClick={closeModal} className="text-mining-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="flex flex-col flex-1 overflow-hidden">
                  <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                    {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Código *</label>
                        <input className="input-field" required value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} disabled={!!editingId} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Estado *</label>
                        <select className="input-field" required value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Finalizado">Finalizado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Fecha *</label>
                        <input type="date" className="input-field" required value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Hora *</label>
                        <input type="time" className="input-field" required value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} />
                      </div>
                    </div>

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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Bocamina / Ubicación</label>
                        <select className="input-field" value={form.boca_mina_id} onChange={e => setForm({...form, boca_mina_id: e.target.value})}>
                          <option value="">Bodega Central / Ninguna</option>
                          {Array.isArray(bocaminas) && bocaminas.map((b: any) => (
                            <option key={b.id} value={b.id}>{b.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Costo Servicio / Mano Obra (Bs.)</label>
                        <input type="number" step="0.01" min="0" placeholder="Ej: 500.00" className="input-field" value={form.costo_mano_obra} onChange={e => setForm({...form, costo_mano_obra: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Descripción del Trabajo</label>
                        <textarea className="input-field" rows={2} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase mb-2">Observaciones</label>
                        <textarea className="input-field" rows={2} value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})}></textarea>
                      </div>
                    </div>

                    {/* Sección de Repuestos */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-white">Repuestos y Materiales a Usar</h4>
                        <button 
                          type="button" 
                          className="btn-secondary py-1 px-3 text-xs" 
                          onClick={() => setForm({...form, repuestos: [...form.repuestos, { material_id: '', material_nombre: '', cantidad: 1, costo_unitario: 0 }]})}
                        >
                          <Plus size={14} className="mr-1" />
                          Añadir Repuesto
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {form.repuestos.map((rep, idx) => (
                          <div key={idx} className="flex gap-3 items-end bg-black/20 p-3 rounded-lg border border-white/5">
                            <div className="flex-1">
                              <label className="block text-xs text-mining-400 mb-1">Buscar Producto / Repuesto</label>
                              <SearchableMaterialSelect
                                materials={materiales?.data || materiales || []}
                                value={rep.material_nombre || ''}
                                placeholder="Escribe o selecciona repuesto..."
                                onChange={selected => {
                                  const newReps = [...form.repuestos];
                                  newReps[idx].material_nombre = selected.nombre;
                                  newReps[idx].material_id = selected.id;
                                  if (selected.material?.precio_unitario) {
                                    newReps[idx].costo_unitario = parseFloat(String(selected.material.precio_unitario)) || 0;
                                  }
                                  setForm({...form, repuestos: newReps});
                                }}
                              />
                            </div>
                            <div className="w-20">
                              <label className="block text-xs text-mining-400 mb-1">Cant.</label>
                              <input 
                                type="number" 
                                className="input-field py-2 text-sm" 
                                required 
                                min="1" 
                                step="1"
                                value={rep.cantidad} 
                                onChange={e => {
                                  const newReps = [...form.repuestos];
                                  newReps[idx].cantidad = parseInt(e.target.value) || 0;
                                  setForm({...form, repuestos: newReps});
                                }} 
                              />
                            </div>
                            <div className="w-28">
                              <label className="block text-xs text-mining-400 mb-1">Costo Unit.</label>
                              <input 
                                type="number" 
                                className="input-field py-2 text-sm" 
                                required 
                                step="0.01"
                                min="0"
                                value={rep.costo_unitario} 
                                onChange={e => {
                                  const newReps = [...form.repuestos];
                                  newReps[idx].costo_unitario = parseFloat(e.target.value) || 0;
                                  setForm({...form, repuestos: newReps});
                                }} 
                              />
                            </div>
                            <div className="w-28 bg-mining-900/50 rounded-lg p-2 border border-white/5 flex flex-col justify-end">
                              <span className="block text-xs text-mining-400 mb-1">Total</span>
                              <span className="font-bold text-white text-sm">
                                Bs. {((rep.cantidad || 0) * (rep.costo_unitario || 0)).toFixed(2)}
                              </span>
                            </div>
                            <button 
                              type="button" 
                              className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10 mb-[2px]"
                              onClick={() => {
                                const newReps = form.repuestos.filter((_, i) => i !== idx);
                                setForm({...form, repuestos: newReps});
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        {form.repuestos.length === 0 && (
                          <p className="text-xs text-mining-500 text-center py-4 bg-black/10 rounded-lg border border-dashed border-white/10">
                            No se han añadido repuestos a este servicio.
                          </p>
                        )}
                        {form.repuestos.length > 0 && (
                          <div className="flex justify-end pt-2 pr-12">
                            <span className="text-sm font-bold text-mining-300 mr-4">Total Repuestos:</span>
                            <span className="text-lg font-bold text-teal-400">
                              Bs. {form.repuestos.reduce((sum, rep) => sum + ((rep.cantidad || 0) * (rep.costo_unitario || 0)), 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fixed Footer Buttons */}
                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-obsidian-950/90 shrink-0">
                    <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
                    <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                      {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Guardar Cambios' : 'Guardar Mantenimiento')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
