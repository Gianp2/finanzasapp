import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { DesafioCard } from '../components/DesafioCard';
import { LogrosSection } from '../components/LogrosSection';
import { calcularNivel } from '../lib/gamification';
import { Desafio, ChallengeCategory } from '../types';
import { CATEGORY_META } from '../lib/challengesData';
import { formatCurrency } from '../lib/mockData';
import {
  History,
  Flame,
  CheckCircle2,
  Dice5,
  QrCode,
  Settings,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Layers,
  Award,
  Trophy,
  Lightbulb,
  Target,
  SlidersHorizontal,
} from 'lucide-react';

interface ChallengesViewProps {
  onOpenChallenge: (desafio?: Desafio, modo?: 'diario' | 'qr_juego' | 'personalizado' | 'explorar') => void;
  onOpenQRModal?: () => void;
  onOpenAdminModal?: () => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = React.memo(({
  onOpenChallenge,
  onOpenQRModal,
  onOpenAdminModal,
}) => {
  const {
    desafios,
    historialDesafios,
    desafioDelDia,
    desafioDelDiaCompletado,
    desafioPersonalizado,
    obtenerDesafioAleatorioQR,
    userProfile,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'explorar' | 'logros' | 'historial'>('explorar');
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'todas'>('todas');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const { nivelActual } = useMemo(
    () => calcularNivel(userProfile.rachaRetos),
    [userProfile.rachaRetos]
  );

  // Stats calculation
  const totalCompletados = historialDesafios.length;

  const categoriasTrabajadasMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of historialDesafios) {
      map[h.categoria] = (map[h.categoria] || 0) + 1;
    }
    return map;
  }, [historialDesafios]);

  const categoriasTrabajadasList = useMemo(() => {
    return Object.entries(categoriasTrabajadasMap).sort((a, b) => b[1] - a[1]);
  }, [categoriasTrabajadasMap]);

  // Conceptos aprendidos únicos
  const conceptosAprendidos = useMemo(() => {
    const set = new Set<string>();
    historialDesafios.forEach((h) => {
      if (h.conceptoClave) set.add(h.conceptoClave);
    });
    return Array.from(set);
  }, [historialDesafios]);

  // Areas a mejorar / Diagnóstico
  const analisisDecisiones = useMemo(() => {
    let gastosCount = 0;
    let ahorroCount = 0;
    let inversionCount = 0;

    historialDesafios.forEach((h) => {
      if (h.tipoImpacto === 'gasto') gastosCount++;
      if (h.tipoImpacto === 'ahorro') ahorroCount++;
      if (h.tipoImpacto === 'inversion') inversionCount++;
    });

    const total = historialDesafios.length || 1;
    const porcentajeGasto = Math.round((gastosCount / total) * 100);

    return {
      gastosCount,
      ahorroCount,
      inversionCount,
      porcentajeGasto,
      necesitaAhorro: porcentajeGasto > 55,
    };
  }, [historialDesafios]);

  const desafiosFiltrados = useMemo(() => {
    if (selectedCategory === 'todas') return desafios;
    return desafios.filter((d) => d.categoria === selectedCategory);
  }, [desafios, selectedCategory]);

  const handleLaunchQRChallenge = () => {
    const randomD = obtenerDesafioAleatorioQR();
    onOpenChallenge(randomD, 'qr_juego');
  };

