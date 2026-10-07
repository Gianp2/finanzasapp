import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../lib/mockData';
import { Categoria } from '../types';

interface CategoryBarProps {
  onViewAll?: () => void;
  limitCount?: number;
  onSelectCategory?: (category: Categoria) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = React.memo(({ onViewAll, limitCount = 4, onSelectCategory }) => {
  const { categories, gastadoPorCategoria, userProfile } = useFinance();
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    // Trigger smooth, fluid line animation from 0 to actual money level on entrance
    const timer = setTimeout(() => {
      setAnimateProgress(true);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const displayedCategories = limitCount ? categories.slice(0, limitCount) : categories;

  const getGradientClass = (percent: number) => {
    if (percent >= 95) return 'from-[#A85D4A] to-[#C46D58]'; // Terracota sólido
    if (percent >= 75) return 'from-[#B58A4A] to-[#D1A056]'; // Dorado sólido
    return 'from-[#4A5A2E] to-[#63793D]'; // Verde oliva sólido
  };

  const getBadgeClass = (percent: number) => {
    if (percent >= 95) return 'bg-[#A85D4A]/15 text-[#A85D4A] border border-[#A85D4A]/25';
    if (percent >= 75) return 'bg-[#B58A4A]/15 text-[#B58A4A] border border-[#B58A4A]/25';
    return 'bg-[#4A5A2E]/10 text-[#4A5A2E] border border-[#4A5A2E]/20';
  };

  return (
    <div className="w-full">
      {/* Title & View All */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#2B2D26]">
            Presupuesto por categoría
          </h3>
          <p className="text-[11px] text-stone-400">
            Tocá una categoría para ver su desglose a 30 días
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            aria-label="Ver todas las categorías"
            className="text-xs font-bold text-[#4A5A2E] hover:text-[#3B4824] bg-[#4A5A2E]/8 hover:bg-[#4A5A2E]/15 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-150 active:scale-95 flex items-center gap-1"
          >
            <span>Ver todo</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Category Progress List */}
      <div className="space-y-3">
        {displayedCategories.map((cat, index) => {
          const gastado = gastadoPorCategoria(cat.id);
          const limite = cat.limiteMensual;
          const rawPercent = limite > 0 ? (gastado / limite) * 100 : 0;
          const cappedWidth = Math.min(rawPercent, 100);
          const restante = Math.max(limite - gastado, 0);
          const excedente = gastado > limite ? gastado - limite : 0;
          const gradientClass = getGradientClass(rawPercent);
          const badgeClass = getBadgeClass(rawPercent);
          const isHovered = hoveredCatId === cat.id;

          return (
            <motion.div
              key={`${cat.id}-${index}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.08 + index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => onSelectCategory?.(cat)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory?.(cat);
                }
              }}
              aria-label={`Ver desglose a 30 días de ${cat.nombre}`}
              onMouseEnter={() => setHoveredCatId(cat.id)}
              onMouseLeave={() => setHoveredCatId(null)}
              className={`space-y-2 p-2.5 rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A5A2E]/40 ${
                isHovered
                  ? 'bg-white shadow-xs border border-stone-200/80 -translate-y-0.5'
                  : 'hover:bg-stone-50/80 border border-transparent'
              }`}
            >
              {/* Category Name & Amounts */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2B2D26] tracking-tight">
                    {cat.nombre}
                  </span>
                  {isHovered && (
                    <span className="text-[10px] text-[#4A5A2E] font-semibold bg-[#4A5A2E]/10 px-1.5 py-0.5 rounded-md">
                      Ver insights →
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-500">
                    {formatCurrency(gastado, userProfile.moneda)}{' '}
                    <span className="text-stone-400 font-normal">/</span>{' '}
                    {formatCurrency(limite, userProfile.moneda)}
                  </span>

                  {/* Percentage Pill */}
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{
                      scale: animateProgress ? 1 : 0.6,
                      opacity: animateProgress ? 1 : 0,
                    }}
                    transition={{
                      delay: 0.3 + index * 0.1,
                      type: 'spring',
                      stiffness: 420,
                      damping: 24,
                    }}
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badgeClass}`}
                  >
                    {Math.round(rawPercent)}%
                  </motion.span>
                </div>
              </div>

              {/* Progress Track (clean matte solid fill, no light effects) */}
              <div className="relative w-full h-2.5 bg-[#E6E1D6] rounded-full overflow-hidden p-[1px] shadow-inner">
                {/* Clean Progress Bar sweeping to money level */}
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: animateProgress ? `${cappedWidth}%` : '0%' }}
                  transition={{
                    duration: 1.1,
                    delay: 0.15 + index * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`h-full rounded-full bg-gradient-to-r ${gradientClass}`}
                />
              </div>

              {/* Subtitle / Remaining balance indicator */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium px-0.5">
                <span>
                  {excedente > 0 ? (
                    <span className="text-[#A85D4A] font-semibold">
                      Excedido por {formatCurrency(excedente, userProfile.moneda)}
                    </span>
                  ) : (
                    <span>
                      Quedan <strong className="text-stone-600 font-bold">{formatCurrency(restante, userProfile.moneda)}</strong>
                    </span>
                  )}
                </span>

                <span className="text-[10px] text-stone-400 font-normal flex items-center gap-1">
                  <span>Detalles</span>
                  <span className="text-[11px]">↗</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

CategoryBar.displayName = 'CategoryBar';
