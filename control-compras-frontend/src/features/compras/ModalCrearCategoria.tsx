import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useToast } from '../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, Tag, FileText, Hash, X, Loader2, Save } from 'lucide-react';

const isTest = typeof window !== 'undefined' && !!(window as any).Cypress;

interface ModalCrearCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (nuevaCategoria: any) => void;
  editingCategoria?: any;
}

export const ModalCrearCategoria = ({ isOpen, onClose, onSuccess, editingCategoria }: ModalCrearCategoriaProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  // Sync state when editingCategoria changes or modal opens
  useState(() => {
    if (editingCategoria) {
      setNombre(editingCategoria.nombre || '');
      setCodigo(editingCategoria.codigo || '');
      setDescripcion(editingCategoria.descripcion || '');
    }
  });

  // Also sync on open/change via useEffect
  useState(() => {
    if (isOpen) {
      setNombre(editingCategoria?.nombre || '');
      setCodigo(editingCategoria?.codigo || '');
      setDescripcion(editingCategoria?.descripcion || '');
      setError('');
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        nombre: nombre.trim(),
        codigo: codigo.trim() || null,
        descripcion: descripcion.trim() || null,
        estado: editingCategoria?.estado || 'activo'
      };
      
      const res = editingCategoria 
        ? await api.put(`/categorias/${editingCategoria.id}`, payload)
        : await api.post('/categorias', payload);
        
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        editingCategoria ? 'Categoría Actualizada' : 'Categoría Creada', 
        `La categoría "${nombre}" se ha registrado/guardado exitosamente.`
      );
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['materiales-grupos'] });
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
      
      if (onSuccess) {
        onSuccess(data?.data || data);
      }
      handleClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.errors?.nombre?.[0] || 'Error al guardar la categoría';
      setError(msg);
      toast.error('Error', msg);
    }
  });

  const handleClose = () => {
    setNombre('');
    setCodigo('');
    setDescripcion('');
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }
    setError('');
    createMutation.mutate();
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={isTest ? false : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-obsidian-900 border border-white/10 rounded-2xl shadow-elevated overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-copper-500/10 text-copper-400 rounded-xl border border-copper-500/20">
                  <FolderPlus size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                  <p className="text-xs text-mining-400">{editingCategoria ? 'Actualizar detalles de la categoría de materiales' : 'Crear una categoría para clasificación de compras e inventario'}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-mining-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                  Nombre de la Categoría *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mining-500" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Herramientas de Corte, Mangueras y Conexiones"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="input-field pl-11 py-2.5 w-full"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                  Código / Prefijo (Opcional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mining-500" size={18} />
                  <input
                    type="text"
                    placeholder="Ej. G-12, HERR-C, MANG"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="input-field pl-11 py-2.5 w-full font-mono uppercase"
                  />
                </div>
                <p className="text-[11px] text-mining-500 mt-1">Identificador de grupo usado en correlativos de códigos de material.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                  Descripción (Opcional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 text-mining-500" size={18} />
                  <textarea
                    rows={3}
                    placeholder="Detalles sobre los ítems incluidos en esta categoría..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="input-field pl-11 py-2.5 w-full resize-none"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={createMutation.isPending}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Guardar Categoría
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
