import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Search, Plus, Package, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../components/ui/PageTransition';

export const InventarioList = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['materiales', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await api.get(`/materiales?${params.toString()}`);
      return res.data;
    }
  });

  const getGroupImage = (grupo: string = '') => {
    // Generate a determinist hash based on the group name or code
    const hash = grupo.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const photos = [
      'https://images.unsplash.com/photo-1587315332822-6b95b8630bb3?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581166397007-0bc44d637f1c?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620286828590-e54dbf83c185?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586942913160-c4e9ed1129b2?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508344928928-7137b29de218?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?q=80&w=200&auto=format&fit=crop',
    ];
    return photos[hash % photos.length];
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="section-title">Materiales</h1>
          <p className="section-subtitle">Catálogo maestro de todos los productos de la cooperativa</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mining-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar material o código..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <button className="btn-primary group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th className="px-6 font-medium">Producto</th>
                <th className="px-6 font-medium w-48 text-right">SKU</th>
              </tr>
            </thead>
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                <tbody>
                  {Array.from({length: 5}).map((_, i) => (
                    <tr key={i} className="border-b border-mining-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-mining-100 animate-pulse"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-48 bg-mining-100 rounded animate-pulse"></div>
                            <div className="h-3 w-24 bg-mining-100 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="h-6 w-24 bg-mining-100 rounded ml-auto animate-pulse"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <motion.tbody 
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0 }}
                >
                  {data?.data?.map((item: any) => (
                    <motion.tr 
                      key={item.id} 
                      variants={staggerItem}
                      className="border-b border-mining-50 hover:bg-mining-50/50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-obsidian-800 border border-white/5 relative group-hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all">
                            <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                            {item.imagen ? (
                              <img src={item.imagen} alt={item.descripcion} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <img src={getGroupImage(item.grupo)} alt="Grupo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter grayscale-[20%]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-mining-100 group-hover:text-teal-400 transition-colors">
                              {item.descripcion}
                            </p>
                            {item.grupo && (
                              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-copper-400 bg-copper-500/10 border border-copper-500/20 inline-flex px-2 py-0.5 rounded-md">
                                <Star size={10} className="fill-copper-500" />
                                {item.grupo}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-mono font-bold bg-white/5 border border-white/10 text-mining-300 rounded-lg whitespace-nowrap shadow-glass-inset">
                          {item.codigo}
                        </span>
                      </td>
                    </motion.tr>
                  ))}

                  {(!data?.data || data.data.length === 0) && (
                    <tr>
                      <td colSpan={2} className="py-12 text-center text-mining-500">
                        <Package size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium text-white">No se encontraron productos</p>
                        <p className="text-sm mt-1">Ajusta tu búsqueda o agrega un nuevo material.</p>
                      </td>
                    </tr>
                  )}
                </motion.tbody>
              )}
            </AnimatePresence>
          </table>
        </div>
      </div>
    </div>
  );
};
