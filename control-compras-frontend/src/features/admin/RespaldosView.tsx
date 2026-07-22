import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { 
  HardDrive, Download, Trash2, ShieldAlert, CloudLightning, Loader2, 
  Calendar, CheckCircle, UploadCloud, RotateCcw, Database, FileText, Image, RefreshCw, X, Settings 
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';

export const RespaldosView = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<{ id?: number; filename?: string; file?: File } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal de resumen de restauración
  const [restoreSummary, setRestoreSummary] = useState<{
    tablas_restauradas: number;
    registros_procesados: number;
    duplicados_omitidos: number;
    archivos_restaurados: number;
  } | null>(null);

  // State para modal de programación de respaldos
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [frecuencia, setFrecuencia] = useState<'diario' | 'semanal' | 'mensual' | 'desactivado'>('semanal');
  const [diaSemana, setDiaSemana] = useState('domingo');
  const [diaMes, setDiaMes] = useState(1);
  const [hora, setHora] = useState('02:00');

  // Consultar respaldos
  const { data, isLoading } = useQuery({
    queryKey: ['respaldos', page],
    queryFn: async () => {
      return (await api.get('/respaldos', { params: { page } })).data;
    }
  });

  // Consultar configuración de programación
  const { data: configData } = useQuery({
    queryKey: ['respaldos-configuracion'],
    queryFn: async () => {
      const res = (await api.get('/respaldos/configuracion')).data;
      if (res) {
        setFrecuencia(res.backup_frecuencia || 'semanal');
        setDiaSemana(res.backup_dia_semana || 'domingo');
        setDiaMes(res.backup_dia_mes || 1);
        setHora(res.backup_hora || '02:00');
      }
      return res;
    }
  });

  // Mutación para guardar programación
  const updateConfigMutation = useMutation({
    mutationFn: async (payload: any) => {
      return (await api.put('/respaldos/configuracion', payload)).data;
    },
    onSuccess: (resData) => {
      toast.success('Programación actualizada', resData.message || 'Horario guardado correctamente.');
      queryClient.invalidateQueries({ queryKey: ['respaldos-configuracion'] });
      setShowConfigModal(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al guardar la programación.';
      toast.error('Error', msg);
    }
  });

  // Mutación para crear respaldo manual
  const createMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      return (await api.post('/respaldos/crear')).data;
    },
    onSuccess: () => {
      toast.success('Copia de seguridad generada con éxito');
      queryClient.invalidateQueries({ queryKey: ['respaldos'] });
      setIsGenerating(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error al generar la copia de seguridad';
      toast.error(msg);
      setIsGenerating(false);
    }
  });

  // Descargar respaldo
  const handleDownload = async (id: number, filename: string) => {
    try {
      const response = await api.get(`/respaldos/${id}/descargar`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Archivo descargado con éxito');
    } catch {
      toast.error('No se pudo descargar el archivo de respaldo');
    }
  };

  // Restaurar respaldo (listado o subido)
  const confirmRestore = async () => {
    if (!restoreTarget) return;
    setIsRestoring(true);

    try {
      let res;
      if (restoreTarget.file) {
        const formData = new FormData();
        formData.append('backup_file', restoreTarget.file);
        res = await api.post('/respaldos/restaurar-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (restoreTarget.id) {
        res = await api.post(`/respaldos/${restoreTarget.id}/restaurar`);
      }

      toast.success('Restauración completada', 'El sistema y las imágenes se restauraron sin duplicar registros idénticos.');
      if (res?.data?.detalles) {
        setRestoreSummary(res.data.detalles);
      }
      queryClient.invalidateQueries();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error durante la restauración del sistema.';
      toast.error('Error al restaurar', msg);
    } finally {
      setIsRestoring(false);
      setRestoreTarget(null);
    }
  };

  // Manejar selección de archivo ZIP local
  const handleFileSelected = (file: File) => {
    if (!file.name.endsWith('.zip')) {
      toast.error('Formato no válido', 'Por favor selecciona un archivo comprimido .ZIP de respaldo.');
      return;
    }
    setRestoreTarget({ filename: file.name, file });
  };

  // Eliminar respaldo
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/respaldos/${deleteId}`);
      toast.success('Respaldo eliminado con éxito');
      queryClient.invalidateQueries({ queryKey: ['respaldos'] });
      setDeleteId(null);
    } catch {
      toast.error('Error al eliminar el respaldo');
    } finally {
      setDeleting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalBytesUsed = data?.data?.reduce((acc: number, item: any) => acc + (item.tamano || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="section-header flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <HardDrive className="text-copper-500" size={32} />
            Copias de Seguridad (Backups)
          </h1>
          <p className="section-subtitle">Gestión integral de respaldos ZIP, imágenes de storage y restauración inteligente sin duplicados</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            accept=".zip"
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRestoring}
            className="btn-secondary flex items-center gap-2 h-11 px-5 text-sm font-bold w-full sm:w-auto justify-center"
          >
            <UploadCloud size={18} className="text-copper-400" />
            <span>Subir & Restaurar ZIP</span>
          </button>

          <button
            onClick={() => createMutation.mutate()}
            disabled={isGenerating}
            className="btn-primary flex items-center gap-2 h-11 px-6 text-sm font-bold shadow-glow-copper w-full sm:w-auto justify-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Generando Respaldo...</span>
              </>
            ) : (
              <>
                <CloudLightning size={18} />
                <span>Generar Respaldo Ahora</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Dropzone Area for Restoring Local Backups */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelected(e.dataTransfer.files[0]);
          }
        }}
        className="card p-6 border-2 border-dashed border-white/15 hover:border-copper-500/50 bg-obsidian-900/60 hover:bg-copper-500/[0.02] cursor-pointer transition-all flex flex-col md:flex-row items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-copper-500/10 text-copper-400 group-hover:scale-105 group-hover:bg-copper-500/20 flex items-center justify-center transition-all shrink-0">
            <UploadCloud size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-copper-400 transition-colors">
              Subir Archivo de Respaldo Local (.ZIP)
            </h3>
            <p className="text-xs text-mining-400 mt-1">
              Arrastra y suelta tu copia `.ZIP` de seguridad o haz clic para explorarla. Se restaurarán datos e imágenes omitiendo duplicados idénticos automáticamente.
            </p>
          </div>
        </div>
        <div className="btn-secondary py-2 px-4 text-xs font-bold whitespace-nowrap shrink-0">
          Explorar Archivos ZIP
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-copper-500/10 text-copper-500 flex items-center justify-center shrink-0">
            <HardDrive size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-mining-500 uppercase tracking-wider">Espacio Almacenado</div>
            <div className="text-xl font-black text-white mt-0.5">{formatBytes(totalBytesUsed)}</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-mining-500 uppercase tracking-wider">Retención GFS</div>
            <div className="text-xs font-semibold text-white mt-1">Activa (7D, 4S, 12M, 5A)</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            <RefreshCw size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-mining-500 uppercase tracking-wider">Fusión & Deduplicación</div>
            <div className="text-xs font-semibold text-white mt-1">Activa (Sin duplicados)</div>
          </div>
        </div>

        <div 
          onClick={() => setShowConfigModal(true)}
          className="card p-4 flex items-center justify-between gap-2.5 hover:border-copper-500/40 cursor-pointer group transition-all min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-copper-500/20 group-hover:text-copper-400 flex items-center justify-center shrink-0 transition-all">
              <Calendar size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-mining-500 uppercase tracking-wider truncate">Programación</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate capitalize">
                {configData?.backup_frecuencia === 'semanal' && `Semanal (${configData?.backup_dia_semana}s ${configData?.backup_hora})`}
                {configData?.backup_frecuencia === 'diario' && `Diario (${configData?.backup_hora})`}
                {configData?.backup_frecuencia === 'mensual' && `Mensual (Día ${configData?.backup_dia_mes} ${configData?.backup_hora})`}
                {configData?.backup_frecuencia === 'desactivado' && 'Desactivado'}
                {!configData && 'Cargando...'}
              </div>
            </div>
          </div>
          <button className="px-2 py-1 rounded-lg bg-white/5 hover:bg-copper-500/20 text-copper-400 hover:text-white border border-white/10 text-[11px] font-bold shrink-0 flex items-center gap-1 transition-colors">
            <Settings size={12} /> Configurar
          </button>
        </div>
      </div>

      {/* Alert Rule */}
      <div className="bg-obsidian-900/40 border border-white/5 p-4 rounded-xl flex gap-3 text-xs text-mining-400">
        <ShieldAlert size={20} className="text-copper-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Nota de Seguridad & Disaster Recovery:</strong> Los respaldos ZIP incluyen la base de datos completa (`database.json` + `database.sql`) y las carpetas de archivos/fotos del sistema. Si el sistema sufre una pérdida total, al subir el ZIP el sistema recuperará todo el inventario, compras, servicios e imágenes automáticamente.
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg border border-white/5"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-premium w-full">
                <thead className="bg-mining-50/80 border-b border-mining-100">
                  <tr>
                    <th className="pl-6 w-56">Fecha de Creación</th>
                    <th>Nombre del Archivo</th>
                    <th>Tipo</th>
                    <th>Tamaño</th>
                    <th>Estado</th>
                    <th>Responsable</th>
                    <th className="pr-6 text-right w-44">Acciones</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                  {data?.data?.map((item: any) => (
                    <motion.tr variants={tableRowVariant} key={item.id} className="hover:bg-mining-50/50">
                      <td className="pl-6">
                        <div className="flex items-center gap-2 text-mining-500 text-sm font-medium">
                          <Calendar size={14} className="text-copper-500" />
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="font-semibold text-white text-xs max-w-xs truncate">{item.nombre_archivo}</td>
                      <td>
                        <span className={`badge ${item.tipo === 'manual' ? 'badge-success' : 'badge-neutral'}`}>
                          {item.tipo === 'manual' ? 'Manual' : 'Automático'}
                        </span>
                      </td>
                      <td className="text-mining-300 font-mono text-xs">{formatBytes(item.tamano)}</td>
                      <td>
                        {item.estado === 'completado' ? (
                          <span className="badge badge-success">Completado</span>
                        ) : (
                          <span className="badge badge-danger">Fallido</span>
                        )}
                      </td>
                      <td className="text-mining-400 font-semibold">{item.usuario?.nombre || 'Sistema'}</td>
                      <td className="pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          {item.estado === 'completado' && (
                            <>
                              <button
                                onClick={() => setRestoreTarget({ id: item.id, filename: item.nombre_archivo })}
                                className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 flex items-center justify-center transition-colors"
                                title="Restaurar datos e imágenes"
                              >
                                <RotateCcw size={14} />
                              </button>
                              <button
                                onClick={() => handleDownload(item.id, item.nombre_archivo)}
                                className="w-8 h-8 rounded-lg bg-white/5 text-mining-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
                                title="Descargar ZIP"
                              >
                                <Download size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {(!data || data.data.length === 0) && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <HardDrive size={48} className="text-white/5 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">Sin respaldos</h3>
                        <p className="text-mining-500 mt-1">No se ha registrado ninguna copia de seguridad aún.</p>
                      </td>
                    </tr>
                  )}
                </motion.tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.last_page > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-t border-white/5">
                <span className="text-sm text-mining-400">
                  Página <strong className="text-white">{data.current_page}</strong> de <strong className="text-white">{data.last_page}</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={data.current_page === 1}
                    className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(data.last_page, p + 1))}
                    disabled={data.current_page === data.last_page}
                    className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal for Restoration */}
      {createPortal(
        <ConfirmDialog
          isOpen={!!restoreTarget}
          title="Restaurar Sistema y Archivos"
          message={`¿Deseas restaurar la base de datos y archivos físicos desde "${restoreTarget?.filename || 'el archivo ZIP seleccionado'}"? Se restablecerán registros e imágenes. Los registros idénticos no se duplicarán.`}
          confirmLabel="Sí, Restaurar Todo"
          cancelLabel="Cancelar"
          variant="warning"
          isLoading={isRestoring}
          onConfirm={confirmRestore}
          onCancel={() => setRestoreTarget(null)}
        />,
        document.body
      )}

      {/* Modal de Resumen de Restauración */}
      {createPortal(
        <AnimatePresence>
          {restoreSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[100] p-4"
              onClick={() => setRestoreSummary(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-panel bg-obsidian-900/98 border border-teal-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                      <CheckCircle size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Restauración Completada</h3>
                      <p className="text-xs text-mining-400">Resultados del proceso de recuperación</p>
                    </div>
                  </div>
                  <button onClick={() => setRestoreSummary(null)} className="text-mining-400 hover:text-white p-1">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-mining-400 flex items-center gap-1.5 font-medium">
                      <Database size={14} className="text-teal-400" /> Tablas Restauradas
                    </div>
                    <div className="text-xl font-black text-white">{restoreSummary.tablas_restauradas}</div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-mining-400 flex items-center gap-1.5 font-medium">
                      <FileText size={14} className="text-copper-400" /> Registros Procesados
                    </div>
                    <div className="text-xl font-black text-white">{restoreSummary.registros_procesados}</div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-mining-400 flex items-center gap-1.5 font-medium">
                      <RefreshCw size={14} className="text-blue-400" /> Duplicados Fusionados
                    </div>
                    <div className="text-xl font-black text-white">{restoreSummary.duplicados_omitidos}</div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-mining-400 flex items-center gap-1.5 font-medium">
                      <Image size={14} className="text-emerald-400" /> Imágenes Recuperadas
                    </div>
                    <div className="text-xl font-black text-white">{restoreSummary.archivos_restaurados}</div>
                  </div>
                </div>

                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-300">
                  <strong>✓ Recuperación ante Desastres Completa:</strong> El catálogo de materiales, compras, usuarios e imágenes se encuentra sincronizado sin datos duplicados.
                </div>

                <button
                  onClick={() => setRestoreSummary(null)}
                  className="btn-primary w-full py-2.5 justify-center font-bold text-sm"
                >
                  Aceptar y Continuar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Modal de Configuración de Programación de Respaldos */}
      {createPortal(
        <AnimatePresence>
          {showConfigModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-[100] p-4"
              onClick={() => setShowConfigModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="glass-panel bg-obsidian-900/98 border border-copper-500/30 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-copper-500/20 text-copper-400 flex items-center justify-center">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Programación de Respaldos Automáticos</h3>
                      <p className="text-xs text-mining-400">Configura la frecuencia, día de la semana y hora exacta</p>
                    </div>
                  </div>
                  <button onClick={() => setShowConfigModal(false)} className="text-mining-400 hover:text-white p-1">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-mining-400 font-bold mb-1.5 uppercase tracking-wider">Frecuencia del Respaldo</label>
                    <select
                      value={frecuencia}
                      onChange={e => setFrecuencia(e.target.value as any)}
                      className="input-field w-full text-white bg-obsidian-800 border-white/15 focus:border-copper-500"
                    >
                      <option value="diario">Diario (Todos los días)</option>
                      <option value="semanal">Semanal (Una vez por semana)</option>
                      <option value="mensual">Mensual (Una vez al mes)</option>
                      <option value="desactivado">Desactivado (Solo respaldos manuales)</option>
                    </select>
                  </div>

                  {frecuencia === 'semanal' && (
                    <div>
                      <label className="block text-mining-400 font-bold mb-1.5 uppercase tracking-wider">Día de la Semana</label>
                      <select
                        value={diaSemana}
                        onChange={e => setDiaSemana(e.target.value)}
                        className="input-field w-full text-white bg-obsidian-800 border-white/15 focus:border-copper-500"
                      >
                        <option value="domingo">Domingo</option>
                        <option value="lunes">Lunes</option>
                        <option value="martes">Martes</option>
                        <option value="miercoles">Miércoles</option>
                        <option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                        <option value="sabado">Sábado</option>
                      </select>
                    </div>
                  )}

                  {frecuencia === 'mensual' && (
                    <div>
                      <label className="block text-mining-400 font-bold mb-1.5 uppercase tracking-wider">Día del Mes</label>
                      <select
                        value={diaMes}
                        onChange={e => setDiaMes(Number(e.target.value))}
                        className="input-field w-full text-white bg-obsidian-800 border-white/15 focus:border-copper-500"
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>Día {day} de cada mes</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {frecuencia !== 'desactivado' && (
                    <div>
                      <label className="block text-mining-400 font-bold mb-1.5 uppercase tracking-wider">Hora Exacta de Ejecución</label>
                      <input
                        type="time"
                        value={hora}
                        onChange={e => setHora(e.target.value)}
                        className="input-field w-full text-white bg-obsidian-800 border-white/15 focus:border-copper-500 font-mono text-sm"
                      />
                    </div>
                  )}

                  {/* Resumen dinámico */}
                  <div className="p-4 bg-copper-500/10 border border-copper-500/25 rounded-xl text-xs text-copper-300 flex items-start gap-2.5">
                    <Calendar size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold mb-0.5">Resumen de Programación:</strong>
                      {frecuencia === 'diario' && `El sistema generará respaldos automáticos todos los días a las ${hora}.`}
                      {frecuencia === 'semanal' && `El sistema generará respaldos automáticos todos los ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}s a las ${hora}.`}
                      {frecuencia === 'mensual' && `El sistema generará respaldos automáticos el día ${diaMes} de cada mes a las ${hora}.`}
                      {frecuencia === 'desactivado' && `La generación automática está desactivada. Solo se crearán respaldos manuales o por subida ZIP.`}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="btn-secondary w-full py-2.5 justify-center font-bold text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={updateConfigMutation.isPending}
                    onClick={() => {
                      updateConfigMutation.mutate({
                        backup_frecuencia: frecuencia,
                        backup_dia_semana: diaSemana,
                        backup_dia_mes: diaMes,
                        backup_hora: hora,
                      });
                    }}
                    className="btn-primary w-full py-2.5 justify-center font-bold text-sm"
                  >
                    {updateConfigMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <ConfirmDialog
          isOpen={!!deleteId}
          title="Eliminar Respaldo"
          message="¿Estás seguro de que deseas eliminar este respaldo de manera definitiva? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />,
        document.body
      )}
    </div>
  );
};