  return (
    <div className="w-full pb-8 pt-2 px-4 max-w-md mx-auto space-y-5">
      {/* Top Header & Actions */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-extrabold text-[#4A5A2E] tracking-wider uppercase bg-[#E2E7D5] px-2.5 py-0.5 rounded-full">
            Eje Principal del Juego
          </span>
          <h1 className="text-2xl font-black text-[#2B2D26] tracking-tight mt-1">
            Desafíos Financieros
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Decisiones reales, consecuencias inmediatas y aprendizaje práctico.
          </p>
        </div>

        {onOpenAdminModal && (
          <button
            onClick={onOpenAdminModal}
            title="Administración de desafíos"
            className="p-2 text-stone-500 hover:text-black hover:bg-stone-100 rounded-xl transition cursor-pointer border border-stone-200/80 bg-white"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Streak & Stats Hero with Level info */}
      <div className="bg-[#4A5A2E] text-white rounded-[24px] p-5 shadow-[0_4px_16px_rgba(74,90,46,0.18)] relative overflow-hidden flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-[#E2E7D5] font-semibold">
              <motion.div
                animate={{ scale: [1, 1.25, 1], rotate: [0, 4, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                <Flame className="w-4 h-4 text-amber-300" />
              </motion.div>
              <span>Racha activa</span>
            </div>

            <button
              onClick={() => setActiveSubTab('logros')}
              className="inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 transition text-[10px] font-black px-2 py-0.5 rounded-full text-amber-300 uppercase cursor-pointer"
            >
              <Trophy className="w-3 h-3" />
              <span>Nivel {nivelActual.nivel}: {nivelActual.titulo}</span>
            </button>
          </div>

          <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            {userProfile.rachaRetos} días seguidos
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-white/80 flex-wrap">
            <span>{totalCompletados} completados</span>
            <span>•</span>
            <button
              onClick={() => setActiveSubTab('logros')}
              className="text-amber-200 hover:underline font-bold"
            >
              Ver Logros e Insignias →
            </button>
          </div>
        </div>

        <button
          onClick={() => setActiveSubTab('logros')}
          className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-amber-300 text-2xl flex-shrink-0 border border-white/10 cursor-pointer"
        >
          {nivelActual.icono}
        </button>
      </div>

      {/* Primary Section: Desafío del Día */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>★</span>
            <span>Desafío del Día</span>
          </h2>
          <span className="text-[11px] font-semibold text-stone-400">
            {desafioDelDiaCompletado ? 'Completado' : 'Pendiente para hoy'}
          </span>
        </div>
        <DesafioCard onOpenChallenge={() => onOpenChallenge(desafioDelDia, 'diario')} />
      </div>

      {/* QR Board Game Tile Action Card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-stone-900 rounded-[24px] p-5 shadow-sm relative overflow-hidden border border-amber-400/40"
      >
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-stone-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Dice5 className="w-3.5 h-3.5 text-amber-400" />
              <span>Juego de Mesa</span>
            </div>
            <h3 className="text-lg font-black text-white leading-tight">
              ¿Caíste en la Casilla con QR?
            </h3>
            <p className="text-amber-100 text-xs leading-relaxed max-w-[280px]">
              Tirá un desafío aleatorio para tu turno en el tablero. Cada jugador enfrenta dilemas sin repeticiones recientes.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0">
            <Dice5 className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-400/30 flex items-center gap-2 relative z-10">
          <button
            type="button"
            onClick={handleLaunchQRChallenge}
            className="flex-1 py-2.5 px-4 bg-white text-stone-900 font-extrabold text-xs rounded-xl shadow hover:bg-stone-50 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Dice5 className="w-4 h-4 text-amber-600" />
            <span>Sacar Desafío Ahora</span>
          </button>

          {onOpenQRModal && (
            <button
              type="button"
              onClick={onOpenQRModal}
              title="Ver código QR para escanear"
              className="py-2.5 px-3 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-black transition cursor-pointer flex items-center gap-1"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>Ver QR</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Personalized Challenge based on User's Real Budget */}
      {desafioPersonalizado && (
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-[24px] p-5 border border-purple-200/90 shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center gap-1.5 text-purple-700 text-[10px] font-black uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-full inline-flex">
            <Target className="w-3.5 h-3.5" />
            <span>Basado en tus Gastos Reales</span>
          </div>

          <h3 className="text-base font-extrabold text-[#2B2D26] mt-2">
            {desafioPersonalizado.titulo}
          </h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-3">
            {desafioPersonalizado.situacion}
          </p>

          <div className="mt-3.5 flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800">
              Impacto potencial: {formatCurrency(desafioPersonalizado.montoInvolucrado, userProfile.moneda)}
            </span>
            <button
              type="button"
              onClick={() => onOpenChallenge(desafioPersonalizado, 'personalizado')}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>Resolver</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabs: Explorar Banco vs Logros & Racha vs Historial & Diagnóstico */}
      <div className="flex border-b border-stone-200 pt-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('explorar')}
          className={`flex-1 pb-2.5 text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'explorar'
              ? 'text-[#4A5A2E] border-b-2 border-[#4A5A2E]'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Desafíos ({desafios.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('logros')}
          className={`flex-1 pb-2.5 text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'logros'
              ? 'text-[#4A5A2E] border-b-2 border-[#4A5A2E]'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Logros & Nivel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('historial')}
          className={`flex-1 pb-2.5 text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'historial'
              ? 'text-[#4A5A2E] border-b-2 border-[#4A5A2E]'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Historial</span>
        </button>
      </div>

      {/* Subtab 1: Explorar Banco de Desafíos */}
      {activeSubTab === 'explorar' && (
        <div className="space-y-4">
          {/* Categories Pill Scroller */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('todas')}
              className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'todas'
                  ? 'bg-[#4A5A2E] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
              }`}
            >
              Todas ({desafios.length})
            </button>

            {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
              const count = desafios.filter((d) => d.categoria === catKey).length;
              if (count === 0) return null;
              const isSelected = selectedCategory === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey as ChallengeCategory)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#4A5A2E] text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>

          {/* List of Challenges */}
          <div className="space-y-3">
            {desafiosFiltrados.map((desafio, dIdx) => {
              const meta = CATEGORY_META[desafio.categoria] || {
                label: desafio.categoria,
                badgeBg: 'bg-stone-100 text-stone-700',
              };

              return (
                <motion.div
                  key={`${desafio.id}-${dIdx}`}
                  whileHover={{ y: -1 }}
                  className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs hover:border-stone-300 transition"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${meta.badgeBg}`}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">
                      {desafio.dificultad}
                    </span>
                    {desafio.montoInvolucrado > 0 && (
                      <span className="text-xs font-bold text-[#4A5A2E] ml-auto">
                        {formatCurrency(desafio.montoInvolucrado, userProfile.moneda)}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#2B2D26] mt-2">
                    {desafio.titulo}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                    {desafio.situacion}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 font-medium">
                      {desafio.opciones.length} opciones educativas
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenChallenge(desafio, 'explorar')}
                      className="text-xs font-bold text-[#4A5A2E] hover:text-[#3B4824] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Jugar desafío</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 2: Logros & Niveles (Gamification & Retention) */}
      {activeSubTab === 'logros' && (
        <LogrosSection
          onPlayTodayChallenge={() => onOpenChallenge(desafioDelDia, 'diario')}
        />
      )}

      {/* Subtab 3: Historial & Diagnóstico de Aprendizaje */}
      {activeSubTab === 'historial' && (
        <div className="space-y-4">
          {/* Areas a mejorar / Financial Mindset Diagnostic */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2B2D26]">
              <Award className="w-4 h-4 text-[#4A5A2E]" />
              <span>Diagnóstico de tus Decisiones</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                <span className="text-xs text-emerald-800 font-bold block">Ahorro</span>
                <span className="text-lg font-extrabold text-emerald-700">{analisisDecisiones.ahorroCount}</span>
              </div>
              <div className="bg-purple-50 rounded-xl p-2.5 border border-purple-100">
                <span className="text-xs text-purple-800 font-bold block">Inversión</span>
                <span className="text-lg font-extrabold text-purple-700">{analisisDecisiones.inversionCount}</span>
              </div>
              <div className="bg-rose-50 rounded-xl p-2.5 border border-rose-100">
                <span className="text-xs text-rose-800 font-bold block">Consumo</span>
                <span className="text-lg font-extrabold text-rose-700">{analisisDecisiones.gastosCount}</span>
              </div>
            </div>

            {/* Pedagogical recommendation */}
            <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-700 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="block text-[#2B2D26]">Área clave a fortalecer:</strong>
                {analisisDecisiones.necesitaAhorro ? (
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                    Tus decisiones muestran una tendencia a priorizar el disfrute inmediato. Practicá más desafíos de <strong>Fondo de Emergencia</strong> y <strong>Costo de Oportunidad</strong>.
                  </p>
                ) : (
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                    ¡Gran disciplina de preservación de capital! El siguiente paso es explorar desafíos de <strong>Inversión y Rendimientos diarios</strong> para ganarle a la inflación.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Categorías Trabajadas */}
          {categoriasTrabajadasList.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                Categorías trabajadas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categoriasTrabajadasList.map(([catKey, count], catIdx) => {
                  const meta = CATEGORY_META[catKey as ChallengeCategory] || { label: catKey, badgeBg: 'bg-stone-100 text-stone-700' };
                  return (
                    <span key={`${catKey}-${catIdx}`} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.badgeBg}`}>
                      {meta.label}: {count}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conceptos Aprendidos */}
          {conceptosAprendidos.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#4A5A2E]" />
                <span>Conceptos financieros dominados</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {conceptosAprendidos.map((concepto, idx) => (
                  <span
                    key={`${concepto}-${idx}`}
                    className="text-[11px] font-medium bg-[#E2E7D5] text-[#4A5A2E] px-2.5 py-0.5 rounded-full"
                  >
                    ✓ {concepto}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* List of decisions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
              Registro detallado de decisiones
            </h3>

            {historialDesafios.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-xs text-stone-500 border border-stone-200/70">
                Aún no completaste ningún desafío. ¡Probá el desafío del día o la casilla con QR!
              </div>
            ) : (
              historialDesafios.map((item, hIdx) => {
                const meta = CATEGORY_META[item.categoria] || {
                  label: item.categoria,
                  badgeBg: 'bg-stone-100 text-stone-700',
                };

                return (
                  <div
                    key={`${item.id}-${hIdx}`}
                    className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span>{new Date(item.fechaCompletado).toLocaleDateString('es-AR')}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${meta.badgeBg}`}>
                        {meta.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#2B2D26]">
                      {item.desafioTitulo}
                    </h4>

                    <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 text-xs">
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">Elegiste:</span>
                      <p className="font-semibold text-stone-800 mt-0.5">{item.opcionElegidaTexto}</p>
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-stone-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5A2E] mt-0.5 flex-shrink-0" />
                      <span>{item.consecuencia}</span>
                    </div>

                    {item.conceptoClave && (
                      <div className="text-[11px] font-bold text-[#4A5A2E] bg-[#F4F7EE] px-2.5 py-1 rounded-lg">
                        Aprendizaje: {item.conceptoClave}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

ChallengesView.displayName = 'ChallengesView';
