import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { 
  TrendingUp, Building2, ShoppingCart, Wrench, Package, 
  PieChart as PieIcon, Calendar, ChevronRight, RotateCw 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Cell, Legend 
} from 'recharts';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { SkeletonKPI, SkeletonChart } from '../../components/ui/Skeleton';
import { TiltCard } from '../../components/ui/TiltCard';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../components/ui/PageTransition';

export const Dashboard = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [viewMode, setViewMode] = useState<'mensual' | 'diario'>('mensual');

  const { data: stats, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['dashboard-stats', selectedYear],
    queryFn: async () => {
      const { data } = await api.get(`/reportes/dashboard?year=${selectedYear}`);
      return data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const trendData = viewMode === 'mensual'
    ? (stats?.tendencia_mensual || [])
    : (stats?.tendencia_diaria || []);

  const totalGasto = parseFloat(stats?.gasto_total || '0');
  const gastoCompras = parseFloat(stats?.gasto_compras || '0');
  const gastoServicios = parseFloat(stats?.gasto_servicios || '0');

  const pctCompras = totalGasto > 0 ? Math.round((gastoCompras / totalGasto) * 100) : 0;
  const pctServicios = totalGasto > 0 ? Math.round((gastoServicios / totalGasto) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Resumen Ejecutivo</h1>
          <p className="text-mining-400 text-xs mt-1">
            Consolidado de compras de inventario, mantenimiento técnico y servicios por bocamina — Año {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Actualizar datos"
            className="p-2 bg-obsidian-900 border border-white/15 text-mining-300 hover:text-white hover:border-copper-500 rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 text-xs font-bold"
          >
            <RotateCw size={16} className={isFetching ? 'animate-spin text-copper-400' : ''} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-obsidian-900 border border-white/15 text-white text-sm font-bold rounded-xl px-4 py-2 focus:outline-none focus:border-copper-500 shadow-md"
          >
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear - 2}>{currentYear - 2}</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI />
        </div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Card 1: Gasto Total Consolidado */}
          <motion.div variants={staggerItem}>
            <TiltCard>
              <div className="card h-full relative overflow-hidden group p-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-copper-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div>
                    <p className="text-xs font-bold text-mining-400 uppercase tracking-wider mb-1">Inversión Consolidada</p>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Bs. <AnimatedCounter value={totalGasto} />
                    </h3>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-copper-500/10 border border-copper-500/30 flex items-center justify-center text-copper-400 shadow-glow-copper shrink-0">
                    <TrendingUp size={22} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs relative z-10 mt-4 pt-3 border-t border-white/5">
                  <span className="text-copper-400 font-bold">Compras + Servicios</span>
                  <span className="text-mining-500">Total Anual</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 2: Compras de Materiales */}
          <motion.div variants={staggerItem}>
            <TiltCard>
              <div className="card h-full relative overflow-hidden group p-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div>
                    <p className="text-xs font-bold text-mining-400 uppercase tracking-wider mb-1">Compras Realizadas</p>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Bs. <AnimatedCounter value={gastoCompras} />
                    </h3>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-glow-teal shrink-0">
                    <ShoppingCart size={22} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs relative z-10 mt-4 pt-3 border-t border-white/5">
                  <span className="text-teal-400 font-bold">{stats?.total_compras || 0} compras</span>
                  <span className="text-mining-400 font-semibold">{pctCompras}% del total</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 3: Servicios y Mantenimiento */}
          <motion.div variants={staggerItem}>
            <TiltCard>
              <div className="card h-full relative overflow-hidden group p-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div>
                    <p className="text-xs font-bold text-mining-400 uppercase tracking-wider mb-1">Servicios & Mantenimiento</p>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Bs. <AnimatedCounter value={gastoServicios} />
                    </h3>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] shrink-0">
                    <Wrench size={22} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs relative z-10 mt-4 pt-3 border-t border-white/5">
                  <span className="text-blue-400 font-bold">{stats?.total_servicios || 0} servicios</span>
                  <span className="text-mining-400 font-semibold">{pctServicios}% del total</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 4: Inventario & Operaciones */}
          <motion.div variants={staggerItem}>
            <TiltCard>
              <div className="card h-full relative overflow-hidden group p-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div>
                    <p className="text-xs font-bold text-mining-400 uppercase tracking-wider mb-1">Infraestructura & Stock</p>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      <AnimatedCounter value={stats?.total_materiales || 0} /> <span className="text-sm font-semibold text-mining-400">Materiales</span>
                    </h3>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)] shrink-0">
                    <Package size={22} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs relative z-10 mt-4 pt-3 border-t border-white/5">
                  <span className="text-purple-400 font-bold">{stats?.total_bocaminas || 0} bocaminas</span>
                  <span className="text-mining-400 font-semibold">{stats?.total_proveedores || 0} proveedores</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </motion.div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trend Chart: Compras vs Servicios */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="xl:col-span-2 card p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-copper-400" />
                Evolución de Gastos (Compras vs Servicios)
              </h3>
              <p className="text-xs text-mining-400 mt-0.5">
                Comparativa de inversiones de compras de materiales y servicios técnicos ({viewMode})
              </p>
            </div>

            <div className="flex rounded-lg p-0.5 bg-obsidian-900 border border-white/10">
              <button
                onClick={() => setViewMode('mensual')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  viewMode === 'mensual'
                    ? 'bg-copper-500 text-white shadow-md'
                    : 'text-mining-400 hover:text-white'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setViewMode('diario')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  viewMode === 'diario'
                    ? 'bg-copper-500 text-white shadow-md'
                    : 'text-mining-400 hover:text-white'
                }`}
              >
                Diario
              </button>
            </div>
          </div>
          
          {isLoading ? <SkeletonChart /> : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorServicios" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(value) => value >= 1000 ? `Bs. ${value/1000}k` : `Bs. ${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', backgroundColor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}
                    formatter={(value: any, name: any) => [
                      `Bs. ${Number(value).toLocaleString()}`, 
                      name === 'compras' ? 'Compras Materiales' : name === 'servicios' ? 'Servicios & Mantenimiento' : 'Total'
                    ]}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs font-bold text-white capitalize">
                        {value === 'compras' ? 'Compras de Inventario' : value === 'servicios' ? 'Servicios & Mantenimiento' : 'Total'}
                      </span>
                    )}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="compras" 
                    name="compras"
                    stroke="#2DD4BF" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorCompras)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="servicios" 
                    name="servicios"
                    stroke="#3B82F6" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorServicios)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Desglose Proporcional (Compras vs Servicios) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card p-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <PieIcon size={20} className="text-copper-400" />
              Distribución de Inversión
            </h3>
            <p className="text-xs text-mining-400 mb-6">Proporción por tipo de gasto en el período</p>

            <div className="space-y-6">
              {/* Compras progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-teal-400 flex items-center gap-1.5">
                    <ShoppingCart size={14} /> Compras de Materiales
                  </span>
                  <span className="text-white">Bs. {gastoCompras.toLocaleString()} ({pctCompras}%)</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${pctCompras}%` }}
                  ></div>
                </div>
              </div>

              {/* Servicios progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-blue-400 flex items-center gap-1.5">
                    <Wrench size={14} /> Servicios & Mantenimiento
                  </span>
                  <span className="text-white">Bs. {gastoServicios.toLocaleString()} ({pctServicios}%)</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-1000"
                    style={{ width: `${pctServicios}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-copper-500/10 border border-copper-500/20 text-xs text-copper-300">
            <strong className="text-white block font-bold mb-1">Métricas Clave:</strong>
            El gasto total consolidado es de <span className="font-bold text-white">Bs. {totalGasto.toLocaleString()}</span> repartidos entre compras de stock y mantenimiento operativo de equipos.
          </div>
        </motion.div>
      </div>

      {/* Lower Section: Bar Chart & Unified Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gastos por Bocamina (Compras + Servicios) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="xl:col-span-2 card p-6"
        >
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 size={20} className="text-copper-400" />
                Inversión Consolidada por Bocamina
              </h3>
              <p className="text-xs text-mining-400 mt-0.5">Suma total de compras y servicios asignados a cada centro minero</p>
            </div>
          </div>
          
          {isLoading ? <SkeletonChart /> : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.gastos_por_bocamina || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(val) => `Bs. ${val/1000}k`} dx={-5} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backgroundColor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    formatter={(val: any) => [`Bs. ${Number(val).toLocaleString()}`, 'Inversión Total']}
                  />
                  <Bar dataKey="total_gastado" radius={[8, 8, 0, 0]} barSize={38}>
                    {
                      (stats?.gastos_por_bocamina || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#EA7740' : '#2DD4BF'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Unified Activity Feed (Compras + Servicios) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar size={20} className="text-copper-400" />
                Actividad Reciente
              </h3>
              <button 
                onClick={() => navigate('/reportes')} 
                className="text-copper-400 text-xs font-bold hover:text-copper-300 flex items-center gap-1"
              >
                Ver todo <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="space-y-3">
              {isLoading ? (
                Array.from({length: 4}).map((_,i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse"></div>)
              ) : (
                stats?.actividad_reciente?.map((item: any) => {
                  const isCompra = item.tipo === 'compra';
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => navigate(isCompra ? '/compras' : '/servicios')}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 transition-all group cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isCompra ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {isCompra ? <ShoppingCart size={16} /> : <Wrench size={16} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            isCompra ? 'bg-teal-500/10 text-teal-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {isCompra ? 'Compra' : 'Servicio'}
                          </span>
                          <p className="font-bold text-white text-xs truncate group-hover:text-copper-400 transition-colors">
                            {item.titulo}
                          </p>
                        </div>
                        <p className="text-[11px] text-mining-400 truncate mt-0.5">{item.subtitulo} • {item.bocamina}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-xs text-white">Bs. {Number(item.monto).toLocaleString()}</p>
                        <p className="text-[10px] text-mining-500">{new Date(item.fecha).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
              {(!stats?.actividad_reciente || stats.actividad_reciente.length === 0) && (
                <div className="py-8 text-center text-xs text-mining-500">
                  Sin operaciones registradas recientemente.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
