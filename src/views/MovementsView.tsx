import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { Movimiento, TransactionType } from '../types';
import { MovementItem } from '../components/MovementItem';
import { formatCurrency } from '../lib/mockData';
import {
  Search,
  Plus,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  TrendingDown,
  TrendingUp,
  WifiOff,
  RefreshCw,
  Check,
} from 'lucide-react';

interface MovementsViewProps {
  onOpenAddModal: () => void;
  onEditMovement: (mov: Movimiento) => void;
}

export const MovementsView: React.FC<MovementsViewProps> = React.memo(({
  onOpenAddModal,
  onEditMovement,
}) => {
  const {
    movements,
    categories,
    deleteMovement,
    userProfile,
    isOnline,
    isMovementsSynced,
    isSyncing,
    user,
  } = useFinance();

  // Scroll to top on view mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'todos' | TransactionType>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Filtered movements optimized with early exit
  const filteredMovements = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const hasSearch = term.length > 0;
    const filterAllType = selectedType === 'todos';
    const filterAllCat = selectedCategory === 'todas';

    if (!hasSearch && filterAllType && filterAllCat) {
      return movements;
    }

    return movements.filter((mov) => {
      if (!filterAllType && mov.tipo !== selectedType) return false;
      if (!filterAllCat && mov.categoriaId !== selectedCategory) return false;
      if (hasSearch) {
        const matchNote = mov.nota.toLowerCase().includes(term);
        if (matchNote) return true;
        const matchCat = (mov.categoriaNombre || '').toLowerCase().includes(term);
        return matchCat;
      }
      return true;
    });
  }, [movements, searchTerm, selectedType, selectedCategory]);

  // Totals for filtered view
  const { totalFilteredIngresos, totalFilteredGastos } = useMemo(() => {
    let ing = 0;
    let gas = 0;
    filteredMovements.forEach((m) => {
      if (m.tipo === 'ingreso') ing += m.monto;
      else gas += m.monto;
    });
    return { totalFilteredIngresos: ing, totalFilteredGastos: gas };
  }, [filteredMovements]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que querés eliminar este movimiento?')) {
      await deleteMovement(id);
      setActiveActionId(null);
    }
  };

  return (
    <div className="w-full pb-3 pt-3 px-4 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B2D26] tracking-tight">
            Movimientos
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Historial detallado y control de tus transacciones
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 bg-[#4A5A2E] hover:bg-[#3D4B26] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-xs transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Persistence & Offline Status Indicator */}
      <div className="flex items-center gap-2 mb-3">
        {!isOnline ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF9EC] text-[#9A7326] border border-[#F3DFB7] rounded-full text-[11px] font-semibold shadow-xs">
            <WifiOff className="w-3.5 h-3.5 text-[#B88728]" />
            <span>Sin conexión · Visualizando movimientos guardados en tu dispositivo</span>
          </div>
        ) : isSyncing ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-stone-600 border border-stone-200/70 rounded-full text-[11px] font-medium shadow-xs">
            <RefreshCw className="w-3 h-3 text-[#4A5A2E] animate-spin" />
            <span>Sincronizando con Firestore...</span>
          </div>
        ) : user ? (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50/80 text-emerald-800 border border-emerald-200/60 rounded-full text-[10px] font-medium">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Persistencia local activa y sincronizada</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-medium">
            <span>💾 Guardado localmente en tu navegador</span>
          </div>
        )}
      </div>

      {/* Mini Summary Card */}
      <div className="bg-white rounded-[22px] p-4 border border-stone-200/70 shadow-xs mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
            <TrendingUp className="w-3.5 h-3.5 text-[#4A5A2E]" />
            <span>Ingresos</span>
          </div>
          <p className="text-base font-bold text-[#4A5A2E] mt-0.5">
            +{formatCurrency(totalFilteredIngresos, userProfile.moneda)}
          </p>
        </div>

        <div className="w-[1px] h-8 bg-stone-200" />

        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
            <TrendingDown className="w-3.5 h-3.5 text-[#C67D5A]" />
            <span>Gastos</span>
          </div>
          <p className="text-base font-bold text-[#2B2D26] mt-0.5">
            -{formatCurrency(totalFilteredGastos, userProfile.moneda)}
          </p>
        </div>

        <div className="w-[1px] h-8 bg-stone-200" />

        <div>
          <span className="text-[11px] font-semibold text-stone-500">Neto</span>
          <p className="text-base font-bold text-[#2B2D26] mt-0.5">
            {formatCurrency(totalFilteredIngresos - totalFilteredGastos, userProfile.moneda)}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por comercio, concepto..."
          aria-label="Buscar movimientos por comercio o concepto"
          className="w-full bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-stone-200/80 shadow-xs text-[#2B2D26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#4A5A2E]/20"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Type Filter Segmented Control */}
      <div className="flex items-center p-1 bg-[#E4DFD5]/70 rounded-2xl mb-3.5 border border-stone-300/40">
        {(['todos', 'gasto', 'ingreso'] as const).map((t) => {
          const isActive = selectedType === t;
          return (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`relative flex-1 py-2 text-xs font-bold transition-all duration-150 cursor-pointer select-none text-center rounded-xl ${
                isActive
                  ? 'text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="filterTypeActivePill"
                  className="absolute inset-0 bg-[#2B2D26] rounded-xl -z-10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 480, damping: 35 }}
                />
              )}
              <span>{t === 'todos' ? 'Todos' : t === 'gasto' ? 'Gastos' : 'Ingresos'}</span>
            </button>
          );
        })}
      </div>

      {/* Category Filter Select */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-700 border border-stone-200/70 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#4A5A2E]/20 transition"
        >
          <option value="todas">Todas las categorías</option>
          {categories.map((c, idx) => (
            <option key={`${c.id}-${idx}`} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-[24px] p-4 border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {filteredMovements.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-sm font-bold text-[#2B2D26]">No encontramos movimientos</p>
            <p className="text-xs text-stone-500">
              Probá cambiando los filtros o creá un nuevo movimiento con el botón inferior.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredMovements.map((mov, mIdx) => {
              const isSelected = activeActionId === mov.id;

              return (
                <div key={`${mov.id}-${mIdx}`} className="relative">
                  <MovementItem
                    movimiento={mov}
                    moneda={userProfile.moneda}
                    onClick={() => setActiveActionId(isSelected ? null : mov.id)}
                    showDivider={false}
                  />

                  {/* Actions Drawer when tapped */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#F8F6F0] p-2.5 rounded-xl mb-3 mt-1 flex items-center justify-end gap-2 border border-stone-200/50">
                          <span className="text-[11px] text-stone-500 mr-auto pl-2 font-medium">
                            Acciones:
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              onEditMovement(mov);
                              setActiveActionId(null);
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                            <span>Editar</span>
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(mov.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Eliminar</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-5 z-30 xl:hidden">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={onOpenAddModal}
          aria-label="Agregar nuevo movimiento"
          className="w-13 h-13 rounded-2xl bg-[#4A5A2E] hover:bg-[#3D4B26] text-white shadow-[0_6px_20px_rgba(74,90,46,0.35)] flex items-center justify-center cursor-pointer active:scale-90 transition"
          title="Agregar nuevo movimiento"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </motion.button>
      </div>
    </div>
  );
});

MovementsView.displayName = 'MovementsView';

