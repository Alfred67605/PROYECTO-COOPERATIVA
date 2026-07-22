import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar opción',
  icon = <Filter size={16} />,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    width: 200,
    placeAbove: false
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || { value, label: value || placeholder };

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < 260 && rect.top > 260;

      const width = Math.max(rect.width, 240);
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
        const portalEl = document.getElementById('custom-select-portal');
        if (portalEl && portalEl.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative min-w-[200px] ${className}`}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          updateCoords();
        }}
        className={`w-full flex items-center justify-between gap-3 bg-obsidian-900/80 border px-4 py-3 rounded-xl text-sm transition-all shadow-sm ${
          isOpen
            ? 'border-copper-500/80 ring-2 ring-copper-500/20 text-white'
            : 'border-white/10 hover:border-white/20 text-mining-200 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-copper-400 shrink-0">{icon}</span>
          <span className="font-semibold text-white text-sm truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-mining-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-copper-400' : ''
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div id="custom-select-portal">
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
                className="bg-obsidian-900/98 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar"
              >
                {options.map(opt => {
                  const isSelected = opt.value === value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-copper-500/20 border border-copper-500/40 text-white font-bold'
                          : 'hover:bg-white/[0.08] text-mining-300 hover:text-white font-medium'
                      }`}
                    >
                      <span className="text-sm truncate">{opt.label}</span>
                      {isSelected && <Check size={16} className="text-copper-400 shrink-0 ml-2" />}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>,
          document.body
        )}
    </div>
  );
};
