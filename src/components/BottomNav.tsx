import React from 'react';
import { motion } from 'motion/react';
import { ActiveTab } from '../types';
import { Home, Clock, Target, Menu } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = React.memo(({ activeTab, onChangeTab }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'inicio',
      label: 'Inicio',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'movimientos',
      label: 'Movimientos',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: 'retos',
      label: 'Desafíos',
      icon: <Target className="w-5 h-5" />,
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: <Menu className="w-5 h-5" />,
    },
  ];

  const handleSelectTab = (id: ActiveTab) => {
    if (activeTab === id) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      onChangeTab(id);
    }
  };

  return (
    <motion.nav
      role="navigation"
      aria-label="Navegación principal inferior"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] pb-safe xl:hidden"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center w-16 h-full transition-colors cursor-pointer select-none active:scale-95 ${
                isActive ? 'text-[#4A5A2E]' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {/* Active Indicator Backdrop */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-1.5 top-1.5 bottom-1.5 bg-[#4A5A2E]/10 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <motion.div
                animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {item.icon}
              </motion.div>
              <span
                className={`text-[11px] mt-1 tracking-tight transition-all duration-200 ${
                  isActive ? 'font-extrabold text-[#4A5A2E]' : 'font-medium text-stone-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
});

BottomNav.displayName = 'BottomNav';

