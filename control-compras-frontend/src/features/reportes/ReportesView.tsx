import { useState } from 'react';
import { CustomDatePicker } from '../../components/ui/CustomDatePicker';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Download, FileText, Loader2, Filter, Pickaxe, Building2, Package, Activity, ShoppingCart, AlertCircle, RefreshCw, Wrench } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Formatea una fecha a YYYY-MM-DD usando zona horaria local (evita desfase UTC)
const formatLocalDate = (d: Date): string => {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatEquipoTipo = (tipo: string): string => {
  if (!tipo) return '-';
  const parts = tipo.split('\\');
  const base = parts[parts.length - 1];
  if (base === 'Vehiculo') return 'Vehículo';
  if (base === 'Maquinaria') return 'Maquinaria';
  return base;
};

export const ReportesView = () => {
  const toast = useToast();
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Rango inicial: mes actual completo (incluye días futuros del mes)
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastOfMonth  = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [dateRange, setDateRange] = useState({
    inicio: formatLocalDate(firstOfMonth),
    fin: formatLocalDate(lastOfMonth),
    bocamina_id: '',
    tipo: 'todos' // 'todos', 'compras', 'servicios'
  });


  const { data: bocaminas } = useQuery({
    queryKey: ['bocaminas'],
    queryFn: async () => (await api.get('/bocaminas')).data
  });

  const { data: reporte, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['reporte-generado', dateRange.inicio, dateRange.fin, dateRange.bocamina_id, dateRange.tipo],
    queryFn: async () => {
      const { data } = await api.get(
        `/reportes/generar?inicio=${dateRange.inicio}&fin=${dateRange.fin}&bocamina_id=${dateRange.bocamina_id}&tipo=${dateRange.tipo}`
      );
      return data;
    },
    retry: 1,
  });

  const setRango = (tipoRango: 'diario' | 'semanal' | 'mensual') => {
    const hoy = new Date();
    const daysAgo = (n: number) => { const d = new Date(hoy); d.setDate(hoy.getDate() - n); return d; };

    if (tipoRango === 'diario') {
      setDateRange({ ...dateRange, inicio: formatLocalDate(hoy), fin: formatLocalDate(hoy) });
    } else if (tipoRango === 'semanal') {
      setDateRange({ ...dateRange, inicio: formatLocalDate(daysAgo(6)), fin: formatLocalDate(hoy) });
    } else if (tipoRango === 'mensual') {
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      setDateRange({ ...dateRange, inicio: formatLocalDate(primerDia), fin: formatLocalDate(ultimoDia) });
    }
  };


  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await api.get(`/reportes/exportar/pdf?inicio=${dateRange.inicio}&fin=${dateRange.fin}&bocamina_id=${dateRange.bocamina_id}&tipo=${dateRange.tipo}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${dateRange.tipo}_${dateRange.inicio}_al_${dateRange.fin}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Reporte PDF Generado', 'El documento respeta los filtros seleccionados.');
    } catch {
      toast.error('Error', 'No se pudo generar el reporte PDF.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const res = await api.get(`/reportes/exportar/excel?inicio=${dateRange.inicio}&fin=${dateRange.fin}&bocamina_id=${dateRange.bocamina_id}&tipo=${dateRange.tipo}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${dateRange.tipo}_${dateRange.inicio}_al_${dateRange.fin}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Reporte Excel Exportado', 'El archivo Excel respeta los filtros seleccionados.');
    } catch {
      toast.error('Error', 'No se pudo generar el reporte Excel.');
    } finally {
      setExportingExcel(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="section-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="section-title">
            {dateRange.tipo === 'todos' ? 'Reporte de Compras y Servicios' :
             dateRange.tipo === 'compras' ? 'Reporte de Compras' : 'Reporte de Servicios'}
          </h1>
          <p className="section-subtitle">Análisis detallado de gastos del periodo</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportPdf} disabled={exportingPdf || isLoading} className="btn-secondary">
            {exportingPdf ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} className="text-copper-500" />}
            Exportar PDF
          </button>
          <button onClick={handleExportExcel} disabled={exportingExcel || isLoading} className="btn-primary">
            {exportingExcel ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Controles de Filtros */}
      <div className="card p-7 border-l-4 border-l-copper-500 space-y-6">
        {/* Fila 1: Filtros Rápidos + Tipo de Gasto */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/10 pb-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-extrabold text-mining-200 uppercase tracking-wider">Filtros Rápidos:</span>
            <div className="flex flex-wrap gap-2.5">
              <button onClick={() => setRango('diario')} className="btn-secondary text-sm font-semibold h-11 px-5">Diario</button>
              <button onClick={() => setRango('semanal')} className="btn-secondary text-sm font-semibold h-11 px-5">Semanal</button>
              <button onClick={() => setRango('mensual')} className="btn-secondary text-sm font-semibold h-11 px-5">Mensual</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-extrabold text-mining-200 uppercase tracking-wider">Tipo de Gasto:</span>
            <CustomSelect
              options={[
                { value: 'todos', label: 'Todos los gastos' },
                { value: 'compras', label: 'Solo Compras' },
                { value: 'servicios', label: 'Solo Servicios' }
              ]}
              value={dateRange.tipo}
              onChange={val => setDateRange({...dateRange, tipo: val})}
              icon={<Filter size={18} />}
              className="w-60"
            />
          </div>
        </div>

        {/* Fila 2: Fechas + Bocamina + Botón Aplicar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
          <CustomDatePicker
            label="Fecha Inicio"
            value={dateRange.inicio}
            onChange={val => setDateRange({...dateRange, inicio: val})}
            className="w-full"
          />
          <CustomDatePicker
            label="Fecha Fin"
            value={dateRange.fin}
            onChange={val => setDateRange({...dateRange, fin: val})}
            className="w-full"
          />
          <div className="space-y-2 w-full">
            <label className="block text-xs font-extrabold text-mining-300 uppercase tracking-wider">Bocamina (Opcional)</label>
            <CustomSelect
              options={[
                { value: '', label: 'Todas las bocaminas' },
                ...(bocaminas || []).map((b: any) => ({ value: String(b.id), label: b.nombre }))
              ]}
              value={dateRange.bocamina_id}
              onChange={val => setDateRange({...dateRange, bocamina_id: val})}
              icon={<Pickaxe size={18} />}
              className="w-full"
            />
          </div>
          <button onClick={() => refetch()} className="btn-primary h-12 px-7 w-full justify-center text-sm font-bold tracking-wide shadow-glow-copper">
            <Filter size={20} /> Aplicar Filtros
          </button>
        </div>
      </div>


      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-copper-500" size={48} />
        </div>
      ) : isError ? (
        <div className="card border border-red-500/20 bg-red-500/5 flex flex-col items-center gap-4 py-16 text-center">
          <AlertCircle size={48} className="text-red-400" />
          <div>
            <p className="text-lg font-bold text-white mb-1">No se pudo cargar el reporte</p>
            <p className="text-sm text-mining-400 max-w-md">
              {(error as any)?.response?.data?.message || 'Verifica los filtros de fecha o contacta al administrador.'}
            </p>
          </div>
          <button onClick={() => refetch()} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumen General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-mining-900 text-white relative overflow-hidden border-0">
              <div className="absolute -right-10 -bottom-10 opacity-10"><Activity size={150} /></div>
              <p className="text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">Gasto Total del Periodo</p>
              <p className="text-4xl font-black text-copper-400">Bs. {parseFloat(reporte?.resumen?.gasto_total || 0).toLocaleString()}</p>
            </div>
            <div className="card relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-5 text-white"><ShoppingCart size={150} /></div>
              <p className="text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">Operaciones de Compra</p>
              <p className="text-4xl font-black text-white">{reporte?.resumen?.total_operaciones || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico Gastos por Bocamina */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 text-white flex items-center justify-center"><Pickaxe size={20} /></div>
                <h3 className="text-lg font-bold text-white">Gastos por Bocamina</h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={reporte?.gastos_bocamina?.map((d: any) => ({ ...d, total_gastado: parseFloat(d.total_gastado) || 0 })) || []} 
                    layout="vertical" 
                    margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tickFormatter={(val) => `Bs. ${(val/1000).toFixed(0)}k`} />
                    <YAxis dataKey="nombre" type="category" axisLine={false} tickLine={false} width={100} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} formatter={(value: any) => [`Bs. ${parseFloat(value || 0).toLocaleString()}`, 'Gasto']} />
                    <Bar dataKey="total_gastado" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Proveedores */}
            <div className="card flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 text-copper-400 flex items-center justify-center"><Building2 size={20} /></div>
                <h3 className="text-lg font-bold text-white">Gastos por Proveedor</h3>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {reporte?.gastos_proveedor?.length > 0 ? reporte.gastos_proveedor.map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-white/5 hover:bg-white/[0.03] transition-colors">
                    <div>
                      <p className="font-bold text-white">{p.nombre}</p>
                      <p className="text-xs text-mining-500">Proveedor</p>
                    </div>
                    <div className="font-black text-copper-400">Bs. {parseFloat(p.total_gastado).toLocaleString()}</div>
                  </div>
                )) : (
                  <p className="text-mining-400 text-center py-10">No hay datos en este periodo.</p>
                )}
              </div>
            </div>
          </div>

          {/* Materiales Más Comprados */}
          {dateRange.tipo !== 'servicios' && (
            <div className="card">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/5 text-emerald-400 flex items-center justify-center"><Package size={20} /></div>
                  <h3 className="text-lg font-bold text-white">Materiales Más Adquiridos</h3>
                </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs font-bold text-mining-400 uppercase">
                    <tr>
                      <th className="p-4">Código</th>
                      <th className="p-4">Material</th>
                      <th className="p-4 text-center">Cantidad Total</th>
                      <th className="p-4 text-right">Inversión Total (Bs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reporte?.top_materiales?.map((mat: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-mono text-xs text-mining-400">{mat.codigo}</td>
                        <td className="p-4 font-bold text-white">{mat.descripcion}</td>
                        <td className="p-4 text-center font-medium text-mining-300">{parseFloat(mat.total_cantidad).toLocaleString()}</td>
                        <td className="p-4 text-right font-bold text-copper-400">Bs. {parseFloat(mat.total_gastado).toLocaleString()}</td>
                      </tr>
                    ))}
                    {reporte?.top_materiales?.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-mining-400">No hay compras de materiales en este periodo.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Compras Table */}
          {dateRange.tipo !== 'servicios' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 text-copper-400 flex items-center justify-center"><ShoppingCart size={20} /></div>
                <h3 className="text-lg font-bold text-white">Compras Realizadas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs font-bold text-mining-400 uppercase">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Proveedor</th>
                      <th className="p-4">N° Factura</th>
                      <th className="p-4">Bocamina</th>
                      <th className="p-4">Responsable / Solicitante</th>
                      <th className="p-4 text-right">Monto (Bs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reporte?.compras?.map((c: any) => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-mono text-xs text-mining-400">#{c.id}</td>
                        <td className="p-4 font-medium text-white">{new Date(c.fecha).toLocaleDateString()}</td>
                        <td className="p-4 text-mining-300">{c.proveedor?.nombre || '-'}</td>
                        <td className="p-4 text-mining-300">{c.numero_factura || '-'}</td>
                        <td className="p-4 text-mining-300">{c.bocamina?.nombre || 'Central'}</td>
                        <td className="p-4 text-teal-400 font-medium">{c.comprador_responsable || c.usuario?.nombre || '-'}</td>
                        <td className="p-4 text-right font-bold text-copper-400">Bs. {parseFloat(c.total).toLocaleString()}</td>
                      </tr>
                    ))}
                    {(!reporte?.compras || reporte.compras.length === 0) && (
                      <tr><td colSpan={7} className="p-8 text-center text-mining-400">No se encontraron compras en este periodo.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Servicios Table */}
          {dateRange.tipo !== 'compras' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 text-teal-400 flex items-center justify-center"><Wrench size={20} /></div>
                <h3 className="text-lg font-bold text-white">Servicios y Mantenimiento</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs font-bold text-mining-400 uppercase">
                    <tr>
                      <th className="p-4">Código</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Equipo</th>
                      <th className="p-4">Bocamina</th>
                      <th className="p-4">Responsable</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Monto (Bs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reporte?.servicios?.map((s: any) => {
                      const totalCosto = (s.costos || []).reduce((acc: number, item: any) => acc + parseFloat(item.monto), 0) +
                                         (s.repuestos || []).reduce((acc: number, item: any) => acc + (parseFloat(item.cantidad) * parseFloat(item.costo_unitario)), 0);
                      return (
                        <tr key={s.id} className="hover:bg-white/[0.02]">
                          <td className="p-4 font-mono text-xs text-mining-400">{s.codigo}</td>
                          <td className="p-4 font-medium text-white">{new Date(s.fecha).toLocaleDateString()}</td>
                          <td className="p-4 text-mining-300">{formatEquipoTipo(s.equipo_tipo)} ({s.equipo?.placa || s.equipo?.nombre_codigo || s.equipo?.codigo || '-'})</td>
                          <td className="p-4 text-mining-300">{s.bocamina?.nombre || 'Central'}</td>
                          <td className="p-4 text-mining-300">{s.responsable?.nombre || '-'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              s.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>{s.estado}</span>
                          </td>
                          <td className="p-4 text-right font-bold text-teal-400">Bs. {totalCosto.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    {(!reporte?.servicios || reporte.servicios.length === 0) && (
                      <tr><td colSpan={7} className="p-8 text-center text-mining-400">No se encontraron servicios en este periodo.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
