import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    iconBg: 'bg-gradient-to-br from-red-500/20 to-red-500/10',
    iconColor: 'text-red-400',
    btnBg: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600',
    ringColor: 'ring-red-500/10',
  },
  warning: {
    iconBg: 'bg-gradient-to-br from-amber-500/20 to-amber-500/10',
    iconColor: 'text-amber-400',
    btnBg: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600',
    ringColor: 'ring-amber-500/10',
  },
  info: {
    iconBg: 'bg-gradient-to-br from-copper-500/20 to-copper-500/10',
    iconColor: 'text-copper-400',
    btnBg: 'bg-gradient-to-r from-copper-600 to-copper-500 hover:from-copper-700 hover:to-copper-600',
    ringColor: 'ring-copper-500/10',
  },
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const styles = variantStyles[variant];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={!isLoading ? onCancel : undefined}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative glass-panel bg-obsidian-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="absolute top-4 right-4 text-mining-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="p-6 pt-8 text-center">
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                className={`w-16 h-16 ${styles.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5 ring-8 ${styles.ringColor}`}
              >
                <AlertTriangle size={28} className={styles.iconColor} />
              </motion.div>

              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-mining-400 text-sm leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-white/5 text-mining-200 font-medium rounded-xl hover:bg-white/10 hover:text-white border border-white/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 ${styles.btnBg} text-white font-medium rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
