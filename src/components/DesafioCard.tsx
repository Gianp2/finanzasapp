import React from 'react';
import { motion } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORY_META } from '../lib/challengesData';
import { formatCurrency } from '../lib/mockData';
import { Flame, CheckCircle2, ArrowRight, Clock } from 'lucide-react';

interface DesafioCardProps {
  onOpenChallenge: () => void;
}

export const DesafioCard: React.FC<DesafioCardProps> = React.memo(({ onOpenChallenge }) => {
  const {
    desafioDelDia,
    desafioDelDiaCompletado,
    tiempoRestanteProximoDesafio,
    userProfile,
  } = useFinance();

  const categoryMeta = CATEGORY_META[desafioDelDia.categoria] || {
    label: desafioDelDia.categoria,
    badgeBg: 'bg-[#4A5A2E]/15 text-[#4A5A2E]',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-[#E2E7D5] rounded-[24px] p-5 sm:p-6 transition shadow-[0_2px_12px_rgba(74,90,46,0.06)] hover:shadow-md relative overflow-hidden"
    >
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1 bg-[#2B2D26] text-white text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
          <span>★</span>
          <span>Desafío del día</span>
        </div>

        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${categoryMeta.badgeBg}`}>
          {categoryMeta.label}
        </span>

        {desafioDelDia.montoInvolucrado > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 text-[#2B2D26]">
            {formatCurrency(desafioDelDia.montoInvolucrado, userProfile.moneda)}
          </span>
        )}

        {desafioDelDiaCompletado && (
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#4A5A2E] text-white">
              <CheckCircle2 className="w-3 h-3" />
              <span>Completado hoy</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900/10 text-stone-700">
              <Clock className="w-3 h-3" />
              <span>Nuevo en {tiempoRestanteProximoDesafio.formatted}</span>
            </span>
          </div>
        )}
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        {/* Left Column: Text + Button */}
        <div className="flex-1 z-10">
          <h3 className="text-lg sm:text-xl font-extrabold text-[#2B2D26] leading-snug tracking-tight">
            {desafioDelDia.titulo}
          </h3>
          <p className="text-[#4E5246] text-xs sm:text-sm mt-1.5 leading-relaxed line-clamp-3">
            {desafioDelDia.situacion}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenChallenge}
            aria-label={desafioDelDiaCompletado ? 'Ver detalles de tu decisión' : 'Tomar decisión del desafío de hoy'}
            className={`mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-2xl transition-all duration-150 shadow-sm hover:shadow active:scale-95 cursor-pointer ${
              desafioDelDiaCompletado
                ? 'bg-[#4A5A2E] text-white hover:bg-[#3B4824]'
                : 'bg-[#2B2D26] text-white hover:bg-black'
            }`}
          >
            <span>{desafioDelDiaCompletado ? 'Revisar tu decisión' : 'Tomar decisión del día'}</span>
            <ArrowRight className="w-4 h-4 font-extrabold" />
          </motion.button>
        </div>

        {/* Right Column: Crossroads Visual */}
        <div className="w-20 sm:w-24 flex-shrink-0 flex items-center justify-center pt-2 select-none pointer-events-none">
          <div className="relative w-16 h-22 flex items-center justify-center">
            {/* Vertical sign post */}
            <div className="w-2 h-20 bg-[#54623C] rounded-full mx-auto" />

            {/* Left Sign */}
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute top-6 right-1/2 mr-0.5 bg-[#8E9D6D] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-l-md shadow-sm border border-[#7D8B5D] flex items-center"
            >
              <span>DECISIÓN</span>
            </motion.div>

            {/* Right Sign */}
            <motion.div
              animate={{ rotate: [2, -2, 2] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute top-2 left-1/2 ml-0.5 bg-[#C5A566] text-[#2B2D26] text-[8px] font-extrabold px-2 py-0.5 rounded-r-md shadow-sm border border-[#B39354] flex items-center"
            >
              <span>APRENDE</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Streak Indicator */}
      <div className="mt-4 pt-3 border-t border-[#D3DCC2] flex items-center justify-between text-xs sm:text-sm font-semibold">
        <div className="flex items-center gap-1.5 text-[#4A5A2E]">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>{userProfile.rachaRetos} días tomando decisiones conscientes</span>
        </div>
        <span className="text-[11px] text-stone-500 font-bold">
          {desafioDelDia.opciones.length} opciones
        </span>
      </div>
    </motion.div>
  );
});

DesafioCard.displayName = 'DesafioCard';
