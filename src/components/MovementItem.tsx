import React from 'react';
import { motion } from 'motion/react';
import { Movimiento } from '../types';
import { formatCurrency, formatMovementDate } from '../lib/mockData';
import {
  ShoppingCart,
  Bus,
  Briefcase,
  Film,
  Zap,
  HeartPulse,
  Home,
  ArrowDownLeft,
  Coffee,
} from 'lucide-react';

interface MovementItemProps {
  movimiento: Movimiento;
  moneda?: string;
  onClick?: () => void;
  showDivider?: boolean;
}

export const MovementItem: React.FC<MovementItemProps> = React.memo(({
  movimiento,
  moneda = '$',
  onClick,
  showDivider = true,
}) => {
  const getCategoryIcon = () => {
    if (movimiento.tipo === 'ingreso') {
      return <Briefcase className="w-5 h-5 text-[#4A5A2E]" />;
    }

    const catName = (movimiento.categoriaNombre || '').toLowerCase();
    const note = (movimiento.nota || '').toLowerCase();

    if (catName.includes('comida') || note.includes('super') || note.includes('mercado')) {
      return <ShoppingCart className="w-5 h-5 text-[#6E7265]" />;
    }
    if (catName.includes('transporte') || note.includes('bus') || note.includes('subte')) {
      return <Bus className="w-5 h-5 text-[#6E7265]" />;
    }
    if (catName.includes('entretenimiento') || note.includes('cine') || note.includes('amigos')) {
      return <Film className="w-5 h-5 text-[#6E7265]" />;
    }
    if (catName.includes('servicio') || note.includes('luz') || note.includes('internet')) {
      return <Zap className="w-5 h-5 text-[#6E7265]" />;
    }
    if (catName.includes('salud') || note.includes('farmacia')) {
      return <HeartPulse className="w-5 h-5 text-[#6E7265]" />;
    }
    if (catName.includes('hogar')) {
      return <Home className="w-5 h-5 text-[#6E7265]" />;
    }
    if (note.includes('café')) {
      return <Coffee className="w-5 h-5 text-[#6E7265]" />;
    }
    return <ArrowDownLeft className="w-5 h-5 text-[#6E7265]" />;
  };

  const isIngreso = movimiento.tipo === 'ingreso';

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={onClick ? `Detalles de ${movimiento.nota}, ${formatCurrency(movimiento.monto, moneda)}` : undefined}
      className={`group flex items-center justify-between py-3.5 transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:bg-black/[0.03] px-2 -mx-2 rounded-xl active:bg-black/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A5A2E]/40' : ''
      } ${showDivider ? 'border-b border-stone-200/60' : ''}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Category Icon Badge */}
        <div className="w-11 h-11 rounded-[14px] bg-[#EFECE3] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E7E2D6] group-hover:scale-105 transition-all duration-150">
          {getCategoryIcon()}
        </div>

        {/* Details */}
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#2B2D26] truncate">
            {movimiento.nota}
          </p>
          <p className="text-xs text-stone-500 mt-0.5 truncate">
            {isIngreso ? 'Ingreso' : movimiento.categoriaNombre} · {formatMovementDate(movimiento.fecha)}
          </p>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0 pl-3">
        <span
          className={`text-base font-extrabold tracking-tight ${
            isIngreso ? 'text-[#4A5A2E]' : 'text-[#2B2D26]'
          }`}
        >
          {isIngreso ? '+' : '-'}
          {formatCurrency(movimiento.monto, moneda)}
        </span>
      </div>
    </motion.div>
  );
});

MovementItem.displayName = 'MovementItem';
