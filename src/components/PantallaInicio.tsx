import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { FinanceLogo } from './FinanceLogo';

interface PantallaInicioProps {
  onComplete: () => void;
  durationMs?: number;
}

export const PantallaInicio: React.FC<PantallaInicioProps> = ({
  onComplete,
  durationMs = 2300,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [onComplete, durationMs]);

  return (
    <motion.div
      key="pantalla-inicio-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onComplete}
      className="fixed inset-0 z-50 min-h-screen w-full bg-[#EEEDE4] flex flex-col justify-between items-center px-6 py-10 select-none cursor-pointer overflow-hidden"
    >
      {/* Soft Ambient Floating Glows */}
      <motion.div
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#4A5A2E]/15 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#C5A566]/20 blur-3xl pointer-events-none"
      />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-[#4A5A2E]/10 blur-3xl pointer-events-none" />

      {/* Top subtle spacer */}
      <div className="w-full flex justify-end">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.8 }}
          className="text-[11px] text-stone-500 font-medium tracking-wide"
        >
          Toca para omitir ·
        </motion.span>
      </div>

      {/* Central Hero: Logo + Nombre con efectos suaves */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* Animated Finance Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <FinanceLogo size="splash" animated={true} />
        </motion.div>

        {/* Small Tag Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-[#4A5A2E] bg-[#4A5A2E]/10 border border-[#4A5A2E]/20 mb-3"
        >
          🌿 Ciudad Financiera
        </motion.div>

        {/* Main App Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl font-extrabold text-[#2B2D26] tracking-tight leading-tight"
        >
          Ciudad Financiera
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-stone-600 text-xs sm:text-sm mt-2 max-w-xs font-medium leading-relaxed"
        >
          Finanzas personales conscientes, presupuesto y retos educativos.
        </motion.p>

        {/* Smooth Clean Progress Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="w-36 h-1 bg-stone-300/60 rounded-full mt-7 overflow-hidden"
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: durationMs / 1000,
              ease: 'easeInOut',
            }}
            className="h-full bg-[#4A5A2E] rounded-full"
          />
        </motion.div>
      </div>

      {/* Bottom Footer Credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <p className="text-[11px] text-stone-500 font-medium">
          Control consciente de tu economía
        </p>
      </motion.div>
    </motion.div>
  );
};
