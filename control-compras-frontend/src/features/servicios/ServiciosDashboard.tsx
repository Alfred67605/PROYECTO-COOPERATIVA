import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Pickaxe, Truck, Wrench, FileCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../components/ui/PageTransition';
import { MaquinariaList } from './MaquinariaList';
import { ServiciosList } from './ServiciosList';
import { GruasList } from './GruasList';
import { VehiculosList } from './VehiculosList';
import { InspeccionesList } from './InspeccionesList';

export const ServiciosDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-servicios'],
    queryFn: async () => (await api.get('/dashboard-servicios')).data
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'maquinaria', label: 'Maquinaria', icon: Pickaxe },
    { id: 'gruas', label: 'Grúas', icon: Truck }, // Using truck as generic heavy equipment
    { id: 'vehiculos', label: 'Vehículos', icon: Truck },
    { id: 'servicios', label: 'Mantenimientos', icon: Wrench },
    { id: 'inspecciones', label: 'Inspecciones', icon: FileCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Servicios y Mantenimiento</h1>
          <p className="section-subtitle">Gestión integral de equipos y reparaciones</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-copper-500 text-white shadow-glow-copper' 
                  : 'bg-obsidian-800 text-mining-300 hover:text-white hover:bg-obsidian-700 border border-white/5'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div variants={staggerItem} className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Pickaxe size={20} className="text-teal-400" />
                </div>
                <h3 className="font-medium text-mining-200">Equipos Activos</h3>
              </div>
              <p className="text-2xl font-bold">{isLoading ? '--' : stats?.kpis?.total_maquinaria_activa || 0}</p>
            </motion.div>
            
            <motion.div variants={staggerItem} className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-copper-500/10 flex items-center justify-center">
                  <Wrench size={20} className="text-copper-400" />
                </div>
                <h3 className="font-medium text-mining-200">En Reparación</h3>
              </div>
              <p className="text-2xl font-bold">{isLoading ? '--' : stats?.kpis?.equipos_reparacion || 0}</p>
            </motion.div>

            <motion.div variants={staggerItem} className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FileCheck size={20} className="text-blue-400" />
                </div>
                <h3 className="font-medium text-mining-200">Servicios (Mes)</h3>
              </div>
              <p className="text-2xl font-bold">{isLoading ? '--' : stats?.kpis?.servicios_mes || 0}</p>
            </motion.div>

            <motion.div variants={staggerItem} className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Activity size={20} className="text-purple-400" />
                </div>
                <h3 className="font-medium text-mining-200">Costos Acumulados</h3>
              </div>
              <p className="text-2xl font-bold">${isLoading ? '--' : parseFloat(stats?.kpis?.costos_acumulados || '0').toLocaleString()}</p>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'maquinaria' && <MaquinariaList />}
        {activeTab === 'gruas' && <GruasList />}
        {activeTab === 'vehiculos' && <VehiculosList />}
        {activeTab === 'servicios' && <ServiciosList />}
        {activeTab === 'inspecciones' && <InspeccionesList />}
      </div>
    </div>
  );
};
