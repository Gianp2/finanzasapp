import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { Header } from '../components/Header';
import { DesafioCard } from '../components/DesafioCard';
import { FinanceChart7Days } from '../components/FinanceChart7Days';
import { CategoryBar } from '../components/CategoryBar';
import { TipCard } from '../components/TipCard';
import { MovementItem } from '../components/MovementItem';

import { Categoria } from '../types';

interface HomeViewProps {
  onOpenChallenge: () => void;
  onOpenMovementModal: () => void;
  onOpenAuthModal: () => void;
  onSelectCategory?: (category: Categoria) => void;
}

export const HomeView: React.FC<HomeViewProps> = React.memo(({
  onOpenChallenge,
  onOpenAuthModal,
  onSelectCategory,
}) => {
  const { movements, tips, setActiveTab, userProfile } = useFinance();

  // Scroll to top on view mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const recentMovements = useMemo(() => movements.slice(0, 3), [movements]);

  return (
    <div className="w-full pb-3">
      {/* 1. Header with olive curves and floating balance card */}
      <Header onAvatarClick={onOpenAuthModal} />

      {/* Main Screen Content */}
      <div className="px-4 mt-6 space-y-6">
        {/* 2. Desafío del día card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <DesafioCard onOpenChallenge={onOpenChallenge} />
        </motion.div>

        {/* 3. Flujo financiero (últimos 7 días con Recharts) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <FinanceChart7Days
            movements={movements}
            moneda={userProfile.moneda}
            onViewMovements={() => setActiveTab('movimientos')}
          />
        </motion.div>

        {/* 4. Presupuesto por categoría */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/40 rounded-[24px] p-2"
        >
          <CategoryBar
            onViewAll={() => setActiveTab('perfil')}
            limitCount={4}
            onSelectCategory={onSelectCategory}
          />
        </motion.div>

        {/* 5. Tips para tus gastos */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <TipCard tips={tips} />
        </motion.div>

        {/* 6. Movimientos recientes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-base sm:text-lg font-bold text-[#2B2D26]">
              Movimientos recientes
            </h3>
            <button
              onClick={() => setActiveTab('movimientos')}
              aria-label="Ver todos los movimientos"
              className="text-xs font-bold text-[#4A5A2E] hover:text-[#3B4824] bg-[#4A5A2E]/8 hover:bg-[#4A5A2E]/15 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-150 active:scale-95 flex items-center gap-1"
            >
              <span>Ver todo</span>
              <span>→</span>
            </button>
          </div>

          <div className="bg-white rounded-[22px] px-4 py-2 border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            {recentMovements.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">
                No hay movimientos registrados este mes.
              </p>
            ) : (
              recentMovements.map((mov, idx) => (
                <MovementItem
                  key={`${mov.id}-${idx}`}
                  movimiento={mov}
                  moneda={userProfile.moneda}
                  showDivider={idx < recentMovements.length - 1}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
});

HomeView.displayName = 'HomeView';

