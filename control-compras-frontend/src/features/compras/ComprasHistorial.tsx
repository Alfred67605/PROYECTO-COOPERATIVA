import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { ShoppingCart, Plus, Search, Calendar, ChevronDown, ChevronRight, CheckCircle, Clock, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';
import { useAuth } from '../auth/AuthContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export const ComprasHistorial = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const canDelete = canWrite('compras');

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/compras/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Compra eliminada', 'El registro de compra fue eliminado permanentemente.');
      setConfirmOpen(false);
      setDeleteTargetId(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'No se pudo eliminar el registro de compra.';
      toast.error('Error al eliminar', msg);
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  });

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  const { data: compras, isLoading } = useQuery({
    queryKey: ['compras', search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      params.append('page', page.toString());
      const res = await api.get(`/compras?${params.toString()}`);
      return res.data;
    }
  });

  // Lazy-load full details (with detalles.material) when a row is expanded
  const { data: compraDetalle, isLoading: isLoadingDetalle } = useQuery({
    queryKey: ['compra-detalle', expandedId],
    queryFn: async () => {
      const { data } = await api.get(`/compras/${expandedId}`);
      return data;
    },
    enabled: !!expandedId,
  });

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'completada': return <span className="badge badge-success"><CheckCircle size={12} /> Completada</span>;
      case 'pendiente': return <span className="badge badge-warning"><Clock size={12} /> Pendiente</span>;
      default: return <span className="badge badge-neutral">{estado}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Historial de Compras</h1>
          <p className="section-subtitle">Registro centralizado de adquisiciones para bocaminas</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar factura o proveedor..." 
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field pl-10 py-2 w-64"
            />
          </div>
          {canWrite('compras') && (
            <Link to="/compras/nueva" className="btn-primary group">
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span className="hidden sm:inline">Nueva Compra</span>
            </Link>
          )}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-4">
            {Array.from({length: 5}).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium w-full">
              <thead>
                <tr>
                  <th className="w-10"></th>
                  <th className="pl-6">ID / Factura</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Bocamina Destino</th>
                  <th>Total</th>
                  <th>Estado</th>
                  {canDelete && <th className="pr-6 text-right w-20">Acciones</th>}
                </tr>
              </thead>
              <motion.tbody
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {compras?.data?.map((compra: any) => (
                  <AnimatePresence key={compra.id}>
                    <motion.tr 
                      variants={tableRowVariant}
                      className={`group cursor-pointer ${expandedId === compra.id ? 'bg-copper-500/5 border-l-2 border-l-copper-500' : 'border-l-2 border-l-transparent hover:bg-white/[0.02]'}`}
                      onClick={() => setExpandedId(expandedId === compra.id ? null : compra.id)}
                    >
                      <td className="w-10 text-center text-mining-500 group-hover:text-copper-400 transition-colors">
                        {expandedId === compra.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </td>
                      <td className="pl-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-mining-500 text-xs bg-white/5 px-2 py-0.5 rounded">#{compra.id}</span>
                          <span className="font-bold text-white tracking-wide">{compra.numero_factura || 'S/F'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-mining-300">
                          <Calendar size={14} className="text-mining-500" />
                          {new Date(compra.fecha).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="font-medium text-white">
                        <div>{compra.proveedor?.nombre || '-'}</div>
                        {compra.comprador_responsable && (
                          <div className="text-[11px] text-teal-400 font-normal">Resp: {compra.comprador_responsable}</div>
                        )}
                      </td>
                      <td>{compra.bocamina?.nombre || <span className="text-mining-500 italic">Bodega Central</span>}</td>
                      <td className="font-bold text-copper-400 drop-shadow-[0_0_8px_rgba(234,119,64,0.3)]">Bs. {parseFloat(compra.total).toLocaleString()}</td>
                      <td>{getStatusBadge(compra.estado || 'completada')}</td>
                      {canDelete && (
                        <td className="pr-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTargetId(compra.id);
                              setConfirmOpen(true);
                            }}
                            className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                            title="Eliminar registro de compra"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </motion.tr>
                    
                    {expandedId === compra.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-obsidian-900/80 border-b border-white/5"
                      >
                        <td colSpan={canDelete ? 8 : 7} className="p-0">
                          <div className="px-16 py-6 overflow-hidden">
                            <div className="flex flex-wrap items-center gap-6 mb-4 p-3 bg-white/[0.02] rounded-xl border border-white/5 text-xs text-mining-300">
                              <div>
                                <span className="text-mining-500 font-bold uppercase tracking-wider block text-[10px]">Responsable / A Nombre De:</span>
                                <span className="font-bold text-teal-400">{compra.comprador_responsable || compra.usuario?.nombre || 'Mismo usuario registrado'}</span>
                              </div>
                              <div>
                                <span className="text-mining-500 font-bold uppercase tracking-wider block text-[10px]">Registrado en Sistema Por:</span>
                                <span className="font-medium text-white">{compra.usuario?.nombre || 'Administrador'}</span>
                              </div>
                            </div>

                            <h4 className="text-xs font-bold text-mining-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-teal-500 shadow-glow-teal animate-pulse-glow"></span>
                              Detalle de Materiales
                            </h4>
                            {isLoadingDetalle ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-teal-500" size={24} />
                                <span className="ml-2 text-mining-400 text-sm">Desencriptando detalles...</span>
                              </div>
                            ) : (
                              <div className="bg-obsidian-800/50 rounded-xl border border-white/10 shadow-glass-inset overflow-hidden">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-white/5 text-mining-400 text-[10px] uppercase font-bold tracking-widest">
                                    <tr>
                                      <th className="px-4 py-3">Código</th>
                                      <th className="px-4 py-3">Material</th>
                                      <th className="px-4 py-3 text-center">Cant.</th>
                                      <th className="px-4 py-3 text-right">P. Unitario</th>
                                      <th className="px-4 py-3 text-right">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {compraDetalle?.detalles?.map((det: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3 font-mono text-mining-500 text-xs">{det.material?.codigo}</td>
                                        <td className="px-4 py-3 font-medium text-mining-200">{det.material?.descripcion}</td>
                                        <td className="px-4 py-3 text-center text-mining-300">{det.cantidad}</td>
                                        <td className="px-4 py-3 text-right text-mining-400">Bs. {parseFloat(det.precio).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-bold text-white drop-shadow-md">Bs. {parseFloat(det.subtotal).toLocaleString()}</td>
                                      </tr>
                                    ))}
                                    {(!compraDetalle?.detalles || compraDetalle.detalles.length === 0) && (
                                      <tr><td colSpan={5} className="px-4 py-6 text-center text-mining-500">No hay detalles disponibles</td></tr>
                                    )}
                                  </tbody>
                                  <tfoot className="bg-obsidian-950 text-white border-t border-white/10">
                                    <tr>
                                      <td colSpan={4} className="px-4 py-4 font-bold text-right tracking-widest text-mining-400 text-xs uppercase">TOTAL GENERAL</td>
                                      <td className="px-4 py-4 font-black text-right text-copper-400 text-xl drop-shadow-glow-copper">Bs. {parseFloat(compra.total).toLocaleString()}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            )}
                            
                            {compra.observaciones && (
                              <div className="mt-4 p-4 bg-obsidian-800/30 rounded-xl border border-white/5 shadow-glass-inset">
                                <h4 className="text-[10px] font-bold text-mining-500 uppercase tracking-widest mb-1">Observaciones</h4>
                                <p className="text-mining-300 text-sm">{compra.observaciones}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
        
        {(!compras?.data || compras.data.length === 0) && !isLoading && (
          <div className="text-center py-16">
            <ShoppingCart size={48} className="text-mining-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white">No hay compras registradas</h3>
            <p className="text-mining-400 mt-1 mb-6">Comienza registrando la primera adquisición del sistema.</p>
            <Link to="/compras/nueva" className="btn-primary inline-flex">
              <Plus size={18} /> Nueva Compra
            </Link>
          </div>
        )}

        {compras && compras.last_page > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/5 bg-obsidian-950/30 text-xs text-mining-400">
            <div>
              Mostrando <span className="font-bold text-white">{compras.from || 1}</span> a <span className="font-bold text-white">{compras.to || compras.data?.length}</span> de <span className="font-bold text-white">{compras.total}</span> compras
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={compras.current_page === 1}
                className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-mining-300 font-medium px-2">
                Página {compras.current_page} de {compras.last_page}
              </span>
              <button
                onClick={() => setPage(p => Math.min(compras.last_page, p + 1))}
                disabled={compras.current_page === compras.last_page}
                className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {createPortal(
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Eliminar Registro de Compra"
          message="¿Estás seguro de que deseas eliminar esta compra de manera definitiva? Esta acción no se puede deshacer y afectará el historial financiero."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={confirmDelete}
          onCancel={() => {
            setConfirmOpen(false);
            setDeleteTargetId(null);
          }}
        />,
        document.body
      )}
    </div>
  );
};
