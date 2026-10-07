import React from 'react';
import { motion } from 'motion/react';
import { TipGasto } from '../types';
import { Lightbulb, BarChart3, PiggyBank, AlertTriangle } from 'lucide-react';

interface TipCardProps {
  tips: TipGasto[];
}

export const TipCard: React.FC<TipCardProps> = React.memo(({ tips }) => {
  const getIcon = (type: TipGasto['icono']) => {
    switch (type) {
      case 'bulb':
        return <Lightbulb className="w-5 h-5 text-[#9E7B3B]" />;
      case 'chart':
        return <BarChart3 className="w-5 h-5 text-[#5B6B3E]" />;
      case 'piggy':
        return <PiggyBank className="w-5 h-5 text-[#A86450]" />;
      case 'alert':
      default:
        return <AlertTriangle className="w-5 h-5 text-[#B58A4A]" />;
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-base sm:text-lg font-bold text-[#2B2D26] mb-3 px-1">
        Tips para tus gastos
      </h3>

      <div className="space-y-3">
        {tips.map((tip, idx) => (
          <motion.div
            key={`${tip.id}-${idx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + idx * 0.08 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-[20px] p-4 border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-sm flex items-start gap-3.5 transition duration-200 hover:border-stone-300"
          >
            {/* Soft Beige Icon Box */}
            <div className="w-11 h-11 rounded-[14px] bg-[#F3EFE6] flex items-center justify-center flex-shrink-0 mt-0.5">
              {getIcon(tip.icono)}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#2B2D26]">
                {tip.titulo}
              </h4>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
                {tip.texto}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

TipCard.displayName = 'TipCard';
