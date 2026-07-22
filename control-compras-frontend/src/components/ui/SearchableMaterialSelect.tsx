import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Package, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MaterialOption {
  id: number;
  codigo: string;
  descripcion: string;
  grupo?: string;
  precio_unitario?: number;
}

interface SearchableMaterialSelectProps {
  materials: MaterialOption[];
  value: string; // current display string or code
  onChange: (selected: { id: number | string; nombre: string; material?: MaterialOption }) => void;
  placeholder?: string;
  required?: boolean;
}

export const SearchableMaterialSelect: React.FC<SearchableMaterialSelectProps> = ({
  materials = [],
  value,
  onChange,
  placeholder = 'Buscar producto o repuesto...',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    width: 380,
    placeAbove: false
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < 280 && rect.top > 280;
      
      const width = Math.max(rect.width, 380);
      let left = rect.left;
      
      if (left + width > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - width - 16);
      }

      setCoords({
        top: placeAbove ? rect.top - 8 : rect.bottom + 6,
        left,
        width,
        placeAbove
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
      return () => {
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', updateCoords, true);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const portalEl = document.getElementById('searchable-select-portal');
        if (portalEl && portalEl.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMaterials = materials.filter(m => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      (m.codigo && m.codigo.toLowerCase().includes(q)) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(q)) ||
      (m.grupo && m.grupo.toLowerCase().includes(q))
    );
  });

  const handleSelect = (m: MaterialOption) => {
    const displayStr = `${m.codigo} - ${m.descripcion}`;
    setQuery(displayStr);
    onChange({ id: m.id, nombre: displayStr, material: m });
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    onChange({ id: '', nombre: '' });
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`relative flex items-center bg-obsidian-950/80 border rounded-xl transition-all cursor-text ${
          isOpen ? 'border-teal-500/80 ring-2 ring-teal-500/20' : 'border-white/10 hover:border-white/20'
        }`}
        onClick={() => {
          setIsOpen(true);
          if (inputRef.current) inputRef.current.focus();
        }}
      >
        <Search size={16} className="absolute left-3 text-mining-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          required={required}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
            updateCoords();
            onChange({ id: '', nombre: e.target.value });
          }}
          onFocus={() => {
            setIsOpen(true);
            updateCoords();
          }}
          placeholder={placeholder}
          className="w-full bg-transparent pl-9 pr-16 py-2.5 text-sm text-white placeholder-mining-500 focus:outline-none"
        />
        <div className="absolute right-3 flex items-center gap-1.5 text-mining-400">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-white rounded-md transition-colors"
              title="Limpiar selección"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-400' : ''}`}
          />
        </div>
      </div>

      {isOpen &&
        createPortal(
          <div id="searchable-select-portal">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: coords.placeAbove ? -6 : 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: coords.placeAbove ? -6 : 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'fixed',
                  top: coords.placeAbove ? undefined : `${coords.top}px`,
                  bottom: coords.placeAbove ? `${window.innerHeight - coords.top}px` : undefined,
                  left: `${coords.left}px`,
                  width: `${coords.width}px`,
                  zIndex: 99999
                }}
                className="bg-obsidian-900/98 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-64 overflow-y-auto p-1.5 space-y-1 custom-scrollbar"
              >
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map(m => {
                    const displayStr = `${m.codigo} - ${m.descripcion}`;
                    const isSelected = query === displayStr || query === m.codigo;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelect(m)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-500/20 border border-teal-500/40 text-white'
                            : 'hover:bg-white/[0.08] text-mining-200 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-teal-400 border border-white/5">
                            <Package size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-copper-400 bg-copper-500/15 px-2 py-0.5 rounded border border-copper-500/30 shrink-0">
                                {m.codigo}
                              </span>
                              {m.grupo && (
                                <span className="text-[10px] text-mining-300 bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold truncate">
                                  {m.grupo}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-white truncate mt-1">{m.descripcion}</p>
                          </div>
                        </div>
                        {isSelected && <Check size={16} className="text-teal-400 shrink-0 ml-2" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-mining-400">
                    <p className="font-medium text-mining-300">No se encontraron productos</p>
                    <p className="text-[11px] text-mining-500 mt-0.5">Intenta buscar con otro código o descripción.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>,
          document.body
        )}
    </div>
  );
};
