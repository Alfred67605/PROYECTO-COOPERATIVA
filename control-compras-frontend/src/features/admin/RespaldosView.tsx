import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { HardDrive, Download, Trash2, ShieldAlert, CloudLightning, Loader2, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { motion } from 'framer-motion';
import { staggerContainer, tableRowVariant } from '../../components/ui/PageTransition';

export const RespaldosView = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Consultar respaldos
  const { data, isLoading } = useQuery({
    queryKey: ['respaldos', page],
    queryFn: async () => {
      return (await api.get('/respaldos', { params: { page } })).data;
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
    } catch (err: any) {
      toast.error('No se pudo descargar el archivo de respaldo');
    }
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
    } catch (err: any) {
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
      <div className="section-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <HardDrive className="text-copper-500" size={28} />
            Copias de Seguridad (Backups)
          </h1>
          <p className="section-subtitle">Administración de respaldos de base de datos y archivos físicos</p>
        </div>
        <button
          onClick={() => createMutation.mutate()}
          disabled={isGenerating}
          className="btn-primary flex items-center gap-2 h-11 w-full md:w-auto justify-center"
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

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-copper-500/10 text-copper-500 flex items-center justify-center">
            <HardDrive size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-mining-500 uppercase tracking-wider">Espacio en Backups (Pág. Actual)</div>
            <div className="text-2xl font-black text-white mt-0.5">{formatBytes(totalBytesUsed)}</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-mining-500 uppercase tracking-wider">Política de Retención GFS</div>
            <div className="text-sm font-semibold text-white mt-1">Activa (7D, 4S, 12M, 5A)</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-mining-500 uppercase tracking-wider">Programación Periódica</div>
            <div className="text-sm font-semibold text-white mt-1">Todos los días a las 02:00 AM</div>
          </div>
        </div>
      </div>

      {/* Alert Rule */}
      <div className="bg-obsidian-900/40 border border-white/5 p-4 rounded-xl flex gap-3 text-xs text-mining-400">
        <ShieldAlert size={20} className="text-copper-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Nota de Seguridad:</strong> Las copias de seguridad contienen información confidencial del inventario, compras y usuarios de la cooperativa. Descargue estos archivos únicamente a dispositivos seguros y de uso personal autorizado.
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
                    <th className="pr-6 text-right w-36">Acciones</th>
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
                            <button
                              onClick={() => handleDownload(item.id, item.nombre_archivo)}
                              className="w-8 h-8 rounded-lg bg-white/5 text-mining-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
                              title="Descargar"
                            >
                              <Download size={14} />
                            </button>
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-white">¿Eliminar Respaldo?</h3>
            </div>
            <p className="text-sm text-mining-400">
              Esta acción eliminará físicamente el archivo del servidor de forma permanente. Esta operación no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2"
              >
                {deleting && <Loader2 className="animate-spin" size={14} />}
                <span>Eliminar Permanentemente</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
