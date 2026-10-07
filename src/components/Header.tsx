import React from 'react';
import { motion } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../lib/mockData';

interface HeaderProps {
  onAvatarClick?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ onAvatarClick }) => {
  const {
    userProfile,
    totalIngresosMes,
    totalGastosMes,
    disponibleMes,
    diaActual,
    totalDiasMes,
    user,
  } = useFinance();

  return (
    <header className="w-full">
      {/* Dark Olive Green Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#4A5A2E] text-white pt-5 pb-9 px-5 sm:px-6 rounded-b-[28px] sm:rounded-b-[32px] relative shadow-xs"
      >
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-white/80 text-xs sm:text-sm font-medium tracking-wide">
              Hola de nuevo
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
              {userProfile.nombre}
            </h1>
          </motion.div>

          {/* User Initials Avatar */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.12, type: 'spring', stiffness: 350 }}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={onAvatarClick}
            aria-label={user ? `Perfil de ${userProfile.nombre}` : 'Modo Demo / Iniciar sesión'}
            className="w-12 h-12 rounded-full bg-[#C5A566] text-[#2B2D26] font-bold text-base flex items-center justify-center shadow-md transition hover:brightness-105 relative cursor-pointer"
            title={user ? `Conectado como ${user.email}` : 'Modo Demo / Iniciar sesión'}
          >
            {userProfile.avatarInitials || 'CR'}
            {user && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </motion.button>
        </div>

        {/* Available Budget Section */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6"
        >
          <p className="text-white/85 text-xs sm:text-sm font-medium">
            Disponible este mes
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
              {formatCurrency(disponibleMes, userProfile.moneda)}
            </h2>
          </div>
          <p className="text-white/75 text-xs sm:text-sm mt-1.5 font-normal">
            de un presupuesto de {formatCurrency(userProfile.presupuestoMensual, userProfile.moneda)} · día {diaActual} de {totalDiasMes}
          </p>
        </motion.div>
      </motion.div>

      {/* Floating White Card: Ingresos | Gastos */}
      <div className="px-4 -mt-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -1 }}
          className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-stone-200/60 flex items-center justify-between"
        >
          {/* Ingresos Column */}
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4A5A2E]" />
              <span className="text-xs font-medium text-stone-500">Ingresos</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#2B2D26] mt-1 tracking-tight">
              {formatCurrency(totalIngresosMes, userProfile.moneda)}
            </p>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-10 bg-stone-200" />

          {/* Gastos Column */}
          <div className="flex-1 pl-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C67D5A]" />
              <span className="text-xs font-medium text-stone-500">Gastos</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#2B2D26] mt-1 tracking-tight">
              {formatCurrency(totalGastosMes, userProfile.moneda)}
            </p>
          </div>
        </motion.div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
