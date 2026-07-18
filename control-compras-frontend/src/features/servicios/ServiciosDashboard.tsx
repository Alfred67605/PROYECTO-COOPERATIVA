import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Pickaxe, Wrench, FileCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../components/ui/PageTransition';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MaquinariaList } from './MaquinariaList';
import { ServiciosList } from './ServiciosList';

import { VehiculosList } from './VehiculosList';
import { InspeccionesList } from './InspeccionesList';
import { AlquilerGruasList } from './AlquilerGruasList';

export const ServiciosDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-servicios'],
    queryFn: async () => (await api.get('/dashboard-servicios')).data
  });

  const DashboardContent = () => (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4"
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
          <div className="w-10 h-10 rounded-xl bg-copper-500/10 flex items-center justify-center">
            <FileCheck size={20} className="text-copper-400" />
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
  );

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Servicios y Mantenimiento</h1>
          <p className="section-subtitle">Gestión integral de equipos y reparaciones</p>
        </div>
      </div>

      <div className="mt-4">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardContent />} />
          <Route path="maquinaria" element={<MaquinariaList />} />

          <Route path="vehiculos" element={<VehiculosList />} />
          <Route path="mantenimientos" element={<ServiciosList />} />
          <Route path="inspecciones" element={<InspeccionesList />} />
          <Route path="alquiler-gruas" element={<AlquilerGruasList />} />
        </Routes>
      </div>
    </div>
  );
};
