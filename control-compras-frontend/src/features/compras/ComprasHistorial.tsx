import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { ShoppingCart, Plus, Search, Calendar, ChevronDown, ChevronRight, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';
import { useAuth } from '../auth/AuthContext';

export const ComprasHistorial = () => {
  const { canWrite } = useAuth();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: compras, isLoading } = useQuery({
    queryKey: ['compras', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
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
              onChange={e => setSearch(e.target.value)}
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
                      <td className="font-medium text-white">{compra.proveedor?.nombre || '-'}</td>
                      <td>{compra.bocamina?.nombre || <span className="text-mining-500 italic">Bodega Central</span>}</td>
                      <td className="font-bold text-copper-400 drop-shadow-[0_0_8px_rgba(234,119,64,0.3)]">Bs. {parseFloat(compra.total).toLocaleString()}</td>
                      <td>{getStatusBadge(compra.estado || 'completada')}</td>
                    </motion.tr>
                    
                    {expandedId === compra.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-obsidian-900/80 border-b border-white/5"
                      >
                        <td colSpan={7} className="p-0">
                          <div className="px-16 py-6 overflow-hidden">
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
      </div>
    </div>
  );
};
