import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Desafio, DesafioOpcion } from '../types';
import { CATEGORY_META } from '../lib/challengesData';
import { formatCurrency } from '../lib/mockData';
import {
  X,
  Flame,
  CheckCircle2,
  TrendingUp,
  Target,
  QrCode,
  Dice5,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  desafio?: Desafio | null;
  modo?: 'diario' | 'qr_juego' | 'personalizado' | 'explorar';
  onNextQRChallenge?: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  desafio,
  modo = 'diario',
  onNextQRChallenge,
}) => {
  const {
    desafioDelDia,
    historialDesafios,
    responderDesafio,
    userProfile,
    disponibleMes,
  } = useFinance();

  const currentDesafio: Desafio | null = desafio || desafioDelDia;

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [chosenOption, setChosenOption] = useState<DesafioOpcion | null>(null);

  // Lock background scroll while modal card is open
  useBodyScrollLock(isOpen);

  // Initialize or reset challenge decision state
  useEffect(() => {
    if (isOpen && currentDesafio) {
      // Check if this challenge was already answered in user history
      const pastRecord = historialDesafios.find((h) => h.desafioId === currentDesafio.id);
      if (pastRecord) {
        setSelectedOptionId(pastRecord.opcionElegidaId);
        const opt = currentDesafio.opciones.find((o) => o.id === pastRecord.opcionElegidaId) || currentDesafio.opciones[0];
        setChosenOption(opt);
        setHasConfirmed(true);
      } else {
        setSelectedOptionId(null);
        setHasConfirmed(false);
        setChosenOption(null);
      }
    }
  }, [isOpen, currentDesafio?.id, historialDesafios]);

  if (!isOpen || !currentDesafio) return null;

  const categoryMeta = CATEGORY_META[currentDesafio.categoria] || {
    label: currentDesafio.categoria,
    color: '#4A5A2E',
    badgeBg: 'bg-[#E2E7D5] text-[#4A5A2E]',
    icon: 'star',
  };

  const handleConfirm = async () => {
    if (!selectedOptionId || !currentDesafio) return;
    const option = currentDesafio.opciones.find((o) => o.id === selectedOptionId);
    if (!option) return;

    setIsSubmitting(true);
    try {
      await responderDesafio(currentDesafio, selectedOptionId, modo);
      setChosenOption(option);
      setHasConfirmed(true);
    } catch (err) {
      console.error('Error confirming challenge decision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative z-10 w-full max-w-lg bg-white rounded-[28px] shadow-2xl overflow-hidden border border-stone-200 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="bg-[#4A5A2E] p-5 sm:p-6 text-white relative flex-shrink-0">
            <button
              onClick={onClose}
              aria-label="Cerrar desafío"
              className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mode & Category tags */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              {modo === 'qr_juego' ? (
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-stone-900 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  <Dice5 className="w-3.5 h-3.5" />
                  <span>Casilla QR • Juego de Mesa</span>
                </div>
              ) : modo === 'personalizado' ? (
                <div className="inline-flex items-center gap-1.5 bg-purple-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  <Target className="w-3.5 h-3.5" />
                  <span>Desafío con tus Datos Reales</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-[#2B2D26] text-[#E2E7D5] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  <span>★</span>
                  <span>Desafío del Día</span>
                </div>
              )}

              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${categoryMeta.badgeBg}`}>
                {categoryMeta.label}
              </span>

              {currentDesafio.montoInvolucrado > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white">
                  Monto: {formatCurrency(currentDesafio.montoInvolucrado, userProfile.moneda)}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight leading-snug">
              {currentDesafio.titulo}
            </h2>
            <p className="text-white/85 text-xs sm:text-sm mt-2 leading-relaxed">
              {currentDesafio.situacion}
            </p>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {!hasConfirmed ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Elegí tu decisión ({currentDesafio.opciones.length} opciones)
                  </p>
                  <span className="text-[11px] font-medium text-stone-400">
                    Dificultad: <strong className="capitalize text-stone-600">{currentDesafio.dificultad}</strong>
                  </span>
                </div>

                <div className="space-y-3">
                  {currentDesafio.opciones.map((opcion, oIdx) => {
                    const isSelected = selectedOptionId === opcion.id;
                    const isAhorro = opcion.tipoImpacto === 'ahorro';
                    const isGasto = opcion.tipoImpacto === 'gasto';
                    const isInversion = opcion.tipoImpacto === 'inversion';

                    return (
                      <div
                        key={`${currentDesafio.id}-${opcion.id}-${oIdx}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedOptionId(opcion.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedOptionId(opcion.id);
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative text-left ${
                          isSelected
                            ? 'border-[#4A5A2E] bg-[#F4F7EE] shadow-sm ring-2 ring-[#4A5A2E]/20'
                            : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                                isSelected
                                  ? 'bg-[#4A5A2E] text-white'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {opcion.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isAhorro
                                  ? 'bg-[#E2E7D5] text-[#4A5A2E]'
                                  : isGasto
                                  ? 'bg-rose-100 text-rose-800'
                                  : isInversion
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {isAhorro ? 'Ahorro / Preservación' : isGasto ? 'Gasto / Consumo' : isInversion ? 'Inversión / Rentabilidad' : 'Alternativa Neutra'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {opcion.impactoMonto > 0 && (
                              <span
                                className={`text-xs font-extrabold ${
                                  isAhorro
                                    ? 'text-[#4A5A2E]'
                                    : isGasto
                                    ? 'text-rose-600'
                                    : 'text-purple-700'
                                }`}
                              >
                                {isAhorro ? '+' : isGasto ? '-' : ''}
                                {formatCurrency(opcion.impactoMonto, userProfile.moneda)}
                              </span>
                            )}
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#4A5A2E] flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-[#2B2D26] mt-2.5 leading-snug">
                          {opcion.texto}
                        </p>

                        {/* Preview detail when selected */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-stone-200 text-xs text-stone-600 space-y-1.5"
                          >
                            <p className="flex items-start gap-1.5 text-stone-700">
                              <TrendingUp className="w-3.5 h-3.5 text-[#4A5A2E] mt-0.5 flex-shrink-0" />
                              <span><strong>Consecuencia inmediata:</strong> {opcion.consecuencia}</span>
                            </p>
                            <p className="flex items-start gap-1.5 text-[#4A5A2E] font-medium">
                              <GraduationCap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                              <span><strong>Concepto:</strong> {opcion.conceptoClave}</span>
                            </p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 text-xs sm:text-sm font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                  >
                    Pensarlo más tarde
                  </button>
                  <button
                    type="button"
                    disabled={!selectedOptionId || isSubmitting}
                    onClick={handleConfirm}
                    className="flex-1 py-3 text-xs sm:text-sm font-bold text-white bg-[#4A5A2E] hover:bg-[#3B4824] rounded-xl transition cursor-pointer shadow-md disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <span>{isSubmitting ? 'Guardando...' : 'Tomar Decisión'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Learning & Outcome Screen */
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-2 space-y-4"
              >
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-[#E2E7D5] text-[#4A5A2E] flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#2B2D26]">
                    ¡Decisión Registrada con Éxito!
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    En Ciudad Financiera cada elección tiene consecuencias reales y deja una enseñanza duradera.
                  </p>
                </div>

                {/* Consequence Card */}
                {chosenOption && (
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">
                        Lo que elegiste:
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-[#2B2D26] mt-0.5">
                        {chosenOption.texto}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-stone-200/80">
                      <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">
                        Impacto en tu vida y economía:
                      </span>
                      <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">
                        {chosenOption.consecuencia}
                      </p>
                    </div>

                    {/* Educational Concept box */}
                    <div className="bg-[#F4F7EE] rounded-xl p-3.5 border border-[#4A5A2E]/25">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#4A5A2E] uppercase tracking-wide">
                        <GraduationCap className="w-4 h-4" />
                        <span>Aprendizaje Financiero: {chosenOption.conceptoClave}</span>
                      </div>
                      <p className="text-xs text-stone-700 mt-1.5 leading-relaxed">
                        {chosenOption.explicacionEducativa}
                      </p>
                    </div>
                  </div>
                )}

                {/* Streak and stats indicator */}
                <div className="flex items-center justify-between p-3.5 bg-[#EEEDE4] rounded-2xl text-xs font-bold text-[#4A5A2E]">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Racha actual: {userProfile.rachaRetos} días tomando decisiones</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-semibold">
                    {userProfile.totalDesafiosCompletados || 1} completados
                  </span>
                </div>

                {/* Navigation actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  {modo === 'qr_juego' && onNextQRChallenge && (
                    <button
                      type="button"
                      onClick={() => {
                        onNextQRChallenge();
                        setHasConfirmed(false);
                        setSelectedOptionId(null);
                        setChosenOption(null);
                      }}
                      className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-stone-900 font-extrabold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Siguiente Turno / Otra Casilla</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-[#2B2D26] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer text-center"
                  >
                    Volver a Ciudad Financiera
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
