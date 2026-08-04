import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Fuel, Plus, Search, Calendar, Trash2, Edit, X, Loader2, Truck, Wrench, DollarSign, Droplets, MapPin, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';
import { useAuth } from '../auth/AuthContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

interface CombustibleForm {
  tipo_combustible: 'diesel' | 'gasolina';
  tipo_equipo: 'vehiculo' | 'maquinaria';
  vehiculo_id: string;
  maquinaria_id: string;
  litros: string;
  monto: string;
  surtidor_grifo: string;
  responsable: string;
  fecha_hora: string;
  observacion: string;
}

const emptyForm: CombustibleForm = {
  tipo_combustible: 'diesel',
  tipo_equipo: 'vehiculo',
  vehiculo_id: '',
  maquinaria_id: '',
  litros: '',
  monto: '',
  surtidor_grifo: '',
  responsable: '',
  fecha_hora: new Date().toISOString().slice(0, 16),
  observacion: '',
};

export const CombustibleList = () => {
  const { canWrite, canDelete, showNoDeleteModal, user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [filterCombustible, setFilterCombustible] = useState('');
  const [filterEquipo, setFilterEquipo] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CombustibleForm>(emptyForm);
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Queries
  const { data: resumen } = useQuery({
    queryKey: ['cargas-combustible-resumen'],
    queryFn: async () => (await api.get('/cargas-combustible/resumen')).data,
  });

  const { data: vehiculos } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: async () => (await api.get('/vehiculos')).data,
  });

  const { data: maquinarias } = useQuery({
    queryKey: ['maquinaria'],
    queryFn: async () => (await api.get('/maquinaria')).data,
  });

  const { data: cargasData, isLoading } = useQuery({
    queryKey: ['cargas-combustible', search, filterCombustible, filterEquipo, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterCombustible) params.append('tipo_combustible', filterCombustible);
      if (filterEquipo) params.append('tipo_equipo', filterEquipo);
      params.append('page', page.toString());
      const res = await api.get(`/cargas-combustible?${params.toString()}`);
      return res.data;
    },
  });

  const vehiculoList = Array.isArray(vehiculos) ? vehiculos : (vehiculos?.data || []);
  const maquinariaList = Array.isArray(maquinarias) ? maquinarias : (maquinarias?.data || []);
  const cargasList = cargasData?.data || [];

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        tipo_combustible: form.tipo_combustible,
        tipo_equipo: form.tipo_equipo,
        vehiculo_id: form.tipo_equipo === 'vehiculo' ? (form.vehiculo_id ? parseInt(form.vehiculo_id) : null) : null,
        maquinaria_id: form.tipo_equipo === 'maquinaria' ? (form.maquinaria_id ? parseInt(form.maquinaria_id) : null) : null,
        litros: parseFloat(form.litros),
        monto: parseFloat(form.monto),
        surtidor_grifo: form.surtidor_grifo,
        responsable: form.responsable,
        fecha_hora: form.fecha_hora,
        observacion: form.observacion,
      };

      if (editingId) {
        return await api.put(`/cargas-combustible/${editingId}`, payload);
      }
      return await api.post('/cargas-combustible', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargas-combustible'] });
      queryClient.invalidateQueries({ queryKey: ['cargas-combustible-resumen'] });
      toast.success(
        editingId ? 'Carga actualizada' : 'Carga registrada',
        editingId ? 'Los datos de la carga de combustible fueron guardados.' : 'El registro de combustible fue creado exitosamente.'
      );
      closeModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al guardar el registro de combustible';
      setError(msg);
      toast.error('Error', msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await api.delete(`/cargas-combustible/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargas-combustible'] });
      queryClient.invalidateQueries({ queryKey: ['cargas-combustible-resumen'] });
      toast.success('Carga eliminada', 'El registro de carga fue eliminado correctamente.');
      setConfirmOpen(false);
      setDeleteTargetId(null);
    },
    onError: (err: any) => {
      toast.error('Error al eliminar', err.response?.data?.message || 'No se pudo eliminar el registro.');
      setConfirmOpen(false);
      setDeleteTargetId(null);
    },
  });

  const openCreate = () => {
    setForm({
      ...emptyForm,
      responsable: user?.nombre || '',
      fecha_hora: new Date().toISOString().slice(0, 16),
    });
    setEditingId(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (carga: any) => {
    setForm({
      tipo_combustible: carga.tipo_combustible === 'gasolina' ? 'gasolina' : 'diesel',
      tipo_equipo: carga.tipo_equipo === 'maquinaria' ? 'maquinaria' : 'vehiculo',
      vehiculo_id: carga.vehiculo_id ? String(carga.vehiculo_id) : '',
      maquinaria_id: carga.maquinaria_id ? String(carga.maquinaria_id) : '',
      litros: String(carga.litros || ''),
      monto: String(carga.monto || ''),
      surtidor_grifo: carga.surtidor_grifo || '',
      responsable: carga.responsable || '',
      fecha_hora: carga.fecha_hora ? new Date(carga.fecha_hora).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      observacion: carga.observacion || '',
    });
    setEditingId(carga.id);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleDelete = (id: number) => {
    if (!canDelete()) {
      showNoDeleteModal();
      return;
    }
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.litros || parseFloat(form.litros) <= 0) {
      setError('Ingrese una cantidad válida de litros cargados.');
      return;
    }
    if (!form.monto || parseFloat(form.monto) < 0) {
      setError('Ingrese un monto válido.');
      return;
    }
    if (form.tipo_equipo === 'vehiculo' && !form.vehiculo_id) {
      setError('Seleccione el vehículo que recibió la carga.');
      return;
    }
    if (form.tipo_equipo === 'maquinaria' && !form.maquinaria_id) {
      setError('Seleccione la maquinaria que recibió la carga.');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title flex items-center gap-2.5">
            <Fuel className="text-amber-400" size={26} />
            Registro de Carga de Combustible
          </h1>
          <p className="section-subtitle">
            Control de surtidor, consumo de gasolina y diésel para flota de vehículos y maquinaria
          </p>
        </div>
        {canWrite('servicios') && (
          <button onClick={openCreate} className="btn-primary group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span>Nueva Carga de Combustible</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Diésel */}
        <div className="card p-5 border border-blue-500/20 bg-gradient-to-br from-blue-950/20 via-obsidian-900 to-obsidian-900 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Total Litros Diésel</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Droplets size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white tracking-tight">
              {resumen?.total_litros_diesel?.toLocaleString() || '0'} <span className="text-sm font-normal text-blue-300">Lts</span>
            </p>
            <p className="text-[11px] text-mining-400 mt-1">Consumo acumulado en maquinaria/vehículos</p>
          </div>
        </div>

        {/* Total Gasolina */}
        <div className="card p-5 border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-obsidian-900 to-obsidian-900 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Total Litros Gasolina</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Fuel size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white tracking-tight">
              {resumen?.total_litros_gasolina?.toLocaleString() || '0'} <span className="text-sm font-normal text-amber-300">Lts</span>
            </p>
            <p className="text-[11px] text-mining-400 mt-1">Consumo acumulado de gasolina</p>
          </div>
        </div>

        {/* Total Monto Gastado */}
        <div className="card p-5 border border-copper-500/20 bg-gradient-to-br from-copper-950/20 via-obsidian-900 to-obsidian-900 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-copper-400 uppercase tracking-wider">Gasto Total Combustibles</span>
            <div className="w-10 h-10 rounded-xl bg-copper-500/10 text-copper-400 flex items-center justify-center border border-copper-500/20">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-copper-400 tracking-tight drop-shadow-[0_0_8px_rgba(234,119,64,0.3)]">
              Bs. {resumen?.total_monto_combustible?.toLocaleString() || '0'}
            </p>
            <p className="text-[11px] text-mining-400 mt-1">Inversión total en abastecimiento</p>
          </div>
        </div>

        {/* Total Cargas Registradas */}
        <div className="card p-5 border border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-obsidian-900 to-obsidian-900 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Total Cargas</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white tracking-tight">
              {resumen?.total_registros || '0'} <span className="text-xs font-normal text-purple-300">registros</span>
            </p>
            <p className="text-[11px] text-mining-400 mt-1">Historial total registrado</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-obsidian-900/60">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por placa, modelo, surtidor..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10 py-2 text-xs w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={filterCombustible}
            onChange={e => { setFilterCombustible(e.target.value); setPage(1); }}
            className="input-field py-2 text-xs w-full sm:w-auto"
          >
            <option value="">Todos los combustibles</option>
            <option value="diesel">Diésel</option>
            <option value="gasolina">Gasolina</option>
          </select>

          <select
            value={filterEquipo}
            onChange={e => { setFilterEquipo(e.target.value); setPage(1); }}
            className="input-field py-2 text-xs w-full sm:w-auto"
          >
            <option value="">Todos los equipos</option>
            <option value="vehiculo">Vehículos</option>
            <option value="maquinaria">Maquinaria</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium w-full">
              <thead>
                <tr>
                  <th className="pl-6">Fecha / Hora</th>
                  <th>Equipo / Vehículo (Placa / Modelo)</th>
                  <th>Combustible</th>
                  <th>Litros Cargados</th>
                  <th>Monto Total (Bs.)</th>
                  <th>Surtidor / Grifo</th>
                  <th>Chofer / Responsable</th>
                  <th className="pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {cargasList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-mining-400 text-sm">
                      <Fuel size={40} className="mx-auto mb-3 text-mining-600 opacity-50" />
                      No hay registros de carga de combustible.
                    </td>
                  </tr>
                ) : (
                  cargasList.map((c: any) => {
                    const isDiesel = c.tipo_combustible === 'diesel';
                    const isVehiculo = c.tipo_equipo === 'vehiculo';
                    const equipoInfo = isVehiculo ? c.vehiculo : c.maquinaria;

                    return (
                      <motion.tr variants={tableRowVariant} key={c.id} className="group hover:bg-white/[0.02]">
                        <td className="pl-6">
                          <div className="text-xs text-white font-medium">
                            {new Date(c.fecha_hora).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-mining-500 font-mono">
                            {new Date(c.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isVehiculo ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {isVehiculo ? <Truck size={16} /> : <Wrench size={16} />}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">
                                {isVehiculo ? (equipoInfo?.placa || 'Sin Placa') : (equipoInfo?.nombre_codigo || 'Sin Código')}
                              </p>
                              <p className="text-[11px] text-mining-400">
                                {equipoInfo ? `${equipoInfo.marca || ''} ${equipoInfo.modelo || ''}`.trim() : 'Equipo no encontrado'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>
                          {isDiesel ? (
                            <span className="badge badge-info bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 w-fit text-xs font-semibold">
                              <Droplets size={12} /> Diésel
                            </span>
                          ) : (
                            <span className="badge badge-warning bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-fit text-xs font-semibold">
                              <Fuel size={12} /> Gasolina
                            </span>
                          )}
                        </td>

                        <td className="font-bold text-white text-sm">
                          {c.litros} <span className="text-xs text-mining-400 font-normal">Lts</span>
                        </td>

                        <td className="font-bold text-copper-400 drop-shadow-[0_0_8px_rgba(234,119,64,0.3)] text-sm">
                          Bs. {parseFloat(c.monto).toLocaleString()}
                          {c.precio_por_litro && (
                            <div className="text-[10px] text-mining-500 font-normal">Bs. {c.precio_por_litro} / L</div>
                          )}
                        </td>

                        <td className="text-xs text-mining-300">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-copper-400 shrink-0" />
                            <span>{c.surtidor_grifo}</span>
                          </div>
                        </td>

                        <td className="text-xs text-white font-medium">
                          <div className="flex items-center gap-1.5">
                            <UserCheck size={12} className="text-teal-400 shrink-0" />
                            <span>{c.responsable}</span>
                          </div>
                        </td>

                        <td className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canWrite('servicios') && (
                              <button onClick={() => openEdit(c)} className="btn-icon p-1.5" title="Editar registro">
                                <Edit size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-500/10 p-1.5"
                              title="Eliminar registro"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </motion.tbody>
            </table>
          </div>
        )}

        {cargasData && cargasData.last_page > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/5 bg-obsidian-950/30 text-xs text-mining-400">
            <div>
              Mostrando página <span className="font-bold text-white">{cargasData.current_page}</span> de <span className="font-bold text-white">{cargasData.last_page}</span> ({cargasData.total} registros)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={cargasData.current_page === 1}
                className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(cargasData.last_page, p + 1))}
                disabled={cargasData.current_page === cargasData.last_page}
                className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      {createPortal(
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Eliminar Registro de Combustible"
          message="¿Estás seguro de que deseas eliminar este registro de carga de combustible? Esta acción afectará el historial de consumo."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={() => { if (deleteTargetId) deleteMutation.mutate(deleteTargetId); }}
          onCancel={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
        />,
        document.body
      )}

      {/* Create / Edit Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto" onClick={closeModal}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl w-full max-w-2xl shadow-elevated border border-white/10 overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                      <Fuel size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Carga de Combustible' : 'Nueva Carga de Combustible'}</h3>
                      <p className="text-xs text-mining-400">Registre los litros, monto y surtidor de abastecimiento</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="text-mining-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                  {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-xs border border-red-500/20">{error}</div>}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Fuel Type and Equipment Type Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div>
                        <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                          Tipo de Combustible *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, tipo_combustible: 'diesel' })}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                              form.tipo_combustible === 'diesel'
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-glow-blue'
                                : 'bg-white/5 border-white/10 text-mining-400 hover:bg-white/10'
                            }`}
                          >
                            <Droplets size={16} /> Diésel
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, tipo_combustible: 'gasolina' })}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                              form.tipo_combustible === 'gasolina'
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-glow-amber'
                                : 'bg-white/5 border-white/10 text-mining-400 hover:bg-white/10'
                            }`}
                          >
                            <Fuel size={16} /> Gasolina
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                          Tipo de Equipo *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, tipo_equipo: 'vehiculo', maquinaria_id: '' })}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                              form.tipo_equipo === 'vehiculo'
                                ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-glow-teal'
                                : 'bg-white/5 border-white/10 text-mining-400 hover:bg-white/10'
                            }`}
                          >
                            <Truck size={16} /> Vehículo
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, tipo_equipo: 'maquinaria', vehiculo_id: '' })}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                              form.tipo_equipo === 'maquinaria'
                                ? 'bg-copper-500/20 border-copper-500/50 text-copper-300 shadow-glow-copper'
                                : 'bg-white/5 border-white/10 text-mining-400 hover:bg-white/10'
                            }`}
                          >
                            <Wrench size={16} /> Maquinaria
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Equipment Selector */}
                    <div>
                      {form.tipo_equipo === 'vehiculo' ? (
                        <div>
                          <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                            Seleccionar Vehículo *
                          </label>
                          <select
                            required
                            className="input-field text-xs"
                            value={form.vehiculo_id}
                            onChange={e => setForm({ ...form, vehiculo_id: e.target.value })}
                          >
                            <option value="">-- Seleccionar Vehículo --</option>
                            {vehiculoList.map((v: any) => (
                              <option key={v.id} value={v.id}>
                                [{v.placa || 'S/P'}] {v.marca} {v.modelo} - {v.tipo || 'Vehículo'} {v.conductor ? `(Chofer: ${v.conductor.nombre})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                            Seleccionar Maquinaria *
                          </label>
                          <select
                            required
                            className="input-field text-xs"
                            value={form.maquinaria_id}
                            onChange={e => setForm({ ...form, maquinaria_id: e.target.value })}
                          >
                            <option value="">-- Seleccionar Maquinaria --</option>
                            {maquinariaList.map((m: any) => (
                              <option key={m.id} value={m.id}>
                                [{m.nombre_codigo || 'S/C'}] {m.marca} {m.modelo} - {m.tipo || 'Maquinaria'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Liters & Total Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                          Cantidad en Litros (Lts) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="0.01"
                          placeholder="Ej. 45.5"
                          className="input-field text-xs"
                          value={form.litros}
                          onChange={e => setForm({ ...form, litros: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                          Monto Total Cargado (Bs.) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="0"
                          placeholder="Ej. 170.00"
                          className="input-field text-xs"
                          value={form.monto}
                          onChange={e => setForm({ ...form, monto: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Station / Surtidor & Responsible User */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                          Surtidor / Grifo / Estación *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Surtidor YPFB San Lucas"
                          className="input-field text-xs"
                          value={form.surtidor_grifo}
                          onChange={e => setForm({ ...form, surtidor_grifo: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                          Chofer / Responsable de la Carga *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nombre del operador o chofer"
                          className="input-field text-xs"
                          value={form.responsable}
                          onChange={e => setForm({ ...form, responsable: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div>
                      <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                        Fecha y Hora de la Carga *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        className="input-field text-xs"
                        value={form.fecha_hora}
                        onChange={e => setForm({ ...form, fecha_hora: e.target.value })}
                      />
                    </div>

                    {/* Observacion */}
                    <div>
                      <label className="block text-xs font-bold text-mining-400 uppercase tracking-wider mb-2">
                        Observaciones Adicionales
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Nro. de tiquete de surtidor, kilometraje o detalles de la recarga"
                        className="input-field text-xs"
                        value={form.observacion}
                        onChange={e => setForm({ ...form, observacion: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button type="button" onClick={closeModal} className="btn-secondary text-xs">Cancelar</button>
                      <button type="submit" disabled={saveMutation.isPending} className="btn-primary text-xs">
                        {saveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : (editingId ? 'Guardar Cambios' : 'Registrar Carga')}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
