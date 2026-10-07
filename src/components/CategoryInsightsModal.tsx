import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  X,
  Store,
  Calendar,
  Receipt,
  Percent,
  PlusCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Categoria, Movimiento } from '../types';
import { formatCurrency } from '../lib/mockData';

interface CategoryInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Categoria | null;
  movements: Movimiento[];
  moneda?: string;
  onAddMovementForCategory?: (categoryId: string) => void;
}

interface MerchantSpend {
  merchant: string;
  total: number;
  count: number;
  percentage: number;
  lastDate: string;
}

interface WeekSpend {
  weekLabel: string;
  total: number;
}

interface CategoryInsightsData {
  categoryMovements30d: Movimiento[];
  totalSpent30d: number;
  ticketPromedio: number;
  topMerchants: MerchantSpend[];
  weeklyBreakdown: WeekSpend[];
  pctPresupuesto: number;
  diaMayorGasto: Movimiento | null;
}

export const CategoryInsightsModal: React.FC<CategoryInsightsModalProps> = ({
  isOpen,
  onClose,
  category,
  movements,
  moneda = '$',
  onAddMovementForCategory,
}) => {
  // Compute 30-day spending data for the specific category
  const {
    categoryMovements30d,
    totalSpent30d,
    ticketPromedio,
    topMerchants,
    weeklyBreakdown,
    pctPresupuesto,
    diaMayorGasto,
  } = useMemo<CategoryInsightsData>(() => {
    if (!category) {
      return {
        categoryMovements30d: [],
        totalSpent30d: 0,
        ticketPromedio: 0,
        topMerchants: [],
        weeklyBreakdown: [],
        pctPresupuesto: 0,
        diaMayorGasto: null,
      };
    }

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Filter movements for this category within last 30 days
    const catMovs = movements
      .filter((m) => {
        if (m.tipo !== 'gasto') return false;
        const matchesCategory =
          m.categoriaId === category.id ||
          m.categoriaNombre.toLowerCase() === category.nombre.toLowerCase();
        if (!matchesCategory) return false;

        const movTime = new Date(m.fecha).getTime();
        return !isNaN(movTime) && movTime >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const total = catMovs.reduce((sum, m) => sum + (Number(m.monto) || 0), 0);
    const avg = catMovs.length > 0 ? Math.round(total / catMovs.length) : 0;
    const pct = category.limiteMensual > 0 ? (total / category.limiteMensual) * 100 : 0;

    // Group spending by merchant / nota
    const merchantMap = new Map<string, { total: number; count: number; lastDate: string }>();

    catMovs.forEach((m) => {
      const rawMerchant = (m.nota || 'Gasto general').trim();
      // Capitalize first letter
      const merchantKey = rawMerchant.charAt(0).toUpperCase() + rawMerchant.slice(1);
      const existing = merchantMap.get(merchantKey) || {
        total: 0,
        count: 0,
        lastDate: m.fecha,
      };

      existing.total += Number(m.monto) || 0;
      existing.count += 1;
      if (new Date(m.fecha).getTime() > new Date(existing.lastDate).getTime()) {
        existing.lastDate = m.fecha;
      }
      merchantMap.set(merchantKey, existing);
    });

    const merchants: MerchantSpend[] = Array.from(merchantMap.entries())
      .map(([merchant, data]) => ({
        merchant,
        total: data.total,
        count: data.count,
        percentage: total > 0 ? Math.round((data.total / total) * 100) : 0,
        lastDate: data.lastDate,
      }))
      .sort((a, b) => b.total - a.total);

    // Group into 4 weekly buckets
    const weekBuckets: WeekSpend[] = [
      { weekLabel: 'Sem 1 (hace 4 sem)', total: 0 },
      { weekLabel: 'Sem 2 (hace 3 sem)', total: 0 },
      { weekLabel: 'Sem 3 (hace 2 sem)', total: 0 },
      { weekLabel: 'Sem 4 (últimos 7d)', total: 0 },
    ];

    catMovs.forEach((m) => {
      const ageDays = (now - new Date(m.fecha).getTime()) / (24 * 60 * 60 * 1000);
      const amount = Number(m.monto) || 0;
      if (ageDays <= 7) {
        weekBuckets[3].total += amount;
      } else if (ageDays <= 14) {
        weekBuckets[2].total += amount;
      } else if (ageDays <= 21) {
        weekBuckets[1].total += amount;
      } else {
        weekBuckets[0].total += amount;
      }
    });

    // Find day with highest spending
    let peakMov: Movimiento | null = null;
    catMovs.forEach((m) => {
      if (!peakMov || Number(m.monto) > Number(peakMov.monto)) {
        peakMov = m;
      }
    });

    return {
      categoryMovements30d: catMovs,
      totalSpent30d: total,
      ticketPromedio: avg,
      topMerchants: merchants,
      weeklyBreakdown: weekBuckets,
      pctPresupuesto: pct,
      diaMayorGasto: peakMov,
    };
  }, [category, movements]);

  // Lock background scroll when modal is open
  useBodyScrollLock(isOpen);

  if (!isOpen || !category) return null;

  const getCategoryEmoji = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('comida') || n.includes('alimento')) return '🛒';
    if (n.includes('transporte') || n.includes('viaje')) return '🚌';
    if (n.includes('entretenimiento') || n.includes('ocio')) return '🍿';
    if (n.includes('servicio') || n.includes('luz')) return '⚡';
    if (n.includes('salud') || n.includes('farmacia')) return '💊';
    if (n.includes('hogar') || n.includes('casa')) return '🏡';
    return '🏷️';
  };

  const maxWeekly = Math.max(...weeklyBreakdown.map((w) => w.total), 1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/45 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#FAF8F5] rounded-[30px] border border-stone-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.18)] w-full max-w-lg overflow-hidden my-auto z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 bg-white border-b border-stone-200/70 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#4A5A2E]/10 flex items-center justify-center text-2xl shadow-xs">
                {getCategoryEmoji(category.nombre)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-[#2B2D26] tracking-tight">
                    {category.nombre}
                  </h2>
                  <span className="text-[11px] font-bold text-[#4A5A2E] bg-[#4A5A2E]/10 px-2.5 py-0.5 rounded-full">
                    Insights 30 días
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Límite mensual: {formatCurrency(category.limiteMensual, moneda)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* 1. Key 30-Day Metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Total spent */}
              <div className="bg-white rounded-2xl p-3 border border-stone-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                  <Receipt className="w-3 h-3 text-[#4A5A2E]" />
                  Total 30d
                </span>
                <span className="text-base sm:text-lg font-extrabold text-[#2B2D26] mt-1 truncate">
                  {formatCurrency(totalSpent30d, moneda)}
                </span>
              </div>

              {/* % of budget */}
              <div className="bg-white rounded-2xl p-3 border border-stone-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                  <Percent className="w-3 h-3 text-[#B58A4A]" />
                  Presupuesto
                </span>
                <span
                  className={`text-base sm:text-lg font-extrabold mt-1 truncate ${
                    pctPresupuesto > 100
                      ? 'text-[#C45638]'
                      : pctPresupuesto > 75
                      ? 'text-[#B58A4A]'
                      : 'text-[#4A5A2E]'
                  }`}
                >
                  {Math.round(pctPresupuesto)}%
                </span>
              </div>

              {/* Average Ticket */}
              <div className="bg-white rounded-2xl p-3 border border-stone-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-500" />
                  Promedio
                </span>
                <span className="text-base sm:text-lg font-extrabold text-stone-700 mt-1 truncate">
                  {formatCurrency(ticketPromedio, moneda)}
                </span>
              </div>
            </div>

            {/* Budget Progress Bar without any light/glare effects */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-600">Consumo del límite mensual</span>
                <span className="text-[#2B2D26]">
                  {formatCurrency(totalSpent30d, moneda)} / {formatCurrency(category.limiteMensual, moneda)}
                </span>
              </div>

              {/* Clean, matte solid progress bar */}
              <div className="w-full h-3 bg-[#E9E4DB] rounded-full overflow-hidden p-[1px] shadow-inner">
                <div
                  style={{ width: `${Math.min(pctPresupuesto, 100)}%` }}
                  className={`h-full rounded-full transition-all duration-700 ${
                    pctPresupuesto >= 95
                      ? 'bg-gradient-to-r from-[#A85D4A] to-[#C46D58]'
                      : pctPresupuesto >= 75
                      ? 'bg-gradient-to-r from-[#B58A4A] to-[#D1A056]'
                      : 'bg-gradient-to-r from-[#4A5A2E] to-[#63793D]'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
                <span>
                  {pctPresupuesto > 100
                    ? `⚠️ Excedido por ${formatCurrency(totalSpent30d - category.limiteMensual, moneda)}`
                    : `Disponible: ${formatCurrency(Math.max(0, category.limiteMensual - totalSpent30d), moneda)}`}
                </span>
                <span>{categoryMovements30d.length} transacciones en 30 días</span>
              </div>
            </div>

            {/* 2. Top Merchants & Notes Breakdown */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/70 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#4A5A2E]" />
                  <h3 className="text-sm font-bold text-[#2B2D26]">
                    Top Comercios y Conceptos
                  </h3>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">
                  {topMerchants.length} lugares
                </span>
              </div>

              {topMerchants.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">
                  No hay gastos registrados en esta categoría en los últimos 30 días.
                </p>
              ) : (
                <div className="space-y-3 pt-1">
                  {topMerchants.map((item, index) => (
                    <div key={`${item.merchant}-${index}`} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="w-5 h-5 rounded-md bg-[#F4F1EA] text-stone-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>
                          <span className="font-bold text-[#2B2D26] truncate">
                            {item.merchant}
                          </span>
                          <span className="text-[11px] text-stone-500 font-normal shrink-0">
                            ({item.count} {item.count === 1 ? 'compra' : 'compras'})
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#2B2D26]">
                            {formatCurrency(item.total, moneda)}
                          </span>
                          <span className="text-[10px] text-stone-500 ml-1.5 font-medium">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Clean solid bar */}
                      <div className="w-full h-1.5 bg-[#F1EDE5] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${item.percentage}%` }}
                          className="h-full bg-[#4A5A2E] rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. 4-Week Distribution Trend */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/70 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4A5A2E]" />
                  <h3 className="text-sm font-bold text-[#2B2D26]">
                    Distribución por semanas
                  </h3>
                </div>
                {diaMayorGasto && (
                  <span className="text-[11px] text-stone-500 truncate max-w-[170px]">
                    Pico: {formatCurrency(diaMayorGasto.monto, moneda)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 items-end h-28">
                {weeklyBreakdown.map((w, i) => {
                  const barHeightPct = maxWeekly > 0 ? (w.total / maxWeekly) * 100 : 0;
                  return (
                    <div key={`week-col-${i}`} className="flex flex-col items-center h-full justify-end gap-1.5">
                      <span className="text-[10px] font-bold text-stone-700">
                        {w.total > 0 ? `${Math.round(w.total / 1000)}k` : '$0'}
                      </span>
                      <div className="w-full bg-[#F1EDE5] rounded-t-lg h-16 flex items-end overflow-hidden p-0.5">
                        <div
                          style={{ height: `${Math.max(barHeightPct, 6)}%` }}
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            i === 3
                              ? 'bg-[#4A5A2E]'
                              : 'bg-[#8F9E75]'
                          }`}
                        />
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium text-center line-clamp-1">
                        {i === 3 ? 'Esta sem' : `Sem ${i + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Recent Transactions List in this category */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/70 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#2B2D26]">
                  Movimientos registrados
                </h3>
                <span className="text-[11px] text-stone-500">
                  {categoryMovements30d.length} transacciones
                </span>
              </div>

              <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto">
                {categoryMovements30d.length === 0 ? (
                  <p className="text-xs text-stone-400 py-3 text-center">
                    Sin transacciones registradas.
                  </p>
                ) : (
                  categoryMovements30d.map((mov, mIdx) => (
                    <div
                      key={`${mov.id}-${mIdx}`}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="font-bold text-[#2B2D26] truncate">
                          {mov.nota || 'Gasto'}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {new Date(mov.fecha).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <span className="font-bold text-[#C45638] shrink-0">
                        -{formatCurrency(mov.monto, moneda)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer with Actions */}
          <div className="p-4 sm:p-5 bg-white border-t border-stone-200/70 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl transition-all cursor-pointer"
            >
              Cerrar
            </button>

            {onAddMovementForCategory && (
              <button
                onClick={() => {
                  onClose();
                  onAddMovementForCategory(category.id);
                }}
                className="px-4 py-2.5 text-xs font-bold text-white bg-[#4A5A2E] hover:bg-[#3D4B26] active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Registrar gasto en {category.nombre}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
