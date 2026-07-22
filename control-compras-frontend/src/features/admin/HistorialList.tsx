import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Activity, Search, Calendar, Database, Eye, Trash2, Edit3, PlusCircle, Clock, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';
import { CustomDatePicker } from '../../components/ui/CustomDatePicker';

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

  const FIELD_LABELS: Record<string, string> = {
    nombre: 'Nombre',
    nombre_codigo: 'Código / Nombre',
    ubicacion: 'Ubicación',
    bocamina_id: 'Bocamina',
    proveedor_id: 'Proveedor',
    numero_factura: 'N° Factura',
    comprador_responsable: 'Responsable',
    placa: 'Placa',
    marca: 'Marca',
    modelo: 'Modelo',
    horometro: 'Horómetro (Hrs)',
    kilometraje: 'Kilometraje',
    capacidad_carga: 'Capacidad Carga',
    nombre_chofer: 'Chófer Asignado',
    tiempo_trabajo: 'Tiempo Trabajo',
    costo: 'Costo (Bs.)',
    precio: 'Precio Unitario (Bs.)',
    cantidad: 'Cantidad',
    observaciones: 'Observaciones',
    descripcion: 'Descripción',
    estado: 'Estado',
    tipo: 'Tipo',
    codigo: 'Código',
    rol_id: 'Rol',
    email: 'Correo Electrónico',
  };

  const formatFieldValue = (key: string, val: any): string | null => {
    if (val === null || val === undefined || val === '') return 'Sin especificar';
    if (typeof val === 'boolean') return val ? 'Activo' : 'Inactivo';
    
    // Ignore empty arrays or empty objects (e.g. imagen: [], repuestos: [])
    if (Array.isArray(val)) {
      if (val.length === 0) return null;
      
      // Format array items (e.g. purchase details or spare parts)
      return val.map((item: any) => {
        if (typeof item === 'object' && item !== null) {
          const qty = item.cantidad || item.qty || 1;
          const price = item.precio || item.costo_unitario || item.monto || 0;
          const subtotal = item.subtotal || (qty * price);
          const matId = item.material_id ? `#${item.material_id}` : '';
          const matName = item.material?.nombre || item.material_nombre || item.nombre || `Ítem ${matId}`.trim();
          
          return `${qty}x ${matName} (Bs. ${Number(subtotal).toFixed(2)})`;
        }
        return String(item);
      }).join('; ');
    }

    if (typeof val === 'object' && val !== null) {
      const keys = Object.keys(val);
      if (keys.length === 0) return null;
      
      return keys
        .filter(k => !['id', 'created_at', 'updated_at'].includes(k))
        .map(k => `${FIELD_LABELS[k] || k}: ${val[k]}`)
        .join(', ');
    }

    // Parse stringified JSON if any
    if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
      try {
        const parsed = JSON.parse(val);
        return formatFieldValue(key, parsed);
      } catch {
        // Keep string if not valid JSON
      }
    }

    if (key === 'estado' && typeof val === 'string') {
      if (val === 'operativa') return 'Operativa';
      if (val === 'en_mantenimiento') return 'En Mantenimiento';
      if (val === 'inactivo') return 'Inactivo';
      if (val === 'activo') return 'Activo';
      return val.charAt(0).toUpperCase() + val.slice(1);
    }

    return String(val);
  };

  const renderDetalleOperacion = (item: any) => {
    const { accion, registro_id, datos_nuevos, datos_anteriores } = item;
    const targetData = (datos_nuevos && Object.keys(datos_nuevos).length > 0) 
      ? datos_nuevos 
      : (datos_anteriores || {});
      
    const effectiveId = registro_id || targetData?.id || '';

    const IGNORED_KEYS = [
      'id', 'created_at', 'updated_at', 'deleted_at', 
      'usuario_id', 'user_id', 'password', 'password_confirmation', 'remember_token'
    ];

    const itemsToRender: { label: string; value: string }[] = [];

    if (targetData && typeof targetData === 'object') {
      Object.entries(targetData).forEach(([key, val]) => {
        if (IGNORED_KEYS.includes(key)) return;
        
        const formattedVal = formatFieldValue(key, val);
        if (formattedVal === null) return;

        const label = FIELD_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        itemsToRender.push({ label, value: formattedVal });
      });
    }

    let mainActionTitle = '';
    const accionLower = (accion || '').toLowerCase();
    const idTag = effectiveId ? `#${effectiveId}` : '';

    if (accionLower.includes('crear') || accionLower.includes('create')) {
      mainActionTitle = `Creación de registro ${idTag}`.trim();
    } else if (accionLower.includes('actualiz') || accionLower.includes('update') || accionLower.includes('edit')) {
      mainActionTitle = `Modificación de datos ${idTag}`.trim();
    } else if (accionLower.includes('elimin') || accionLower.includes('delete')) {
      mainActionTitle = `Eliminación de registro ${idTag}`.trim();
    } else {
      mainActionTitle = `Operación ${accion} ${idTag}`.trim();
    }

    return (
      <div className="space-y-2 py-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-copper-500 animate-pulse"></span>
          <span className="font-bold text-white text-sm tracking-wide">{mainActionTitle}</span>
        </div>

        {itemsToRender.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {itemsToRender.map((itm, i) => (
              <div key={i} className="inline-flex items-center gap-1.5 bg-obsidian-950/80 border border-white/10 px-2.5 py-1 rounded-lg text-xs shadow-inner">
                <span className="text-mining-400 font-medium">{itm.label}:</span>
                <span className="text-white font-bold">{itm.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-mining-500 italic">Operación registrada sin detalles adicionales</p>
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
      <div className="bg-obsidian-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-wrap gap-5 items-end shadow-md">
        {/* Search */}
        <div className="flex-1 min-w-[240px] space-y-2">
          <label className="block text-xs font-extrabold text-mining-300 uppercase tracking-wider">Búsqueda General</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por usuario responsable..." 
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="input-field pl-10 w-full py-3 text-sm font-medium"
            />
          </div>
        </div>

        {/* Date Selector */}
        <CustomDatePicker
          label="Fecha Específica"
          value={fecha}
          onChange={val => handleFechaChange(val)}
          className="w-full sm:w-auto min-w-[200px]"
        />

        {/* Hour Start */}
        <div className="w-1/2 sm:w-auto min-w-[140px] space-y-2">
          <label className="block text-xs font-extrabold text-mining-300 uppercase tracking-wider">Hora Inicio</label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-copper-400" size={18} />
            <input 
              type="time" 
              value={horaInicio}
              onChange={e => handleHoraInicioChange(e.target.value)}
              className="input-field pl-10 w-full py-3 text-sm font-mono font-bold [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Hour End */}
        <div className="w-1/2 sm:w-auto min-w-[140px] space-y-2">
          <label className="block text-xs font-extrabold text-mining-300 uppercase tracking-wider">Hora Fin</label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-copper-400" size={18} />
            <input 
              type="time" 
              value={horaFin}
              onChange={e => handleHoraFinChange(e.target.value)}
              className="input-field pl-10 w-full py-3 text-sm font-mono font-bold [color-scheme:dark]"
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
                    <th className="pl-6 w-44">Fecha y Hora</th>
                    <th className="w-48">Usuario Responsable</th>
                    <th className="w-32">Tipo de Acción</th>
                    <th className="w-40">Módulo / Tabla</th>
                    <th className="w-auto">Detalle de la Operación</th>
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
