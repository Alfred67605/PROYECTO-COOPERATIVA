import { useState } from 'react';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Search, Plus, Package, Star, Edit, Trash2, X, Loader2, UploadCloud, Image as ImageIcon, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../auth/AuthContext';
import { ModalCrearCategoria } from '../compras/ModalCrearCategoria';

const isTest = typeof window !== 'undefined' && !!(window as any).Cypress;

/**
 * Auto-generate the next code for a group by inspecting existing materials.
 * Detects the prefix pattern from existing codes (e.g., G-1/0018 → G-1/0019).
 */
const getNextCodeForGroup = (group: string, allMaterials: any[]) => {
  const materialsList = Array.isArray(allMaterials) ? allMaterials : [];
  const groupMaterials = materialsList.filter((m: any) => m.grupo === group);

  let code = '';
  if (groupMaterials.length === 0) {
    const prefix = group.substring(0, 3).toUpperCase();
    code = `${prefix}-01`;
  } else {
    // Find the last code in this group
    const lastMat = groupMaterials[groupMaterials.length - 1];
    const lastCode = lastMat.codigo || '';

    // Try pattern: PREFIX/NNNN (e.g., G-1/0017)
    const slashMatch = lastCode.match(/^(.+)\/(0*)(\d+)$/);
    if (slashMatch) {
      const prefix = slashMatch[1];
      const padLen = (slashMatch[2] + slashMatch[3]).length;
      const nextNum = parseInt(slashMatch[3], 10) + 1;
      code = `${prefix}/${String(nextNum).padStart(padLen, '0')}`;
    } else {
      // Try pattern: PREFIX-NN (e.g., HERR-05)
      const dashMatch = lastCode.match(/^(.+)-(\d+)$/);
      if (dashMatch) {
        const prefix = dashMatch[1];
        const padLen = dashMatch[2].length;
        const nextNum = parseInt(dashMatch[2], 10) + 1;
        code = `${prefix}-${String(nextNum).padStart(padLen, '0')}`;
      } else {
        code = `${group.substring(0, 3).toUpperCase()}-${String(groupMaterials.length + 1).padStart(2, '0')}`;
      }
    }
  }

  // Ensure unique code
  let isUnique = !materialsList.some((m: any) => m.codigo === code);
  let attempts = 0;
  while (!isUnique && attempts < 100) {
    attempts++;
    // Increment the numeric part of the code
    const numMatch = code.match(/(\d+)$/);
    if (numMatch) {
      const numStr = numMatch[1];
      const nextNum = parseInt(numStr, 10) + 1;
      const padded = String(nextNum).padStart(numStr.length, '0');
      code = code.substring(0, code.length - numStr.length) + padded;
    } else {
      code = `${code}-${attempts}`;
    }
    isUnique = !materialsList.some((m: any) => m.codigo === code);
  }

  return code;
};

interface MaterialForm {
  codigo: string;
  descripcion: string;
  grupo: string;
}

const emptyForm: MaterialForm = {
  codigo: '',
  descripcion: '',
  grupo: ''
};

