import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Download, FileText, Loader2, Calendar, Filter, Pickaxe, Building2, Package, Activity, ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Formatea una fecha a YYYY-MM-DD usando zona horaria local (evita desfase UTC)
const formatLocalDate = (d: Date): string => {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    bocamina_id: ''
  });


  const { data: bocaminas } = useQuery({
    queryKey: ['bocaminas'],
    queryFn: async () => (await api.get('/bocaminas')).data
  });

  const { data: reporte, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['reporte-generado', dateRange.inicio, dateRange.fin, dateRange.bocamina_id],
    queryFn: async () => {
      const { data } = await api.get(
        `/reportes/generar?inicio=${dateRange.inicio}&fin=${dateRange.fin}&bocamina_id=${dateRange.bocamina_id}`
      );
      return data;
    },
    retry: 1,
  });

  const setRango = (tipo: 'diario' | 'semanal' | 'mensual') => {
    const hoy = new Date();
    const daysAgo = (n: number) => { const d = new Date(hoy); d.setDate(hoy.getDate() - n); return d; };

    if (tipo === 'diario') {
      // Solo hoy (el backend usa whereDate >= y <=, cubre todo el día)
      setDateRange({ ...dateRange, inicio: formatLocalDate(hoy), fin: formatLocalDate(hoy) });
    } else if (tipo === 'semanal') {
      // Últimos 7 días incluyendo hoy
      setDateRange({ ...dateRange, inicio: formatLocalDate(daysAgo(6)), fin: formatLocalDate(hoy) });
    } else if (tipo === 'mensual') {
      // Mes calendario completo (incluye días futuros del mes actual)
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      setDateRange({ ...dateRange, inicio: formatLocalDate(primerDia), fin: formatLocalDate(ultimoDia) });
    }
  };


  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await api.get(`/reportes/exportar/pdf?inicio=${dateRange.inicio}&fin=${dateRange.fin}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_compras_${dateRange.inicio}_al_${dateRange.fin}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Reporte PDF Generado', 'El documento respeta el filtro de fechas actual.');
    } catch {
      toast.error('Error', 'No se pudo generar el reporte PDF.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const res = await api.get(`/reportes/exportar/excel?inicio=${dateRange.inicio}&fin=${dateRange.fin}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_compras_${dateRange.inicio}_al_${dateRange.fin}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Reporte Excel Exportado', 'El archivo Excel respeta el filtro de fechas actual.');
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
          <h2 className="section-title">Generador de Reportes</h2>
          <p className="section-subtitle">Análisis detallado de compras por periodo</p>
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
      <div className="card p-5 border-l-4 border-l-copper-500">
        <div className="flex flex-col xl:flex-row gap-6 justify-between">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider">Filtros Rápidos</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setRango('diario')} className="btn-secondary h-10 px-4">Hoy (Diario)</button>
              <button onClick={() => setRango('semanal')} className="btn-secondary h-10 px-4">Esta Semana</button>
              <button onClick={() => setRango('mensual')} className="btn-secondary h-10 px-4">Este Mes</button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-end flex-1 xl:max-w-4xl">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Fecha Inicio</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
                <input type="date" className="input-field pl-10" value={dateRange.inicio} onChange={e => setDateRange({...dateRange, inicio: e.target.value})} />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Fecha Fin</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
                <input type="date" className="input-field pl-10" value={dateRange.fin} onChange={e => setDateRange({...dateRange, fin: e.target.value})} />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Bocamina (Opcional)</label>
              <div className="relative">
                <Pickaxe className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
                <select className="input-field pl-10" value={dateRange.bocamina_id} onChange={e => setDateRange({...dateRange, bocamina_id: e.target.value})}>
                  <option value="">Todas las bocaminas</option>
                  {bocaminas?.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={() => refetch()} className="btn-primary whitespace-nowrap h-10 px-6">
              <Filter size={18} /> Aplicar
            </button>
          </div>
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
              <p className="text-4xl font-black text-copper-400">${parseFloat(reporte?.resumen?.gasto_total || 0).toLocaleString()}</p>
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
                    <XAxis type="number" tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                    <YAxis dataKey="nombre" type="category" axisLine={false} tickLine={false} width={100} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} formatter={(value: any) => [`$${parseFloat(value || 0).toLocaleString()}`, 'Gasto']} />
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
                    <div className="font-black text-copper-400">${parseFloat(p.total_gastado).toLocaleString()}</div>
                  </div>
                )) : (
                  <p className="text-mining-400 text-center py-10">No hay datos en este periodo.</p>
                )}
              </div>
            </div>
          </div>

          {/* Materiales Más Comprados */}
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
                    <th className="p-4 text-right">Inversión Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reporte?.top_materiales?.map((mat: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono text-xs text-mining-400">{mat.codigo}</td>
                      <td className="p-4 font-bold text-white">{mat.descripcion}</td>
                      <td className="p-4 text-center font-medium text-mining-300">{parseFloat(mat.total_cantidad).toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-copper-400">${parseFloat(mat.total_gastado).toLocaleString()}</td>
                    </tr>
                  ))}
                  {reporte?.top_materiales?.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-mining-400">No hay compras de materiales en este periodo.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
