import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Lock } from 'lucide-react';

interface NoDeletePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoDeletePermissionModal: React.FC<NoDeletePermissionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="glass-panel bg-obsidian-900/95 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-red-950/40 via-red-900/20 to-transparent border-b border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-glow-red">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Permiso Denegado</h3>
                <p className="text-[11px] text-red-400/90 font-medium">Control de Seguridad RBAC</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-mining-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mx-auto flex items-center justify-center text-red-400">
              <Lock size={32} />
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-red-300">
                Usted no tiene permisos para eliminar
              </h4>
              <p className="text-xs text-mining-300 leading-relaxed px-2">
                Su cuenta de usuario no dispone de la autorización requerida para eliminar registros en el sistema.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 text-left text-[11px] text-mining-400 space-y-1.5">
              <p className="font-semibold text-copper-300 flex items-center gap-1.5">
                💡 ¿Cómo obtener este permiso?
              </p>
              <p className="text-mining-300">
                Solicite a un <strong className="text-white">Administrador General</strong> que edite su cuenta en el módulo de Usuarios y active la opción <span className="text-amber-400 font-semibold">"Permiso para Eliminar Registros"</span>.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-obsidian-950/60 border-t border-white/5 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
