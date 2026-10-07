import React from 'react';
import { motion } from 'motion/react';
import { FinanceLogo } from './FinanceLogo';

interface AestheticLoaderProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

export const AestheticLoader: React.FC<AestheticLoaderProps> = ({
  message = 'Cargando tus finanzas...',
  submessage = 'Sincronizando movimientos y presupuesto',
  fullScreen = true,
}) => {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-6 text-center select-none"
    >
      {/* Central Animated Logo Badge */}
      <div className="relative mb-4 flex items-center justify-center">
        <FinanceLogo size="hero" animated={true} />
      </div>

      {/* Typography */}
      <motion.h3
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-base sm:text-lg font-bold text-[#2B2D26] tracking-tight"
      >
        {message}
      </motion.h3>

      {submessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-xs text-stone-500 mt-1 max-w-xs font-medium"
        >
          {submessage}
        </motion.p>
      )}

      {/* Sleek Progress Dots */}
      <div className="flex items-center gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            className="w-2 h-2 rounded-full bg-[#4A5A2E]"
          />
        ))}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#EEEDE4] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/80 backdrop-blur-md rounded-[28px] p-6 sm:p-8 border border-stone-200/70 shadow-lg max-w-xs w-full"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 flex items-center justify-center">
      {content}
    </div>
  );
};
