import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Activity, Search, Calendar, Database, Eye, Trash2, Edit3, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';

export const HistorialList = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['historial'],
    queryFn: async () => (await api.get('/historial')).data
  });

  const filteredData = data?.data?.filter((item: any) => 
    item.accion.toLowerCase().includes(search.toLowerCase()) ||
    item.tabla.toLowerCase().includes(search.toLowerCase()) ||
    item.usuario?.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadge = (accion: string) => {
    switch (accion.toLowerCase()) {
      case 'crear': return <span className="badge badge-success"><PlusCircle size={10} /> Creación</span>;
      case 'actualizar': return <span className="badge badge-warning"><Edit3 size={10} /> Actualización</span>;
      case 'eliminar': return <span className="badge badge-danger"><Trash2 size={10} /> Eliminación</span>;
      default: return <span className="badge badge-neutral"><Eye size={10} /> {accion}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h2 className="section-title">Auditoría del Sistema</h2>
          <p className="section-subtitle">Registro inmutable de actividades y cambios de la plataforma</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar en el registro..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 w-64"
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-4">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="h-12 bg-mining-50 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium w-full">
              <thead className="bg-mining-50/80 border-b border-mining-100">
                <tr>
                  <th className="pl-6 w-48">Fecha y Hora</th>
                  <th>Usuario Responsable</th>
                  <th>Tipo de Acción</th>
                  <th>Módulo / Tabla</th>
                  <th>Detalle de la Operación</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {filteredData?.map((item: any) => (
                  <motion.tr variants={tableRowVariant} key={item.id} className="hover:bg-mining-50/50">
                    <td className="pl-6">
                      <div className="flex items-center gap-2 text-mining-500 text-sm font-medium">
                        <Calendar size={14} className="text-copper-500" />
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/5 text-mining-300 flex items-center justify-center text-[10px] font-bold">
                          {item.usuario?.nombre?.charAt(0) || '?'}
                        </div>
                        <span className="font-semibold text-white">{item.usuario?.nombre || 'Sistema'}</span>
                      </div>
                    </td>
                    <td>{getActionBadge(item.accion)}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-mining-400 text-sm uppercase tracking-wide font-bold">
                        <Database size={14} className="text-mining-400" />
                        {item.tabla}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-mining-300 font-mono bg-white/5 px-2 py-1 rounded">
                        ID afectado: {item.registro_id}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {(!filteredData || filteredData.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Activity size={48} className="text-white/5 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white">Registro Vacío</h3>
                      <p className="text-mining-500 mt-1">No se encontraron eventos en el historial que coincidan con la búsqueda.</p>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
