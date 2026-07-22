import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Seleccionar fecha',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: false
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);

  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value + 'T00:00:00'));
    }
  }, [value]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < 340 && rect.top > 340;

      let left = rect.left;
      const popoverWidth = 300;
      if (left + popoverWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - popoverWidth - 16);
      }

      setCoords({
        top: placeAbove ? rect.top - 8 : rect.bottom + 6,
        left,
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
        const portalEl = document.getElementById('custom-datepicker-portal');
        if (portalEl && portalEl.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getDisplayFormat = (val: string) => {
    if (!val) return placeholder;
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDayOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const handlePrevYear = () => setCurrentMonth(new Date(year - 1, month, 1));
  const handleNextYear = () => setCurrentMonth(new Date(year + 1, month, 1));

  const handleSelectDay = (day: number) => {
    const selected = new Date(year, month, day);
    onChange(formatDateString(selected));
    setIsOpen(false);
  };

  const setPreset = (preset: 'today' | 'yesterday' | 'startOfMonth' | 'endOfMonth' | 'clear') => {
    const now = new Date();
    if (preset === 'today') onChange(formatDateString(now));
    else if (preset === 'yesterday') {
      const prev = new Date(now);
      prev.setDate(prev.getDate() - 1);
      onChange(formatDateString(prev));
    } else if (preset === 'startOfMonth') {
      onChange(formatDateString(new Date(now.getFullYear(), now.getMonth(), 1)));
    } else if (preset === 'endOfMonth') {
      onChange(formatDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
    } else if (preset === 'clear') {
      onChange('');
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative min-w-[180px] ${className}`}>
      {label && (
        <label className="block text-xs font-extrabold text-mining-300 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
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
          <CalendarIcon size={18} className="text-copper-400 shrink-0" />
          <span className={`font-mono text-sm font-bold truncate ${value ? 'text-white' : 'text-mining-400'}`}>
            {getDisplayFormat(value)}
          </span>
        </div>
        {value ? (
          <span
            onClick={e => {
              e.stopPropagation();
              onChange('');
            }}
            className="text-mining-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            title="Borrar fecha"
          >
            <X size={16} />
          </span>
        ) : null}
      </button>

      {isOpen &&
        createPortal(
          <div id="custom-datepicker-portal">
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
                  zIndex: 99999
                }}
                className="w-72 bg-obsidian-900/98 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-4 space-y-3"
              >
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1 border-b border-white/10 pb-2.5">
                  <button
                    type="button"
                    onClick={() => setPreset('today')}
                    className="px-2 py-1 bg-white/5 hover:bg-copper-500/20 text-[10px] font-bold text-copper-400 rounded-md transition-colors"
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('yesterday')}
                    className="px-2 py-1 bg-white/5 hover:bg-copper-500/20 text-[10px] font-bold text-mining-300 hover:text-white rounded-md transition-colors"
                  >
                    Ayer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('startOfMonth')}
                    className="px-2 py-1 bg-white/5 hover:bg-copper-500/20 text-[10px] font-bold text-mining-300 hover:text-white rounded-md transition-colors"
                  >
                    Inicio Mes
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('endOfMonth')}
                    className="px-2 py-1 bg-white/5 hover:bg-copper-500/20 text-[10px] font-bold text-mining-300 hover:text-white rounded-md transition-colors"
                  >
                    Fin Mes
                  </button>
                </div>

                {/* Header Month / Year Controls with Up/Down and Left/Right Steppers */}
                <div className="flex items-center justify-between text-white pb-2 border-b border-white/10">
                  {/* Month Stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-white/10 rounded-lg text-mining-400 hover:text-white transition-colors"
                      title="Mes Anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="font-bold text-xs text-teal-400 min-w-[70px] text-center">
                      {monthNames[month]}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-white/10 rounded-lg text-mining-400 hover:text-white transition-colors"
                      title="Mes Siguiente"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Year Stepper with Up / Down Arrows */}
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                    <span className="font-bold font-mono text-xs text-copper-400">{year}</span>
                    <div className="flex flex-col gap-0.5 ml-1">
                      <button
                        type="button"
                        onClick={handleNextYear}
                        className="text-mining-400 hover:text-white transition-colors"
                        title="Año Siguiente"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={handlePrevYear}
                        className="text-mining-400 hover:text-white transition-colors"
                        title="Año Anterior"
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Day Names Header */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-mining-500 uppercase tracking-wider">
                  <span>Lu</span>
                  <span>Ma</span>
                  <span>Mi</span>
                  <span>Ju</span>
                  <span>Vi</span>
                  <span>Sá</span>
                  <span>Do</span>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {Array.from({ length: startDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = formatDateString(new Date(year, month, dayNum));
                    const isSelected = dateStr === value;
                    const isToday = dateStr === formatDateString(new Date());

                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => handleSelectDay(dayNum)}
                        className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-copper-500 text-white font-bold shadow-glow-copper'
                            : isToday
                            ? 'border border-copper-500/50 text-copper-400 hover:bg-copper-500/20'
                            : 'text-mining-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>,
          document.body
        )}
    </div>
  );
};
