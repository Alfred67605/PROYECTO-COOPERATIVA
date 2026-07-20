import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Activity, Search, Calendar, Database, Eye, Trash2, Edit3, PlusCircle, Clock, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';

export const HistorialList = () => {
  const [search, setSearch] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['historial', search, fecha, horaInicio, horaFin, page],
    queryFn: async () => {
      const params: any = { 
        page,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone 
      };
      if (search) params.search = search;
      if (fecha) params.fecha = fecha;
      if (horaInicio) params.hora_inicio = horaInicio;
      if (horaFin) params.hora_fin = horaFin;
      return (await api.get('/historial', { params })).data;
    }
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFechaChange = (val: string) => {
    setFecha(val);
    setPage(1);
  };

  const handleHoraInicioChange = (val: string) => {
    setHoraInicio(val);
    setPage(1);
  };

  const handleHoraFinChange = (val: string) => {
    setHoraFin(val);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setFecha('');
    setHoraInicio('');
    setHoraFin('');
    setPage(1);
  };

  const filteredData = data?.data;

  const getActionBadge = (accion: string) => {
    switch (accion.toLowerCase()) {
      case 'crear': return <span className="badge badge-success"><PlusCircle size={10} /> crear</span>;
      case 'actualizar': return <span className="badge badge-warning"><Edit3 size={10} /> actualizar</span>;
      case 'eliminar': return <span className="badge badge-danger"><Trash2 size={10} /> eliminar</span>;
      default: return <span className="badge badge-neutral"><Eye size={10} /> {accion}</span>;
    }
  };

  const renderDetalleOperacion = (item: any) => {
    const { accion, registro_id, datos_nuevos } = item;
    
    let detailsList: string[] = [];
    if (datos_nuevos && typeof datos_nuevos === 'object') {
      Object.entries(datos_nuevos).forEach(([key, val]) => {
        if (['id', 'created_at', 'updated_at', 'usuario_id', 'user_id', 'password', 'password_confirmation'].includes(key)) {
          return;
        }
        let fieldName = key.replace(/_/g, ' ');
        fieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        
        let displayVal = '';
        if (val === null || val === undefined) {
          displayVal = 'nulo';
        } else if (typeof val === 'object') {
          displayVal = JSON.stringify(val);
        } else {
          displayVal = String(val);
        }
        
        if (displayVal.length > 60) {
          displayVal = displayVal.substring(0, 57) + '...';
        }
        detailsList.push(`${fieldName}: "${displayVal}"`);
      });
    }

    let mainActionText = '';
    if (accion === 'crear') {
      mainActionText = `Creó registro #${registro_id || ''}`;
    } else if (accion === 'editar' || accion === 'actualizar') {
      mainActionText = `Actualizó registro #${registro_id || ''}`;
    } else if (accion === 'eliminar') {
      mainActionText = `Eliminó registro #${registro_id || ''}`;
    } else {
      mainActionText = `Acción: ${accion}`;
    }

    return (
      <div className="space-y-1 py-1">
        <div className="text-xs font-semibold text-white">
          {mainActionText}
        </div>
        {detailsList.length > 0 ? (
          <div className="text-[11px] text-mining-400 font-sans max-w-lg leading-relaxed break-words">
            {detailsList.join(' | ')}
          </div>
        ) : (
          <div className="text-[11px] text-mining-500 italic font-sans">Sin datos adicionales de modificación</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Auditoría</h1>
          <p className="section-subtitle">Registro detallado de todas las operaciones</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-obsidian-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-wrap gap-4 items-end shadow-md">
        {/* Search */}
        <div className="flex-1 min-w-[240px] space-y-2">
          <label className="block text-[10px] font-bold text-mining-500 uppercase tracking-widest">Búsqueda general</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por usuario responsable..." 
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="input-field pl-10 w-full text-sm"
            />
          </div>
        </div>

        {/* Date Selector */}
        <div className="w-full sm:w-auto min-w-[180px] space-y-2">
          <label className="block text-[10px] font-bold text-mining-500 uppercase tracking-widest">Fecha Específica</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={16} />
            <input 
              type="date" 
              value={fecha}
              onChange={e => handleFechaChange(e.target.value)}
              className="input-field pl-10 w-full text-sm [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Hour Start */}
        <div className="w-1/2 sm:w-auto min-w-[120px] space-y-2">
          <label className="block text-[10px] font-bold text-mining-500 uppercase tracking-widest">Hora Inicio</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={16} />
            <input 
              type="time" 
              value={horaInicio}
              onChange={e => handleHoraInicioChange(e.target.value)}
              className="input-field pl-10 w-full text-sm [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Hour End */}
        <div className="w-1/2 sm:w-auto min-w-[120px] space-y-2">
          <label className="block text-[10px] font-bold text-mining-500 uppercase tracking-widest">Hora Fin</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={16} />
            <input 
              type="time" 
              value={horaFin}
              onChange={e => handleHoraFinChange(e.target.value)}
              className="input-field pl-10 w-full text-sm [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Clear filters button */}
        {(search || fecha || horaInicio || horaFin) && (
          <button 
            type="button" 
            onClick={resetFilters} 
            className="btn-secondary h-[42px] px-4 flex items-center gap-2 text-sm justify-center"
          >
            <RotateCcw size={16} />
            <span className="hidden md:inline">Limpiar</span>
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-4">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg border border-white/5"></div>
            ))}
          </div>
        ) : (
          <>
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
                          {item.fecha || item.created_at
                            ? new Date(String(item.fecha || item.created_at).replace(' ', 'T')).toLocaleString()
                            : '-'}
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
                      <td>{renderDetalleOperacion(item)}</td>
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

            {/* Pagination Controls */}
            {data && data.last_page > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-t border-white/5">
                <span className="text-sm text-mining-400">
                  Mostrando Página <strong className="text-white">{data.current_page}</strong> de <strong className="text-white">{data.last_page}</strong> (Total: {data.total} registros)
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={data.current_page === 1}
                    className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(data.last_page, p + 1))}
                    disabled={data.current_page === data.last_page}
                    className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