export const InventarioList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { canWrite } = useAuth();

  const [activeTab, setActiveTab] = useState<'materiales' | 'categorias'>('materiales');
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

  // Categorías Tab State
  const [catSearch, setCatSearch] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<any>(null);
  const [confirmCatOpen, setConfirmCatOpen] = useState(false);
  const [deleteCatTarget, setDeleteCatTarget] = useState<any>(null);

  const canEdit = canWrite('materiales');
  const canDelete = canWrite('materiales');

  // Fetch categories dynamically
  const { data: categoriasData, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ['categorias', catSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (catSearch) params.append('search', catSearch);
      const res = await api.get(`/categorias?${params.toString()}`);
      return res.data;
    },
    enabled: activeTab === 'categorias'
  });

  const rawCategorias = Array.isArray(categoriasData) ? categoriasData : (categoriasData?.data || []);
  const allCategorias = Array.isArray(rawCategorias) ? rawCategorias : [];

  const deleteCatMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/categorias/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['materiales-grupos'] });
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
      toast.success('Categoría eliminada', 'La categoría fue eliminada de manera definitiva.');
      setConfirmCatOpen(false);
      setDeleteCatTarget(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'No se pudo eliminar la categoría.';
      toast.error('Error al eliminar', msg);
      setConfirmCatOpen(false);
      setDeleteCatTarget(null);
    }
  });

  const confirmDeleteCat = () => {
    if (deleteCatTarget) {
      deleteCatMutation.mutate(deleteCatTarget.id);
    }
  };

  // Fetch groups dynamically from the API
  const { data: gruposData } = useQuery({
    queryKey: ['materiales-grupos'],
    queryFn: async () => {
      const res = await api.get('/materiales/grupos');
      return res.data as string[];
    }
  });

  const GRUPOS = gruposData || [];

  const { data: allMaterialsData } = useQuery({
    queryKey: ['all-materiales'],
    queryFn: async () => {
      const res = await api.get('/materiales');
      return res.data;
    }
  });

  const [page, setPage] = useState(1);
  const pageSize = 20;

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

  const rawItems = Array.isArray(data) ? data : (data?.data || []);
  const allItems = Array.isArray(rawItems) ? rawItems : [];
  const totalPages = Math.ceil(allItems.length / pageSize) || 1;
  const paginatedItems = allItems.slice((page - 1) * pageSize, page * pageSize);

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
      toast.success('Material eliminado', 'El material fue eliminado de manera definitiva.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error('Error al eliminar', err.response?.data?.message || 'No se pudo eliminar el material.');
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const openCreate = () => {
    const defaultGroup = GRUPOS[0] || '';
    const rawAllMat = Array.isArray(allMaterialsData) ? allMaterialsData : (allMaterialsData?.data || []);
    const nextCode = getNextCodeForGroup(defaultGroup, rawAllMat);
    setForm({
      codigo: nextCode,
      descripcion: '',
      grupo: defaultGroup
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
      grupo: m.grupo || GRUPOS[0] || ''
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

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">
            {activeTab === 'materiales' ? 'Inventario de Materiales' : 'Categorías de Materiales'}
          </h1>
          <p className="section-subtitle">
            {activeTab === 'materiales' 
              ? 'Catálogo maestro de todos los productos de la cooperativa' 
              : 'Gestión y clasificación de grupos para el inventario y catálogo'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {activeTab === 'materiales' ? (
            <>
              <div className="relative flex-1 lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar material o código..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="input-field pl-10 py-3 text-sm font-medium"
                />
              </div>

              <CustomSelect
                options={[
                  { value: '', label: 'Todos los grupos' },
                  ...GRUPOS.map(grp => ({ value: grp, label: grp }))
                ]}
                value={selectedGrupo}
                onChange={(val) => { setSelectedGrupo(val); setPage(1); }}
                placeholder="Todos los grupos"
                className="flex-1 lg:w-64"
              />

              {canEdit && (
                <button className="btn-primary group h-[46px] px-5 text-sm font-bold" onClick={openCreate}>
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  <span className="hidden sm:inline">Nuevo Material</span>
                </button>
              )}
            </>
          ) : (
            <>
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {canEdit && (
                <button 
                  className="btn-primary group" 
                  onClick={() => {
                    setEditingCategoria(null);
                    setShowCatModal(true);
                  }}
                >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                  <span>Nueva Categoría</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 space-x-8">
        <button
          onClick={() => setActiveTab('materiales')}
          className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'materiales'
              ? 'border-copper-500 text-copper-400'
              : 'border-transparent text-mining-400 hover:text-white'
          }`}
        >
          Materiales
        </button>
        <button
          onClick={() => setActiveTab('categorias')}
          className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'categorias'
              ? 'border-copper-500 text-copper-400'
              : 'border-transparent text-mining-400 hover:text-white'
          }`}
        >
          Categorías
        </button>
      </div>

      {activeTab === 'materiales' ? (
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
                <tbody>
                  {paginatedItems.map((item: any) => (
                    <tr
                      key={item.id}
                      className="border-b border-mining-50 hover:bg-mining-50/50 transition-colors group"
                    >
                      {/* Imagen Column */}
                      <td className="py-4 px-6 w-24">
                        <div className="w-[60px] h-[60px] shrink-0 rounded-xl overflow-hidden bg-obsidian-800 border border-white/5 relative group-hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all">
                          <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                          {item.imagen ? (
                            <img src={item.imagen} alt={item.descripcion} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-obsidian-900 text-teal-400/60 group-hover:text-teal-400 transition-colors">
                              <Package size={24} />
                            </div>
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
                    </tr>
                  ))}

                  {(!allItems || allItems.length === 0) && (
                    <tr>
                      <td colSpan={canEdit ? 4 : 3} className="py-12 text-center text-mining-500">
                        <Package size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium text-white">No hay materiales</p>
                        <p className="text-sm mt-1">Ajusta tu búsqueda o agrega un nuevo material.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/5 bg-obsidian-950/30 text-xs text-mining-400">
              <div>
                Mostrando <span className="font-bold text-white">{(page - 1) * pageSize + 1}</span> a <span className="font-bold text-white">{Math.min(page * pageSize, allItems.length)}</span> de <span className="font-bold text-white">{allItems.length}</span> materiales
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <span className="px-3 py-1.5 font-mono text-mining-300 font-bold">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold cursor-pointer"
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-premium w-full text-left">
              <thead>
                <tr>
                  <th className="px-6 py-3 font-medium pl-6">Código / Prefijo</th>
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">Descripción</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  {canEdit && <th className="pr-6 py-3 text-right w-28">Acciones</th>}
                </tr>
              </thead>
              {isLoadingCategorias ? (
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-4 px-6"><div className="h-4 w-16 bg-white/5 rounded animate-pulse"></div></td>
                      <td className="py-4 px-6"><div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div></td>
                      <td className="py-4 px-6"><div className="h-4 w-48 bg-white/5 rounded animate-pulse"></div></td>
                      <td className="py-4 px-6"><div className="h-6 w-16 bg-white/5 rounded animate-pulse"></div></td>
                      {canEdit && <td className="py-4 px-6 text-right"><div className="h-8 w-16 bg-white/5 rounded ml-auto animate-pulse"></div></td>}
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  {allCategorias.map((cat: any) => (
                    <tr key={cat.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6 pl-6 font-mono text-xs font-bold text-mining-300">
                        {cat.codigo || '-'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-white">
                        {cat.nombre}
                      </td>
                      <td className="py-4 px-6 text-mining-300 text-sm">
                        {cat.descripcion || <span className="text-mining-500 italic">Sin descripción</span>}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`badge ${cat.estado === 'activo' ? 'badge-success' : 'badge-neutral'}`}>
                          {cat.estado}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="pr-6 text-right w-28">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingCategoria(cat);
                                setShowCatModal(true);
                              }}
                              className="btn-icon"
                              title="Editar Categoría"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteCatTarget(cat);
                                setConfirmCatOpen(true);
                              }}
                              className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10"
                              title="Eliminar Categoría"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {allCategorias.length === 0 && (
                    <tr>
                      <td colSpan={canEdit ? 5 : 4} className="py-12 text-center text-mining-500">
                        <Filter size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium text-white">No hay categorías</p>
                        <p className="text-sm mt-1">Intenta con otra búsqueda o agrega una nueva categoría.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>
        </div>
      )}

      {createPortal(
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Eliminar Material"
          message={`¿Estás seguro de que deseas inhabilitar el material "${deleteTarget?.descripcion}"?`}
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
        <AnimatePresence>
          {showModal && (
            <motion.div initial={isTest ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center z-[60] p-4 overflow-y-auto" onClick={closeModal}>
              <motion.div initial={isTest ? false : { scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
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
                      {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Guardar Cambios' : 'Guardar Material')}
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

      {createPortal(
        <ModalCrearCategoria
          isOpen={showCatModal}
          onClose={() => {
            setShowCatModal(false);
            setEditingCategoria(null);
          }}
          editingCategoria={editingCategoria}
        />,
        document.body
      )}

      {createPortal(
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Eliminar Material"
          message={`¿Estás seguro de que deseas eliminar el material "${deleteTarget?.descripcion}" de manera definitiva? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
          onCancel={() => {
            setConfirmOpen(false);
            setDeleteTarget(null);
          }}
        />,
        document.body
      )}

      {createPortal(
        <ConfirmDialog
          isOpen={confirmCatOpen}
          title="Eliminar Categoría"
          message={`¿Estás seguro de que deseas eliminar la categoría "${deleteCatTarget?.nombre}" de manera definitiva? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={deleteCatMutation.isPending}
          onConfirm={confirmDeleteCat}
          onCancel={() => {
            setConfirmCatOpen(false);
            setDeleteCatTarget(null);
          }}
        />,
        document.body
      )}
    </div>
  );
};
