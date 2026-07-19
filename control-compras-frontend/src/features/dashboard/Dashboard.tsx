import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { TrendingUp, Building2, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Cell } from 'recharts';
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

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', selectedYear],
    queryFn: async () => {
      const { data } = await api.get(`/reportes/dashboard?year=${selectedYear}`);
      return data;
    }
  });

  const trendData = viewMode === 'mensual'
    ? (stats?.tendencia_mensual || [])
    : (stats?.tendencia_diaria || []);

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Resumen Ejecutivo</h1>
          <p className="text-mining-500 text-sm mt-1">Métricas y KPIs del año {selectedYear}</p>
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
        <motion.div variants={staggerItem} className="col-span-1">
          <TiltCard>
            <div className="card h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-copper-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-sm font-medium text-mining-400 mb-1">Inversión Total</p>
                  <h3 className="text-3xl font-display font-bold text-white tracking-tight">
                    $<AnimatedCounter value={parseFloat(stats?.gasto_total || '0')} />
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-copper-500/10 border border-copper-500/20 flex items-center justify-center text-copper-400 shadow-glow-copper">
                  <TrendingUp size={24} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm relative z-10">
                <span className="text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-md font-medium border border-teal-400/20">+12.5%</span>
                <span className="text-mining-500">vs mes anterior</span>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        <motion.div variants={staggerItem} className="col-span-1">
          <TiltCard>
            <div className="card h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-sm font-medium text-mining-400 mb-1">Operaciones</p>
                  <h3 className="text-3xl font-display font-bold text-white tracking-tight">
                    <AnimatedCounter value={stats?.total_compras || 0} />
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-glow-teal">
                  <ShoppingCart size={24} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm relative z-10">
                <span className="text-teal-400 font-medium">Actividad normal</span>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        <motion.div variants={staggerItem} className="col-span-1">
          <TiltCard>
            <div className="card h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-sm font-medium text-mining-400 mb-1">Proveedores Activos</p>
                  <h3 className="text-3xl font-display font-bold text-white tracking-tight">
                    <AnimatedCounter value={12} />
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Building2 size={24} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm relative z-10">
                <span className="text-mining-400">En 3 regiones</span>
              </div>
            </div>
          </TiltCard>
        </motion.div>
        </motion.div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="xl:col-span-2 card"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Tendencia de Gastos</h3>
              <p className="text-sm text-slate-400">
                {viewMode === 'mensual' 
                  ? `Histórico mensual del año ${selectedYear}` 
                  : `Histórico diario del año ${selectedYear}`
                }
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Selector de Granularidad */}
              <div className="flex rounded-lg p-0.5 bg-slate-900 border border-slate-700">
                <button
                  onClick={() => setViewMode('mensual')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'mensual'
                      ? 'bg-teal-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setViewMode('diario')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'diario'
                      ? 'bg-teal-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Diario
                </button>
              </div>

              {/* Selector de Año */}
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value={currentYear}>{currentYear}</option>
                <option value={currentYear - 1}>{currentYear - 1}</option>
                <option value={currentYear - 2}>{currentYear - 2}</option>
              </select>
            </div>
          </div>
          
          {isLoading ? <SkeletonChart /> : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => value >= 1000 ? `$${value/1000}k` : `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gastos" 
                    stroke="#2DD4BF" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTrend)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Recent Purchases */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Compras Recientes</h3>
            <button onClick={() => navigate('/compras')} className="text-teal-400 text-sm font-semibold hover:text-teal-300">Ver todas</button>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              Array.from({length: 4}).map((_,i) => <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse"></div>)
            ) : (
              stats?.compras_recientes?.map((compra: any, idx: number) => {
                return (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800 transition-colors group cursor-pointer border border-transparent hover:border-slate-700">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-slate-800 text-slate-400">
                      <ShoppingCart size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200 truncate group-hover:text-teal-400 transition-colors">
                        {compra.proveedor?.nombre || 'Proveedor Desconocido'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{compra.bocamina?.nombre || 'Bodega Central'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">${parseFloat(compra.total).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">{new Date(compra.fecha).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Bar Chart - Gastos por Bocamina */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="xl:col-span-3 card"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Distribución de Gastos por Bocamina</h3>
            <p className="text-sm text-slate-400">Acumulado del mes actual</p>
          </div>
          
          {isLoading ? <SkeletonChart /> : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.gastos_por_bocamina || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e8ec" />
                  <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{ fill: '#798d9e', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#798d9e', fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="total_gastado" fill="#ea7740" radius={[6, 6, 0, 0]} barSize={40}>
                    {
                      (stats?.gastos_por_bocamina || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'rgba(234,119,64,0.8)' : 'rgba(45,212,191,0.8)'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};
