import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  TrendingUp,
  Target,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  DollarSign,
  PiggyBank,
} from 'lucide-react';
import { Meta } from '../types';
import { formatCurrency } from '../lib/mockData';

interface SavingsGoalProjectorProps {
  metas: Meta[];
  disponibleMes: number;
  moneda: string;
  onAddFundsToMeta?: (metaId: string, amount: number) => void;
  onCreateMeta?: (nombre: string, objetivo: number) => void;
  defaultMetaId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const SavingsGoalProjector: React.FC<SavingsGoalProjectorProps> = React.memo(({
  metas,
  disponibleMes,
  moneda,
  onAddFundsToMeta,
  onCreateMeta,
  defaultMetaId,
  onClose,
  isModal = false,
}) => {
  // Selected goal (id or 'custom')
  const [selectedMetaId, setSelectedMetaId] = useState<string>(
    defaultMetaId || (metas.length > 0 ? metas[0].id : 'custom')
  );

  // Custom goal fields
  const [customName, setCustomName] = useState('Nuevo proyecto');
  const [customTarget, setCustomTarget] = useState<number>(60000);
  const [customSaved, setCustomSaved] = useState<number>(10000);

  // User's monthly savings capacity
  // Defaults to current actual monthly available surplus if > 0, else 3500
  const defaultCapacity = disponibleMes > 500 ? disponibleMes : 4500;
  const [capacidadMensual, setCapacidadMensual] = useState<number>(defaultCapacity);

  // Get current active goal values
  const currentGoal = useMemo(() => {
    if (selectedMetaId === 'custom') {
      return {
        id: 'custom',
        nombre: customName,
        objetivo: Math.max(customTarget, 100),
        ahorrado: Math.max(0, customSaved),
        icono: 'sparkles',
      };
    }
    const found = metas.find((m) => m.id === selectedMetaId);
    if (found) return found;
    return {
      id: 'custom',
      nombre: customName,
      objetivo: Math.max(customTarget, 100),
      ahorrado: Math.max(0, customSaved),
      icono: 'sparkles',
    };
  }, [selectedMetaId, metas, customName, customTarget, customSaved]);

  // Mathematical Projection Calculations
  const projection = useMemo(() => {
    const totalObjetivo = currentGoal.objetivo;
    const yaAhorrado = currentGoal.ahorrado;
    const faltante = Math.max(0, totalObjetivo - yaAhorrado);

    if (faltante === 0) {
      return {
        isCompleted: true,
        mesesExactos: 0,
        mesesEnteros: 0,
        diasRestantes: 0,
        targetDate: new Date(),
        targetDateFormatted: '¡Meta ya alcanzada!',
        ahorroDiario: 0,
        ahorroSemanal: 0,
        faltante: 0,
        milestones: [],
        accelerated20: null,
        accelerated50: null,
      };
    }

    if (capacidadMensual <= 0) {
      return {
        isCompleted: false,
        mesesExactos: Infinity,
        mesesEnteros: Infinity,
        diasRestantes: Infinity,
        targetDate: null,
        targetDateFormatted: 'Capacidad insuficiente',
        ahorroDiario: 0,
        ahorroSemanal: 0,
        faltante,
        milestones: [],
        accelerated20: null,
        accelerated50: null,
      };
    }

    const mesesExactos = faltante / capacidadMensual;
    const mesesEnteros = Math.floor(mesesExactos);
    const diasRestantes = Math.round((mesesExactos - mesesEnteros) * 30);

    const now = new Date();
    // Add exact days
    const totalDays = Math.round(mesesExactos * 30.416);
    const targetDate = new Date(now.getTime() + totalDays * 24 * 60 * 60 * 1000);

    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const targetDateFormatted = `${monthNames[targetDate.getMonth()]} de ${targetDate.getFullYear()}`;

    // Milestones (25%, 50%, 75%, 100%)
    const pctPuntos = [0.25, 0.5, 0.75, 1.0];
    const milestones = pctPuntos.map((p) => {
      const valorMetaPunto = totalObjetivo * p;
      const faltaParaPunto = Math.max(0, valorMetaPunto - yaAhorrado);
      const mesesPunto = faltaParaPunto / capacidadMensual;
      const fechaPunto = new Date(now.getTime() + mesesPunto * 30.416 * 24 * 60 * 60 * 1000);

      return {
        percent: Math.round(p * 100),
        monto: valorMetaPunto,
        meses: Math.max(0, Math.round(mesesPunto * 10) / 10),
        fechaFormatted: `${monthNames[fechaPunto.getMonth()].slice(0, 3)} ${fechaPunto.getFullYear()}`,
        alcanzado: yaAhorrado >= valorMetaPunto,
      };
    });

    // Accelerated Scenarios (+20% and +50%)
    const cap20 = capacidadMensual * 1.2;
    const meses20 = faltante / cap20;
    const date20 = new Date(now.getTime() + meses20 * 30.416 * 24 * 60 * 60 * 1000);

    const cap50 = capacidadMensual * 1.5;
    const meses50 = faltante / cap50;
    const date50 = new Date(now.getTime() + meses50 * 30.416 * 24 * 60 * 60 * 1000);

    return {
      isCompleted: false,
      mesesExactos,
      mesesEnteros,
      diasRestantes,
      targetDate,
      targetDateFormatted,
      ahorroDiario: Math.round(capacidadMensual / 30),
      ahorroSemanal: Math.round(capacidadMensual / 4),
      faltante,
      milestones,
      accelerated20: {
        capacidad: cap20,
        meses: Math.round(meses20 * 10) / 10,
        mesesAhorrados: Math.max(0, Math.round((mesesExactos - meses20) * 10) / 10),
        fechaFormatted: `${monthNames[date20.getMonth()].slice(0, 3)} ${date20.getFullYear()}`,
      },
      accelerated50: {
        capacidad: cap50,
        meses: Math.round(meses50 * 10) / 10,
        mesesAhorrados: Math.max(0, Math.round((mesesExactos - meses50) * 10) / 10),
        fechaFormatted: `${monthNames[date50.getMonth()].slice(0, 3)} ${date50.getFullYear()}`,
      },
    };
  }, [currentGoal, capacidadMensual]);

  // Formatted human-friendly time string
  const tiempoEstimadoHuman = useMemo(() => {
    if (projection.isCompleted) return '¡Objetivo completado!';
    if (projection.mesesExactos === Infinity) return 'Indefinido';
    if (projection.mesesEnteros === 0) {
      return `En ${Math.max(1, projection.diasRestantes)} días`;
    }
    if (projection.mesesEnteros === 1 && projection.diasRestantes < 5) {
      return 'En 1 mes';
    }
    if (projection.diasRestantes === 0) {
      return `En ${projection.mesesEnteros} meses`;
    }
    return `En ${projection.mesesEnteros} meses y ${projection.diasRestantes} días`;
  }, [projection]);

  return (
    <div className="bg-[#FAF8F5] rounded-[28px] p-5 sm:p-6 border border-stone-200/90 shadow-[0_4px_24px_rgba(43,45,38,0.04)] w-full space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4A5A2E]/10 flex items-center justify-center text-[#4A5A2E] text-lg shadow-xs">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#2B2D26]">
                Proyector de Metas
              </h3>
              <span className="text-[10px] font-bold text-[#4A5A2E] bg-[#4A5A2E]/10 px-2 py-0.5 rounded-full">
                Simulador
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Calculá cuándo alcanzarás tu objetivo según tu capacidad mensual
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-bold text-stone-400 hover:text-stone-700 p-1.5 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Select Goal to Project */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700 block">
          1. Elegí la meta a proyectar
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {metas.map((m, mIdx) => {
            const isSelected = selectedMetaId === m.id;
            return (
              <button
                key={`${m.id}-${mIdx}`}
                type="button"
                onClick={() => setSelectedMetaId(m.id)}
                className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-white border-[#4A5A2E] shadow-sm ring-1 ring-[#4A5A2E]/20'
                    : 'bg-white/60 border-stone-200/70 hover:bg-white text-stone-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">🎯</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#4A5A2E]" />
                  )}
                </div>
                <p className="text-xs font-bold text-[#2B2D26] truncate mt-1">
                  {m.nombre}
                </p>
                <p className="text-[10px] text-stone-400">
                  {formatCurrency(m.objetivo, moneda)}
                </p>
              </button>
            );
          })}

          {/* Custom Target Option */}
          <button
            type="button"
            onClick={() => setSelectedMetaId('custom')}
            className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer border ${
              selectedMetaId === 'custom'
                ? 'bg-white border-[#4A5A2E] shadow-sm ring-1 ring-[#4A5A2E]/20'
                : 'bg-white/60 border-stone-200/70 hover:bg-white text-stone-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">✨</span>
              {selectedMetaId === 'custom' && (
                <span className="w-2 h-2 rounded-full bg-[#4A5A2E]" />
              )}
            </div>
            <p className="text-xs font-bold text-[#2B2D26] truncate mt-1">
              Personalizado
            </p>
            <p className="text-[10px] text-stone-400">Nuevo monto</p>
          </button>
        </div>
      </div>

      {/* If Custom Goal is chosen, show editable inputs */}
      {selectedMetaId === 'custom' && (
        <div className="p-3.5 bg-white rounded-2xl border border-stone-200/70 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                Nombre del objetivo
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ej. Curso o Computadora"
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2B2D26]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                Monto objetivo ({moneda})
              </label>
              <input
                type="number"
                value={customTarget || ''}
                onChange={(e) => setCustomTarget(Math.max(0, Number(e.target.value)))}
                placeholder="50000"
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2B2D26]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                Ahorro inicial ({moneda})
              </label>
              <input
                type="number"
                value={customSaved || ''}
                onChange={(e) => setCustomSaved(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2B2D26]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Monthly Savings Capacity Slider & Presets */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/70 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs font-bold text-[#2B2D26] block">
              2. Tu capacidad de ahorro mensual
            </label>
            <p className="text-[11px] text-stone-400">
              ¿Cuánto podés separar cada mes para este objetivo?
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-stone-200/80">
            <span className="text-xs font-bold text-stone-400">{moneda}</span>
            <input
              type="number"
              value={capacidadMensual || ''}
              onChange={(e) => setCapacidadMensual(Math.max(0, Number(e.target.value)))}
              className="w-24 text-right font-extrabold text-sm sm:text-base text-[#4A5A2E] bg-transparent focus:outline-none"
            />
            <span className="text-[11px] text-stone-500 font-semibold">/mes</span>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min={500}
          max={Math.max(30000, capacidadMensual * 2)}
          step={250}
          value={capacidadMensual}
          onChange={(e) => setCapacidadMensual(Number(e.target.value))}
          className="w-full accent-[#4A5A2E] cursor-pointer h-2 bg-[#E9E4DB] rounded-lg"
        />

        {/* Quick capacity preset buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {disponibleMes > 0 && (
            <button
              type="button"
              onClick={() => setCapacidadMensual(disponibleMes)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                capacidadMensual === disponibleMes
                  ? 'bg-[#4A5A2E] text-white border-[#4A5A2E]'
                  : 'bg-[#FAF8F5] text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              Margen real actual ({formatCurrency(disponibleMes, moneda)})
            </button>
          )}

          <button
            type="button"
            onClick={() => setCapacidadMensual(3000)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-stone-600 border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer"
          >
            {formatCurrency(3000, moneda)}
          </button>
          <button
            type="button"
            onClick={() => setCapacidadMensual(6000)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-stone-600 border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer"
          >
            {formatCurrency(6000, moneda)}
          </button>
          <button
            type="button"
            onClick={() => setCapacidadMensual(10000)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-stone-600 border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer"
          >
            {formatCurrency(10000, moneda)}
          </button>
        </div>
      </div>

      {/* 3. Hero Projection Result Card */}
      <div className="bg-gradient-to-br from-[#4A5A2E] to-[#364222] text-white rounded-[26px] p-5 sm:p-6 shadow-md relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C5E1A5]" />
              Tiempo estimado para alcanzar la meta
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-white">
              {tiempoEstimadoHuman}
            </h2>
            <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#C5E1A5]" />
              Fecha prevista: <strong className="text-white font-bold">{projection.targetDateFormatted}</strong>
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 sm:text-right shrink-0">
            <span className="text-[10px] text-white/80 font-medium block">
              Falta ahorrar
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-white">
              {formatCurrency(projection.faltante, moneda)}
            </span>
            <span className="text-[10px] text-white/70 block mt-0.5">
              de {formatCurrency(currentGoal.objetivo, moneda)}
            </span>
          </div>
        </div>

        {/* Daily & Weekly Effort Badges */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/15 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-xs">
              📅
            </span>
            <div>
              <p className="text-[10px] text-white/70">Esfuerzo diario</p>
              <p className="font-bold text-white">
                {formatCurrency(projection.ahorroDiario, moneda)} / día
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-xs">
              📆
            </span>
            <div>
              <p className="text-[10px] text-white/70">Esfuerzo semanal</p>
              <p className="font-bold text-white">
                {formatCurrency(projection.ahorroSemanal, moneda)} / semana
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Milestone Schedule (25%, 50%, 75%, 100%) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/70 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2B2D26] flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#4A5A2E]" />
            Cronograma de hitos del objetivo
          </span>
          <span className="text-[11px] text-stone-400">4 etapas</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {projection.milestones.map((m, mIdx) => (
            <div
              key={`${m.percent}-${mIdx}`}
              className={`p-3 rounded-2xl border text-center transition-all ${
                m.alcanzado
                  ? 'bg-[#EBF3E6] border-[#A2C790] text-[#2D6A4F]'
                  : 'bg-[#FAF8F5] border-stone-200/70 text-stone-600'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                {m.alcanzado ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#4A5A2E]" />
                )}
                <span className="text-xs font-extrabold">{m.percent}%</span>
              </div>
              <p className="text-xs font-bold text-[#2B2D26] mt-1 truncate">
                {formatCurrency(m.monto, moneda)}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {m.alcanzado ? '¡Ya alcanzado!' : m.fechaFormatted}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Smart Acceleration Scenarios */}
      {projection.accelerated20 && projection.accelerated50 && !projection.isCompleted && (
        <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-stone-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#B58A4A]" />
            <h4 className="text-xs font-bold text-[#2B2D26]">
              ¿Querés llegar antes? Escenarios de aceleración
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Scenario 1: +20% */}
            <div
              onClick={() => setCapacidadMensual(Math.round(projection.accelerated20!.capacidad))}
              className="p-3 bg-white rounded-2xl border border-stone-200/70 hover:border-[#4A5A2E] transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2B2D26] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#4A5A2E]" />
                  Acelerado (+20%)
                </span>
                <span className="text-[10px] font-extrabold text-[#4A5A2E] bg-[#4A5A2E]/10 px-2 py-0.5 rounded-full">
                  -{projection.accelerated20.mesesAhorrados} meses
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Ahorrando <strong>{formatCurrency(projection.accelerated20.capacidad, moneda)}/mes</strong>
              </p>
              <p className="text-[11px] text-stone-400">
                Lo alcanzás en {projection.accelerated20.meses} meses ({projection.accelerated20.fechaFormatted})
              </p>
            </div>

            {/* Scenario 2: +50% */}
            <div
              onClick={() => setCapacidadMensual(Math.round(projection.accelerated50!.capacidad))}
              className="p-3 bg-white rounded-2xl border border-stone-200/70 hover:border-[#B58A4A] transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2B2D26] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#B58A4A]" />
                  Súper Ahorro (+50%)
                </span>
                <span className="text-[10px] font-extrabold text-[#B58A4A] bg-[#B58A4A]/15 px-2 py-0.5 rounded-full">
                  -{projection.accelerated50.mesesAhorrados} meses
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Ahorrando <strong>{formatCurrency(projection.accelerated50.capacidad, moneda)}/mes</strong>
              </p>
              <p className="text-[11px] text-stone-400">
                Lo alcanzás en {projection.accelerated50.meses} meses ({projection.accelerated50.fechaFormatted})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200/80">
        <p className="text-[11px] text-stone-500">
          Tip: Destinar fondos constantes el día 1 de cada mes aumenta 3x la probabilidad de éxito.
        </p>

        {selectedMetaId === 'custom' && onCreateMeta && (
          <button
            type="button"
            onClick={() => {
              onCreateMeta(customName, customTarget);
              onClose?.();
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#4A5A2E] hover:bg-[#3D4B26] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Crear como meta oficial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});

SavingsGoalProjector.displayName = 'SavingsGoalProjector';

