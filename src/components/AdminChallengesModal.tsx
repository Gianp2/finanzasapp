import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Desafio, DesafioOpcion, ChallengeCategory, ChallengeDifficulty, ChallengeType } from '../types';
import { CATEGORY_META } from '../lib/challengesData';
import { formatCurrency } from '../lib/mockData';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  TrendingUp,
  Percent,
  Search,
  Filter,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
  Save,
} from 'lucide-react';

interface AdminChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminChallengesModal: React.FC<AdminChallengesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    desafios,
    addDesafio,
    updateDesafio,
    toggleDesafioActivo,
    deleteDesafio,
    seedDesafiosDefault,
    actualizarMontosPorInflacion,
    userProfile,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Inflation quick tool
  const [inflationPercent, setInflationPercent] = useState<number>(20);
  const [showInflationConfirm, setShowInflationConfirm] = useState(false);

  // Form state
  const [formTitulo, setFormTitulo] = useState('');
  const [formSituacion, setFormSituacion] = useState('');
  const [formCategoria, setFormCategoria] = useState<ChallengeCategory>('gastos_cotidianos');
  const [formMonto, setFormMonto] = useState<number>(45000);
  const [formDificultad, setFormDificultad] = useState<ChallengeDifficulty>('medio');
  const [formTipo, setFormTipo] = useState<ChallengeType>('decision');
  const [formOpciones, setFormOpciones] = useState<DesafioOpcion[]>([
    {
      id: 'A',
      texto: 'Priorizar ahorro consciente o inversión',
      tipoImpacto: 'ahorro',
      impactoMonto: 30000,
      consecuencia: 'Tu fondo de reserva se fortalece y evitás gastos imprevistos.',
      explicacionEducativa: 'El hábito de pagarse a uno mismo primero asegura tranquilidad frente a emergencias.',
      conceptoClave: 'Pagarse a uno mismo primero'
    },
    {
      id: 'B',
      texto: 'Realizar el consumo inmediato',
      tipoImpacto: 'gasto',
      impactoMonto: 30000,
      consecuencia: 'Disfrutás el momento pero reducís tu disponible del mes.',
      explicacionEducativa: 'El sesgo del presente hace que sobrevaloremos el placer actual sobre la estabilidad futura.',
      conceptoClave: 'Sesgo del presente'
    }
  ]);

  // Lock background scroll when admin modal is open
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const filteredDesafios = desafios.filter((d) => {
    const matchesSearch =
      d.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.situacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.categoria.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || d.categoria === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleStartCreate = () => {
    setEditingId(null);
    setFormTitulo('');
    setFormSituacion('');
    setFormCategoria('gastos_cotidianos');
    setFormMonto(50000);
    setFormDificultad('medio');
    setFormTipo('decision');
    setFormOpciones([
      {
        id: 'A',
        texto: 'Opción de preservación o ahorro',
        tipoImpacto: 'ahorro',
        impactoMonto: 30000,
        consecuencia: 'Protege tu liquidez mensual.',
        explicacionEducativa: 'Fomenta la disciplina financiera.',
        conceptoClave: 'Costo de oportunidad'
      },
      {
        id: 'B',
        texto: 'Opción de consumo o gasto',
        tipoImpacto: 'gasto',
        impactoMonto: 30000,
        consecuencia: 'Genera una salida de fondos.',
        explicacionEducativa: 'Permite evaluar el costo por uso.',
        conceptoClave: 'Gasto discrecional'
      }
    ]);
    setIsEditing(true);
  };

  const handleStartEdit = (desafio: Desafio) => {
    setEditingId(desafio.id);
    setFormTitulo(desafio.titulo);
    setFormSituacion(desafio.situacion);
    setFormCategoria(desafio.categoria);
    setFormMonto(desafio.montoInvolucrado);
    setFormDificultad(desafio.dificultad);
    setFormTipo(desafio.tipoDesafio);
    setFormOpciones([...desafio.opciones]);
    setIsEditing(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formSituacion.trim() || formOpciones.length < 2) return;

    if (editingId) {
      await updateDesafio(editingId, {
        titulo: formTitulo,
        situacion: formSituacion,
        categoria: formCategoria,
        montoInvolucrado: formMonto,
        dificultad: formDificultad,
        tipoDesafio: formTipo,
        opciones: formOpciones,
      });
    } else {
      await addDesafio({
        titulo: formTitulo,
        situacion: formSituacion,
        categoria: formCategoria,
        montoInvolucrado: formMonto,
        dificultad: formDificultad,
        tipoDesafio: formTipo,
        opciones: formOpciones,
        activo: true,
      });
    }
    setIsEditing(false);
  };

  const handleAddOption = () => {
    if (formOpciones.length >= 4) return;
    const nextLetters = ['A', 'B', 'C', 'D'];
    const nextId = nextLetters[formOpciones.length] || `O${formOpciones.length + 1}`;
    setFormOpciones([
      ...formOpciones,
      {
        id: nextId,
        texto: '',
        tipoImpacto: 'neutro',
        impactoMonto: 0,
        consecuencia: '',
        explicacionEducativa: '',
        conceptoClave: 'Finanzas Personales'
      }
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (formOpciones.length <= 2) return;
    const updated = formOpciones.filter((_, idx) => idx !== index);
    setFormOpciones(updated);
  };

  const handleApplyInflation = async () => {
    await actualizarMontosPorInflacion(inflationPercent);
    setShowInflationConfirm(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-3xl bg-white rounded-[28px] shadow-2xl overflow-hidden border border-stone-200 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#2B2D26] p-5 sm:p-6 text-white flex items-center justify-between flex-shrink-0">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#4A5A2E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                <span>⚙ Panel de Administración</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Gestor del Banco de Desafíos
              </h2>
              <p className="text-stone-300 text-xs mt-0.5">
                {desafios.length} desafíos en el sistema • Preparado para escalar a cientos de desafíos
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {isEditing ? (
              /* Edit / Create Form */
              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h3 className="text-base font-extrabold text-[#2B2D26]">
                    {editingId ? 'Editar Desafío' : 'Crear Nuevo Desafío'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs font-bold text-stone-500 hover:text-stone-700"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Título del Desafío *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitulo}
                      onChange={(e) => setFormTitulo(e.target.value)}
                      placeholder="Ej. Electrodoméstico roto: ¿Contado o cuotas?"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#4A5A2E]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Situación Realista (Dilema del jugador) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formSituacion}
                      onChange={(e) => setFormSituacion(e.target.value)}
                      placeholder="Describí la situación financiera cotidiana que enfrentará el jugador..."
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#4A5A2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={formCategoria}
                      onChange={(e) => setFormCategoria(e.target.value as ChallengeCategory)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      {Object.entries(CATEGORY_META).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Monto Involucrado (ARS)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={formMonto}
                      onChange={(e) => setFormMonto(Number(e.target.value))}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Dificultad
                    </label>
                    <select
                      value={formDificultad}
                      onChange={(e) => setFormDificultad(e.target.value as ChallengeDifficulty)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="facil">Fácil</option>
                      <option value="medio">Medio</option>
                      <option value="dificil">Difícil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Tipo de Desafío
                    </label>
                    <select
                      value={formTipo}
                      onChange={(e) => setFormTipo(e.target.value as ChallengeType)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="decision">Toma de Decisión</option>
                      <option value="dilema">Dilema Necesidad vs Deseo</option>
                      <option value="oportunidad">Oportunidad / Inversión</option>
                      <option value="imprevisto">Imprevisto / Emergencia</option>
                      <option value="presupuesto_real">Ajuste de Presupuesto</option>
                    </select>
                  </div>
                </div>

                {/* Options List (2 to 4 options) */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-[#2B2D26] uppercase tracking-wider">
                      Opciones de Decisión ({formOpciones.length}/4)
                    </label>
                    {formOpciones.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-xs font-bold text-[#4A5A2E] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Opción</span>
                      </button>
                    )}
                  </div>

                  {formOpciones.map((opcion, idx) => (
                    <div
                      key={`opcion-form-${opcion.id}-${idx}`}
                      className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-[#4A5A2E] text-white flex items-center justify-center text-xs font-extrabold">
                          {opcion.id}
                        </span>
                        {formOpciones.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          value={opcion.texto}
                          onChange={(e) => {
                            const updated = [...formOpciones];
                            updated[idx].texto = e.target.value;
                            setFormOpciones(updated);
                          }}
                          placeholder={`Texto de la Opción ${opcion.id}`}
                          className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-stone-300 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 uppercase block">Impacto</label>
                          <select
                            value={opcion.tipoImpacto}
                            onChange={(e) => {
                              const updated = [...formOpciones];
                              updated[idx].tipoImpacto = e.target.value as any;
                              setFormOpciones(updated);
                            }}
                            className="w-full text-xs px-2 py-1.5 rounded-lg border border-stone-300 bg-white"
                          >
                            <option value="ahorro">Ahorro (+)</option>
                            <option value="gasto">Gasto (-)</option>
                            <option value="inversion">Inversión</option>
                            <option value="neutro">Neutro</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-stone-500 uppercase block">Monto Impacto</label>
                          <input
                            type="number"
                            min={0}
                            value={opcion.impactoMonto}
                            onChange={(e) => {
                              const updated = [...formOpciones];
                              updated[idx].impactoMonto = Number(e.target.value);
                              setFormOpciones(updated);
                            }}
                            className="w-full text-xs px-2 py-1.5 rounded-lg border border-stone-300 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-stone-500 uppercase block">Consecuencia Inmediata</label>
                        <input
                          type="text"
                          required
                          value={opcion.consecuencia}
                          onChange={(e) => {
                            const updated = [...formOpciones];
                            updated[idx].consecuencia = e.target.value;
                            setFormOpciones(updated);
                          }}
                          placeholder="Consecuencia en la economía o rutina del jugador..."
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 uppercase block">Explicación Educativa</label>
                          <input
                            type="text"
                            required
                            value={opcion.explicacionEducativa}
                            onChange={(e) => {
                              const updated = [...formOpciones];
                              updated[idx].explicacionEducativa = e.target.value;
                              setFormOpciones(updated);
                            }}
                            placeholder="Enseñanza conceptual detallada..."
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-stone-500 uppercase block">Concepto Clave</label>
                          <input
                            type="text"
                            required
                            value={opcion.conceptoClave}
                            onChange={(e) => {
                              const updated = [...formOpciones];
                              updated[idx].conceptoClave = e.target.value;
                              setFormOpciones(updated);
                            }}
                            placeholder="Ej. Costo de Oportunidad"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-white bg-[#4A5A2E] rounded-xl hover:bg-[#3B4824] transition shadow flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Desafío</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Challenges List & Management */
              <>
                {/* Top action toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Buscar por título, situación..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="text-xs px-2.5 py-2 rounded-xl border border-stone-200 bg-stone-50"
                    >
                      <option value="all">Todas las categorías</option>
                      {Object.entries(CATEGORY_META).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowInflationConfirm(!showInflationConfirm)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Actualizar por Inflación</span>
                    </button>

                    <button
                      onClick={handleStartCreate}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#4A5A2E] hover:bg-[#3B4824] flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Desafío</span>
                    </button>
                  </div>
                </div>

                {/* Inflation quick adjust tool bar */}
                {showInflationConfirm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-900">
                        Ajuste Rápido de Montos por Inflación (Realidad Argentina)
                      </span>
                      <button
                        onClick={() => setShowInflationConfirm(false)}
                        className="text-stone-400 hover:text-stone-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-amber-800">
                      Actualizá automáticamente todos los montos de dilemas y consecuencias en un porcentaje para mantenerlos alineados con la economía actual.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInflationPercent(10)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${
                            inflationPercent === 10 ? 'bg-amber-500 text-white' : 'bg-white'
                          }`}
                        >
                          +10%
                        </button>
                        <button
                          type="button"
                          onClick={() => setInflationPercent(20)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${
                            inflationPercent === 20 ? 'bg-amber-500 text-white' : 'bg-white'
                          }`}
                        >
                          +20%
                        </button>
                        <button
                          type="button"
                          onClick={() => setInflationPercent(35)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${
                            inflationPercent === 35 ? 'bg-amber-500 text-white' : 'bg-white'
                          }`}
                        >
                          +35%
                        </button>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <input
                          type="number"
                          value={inflationPercent}
                          onChange={(e) => setInflationPercent(Number(e.target.value))}
                          className="w-16 text-xs px-2 py-1 border rounded-lg bg-white text-center font-bold"
                        />
                        <button
                          onClick={handleApplyInflation}
                          className="px-3.5 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition"
                        >
                          Aplicar a todo el banco
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Challenges cards */}
                <div className="space-y-3">
                  {filteredDesafios.map((d, dIdx) => {
                    const meta = CATEGORY_META[d.categoria] || {
                      label: d.categoria,
                      badgeBg: 'bg-stone-100 text-stone-700',
                    };

                    return (
                      <div
                        key={`${d.id}-${dIdx}`}
                        className={`p-4 rounded-2xl border transition-all ${
                          d.activo !== false
                            ? 'bg-white border-stone-200'
                            : 'bg-stone-100 border-stone-200/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badgeBg}`}
                              >
                                {meta.label}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                                {d.dificultad}
                              </span>
                              <span className="text-xs font-extrabold text-[#4A5A2E]">
                                {formatCurrency(d.montoInvolucrado, userProfile.moneda)}
                              </span>
                              {d.activo === false && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-500">
                                  Inactivo
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-[#2B2D26]">
                              {d.titulo}
                            </h4>
                            <p className="text-xs text-stone-600 line-clamp-2">
                              {d.situacion}
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => toggleDesafioActivo(d.id)}
                              title={d.activo !== false ? 'Desactivar' : 'Activar'}
                              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
                            >
                              {d.activo !== false ? (
                                <ToggleRight className="w-5 h-5 text-[#4A5A2E]" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-stone-400" />
                              )}
                            </button>

                            <button
                              onClick={() => handleStartEdit(d)}
                              className="p-1.5 text-stone-500 hover:text-black rounded-lg hover:bg-stone-100 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => deleteDesafio(d.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Options summary */}
                        <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap gap-2 text-[11px] text-stone-500">
                          {d.opciones.map((op, opIdx) => (
                            <span key={`${d.id}-op-${op.id}-${opIdx}`} className="bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
                              <strong>{op.id}:</strong> {op.texto.slice(0, 38)}...
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer action to restore default seed */}
                <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-xs">
                  <button
                    onClick={seedDesafiosDefault}
                    className="text-stone-500 hover:text-stone-800 flex items-center gap-1.5 font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar banco inicial de desafíos</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="py-2 px-5 bg-[#2B2D26] text-white font-bold rounded-xl hover:bg-black transition"
                  >
                    Listo
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
