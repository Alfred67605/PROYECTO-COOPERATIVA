import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Search, Plus, Package, Star, Edit, Trash2, X, Loader2, UploadCloud, Image as ImageIcon, Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../auth/AuthContext';
import { staggerContainer, staggerItem } from '../../components/ui/PageTransition';

const PREFIX_MAP: { [key: string]: string } = {
  'Herramientas': 'HERR',
  'Combustibles': 'COMB',
  'Cambio de aceite': 'ACEI',
  'Lubricantes': 'LUB',
  'Automotores': 'AUTO',
  'Vehículos registrados': 'VEHI',
  'Máquina de perforación': 'PERF',
  'Materiales': 'MAT',
  'Herramientas manuales': 'MANU',
  'Maderas': 'MADE',
  'Reparaciones': 'REPA',
  'Otros': 'OTRO'
};

const getNextCodeForGroup = (group: string, allMaterials: any[]) => {
  const prefix = PREFIX_MAP[group] || 'MAT';
  const groupMaterials = allMaterials.filter((m: any) => m.grupo === group);
  
  let maxNum = 0;
  const regex = new RegExp(`^${prefix}-(\\d+)$`, 'i');
  
  groupMaterials.forEach((m: any) => {
    const match = m.codigo.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  
  const nextNum = maxNum > 0 ? maxNum + 1 : groupMaterials.length + 1;
  return `${prefix}-${String(nextNum).padStart(2, '0')}`;
};

interface MaterialForm {
  codigo: string;
  descripcion: string;
  grupo: string;
}

const emptyForm: MaterialForm = {
  codigo: '',
  descripcion: '',
  grupo: 'Herramientas'
};

const GRUPOS = [
  'Herramientas',
  'Combustibles',
  'Cambio de aceite',
  'Lubricantes',
  'Automotores',
  'Vehículos registrados',
  'Máquina de perforación',
  'Materiales',
  'Herramientas manuales',
  'Maderas',
  'Reparaciones',
  'Otros'
];

export const InventarioList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { canWrite } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MaterialForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDeleted, setImageDeleted] = useState(false);
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; descripcion: string } | null>(null);

  const canEdit = canWrite('materiales');
  const canDelete = canWrite('materiales');

  const { data: allMaterialsData } = useQuery({
    queryKey: ['all-materiales'],
    queryFn: async () => {
      const res = await api.get('/materiales');
      return res.data;
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['materiales', search, selectedGrupo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedGrupo) params.append('grupo', selectedGrupo);
      const res = await api.get(`/materiales?${params.toString()}`);
      return res.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let response;
      if (editingId) {
        response = await api.put(`/materiales/${editingId}`, form);
      } else {
        response = await api.post('/materiales', form);
      }

      const matId = editingId || response.data.id;

      if (imageDeleted && editingId) {
        await api.delete(`/materiales/${editingId}/imagen`);
      }

      if (imageFile && matId) {
        const formData = new FormData();
        formData.append('imagen', imageFile);
        await api.post(`/materiales/${matId}/imagen`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
      queryClient.invalidateQueries({ queryKey: ['all-materiales'] });
      toast.success(
        editingId ? 'Material actualizado' : 'Material registrado',
        editingId ? 'Los datos se guardaron correctamente.' : 'El material fue añadido al catálogo.'
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
    mutationFn: async (id: number) => await api.delete(`/materiales/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
      queryClient.invalidateQueries({ queryKey: ['all-materiales'] });
      toast.success('Material inhabilitado', 'El material fue marcado como inactivo.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error al inhabilitar', err.response?.data?.message || 'No se pudo inhabilitar el material.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const openCreate = () => {
    const nextCode = getNextCodeForGroup('Herramientas', allMaterialsData?.data || []);
    setForm({
      codigo: nextCode,
      descripcion: '',
      grupo: 'Herramientas'
    });
    setEditingId(null);
    setError('');
    setImageFile(null);
    setPreviewUrl(null);
    setImageDeleted(false);
    setShowModal(true);
  };

  const openEdit = (m: any) => {
    setForm({
      codigo: m.codigo,
      descripcion: m.descripcion,
      grupo: m.grupo || 'Herramientas'
    });
    setEditingId(m.id);
    setError('');
    setImageFile(null);
    setPreviewUrl(m.imagen || null);
    setImageDeleted(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setImageFile(null);
    setPreviewUrl(null);
    setImageDeleted(false);
  };

  const handleDelete = (id: number, descripcion: string) => {
    setDeleteTarget({ id, descripcion });
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };

  const getGroupImage = (grupo: string = '') => {
    const hash = grupo.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const photos = [
      'https://images.unsplash.com/photo-1587315332822-6b95b8630bb3?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581166397007-0bc44d637f1c?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620286828590-e54dbf83c185?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586942913160-c4e9ed1129b2?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508344928928-7137b29de218?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?q=80&w=200&auto=format&fit=crop',
    ];
    return photos[hash % photos.length];
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Materiales</h1>
          <p className="section-subtitle">Catálogo maestro de todos los productos de la cooperativa</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
            <input
              type="text"
              placeholder="Buscar material o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="relative flex-1 lg:w-56">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={16} />
            <select
              value={selectedGrupo}
              onChange={(e) => setSelectedGrupo(e.target.value)}
              className="input-field pl-10 pr-10 bg-obsidian-950/50 appearance-none cursor-pointer text-sm w-full"
            >
              <option value="" className="bg-obsidian-950">Todas las categorías</option>
              {GRUPOS.map(grp => (
                <option key={grp} value={grp} className="bg-obsidian-950">{grp}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-mining-400 pointer-events-none" size={16} />
          </div>

          {canEdit && (
            <button className="btn-primary group" onClick={openCreate}>
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span className="hidden sm:inline">Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th className="px-6 font-medium w-24">Imagen</th>
                <th className="px-6 font-medium">Producto</th>
                <th className="px-6 font-medium w-48 text-right">SKU</th>
                {canEdit && <th className="pr-6 text-right w-28">Acciones</th>}
              </tr>
            </thead>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-mining-50">
                      <td className="py-4 px-6 w-24">
                        <div className="w-[60px] h-[60px] rounded-xl bg-mining-100 animate-pulse"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <div className="h-4 w-48 bg-mining-100 rounded animate-pulse"></div>
                          <div className="h-3 w-24 bg-mining-100 rounded animate-pulse"></div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="h-6 w-24 bg-mining-100 rounded ml-auto animate-pulse"></div>
                      </td>
                      {canEdit && (
                        <td className="py-4 px-6 text-right w-28">
                          <div className="h-8 w-16 bg-mining-100 rounded ml-auto animate-pulse"></div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              ) : (
                <motion.tbody
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0 }}
                >
                  {data?.data?.map((item: any) => (
                    <motion.tr
                      key={item.id}
                      variants={staggerItem}
                      className="border-b border-mining-50 hover:bg-mining-50/50 transition-colors group"
                    >
                      {/* Imagen Column */}
                      <td className="py-4 px-6 w-24">
                        <div className="w-[60px] h-[60px] shrink-0 rounded-xl overflow-hidden bg-obsidian-800 border border-white/5 relative group-hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all">
                          <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                          {item.imagen ? (
                            <img src={item.imagen} alt={item.descripcion} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <img src={getGroupImage(item.grupo)} alt="Grupo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter grayscale-[20%]" />
                          )}
                        </div>
                      </td>

                      {/* Producto Column */}
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-mining-100 group-hover:text-teal-400 transition-colors">
                            {item.descripcion}
                          </p>
                          {item.grupo && (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-copper-400 bg-copper-500/10 border border-copper-500/20 inline-flex px-2 py-0.5 rounded-md">
                              <Star size={10} className="fill-copper-500" />
                              {item.grupo}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* SKU Column */}
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-mono font-bold bg-white/5 border border-white/10 text-mining-300 rounded-lg whitespace-nowrap shadow-glass-inset">
                          {item.codigo}
                        </span>
                      </td>

                      {/* Acciones Column */}
                      {canEdit && (
                        <td className="pr-6 text-right w-28">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(item)} className="btn-icon">
                              <Edit size={16} />
                            </button>
                            {canDelete && (
                              <button onClick={() => handleDelete(item.id, item.descripcion)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}

                  {(!data?.data || data.data.length === 0) && (
                    <tr>
                      <td colSpan={canEdit ? 4 : 3} className="py-12 text-center text-mining-500">
                        <Package size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium text-white">No se encontraron productos</p>
                        <p className="text-sm mt-1">Ajusta tu búsqueda o agrega un nuevo material.</p>
                      </td>
                    </tr>
                  )}
                </motion.tbody>
              )}
            </AnimatePresence>
          </table>
        </div>
      </div>

      {createPortal(
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Inhabilitar Material"
          message={`¿Estás seguro de que deseas inhabilitar el material "${deleteTarget?.descripcion}"?`}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-[60] p-4 overflow-y-auto" onClick={closeModal}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl w-full max-w-lg shadow-elevated border border-white/10 overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-copper-500/10 text-copper-400 flex items-center justify-center">
                      <Package size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Material' : 'Nuevo Material'}</h3>
                  </div>
                  <button onClick={closeModal} className="text-mining-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"><X size={20} /></button>
                </div>

                <div className="p-6">
                  {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</div>}

                  <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Código / SKU *</label>
                        <input className="input-field" required value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} placeholder="Ej: MAT-001" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Grupo / Categoría *</label>
                        <select 
                          className="input-field bg-obsidian-950" 
                          required 
                          value={form.grupo} 
                          onChange={e => {
                            const newGroup = e.target.value;
                            let nextCode = form.codigo;
                            if (!editingId) {
                              nextCode = getNextCodeForGroup(newGroup, allMaterialsData?.data || []);
                            }
                            setForm({ ...form, grupo: newGroup, codigo: nextCode });
                          }}
                        >
                          {GRUPOS.map(grp => (
                            <option key={grp} value={grp}>{grp}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  <div>
                    <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Descripción / Nombre *</label>
                    <input className="input-field" required value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Pala de punta huevo" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Imagen de Referencia</label>
                    <div className="flex items-center gap-4">
                      {previewUrl ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 group/img">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setImageFile(null); setPreviewUrl(null); setImageDeleted(true); }} className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed border-white/20 bg-white/[0.02] flex items-center justify-center text-mining-500 shrink-0">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          id="image-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setImageFile(file);
                              setPreviewUrl(window.URL.createObjectURL(file));
                              setImageDeleted(false);
                            }
                          }}
                        />
                        <label htmlFor="image-upload" className="btn-secondary text-sm cursor-pointer inline-flex w-full justify-center">
                          <UploadCloud size={16} />
                          Seleccionar Imagen
                        </label>
                        <p className="text-[10px] text-mining-500 mt-1">Formatos: JPG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
                    <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
                    <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                      {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Guardar Cambios' : 'Registrar Producto')}
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
