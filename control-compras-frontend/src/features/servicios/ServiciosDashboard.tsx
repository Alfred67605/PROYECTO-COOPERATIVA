import { Routes, Route, Navigate } from 'react-router-dom';
import { MaquinariaList } from './MaquinariaList';
import { ServiciosList } from './ServiciosList';
import { VehiculosList } from './VehiculosList';
import { InspeccionesList } from './InspeccionesList';
import { AlquilerGruasList } from './AlquilerGruasList';

export const ServiciosDashboard = () => {
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
          <Route path="/" element={<Navigate to="mantenimientos" replace />} />
          <Route path="maquinaria" element={<MaquinariaList />} />
          <Route path="vehiculos" element={<VehiculosList />} />
          <Route path="mantenimientos" element={<ServiciosList />} />
          <Route path="inspecciones" element={<InspeccionesList />} />
          <Route path="alquiler-gruas" element={<AlquilerGruasList />} />
          <Route path="*" element={<Navigate to="mantenimientos" replace />} />
        </Routes>
      </div>
    </div>
  );
};
