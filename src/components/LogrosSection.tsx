import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { calcularNivel, obtenerInsignias } from '../lib/gamification';
import { Insignia } from '../types';
import {
  Flame,
  Award,
  Trophy,
  Shield,
  Zap,
  Brain,
  Crown,
  Dice5,
  Compass,
  GraduationCap,
  TrendingUp,
  Target,
  Lock,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';

interface LogrosSectionProps {
  onPlayTodayChallenge?: () => void;
}

export const LogrosSection: React.FC<LogrosSectionProps> = ({ onPlayTodayChallenge }) => {
  const { userProfile, historialDesafios, desafioDelDiaCompletado } = useFinance();
  const [filterType, setFilterType] = useState<'todas' | 'desbloqueadas' | 'racha'>('todas');
  const [selectedInsignia, setSelectedInsignia] = useState<Insignia | null>(null);

  // Lock background scroll when an insignia card modal is open
  useBodyScrollLock(Boolean(selectedInsignia));

  const { nivelActual, siguienteNivel, porcentajeProgreso, diasRestantes } = useMemo(
    () => calcularNivel(userProfile.rachaRetos),
    [userProfile.rachaRetos]
  );

  const insignias = useMemo(
    () => obtenerInsignias(userProfile.rachaRetos, historialDesafios),
    [userProfile.rachaRetos, historialDesafios]
  );

  const insigniasDesbloqueadas = useMemo(
    () => insignias.filter((i) => i.desbloqueada).length,
    [insignias]
  );

  const filteredInsignias = useMemo(() => {
    if (filterType === 'desbloqueadas') return insignias.filter((i) => i.desbloqueada);
    if (filterType === 'racha') return insignias.filter((i) => i.categoriaTipo === 'racha');
    return insignias;
  }, [insignias, filterType]);

  const renderBadgeIcon = (icono: string, isUnlocked: boolean) => {
    const props = {
      className: `w-6 h-6 ${isUnlocked ? 'text-white' : 'text-stone-400'}`,
    };

    switch (icono) {
      case 'target':
        return <Target {...props} />;
      case 'flame':
        return <Flame {...props} />;
      case 'shield':
        return <Shield {...props} />;
      case 'zap':
        return <Zap {...props} />;
      case 'brain':
        return <Brain {...props} />;
      case 'crown':
        return <Crown {...props} />;
      case 'dice':
        return <Dice5 {...props} />;
      case 'compass':
        return <Compass {...props} />;
      case 'graduation':
        return <GraduationCap {...props} />;
      case 'trending':
        return <TrendingUp {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  const getRarityBadge = (rareza?: string) => {
    switch (rareza) {
      case 'legendaria':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'epica':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'rara':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Level & Streak Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#2B2D26] via-[#3B4824] to-[#4A5A2E] text-white rounded-[26px] p-5 sm:p-6 shadow-[0_6px_20px_rgba(43,45,38,0.22)] relative overflow-hidden"
      >
        {/* Top level info */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xs text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider text-amber-300">
              <Trophy className="w-3.5 h-3.5" />
              <span>Nivel {nivelActual.nivel} de 6</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black mt-2 tracking-tight flex items-center gap-2">
              <span>{nivelActual.icono}</span>
              <span>{nivelActual.titulo}</span>
            </h3>
            <p className="text-xs text-white/80 mt-1 leading-relaxed max-w-xs">
              {nivelActual.descripcion}
            </p>
          </div>

          {/* Streak Flame Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/15 flex-shrink-0">
            <div className="flex items-center justify-center gap-1 text-amber-300">
              <Flame className="w-5 h-5 fill-amber-300" />
              <span className="text-lg font-black">{userProfile.rachaRetos}</span>
            </div>
            <span className="text-[10px] font-bold text-white/80 block uppercase tracking-wider mt-0.5">
              Días seguidos
            </span>
          </div>
        </div>

        {/* Progress to Next Level */}
        <div className="mt-5 pt-4 border-t border-white/15 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white/90">
            <span className="flex items-center gap-1">
              <span>Siguiente: {siguienteNivel ? siguienteNivel.titulo : '¡Nivel Máximo!'}</span>
            </span>
            <span>
              {siguienteNivel
                ? `${diasRestantes} ${diasRestantes === 1 ? 'día restante' : 'días restantes'}`
                : '100% Completado'}
            </span>
          </div>

          <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${porcentajeProgreso}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full shadow"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/70 pt-0.5">
            <span>Racha actual: {userProfile.rachaRetos} días</span>
            {siguienteNivel && <span>Meta: {siguienteNivel.rachaMinima} días</span>}
          </div>
        </div>

        {/* Level Reward Banner */}
        <div className="mt-3.5 bg-white/10 backdrop-blur-xs rounded-xl p-2.5 flex items-center justify-between text-xs text-stone-200">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <span className="text-[11px]">{nivelActual.beneficio}</span>
          </div>
          {!desafioDelDiaCompletado && onPlayTodayChallenge && (
            <button
              onClick={onPlayTodayChallenge}
              className="text-[10px] font-black uppercase text-amber-300 hover:text-white flex items-center gap-0.5 cursor-pointer ml-2"
            >
              <span>Reto hoy</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>

      {/* 2. Badges / Insignias Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h4 className="text-sm font-extrabold text-[#2B2D26] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#4A5A2E]" />
              <span>Insignias de Constancia</span>
            </h4>
            <p className="text-[11px] text-stone-500">
              Desbloqueadas: <strong>{insigniasDesbloqueadas}</strong> de {insignias.length}
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setFilterType('todas')}
              className={`px-2 py-1 rounded-lg transition ${
                filterType === 'todas' ? 'bg-white text-[#2B2D26] shadow-xs' : 'text-stone-600'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('desbloqueadas')}
              className={`px-2 py-1 rounded-lg transition ${
                filterType === 'desbloqueadas' ? 'bg-white text-[#2B2D26] shadow-xs' : 'text-stone-600'
              }`}
            >
              Logradas
            </button>
            <button
              onClick={() => setFilterType('racha')}
              className={`px-2 py-1 rounded-lg transition ${
                filterType === 'racha' ? 'bg-white text-[#2B2D26] shadow-xs' : 'text-stone-600'
              }`}
            >
              Racha
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {filteredInsignias.map((insignia, iIdx) => {
            const isUnlocked = insignia.desbloqueada;

            return (
              <motion.div
                key={`${insignia.id}-${iIdx}`}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedInsignia(insignia)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-white border-[#4A5A2E]/30 shadow-xs hover:border-[#4A5A2E] hover:shadow-sm'
                    : 'bg-stone-50/80 border-stone-200/80 opacity-75 hover:opacity-95'
                }`}
              >
                <div>
                  {/* Badge Header: Icon + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-[#4A5A2E] to-[#687F40]'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      {renderBadgeIcon(insignia.icono, isUnlocked)}
                    </div>

                    <div className="flex items-center gap-1">
                      {isUnlocked ? (
                        <span className="w-5 h-5 rounded-full bg-[#E2E7D5] text-[#4A5A2E] flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  <h5 className="text-xs sm:text-sm font-extrabold text-[#2B2D26] mt-2.5 leading-snug">
                    {insignia.titulo}
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed line-clamp-2">
                    {insignia.descripcion}
                  </p>
                </div>

                {/* Progress / Requirement Footer */}
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                  {isUnlocked ? (
                    <span className="font-extrabold text-[#4A5A2E]">¡Completada!</span>
                  ) : (
                    <span className="font-bold text-stone-500">
                      {insignia.rachaRequerida > 0
                        ? `Meta: ${insignia.rachaRequerida} días`
                        : `${insignia.progresoActual} / ${insignia.progresoTotal}`}
                    </span>
                  )}
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded uppercase text-[9px] border ${getRarityBadge(
                      insignia.rareza
                    )}`}
                  >
                    {insignia.rareza || 'Común'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Retention Booster: Daily Consistency Banner */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/90 text-amber-950 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-200/80 flex items-center justify-center flex-shrink-0 text-amber-800">
          <Flame className="w-5 h-5 fill-amber-500 text-amber-600" />
        </div>
        <div className="space-y-1 text-xs">
          <strong className="block font-black text-amber-900">
            ¿Cómo no perder tu racha de {userProfile.rachaRetos} días?
          </strong>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            Cada día podés resolver el <strong>Desafío del Día</strong> o escanear una casilla con el código QR del <strong>Juego de Mesa</strong>. Ambas actividades suman a tu constancia consecutiva y te acercan al siguiente nivel.
          </p>
        </div>
      </div>

      {/* Insignia Detail Modal */}
      <AnimatePresence>
        {selectedInsignia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-contain">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInsignia(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-white rounded-[26px] p-6 text-center space-y-4 shadow-2xl border border-stone-200"
            >
              <div
                className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-md ${
                  selectedInsignia.desbloqueada
                    ? 'bg-gradient-to-br from-[#4A5A2E] to-[#687F40]'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {renderBadgeIcon(selectedInsignia.icono, selectedInsignia.desbloqueada)}
              </div>

              <div>
                <span
                  className={`inline-block font-bold px-2 py-0.5 rounded uppercase text-[10px] border mb-1.5 ${getRarityBadge(
                    selectedInsignia.rareza
                  )}`}
                >
                  Insignia {selectedInsignia.rareza}
                </span>
                <h4 className="text-lg font-black text-[#2B2D26]">
                  {selectedInsignia.titulo}
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {selectedInsignia.descripcion}
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-700">
                <span className="font-bold block text-stone-500 text-[10px] uppercase">
                  Requisito de Desbloqueo:
                </span>
                <span className="font-extrabold text-sm text-[#2B2D26] mt-0.5 block">
                  {selectedInsignia.rachaRequerida > 0
                    ? `${selectedInsignia.rachaRequerida} días seguidos de desafíos`
                    : 'Acción especial en el juego'}
                </span>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Estado actual: {selectedInsignia.desbloqueada ? '¡Desbloqueada!' : 'En progreso'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInsignia(null)}
                className="w-full py-2.5 bg-[#2B2D26] hover:bg-black text-white text-xs font-bold rounded-xl transition"
              >
                Cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
