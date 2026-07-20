import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useToast } from '../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Calendar, FileText, Search, Plus, Trash2, 
  ArrowRight, ArrowLeft, CheckCircle2, PackageSearch, Save, Loader2
} from 'lucide-react';

interface DetalleForm {
  material_id: number;
  codigo: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

const steps = [
  { id: 1, title: 'Datos Generales', icon: <FileText size={20} /> },
  { id: 2, title: 'Materiales', icon: <PackageSearch size={20} /> },
  { id: 3, title: 'Confirmación', icon: <CheckCircle2 size={20} /> }
];

export const NuevaCompra = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isTest = typeof window !== 'undefined' && !!(window as any).Cypress;

  const [currentStep, setCurrentStep] = useState(1);
  const [proveedorId, setProveedorId] = useState('');
  const [bocaminaId, setBocaminaId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [numeroFactura, setNumeroFactura] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState<DetalleForm[]>([]);
  const [searchMaterial, setSearchMaterial] = useState('');
  const [continueAdding, setContinueAdding] = useState(false);

  const { data: proveedores } = useQuery({ queryKey: ['proveedores'], queryFn: async () => (await api.get('/proveedores')).data });
  const { data: bocaminas } = useQuery({ queryKey: ['bocaminas'], queryFn: async () => (await api.get('/bocaminas')).data });
  const { data: materiales } = useQuery({ 
    queryKey: ['materiales-search', searchMaterial], 
    queryFn: async () => (await api.get(`/materiales?search=${searchMaterial}`)).data,
    enabled: searchMaterial.length > 2
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        proveedor_id: proveedorId,
        bocamina_id: bocaminaId,
        fecha,
        numero_factura: numeroFactura,
        observaciones,
        total: detalles.reduce((sum, item) => sum + item.subtotal, 0),
        detalles: detalles.map(d => ({
          material_id: d.material_id,
          cantidad: d.cantidad,
          precio: d.precio_unitario,
          subtotal: d.subtotal
        }))
      };
      return await api.post('/compras', payload);
    },
    onSuccess: () => {
      toast.success('Compra registrada', 'La compra se ha guardado exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      if (!continueAdding) {
        navigate('/compras');
      } else {
        setProveedorId('');
        setBocaminaId('');
        setNumeroFactura('');
        setObservaciones('');
        setDetalles([]);
        setCurrentStep(1);
        setContinueAdding(false);
      }
    },
    onError: (err: any) => {
      toast.error('Error', err.response?.data?.message || 'Error al guardar la compra');
    }
  });

  const addMaterial = (mat: any) => {
    if (detalles.find(d => d.material_id === mat.id)) {
      toast.warning('Material duplicado', 'El material ya está en la lista.');
      return;
    }
    setDetalles([...detalles, {
      material_id: mat.id,
      codigo: mat.codigo,
      descripcion: mat.descripcion,
      cantidad: 1,
      precio_unitario: mat.precio_unitario || 0,
      subtotal: mat.precio_unitario || 0
    }]);
    setSearchMaterial('');
  };

  const updateDetalle = (id: number, field: string, value: number) => {
    setDetalles(detalles.map(d => {
      if (d.material_id === id) {
        const updated = { ...d, [field]: value };
        updated.subtotal = updated.cantidad * updated.precio_unitario;
        return updated;
      }
      return d;
    }));
  };

  const removeDetalle = (id: number) => {
    setDetalles(detalles.filter(d => d.material_id !== id));
  };

  const totalGeneral = detalles.reduce((sum, item) => sum + item.subtotal, 0);

  const nextStep = () => {
    if (currentStep === 1 && (!proveedorId || !bocaminaId || !fecha)) {
      toast.warning('Campos incompletos', 'Seleccione un proveedor, bocamina y fecha obligatoria.');
      return;
    }
    if (currentStep === 2 && detalles.length === 0) {
      toast.warning('Sin materiales', 'Agregue al menos un material a la compra.');
      return;
    }
    setCurrentStep(s => Math.min(3, s + 1));
  };

  const prevStep = () => setCurrentStep(s => Math.max(1, s - 1));

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Nueva Compra</h1>
          <p className="section-subtitle">Registro de abastecimiento paso a paso</p>
        </div>
      </div>

      {/* Stepper Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-mining-100 rounded-full z-0">
            <motion.div 
              className="h-full bg-copper-500 rounded-full transition-all duration-500 ease-out"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${
                  currentStep >= step.id 
                    ? 'bg-copper-600 text-white border-white shadow-glow-copper' 
                    : 'bg-white/5 text-mining-500 border-white/5'
                }`}
              >
                {step.icon}
              </div>
              <span className={`absolute -bottom-7 text-xs font-bold whitespace-nowrap ${currentStep >= step.id ? 'text-white' : 'text-mining-400'}`}>
                Paso {step.id}: {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stepper Content */}
      <div className="card min-h-[400px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" variants={variants} initial={isTest ? false : "initial"} animate="animate" exit="exit" className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">Información del Documento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Proveedor *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
                    <select className="input-field pl-10" value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
                      <option value="">Seleccionar proveedor</option>
                      {proveedores?.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Bocamina Destino *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
                    <select className="input-field pl-10" value={bocaminaId} onChange={e => setBocaminaId(e.target.value)}>
                      <option value="">Seleccionar destino</option>
                      {bocaminas?.map((b: any) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Fecha de Compra *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
                    <input type="date" className="input-field pl-10" value={fecha} onChange={e => setFecha(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Número de Factura</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
                    <input type="text" className="input-field pl-10" placeholder="Ej. F001-00045" value={numeroFactura} onChange={e => setNumeroFactura(e.target.value)} />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-mining-500 uppercase tracking-wider mb-2">Observaciones</label>
                  <textarea className="input-field" rows={3} placeholder="Notas adicionales..." value={observaciones} onChange={e => setObservaciones(e.target.value)}></textarea>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" variants={variants} initial={isTest ? false : "initial"} animate="animate" exit="exit" className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-white">Detalle de Materiales</h3>
                <div className="relative w-full md:w-72 z-20">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar material (min 3 letras)..." 
                    value={searchMaterial}
                    onChange={e => setSearchMaterial(e.target.value)}
                    className="input-field pl-10"
                  />
                  {searchMaterial.length > 2 && materiales?.data && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-obsidian-800/95 backdrop-blur-md rounded-xl shadow-elevated border border-white/10 max-h-60 overflow-y-auto z-30">
                      {materiales.data.map((mat: any) => (
                        <div 
                          key={mat.id} 
                          className="p-3 hover:bg-white/5 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0"
                          onClick={() => addMaterial(mat)}
                        >
                          <div>
                            <div className="font-bold text-white">{mat.descripcion}</div>
                            <div className="text-xs text-mining-400 font-mono">{mat.codigo}</div>
                          </div>
                          <button className="p-1 text-copper-500 hover:bg-white/10 rounded-lg"><Plus size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs font-bold text-mining-400 uppercase">
                    <tr>
                      <th className="p-4 w-32">Código</th>
                      <th className="p-4">Descripción</th>
                      <th className="p-4 w-32">Cantidad</th>
                      <th className="p-4 w-40">Precio Unitario (Bs.)</th>
                      <th className="p-4 w-40 text-right">Subtotal</th>
                      <th className="p-4 w-16 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {detalles.map(d => (
                      <tr key={d.material_id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-mono text-xs font-bold text-mining-300">
                          {d.codigo}
                        </td>
                        <td className="p-4 text-white font-medium">
                          {d.descripcion}
                        </td>
                        <td className="p-4">
                          <input type="number" min="0.1" step="any" className="input-field py-1.5 px-3 text-center" value={d.cantidad} onChange={e => updateDetalle(d.material_id, 'cantidad', parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="p-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400 font-medium">$</span>
                            <input type="number" min="0" step="any" className="input-field py-1.5 pl-7 pr-3 text-right" value={d.precio_unitario} onChange={e => updateDetalle(d.material_id, 'precio_unitario', parseFloat(e.target.value) || 0)} />
                          </div>
                        </td>
                        <td className="p-4 text-right font-bold text-white">
                          ${d.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => removeDetalle(d.material_id)} className="p-2 text-mining-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {detalles.length === 0 && (
                      <tr><td colSpan={6} className="p-12 text-center text-mining-400">Busca y selecciona materiales para agregar a la compra.</td></tr>
                    )}
                  </tbody>
                  {detalles.length > 0 && (
                    <tfoot className="bg-white/5 text-white">
                      <tr>
                        <td colSpan={4} className="p-4 font-bold text-right uppercase tracking-wider text-sm">Total Compra</td>
                        <td className="p-4 text-right font-black text-xl text-copper-400">Bs. {totalGeneral.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" variants={variants} initial={isTest ? false : "initial"} animate="animate" exit="exit" className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white">Confirma la Compra</h3>
                <p className="text-mining-400">Resumen de la Compra: Revisa que los datos sean correctos antes de guardar.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-mining-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Resumen de Materiales ({detalles.length})</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {detalles.map(d => (
                      <div key={d.material_id} className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        <div>
                          <div className="font-bold text-white text-sm">{d.descripcion}</div>
                          <div className="text-xs text-mining-400">{d.cantidad} unid. x Bs. {d.precio_unitario}</div>
                        </div>
                        <div className="font-bold text-copper-400">Bs. {d.subtotal.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel text-white p-6 rounded-2xl shadow-elevated flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-copper-500/20 rounded-full blur-3xl"></div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-mining-400 uppercase tracking-wider mb-6">Datos de Operación</h4>
                    
                    <div className="space-y-4 mb-8">
                      <div>
                        <p className="text-xs text-mining-400 mb-1">Proveedor</p>
                        <p className="font-semibold text-white">{proveedores?.find((p:any) => p.id === parseInt(proveedorId))?.nombre || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-mining-400 mb-1">Bocamina Destino</p>
                        <p className="font-semibold text-white">{bocaminas?.find((b:any) => b.id === parseInt(bocaminaId))?.nombre || '-'}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-mining-400 mb-1">Fecha</p>
                          <p className="font-semibold text-white">{fecha}</p>
                        </div>
                        <div>
                          <p className="text-xs text-mining-400 mb-1">Factura</p>
                          <p className="font-semibold text-white">{numeroFactura || 'S/F'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm text-mining-400 mb-1">Total a Pagar</p>
                    <p className="text-3xl font-black text-copper-400">Bs. {totalGeneral.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stepper Footer Controls */}
      <div className="flex justify-between pt-4 border-t border-white/5">
        <button 
          onClick={prevStep}
          disabled={currentStep === 1 || saveMutation.isPending}
          className={`btn-secondary ${currentStep === 1 ? 'opacity-0' : ''}`}
        >
          <ArrowLeft size={18} /> Anterior
        </button>
        
        {currentStep < 3 ? (
          <button onClick={nextStep} className="btn-primary">
            Siguiente <ArrowRight size={18} />
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => { setContinueAdding(true); saveMutation.mutate(); }} 
              disabled={saveMutation.isPending}
              className="btn-secondary"
            >
              {saveMutation.isPending && continueAdding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Guardar y agregar otra
            </button>
            <button 
              onClick={() => { setContinueAdding(false); saveMutation.mutate(); }} 
              disabled={saveMutation.isPending}
              className="btn-primary bg-emerald-600 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-600/30"
            >
              {saveMutation.isPending && !continueAdding ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Confirmar y Guardar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
