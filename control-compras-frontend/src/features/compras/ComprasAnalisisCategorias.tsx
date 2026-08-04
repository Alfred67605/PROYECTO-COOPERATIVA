import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Layers, Calendar, ChevronDown, ChevronRight, Building2, Pickaxe, PackageCheck, DollarSign, PieChart, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ComprasAnalisisCategorias = () => {
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [bocaminaId, setBocaminaId] = useState<string>('');
  const [proveedorId, setProveedorId] = useState<string>('');
  const [expandedMaterialId, setExpandedMaterialId] = useState<number | null>(null);

  // Queries
  const { data: bocaminas } = useQuery({
    queryKey: ['bocaminas'],
    queryFn: async () => (await api.get('/bocaminas')).data,
  });

  const { data: proveedores } = useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => (await api.get('/proveedores')).data,
  });

  const { data: analisisData, isLoading } = useQuery({
    queryKey: ['compras-analisis-categorias', selectedCategoria, fechaInicio, fechaFin, bocaminaId, proveedorId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategoria) params.append('categoria', selectedCategoria);
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);
      if (bocaminaId) params.append('bocamina_id', bocaminaId);
      if (proveedorId) params.append('proveedor_id', proveedorId);
      const res = await api.get(`/compras/analisis-categorias?${params.toString()}`);
      return res.data;
    },
  });

  const rankingCategorias = analisisData?.ranking_categorias || [];
  const materialesDetalle = analisisData?.materiales_detalle || [];
  const totales = analisisData?.totales || {};
  const currentCategory = analisisData?.categoria_seleccionada || selectedCategoria;

  const bocaminasList = Array.isArray(bocaminas) ? bocaminas : (bocaminas?.data || []);
  const proveedoresList = Array.isArray(proveedores) ? proveedores : (proveedores?.data || []);

  const resetFilters = () => {
    setFechaInicio('');
    setFechaFin('');
    setBocaminaId('');
    setProveedorId('');
    setSelectedCategoria('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title flex items-center gap-2.5">
            <PieChart className="text-copper-400" size={26} />
            Análisis de Compras por Categorías y Materiales
          </h1>
          <p className="section-subtitle">
            Clasificación de egresos por grupo de material, bocaminas de destino y proveedores
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inversion */}
        <div className="card p-5 border border-copper-500/20 bg-gradient-to-br from-copper-950/20 via-obsidian-900 to-obsidian-900 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-copper-400 uppercase tracking-wider">Inversión Total en Compras</span>
            <div className="w-10 h-10 rounded-xl bg-copper-500/10 text-copper-400 flex items-center justify-center border border-copper-500/20">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-copper-400 tracking-tight drop-shadow-[0_0_8px_rgba(234,119,64,0.3)]">
              Bs. {totales?.total_inversion?.toLocaleString() || '0'}
            </p>
            <p className="text-[11px] text-mining-400 mt-1">Monto gastado en el filtro seleccionado</p>
          </div>
        </div>

        {/* Top Categoria */}
        <div className="card p-5 border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-obsidian-900 to-obsidian-900 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Categoría #1 con Mayor Gasto</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Layers size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-black text-white tracking-tight truncate">
              {totales?.top_categoria || 'N/A'}
            </p>
            <p className="text-[11px] text-mining-400 mt-1">Grupo con mayor concentración de egresos</p>
          </div>
        </div>

        {/* Total Materiales */}
        <div className="card p-5 border border-teal-500/20 bg-gradient-to-br from-teal-950/20 via-obsidian-900 to-obsidian-900 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Materiales Registrados</span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <PackageCheck size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white tracking-tight">
              {totales?.total_materiales_mostrados || 0} <span className="text-xs font-normal text-teal-300">materiales</span>
            </p>
            <p className="text-[11px] text-mining-400 mt-1">Tipos de repuestos e insumos en desglose</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 space-y-3 bg-obsidian-900/60 border border-white/5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-copper-400 uppercase tracking-widest flex items-center gap-2">
            <Filter size={14} /> Filtros de Análisis Financiero
          </h4>
          {(fechaInicio || fechaFin || bocaminaId || proveedorId || selectedCategoria) && (
            <button onClick={resetFilters} className="text-[11px] text-red-400 hover:text-red-300 font-semibold underline transition-colors">
              Limpiar todos los filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-mining-400 uppercase tracking-wider mb-1">Fecha Desde</label>
            <input
              type="date"
              className="input-field py-1.5 text-sm"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-mining-400 uppercase tracking-wider mb-1">Fecha Hasta</label>
            <input
              type="date"
              className="input-field py-1.5 text-sm"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-mining-400 uppercase tracking-wider mb-1">Bocamina Destino</label>
            <select
              className="input-field py-1.5 text-sm"
              value={bocaminaId}
              onChange={e => setBocaminaId(e.target.value)}
            >
              <option value="">Todas las bocaminas</option>
              {bocaminasList.map((b: any) => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-mining-400 uppercase tracking-wider mb-1">Proveedor</label>
            <select
              className="input-field py-1.5 text-sm"
              value={proveedorId}
              onChange={e => setProveedorId(e.target.value)}
            >
              <option value="">Todos los proveedores</option>
              {proveedoresList.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories Ranking */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>Ranking de Categorías por Gasto</span>
          <span className="text-xs font-normal text-mining-400">Haga clic en una categoría para inspeccionar sus materiales a detalle</span>
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5"></div>
            ))}
          </div>
        ) : rankingCategorias.length === 0 ? (
          <div className="card p-8 text-center text-mining-400 text-sm">
            No hay compras registradas con los filtros aplicados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {rankingCategorias.map((cat: any, index: number) => {
              const isSelected = currentCategory && strtolower(cat.categoria) === strtolower(currentCategory);
              const rankColor = index === 0 ? 'border-copper-500/50 bg-copper-500/10' : index === 1 ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-white/[0.02]';

              return (
                <div
                  key={cat.categoria}
                  onClick={() => setSelectedCategoria(cat.categoria)}
                  className={`card p-4 cursor-pointer transition-all border ${rankColor} ${
                    isSelected ? 'ring-2 ring-copper-500 shadow-glow-copper scale-[1.02]' : 'hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white truncate max-w-[130px]">{cat.categoria}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-mining-300">
                      #{index + 1}
                    </span>
                  </div>

                  <p className="text-lg font-black text-copper-400">
                    Bs. {cat.total_gastado?.toLocaleString()}
                  </p>

                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-mining-400">
                      <span>{cat.total_ordenes} órdenes</span>
                      <span className="font-bold text-copper-300">{cat.porcentaje}% del total</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-copper-500 to-amber-400 rounded-full"
                        style={{ width: `${Math.min(100, cat.porcentaje)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Category Material Breakdown */}
      <div className="card p-0 overflow-hidden border border-white/10">
        <div className="px-6 py-4 bg-obsidian-950 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-copper-500/10 text-copper-400 flex items-center justify-center border border-copper-500/20">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Detalle de Materiales: <span className="text-copper-400">{currentCategory || 'Todas las categorías'}</span>
              </h3>
              <p className="text-xs text-mining-400">
                Materiales más comprados, bocaminas de destino y proveedores suministradores
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 animate-pulse space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg border border-white/5"></div>
            ))}
          </div>
        ) : materialesDetalle.length === 0 ? (
          <div className="p-12 text-center text-mining-400 text-sm">
            No hay materiales registrados para la categoría seleccionada.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {materialesDetalle.map((mat: any) => {
              const isExpanded = expandedMaterialId === mat.material_id;

              return (
                <div key={mat.material_id} className="transition-colors hover:bg-white/[0.01]">
                  <div
                    onClick={() => setExpandedMaterialId(isExpanded ? null : mat.material_id)}
                    className="p-5 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-mining-400 flex items-center justify-center shrink-0 mt-0.5">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-mining-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            {mat.codigo}
                          </span>
                          <span className="font-bold text-white text-sm">{mat.descripcion}</span>
                        </div>
                        <p className="text-xs text-mining-400 mt-0.5">Categoría: <span className="text-copper-300 font-medium">{mat.grupo}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs w-full md:w-auto justify-between md:justify-end">
                      {/* Cantidad Total */}
                      <div className="text-right">
                        <span className="text-[10px] text-mining-500 font-bold uppercase block">Cantidad Comprada</span>
                        <span className="font-bold text-white text-sm">{mat.total_cantidad?.toLocaleString()}</span>
                      </div>

                      {/* Total Gastado */}
                      <div className="text-right">
                        <span className="text-[10px] text-mining-500 font-bold uppercase block">Monto Total Invertido</span>
                        <span className="font-bold text-copper-400 text-sm drop-shadow-[0_0_8px_rgba(234,119,64,0.3)]">
                          Bs. {mat.total_gastado?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Material Details (Bocaminas Destino + Proveedores + Purchase History) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6 pt-2 bg-obsidian-950/80 border-t border-white/5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          {/* Bocaminas Destino */}
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                            <h5 className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
                              <Pickaxe size={14} /> Bocaminas de Destino
                            </h5>
                            <div className="space-y-1.5">
                              {mat.bocaminas?.map((b: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                  <span className="font-medium text-white">{b.nombre}</span>
                                  <span className="font-bold text-teal-300">
                                    {b.cantidad} unids / <span className="text-copper-400">Bs. {b.total_gastado?.toLocaleString()}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Proveedores Suministradores */}
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                              <Building2 size={14} /> Proveedores Suministradores
                            </h5>
                            <div className="space-y-1.5">
                              {mat.proveedores?.map((p: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                  <span className="font-medium text-white">{p.nombre}</span>
                                  <span className="font-bold text-amber-300">
                                    {p.cantidad} unids / <span className="text-copper-400">Bs. {p.total_gastado?.toLocaleString()}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Order History breakdown */}
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-bold text-mining-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={12} /> Historial de Compras de este Material
                          </h5>
                          <div className="overflow-x-auto rounded-xl border border-white/5 bg-obsidian-900/60">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-white/5 text-mining-400 text-[10px] uppercase font-bold">
                                <tr>
                                  <th className="px-3 py-2">Fecha</th>
                                  <th className="px-3 py-2">Nro. Factura</th>
                                  <th className="px-3 py-2">Bocamina Destino</th>
                                  <th className="px-3 py-2">Proveedor</th>
                                  <th className="px-3 py-2 text-center">Cant.</th>
                                  <th className="px-3 py-2 text-right">Precio Unit.</th>
                                  <th className="px-3 py-2 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-mining-300">
                                {mat.compras_historial?.map((item: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-white/[0.02]">
                                    <td className="px-3 py-2 font-medium text-white">{new Date(item.fecha).toLocaleDateString()}</td>
                                    <td className="px-3 py-2 font-mono text-mining-400">{item.numero_factura}</td>
                                    <td className="px-3 py-2 text-teal-300 font-medium">{item.bocamina}</td>
                                    <td className="px-3 py-2 text-white">{item.proveedor}</td>
                                    <td className="px-3 py-2 text-center font-bold text-white">{item.cantidad}</td>
                                    <td className="px-3 py-2 text-right">Bs. {item.precio?.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right font-bold text-copper-400">Bs. {item.subtotal?.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function strtolower(str: string) {
  return (str || '').toLowerCase();
}
