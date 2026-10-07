import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { Movimiento } from '../types';

interface FinanceChart7DaysProps {
  movements: Movimiento[];
  moneda?: string;
  onViewMovements?: () => void;
}

interface DayData {
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Lun 23" or "Hoy"
  fullDateLabel: string; // e.g. "Lunes 23 de Septiembre"
  ingresos: number;
  gastos: number;
  neto: number;
  rawDate: Date;
}

export const FinanceChart7Days: React.FC<FinanceChart7DaysProps> = React.memo(({
  movements,
  moneda = '$',
  onViewMovements,
}) => {
  const [activeFilter, setActiveFilter] = useState<'both' | 'gastos' | 'ingresos'>('both');
  const [hoveredData, setHoveredData] = useState<DayData | null>(null);

  // Generate last 7 days window (from 6 days ago up to today)
  const chartData: DayData[] = useMemo(() => {
    const days: DayData[] = [];
    const now = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const fullDayNames = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const isToday = i === 0;
      const isYesterday = i === 1;
      const dayName = dayNames[d.getDay()];
      const dayLabel = isToday ? 'Hoy' : isYesterday ? 'Ayer' : `${dayName} ${d.getDate()}`;
      const fullDateLabel = `${fullDayNames[d.getDay()]} ${d.getDate()} de ${monthNames[d.getMonth()]}`;

      days.push({
        dateKey,
        dayLabel,
        fullDateLabel,
        ingresos: 0,
        gastos: 0,
        neto: 0,
        rawDate: d,
      });
    }

    // Map movements to days
    movements.forEach((mov) => {
      if (!mov.fecha) return;
      const movDate = new Date(mov.fecha);
      if (isNaN(movDate.getTime())) return;

      const y = movDate.getFullYear();
      const m = String(movDate.getMonth() + 1).padStart(2, '0');
      const day = String(movDate.getDate()).padStart(2, '0');
      const movKey = `${y}-${m}-${day}`;

      const targetDay = days.find((d) => d.dateKey === movKey);
      if (targetDay) {
        if (mov.tipo === 'ingreso') {
          targetDay.ingresos += Number(mov.monto) || 0;
        } else if (mov.tipo === 'gasto') {
          targetDay.gastos += Number(mov.monto) || 0;
        }
      }
    });

    // Calculate neto for each day
    days.forEach((d) => {
      d.neto = d.ingresos - d.gastos;
    });

    return days;
  }, [movements]);

  // Aggregate totals
  const totalIngresos7d = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.ingresos, 0),
    [chartData]
  );

  const totalGastos7d = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.gastos, 0),
    [chartData]
  );

  const balanceNeto7d = totalIngresos7d - totalGastos7d;

  // Savings / retention percentage
  const porcentajeAhorro = useMemo(() => {
    if (totalIngresos7d <= 0) return 0;
    const ratio = Math.max(0, Math.min(100, Math.round(((totalIngresos7d - totalGastos7d) / totalIngresos7d) * 100)));
    return ratio;
  }, [totalIngresos7d, totalGastos7d]);

  // Find peak expense day
  const diaMayorGasto = useMemo<{ dia: DayData; maxGasto: number } | null>(() => {
    let maxGasto = 0;
    let maxDia: DayData | null = null;
    for (const d of chartData) {
      if (d.gastos > maxGasto) {
        maxGasto = d.gastos;
        maxDia = d;
      }
    }
    if (maxDia && maxGasto > 0) {
      return { dia: maxDia, maxGasto };
    }
    return null;
  }, [chartData]);

  const formatCurrency = (val: number) => {
    return `${moneda}${Math.abs(val).toLocaleString('es-AR')}`;
  };

  // Determine current active display (scrubbed day or cumulative 7 days)
  const displayNeto = hoveredData ? hoveredData.neto : balanceNeto7d;
  const displayIngresos = hoveredData ? hoveredData.ingresos : totalIngresos7d;
  const displayGastos = hoveredData ? hoveredData.gastos : totalGastos7d;
  const displaySubtitle = hoveredData ? hoveredData.fullDateLabel : 'Balance acumulado (últimos 7 días)';

  return (
    <div className="relative bg-gradient-to-b from-[#FFFFFF] to-[#FCFBF8] rounded-[28px] p-5 sm:p-6 border border-[#E9E4DC] shadow-[0_4px_24px_rgba(43,45,38,0.04)] w-full overflow-hidden transition-all duration-200">
      {/* Decorative subtle ambient backdrop glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4A5A2E]/[0.03] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C45638]/[0.02] rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

      {/* Top Section: Title & Interactive Segmented Filter */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4A5A2E]/10 flex items-center justify-center text-[#4A5A2E]">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#2B2D26] tracking-tight">
              Flujo de fondos
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Evolución diaria de entradas y salidas
            </p>
          </div>
        </div>

        {/* Clean segmented control */}
        <div className="flex items-center gap-1 bg-[#F1EDE5] p-1 rounded-xl self-start sm:self-auto text-xs font-semibold shadow-inner">
          <button
            onClick={() => setActiveFilter('both')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'both'
                ? 'bg-white text-[#2B2D26] shadow-sm font-bold scale-[1.02]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Ambos
          </button>
          <button
            onClick={() => setActiveFilter('ingresos')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'ingresos'
                ? 'bg-white text-[#2D6A4F] shadow-sm font-bold scale-[1.02]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
            Ingresos
          </button>
          <button
            onClick={() => setActiveFilter('gastos')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'gastos'
                ? 'bg-white text-[#C45638] shadow-sm font-bold scale-[1.02]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#C45638]" />
            Gastos
          </button>
        </div>
      </div>

      {/* Hero Financial Metric Scrubbing Card */}
      <div className="relative z-10 bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-stone-200/70 mb-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-stone-500 flex items-center gap-1.5 transition-colors duration-150">
              {hoveredData ? (
                <span className="inline-block w-2 h-2 rounded-full bg-[#4A5A2E] animate-pulse" />
              ) : (
                <span className="text-stone-400">·</span>
              )}
              {displaySubtitle}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-sans ${
                  displayNeto >= 0 ? 'text-[#2B2D26]' : 'text-[#C45638]'
                }`}
              >
                {displayNeto >= 0 ? '+' : '-'}
                {formatCurrency(displayNeto)}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                saldo neto
              </span>
            </div>
          </div>

          {/* Side stats: Ingresos & Gastos breakdown */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex flex-col">
              <span className="text-stone-400 text-[11px] font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#2D6A4F]" />
                Ingresos
              </span>
              <span className="text-sm font-bold text-[#2D6A4F] mt-0.5">
                +{formatCurrency(displayIngresos)}
              </span>
            </div>

            <div className="w-px h-7 bg-stone-200" />

            <div className="flex flex-col">
              <span className="text-stone-400 text-[11px] font-medium flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-[#C45638]" />
                Gastos
              </span>
              <span className="text-sm font-bold text-[#C45638] mt-0.5">
                -{formatCurrency(displayGastos)}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Cash Flow Retention Bar */}
        <div className="mt-3.5 pt-3 border-t border-stone-200/60">
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
            <span className="font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
              Retención de ingresos
            </span>
            <span className="font-bold text-[#2B2D26]">
              {porcentajeAhorro}% conservado
            </span>
          </div>
          <div className="w-full h-2 bg-[#E9E4DB] rounded-full overflow-hidden flex shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${porcentajeAhorro}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-[#3B7A50] to-[#2D6A4F] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Main Recharts Area Chart Container */}
      <div className="relative z-10 w-full h-[230px] sm:h-[250px] pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 14, right: 10, left: -20, bottom: 0 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                const day = state.activePayload[0].payload as DayData;
                setHoveredData(day);
              }
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <defs>
              {/* Premium Gradient for Ingresos */}
              <linearGradient id="areaIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.32} />
                <stop offset="65%" stopColor="#2D6A4F" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0.0} />
              </linearGradient>

              {/* Premium Gradient for Gastos */}
              <linearGradient id="areaGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C45638" stopOpacity={0.30} />
                <stop offset="65%" stopColor="#C45638" stopOpacity={0.07} />
                <stop offset="100%" stopColor="#C45638" stopOpacity={0.0} />
              </linearGradient>

              {/* Subtle drop shadow for active dots */}
              <filter id="dotShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#ECE8E0"
              vertical={false}
            />

            <XAxis
              dataKey="dayLabel"
              stroke="#9E9A8E"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E8E4DC', strokeWidth: 1 }}
              dy={8}
              tick={({ x, y, payload }) => {
                const isHovered = hoveredData?.dayLabel === payload.value;
                const isToday = payload.value === 'Hoy';
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fill={isToday ? '#2B2D26' : isHovered ? '#4A5A2E' : '#8C887B'}
                    fontWeight={isToday || isHovered ? 700 : 500}
                    fontSize={11}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />

            <YAxis
              stroke="#9E9A8E"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                if (val >= 1000) return `${val / 1000}k`;
                return `${val}`;
              }}
              dx={-4}
            />

            {/* Custom Modern Floating Glass Tooltip */}
            <Tooltip
              cursor={{
                stroke: '#8C887B',
                strokeWidth: 1.2,
                strokeDasharray: '3 3',
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DayData;
                  return (
                    <div className="bg-[#242720]/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.22)] text-white text-xs z-50 min-w-[180px]">
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                        <span className="font-semibold text-stone-200">
                          {data.fullDateLabel}
                        </span>
                        {data.dayLabel === 'Hoy' && (
                          <span className="text-[10px] bg-[#4A5A2E] text-white px-1.5 py-0.5 rounded-full font-bold">
                            Hoy
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-stone-300">
                            <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                            Ingresos:
                          </span>
                          <span className="font-bold text-[#4ADE80]">
                            +{moneda}{data.ingresos.toLocaleString('es-AR')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-stone-300">
                            <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
                            Gastos:
                          </span>
                          <span className="font-bold text-[#FB7185]">
                            -{moneda}{data.gastos.toLocaleString('es-AR')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-white/10">
                          <span className="text-[11px] font-medium text-stone-400">
                            Balance día:
                          </span>
                          <span
                            className={`font-bold ${
                              data.neto >= 0 ? 'text-[#4ADE80]' : 'text-[#FB7185]'
                            }`}
                          >
                            {data.neto >= 0 ? '+' : '-'}
                            {moneda}{Math.abs(data.neto).toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Area for Ingresos */}
            {(activeFilter === 'both' || activeFilter === 'ingresos') && (
              <Area
                type="monotone"
                dataKey="ingresos"
                name="Ingresos"
                stroke="#2D6A4F"
                strokeWidth={2.6}
                fillOpacity={1}
                fill="url(#areaIngresos)"
                dot={{
                  r: 3.5,
                  fill: '#FFFFFF',
                  stroke: '#2D6A4F',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: '#2D6A4F',
                  stroke: '#FFFFFF',
                  strokeWidth: 2.5,
                  style: { filter: 'drop-shadow(0px 2px 6px rgba(45,106,79,0.5))' },
                }}
              />
            )}

            {/* Area for Gastos */}
            {(activeFilter === 'both' || activeFilter === 'gastos') && (
              <Area
                type="monotone"
                dataKey="gastos"
                name="Gastos"
                stroke="#C45638"
                strokeWidth={2.6}
                fillOpacity={1}
                fill="url(#areaGastos)"
                dot={{
                  r: 3.5,
                  fill: '#FFFFFF',
                  stroke: '#C45638',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: '#C45638',
                  stroke: '#FFFFFF',
                  strokeWidth: 2.5,
                  style: { filter: 'drop-shadow(0px 2px 6px rgba(196,86,56,0.5))' },
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Aesthetic Footer Insight & Details Callout */}
      <div className="relative z-10 mt-4 pt-3.5 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#4A5A2E]/10 flex items-center justify-center text-[#4A5A2E] shrink-0">
            <TrendingUp className="w-3 h-3" />
          </div>
          <span>
            {diaMayorGasto ? (
              <>
                Día de mayor desembolso: <strong className="text-[#2B2D26] font-semibold">{diaMayorGasto.dia.dayLabel}</strong> ({formatCurrency(diaMayorGasto.maxGasto)})
              </>
            ) : balanceNeto7d >= 0 ? (
              <>
                Flujo financiero <strong className="text-[#2D6A4F] font-semibold">positivo</strong> durante la última semana.
              </>
            ) : (
              <>
                Mayor concentración de gastos en los últimos días.
              </>
            )}
          </span>
        </div>

        {onViewMovements && (
          <button
            onClick={onViewMovements}
            className="text-xs font-bold text-[#4A5A2E] hover:text-[#3B4824] bg-[#4A5A2E]/8 hover:bg-[#4A5A2E]/15 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-150 active:scale-95 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver movimientos</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
});

FinanceChart7Days.displayName = 'FinanceChart7Days';
