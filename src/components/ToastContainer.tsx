import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastNotification } from '../types';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X, ChevronRight } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  onViewCategory?: (catName?: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = React.memo(({
  toasts,
  onDismiss,
  onViewCategory,
}) => {
  return (
    <div
      role="region"
      aria-label="Notificaciones"
      className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto pointer-events-none flex flex-col gap-2.5"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isCriticalLimit = toast.tipo === 'danger' || toast.tipo === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={`pointer-events-auto bg-white rounded-[22px] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)] border ${
                isCriticalLimit
                  ? 'border-[#A85D4A]/50 ring-2 ring-[#A85D4A]/10'
                  : 'border-stone-200 ring-1 ring-black/5'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isCriticalLimit
                      ? 'bg-[#F9ECE8] text-[#A85D4A]'
                      : toast.tipo === 'success'
                      ? 'bg-[#E2E7D5] text-[#4A5A2E]'
                      : 'bg-[#F5F2EB] text-stone-700'
                  }`}
                >
                  {isCriticalLimit ? (
                    <AlertTriangle className="w-5 h-5 text-[#A85D4A]" />
                  ) : toast.tipo === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4A5A2E]" />
                  ) : (
                    <Info className="w-5 h-5 text-stone-600" />
                  )}
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#2B2D26] leading-tight">
                      {toast.titulo}
                    </h4>
                    {toast.porcentaje !== undefined && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#A85D4A] text-white">
                        {toast.porcentaje}%
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {toast.mensaje}
                  </p>

                  {/* Progress bar visual if limit exceeded */}
                  {toast.porcentaje !== undefined && (
                    <div className="mt-2.5 space-y-1">
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(toast.porcentaje, 100)}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full bg-[#A85D4A] rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action button */}
                  {onViewCategory && toast.categoriaNombre && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          onViewCategory(toast.categoriaNombre);
                          onDismiss(toast.id);
                        }}
                        className="text-xs font-bold text-[#4A5A2E] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ver presupuesto de {toast.categoriaNombre}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-stone-400">Atención requerida</span>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer flex-shrink-0"
                  aria-label="Cerrar notificación"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';


