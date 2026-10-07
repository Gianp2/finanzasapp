import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../lib/mockData';
import { PWAInstallButton } from '../components/PWAInstallButton';
import {
  User,
  Settings,
  Target,
  Layers,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  LogOut,
  Check,
  ShieldCheck,
  Plane,
  Shield,
  BarChart2,
  PiggyBank,
  Clock,
  Dice5,
  QrCode,
  ToggleRight,
  ToggleLeft,
} from 'lucide-react';
import { Categoria } from '../types';
import { SavingsGoalProjector } from '../components/SavingsGoalProjector';

interface ProfileViewProps {
  onOpenAuthModal: () => void;
  onSelectCategory?: (category: Categoria) => void;
  onOpenAdminModal?: () => void;
  onOpenQRModal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = React.memo(({
  onOpenAuthModal,
  onSelectCategory,
  onOpenAdminModal,
  onOpenQRModal,
}) => {
  const {
    user,
    userProfile,
    updateProfile,
    categories,
    updateCategory,
    addCategory,
    deleteCategory,
    metas,
    addMeta,
    addFundsToMeta,
    resetToDemoData,
    logout,
    disponibleMes,
    desafios,
    historialDesafios,
    toggleAdminMode,
  } = useFinance();

  // Scroll to top on view mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Savings goal projector state
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);
  const [projectorMetaId, setProjectorMetaId] = useState<string | undefined>(undefined);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nombreInput, setNombreInput] = useState(userProfile.nombre);
  const [presupuestoInput, setPresupuestoInput] = useState(
    userProfile.presupuestoMensual.toString()
  );

  // Category modal / edit
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catNameInput, setCatNameInput] = useState('');
  const [catLimitInput, setCatLimitInput] = useState('');

  // Smooth line filling on view entrance
  const [animateGoals, setAnimateGoals] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimateGoals(true), 120);
    return () => clearTimeout(timer);
  }, []);
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Goal modal / add
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [addingFundsGoalId, setAddingFundsGoalId] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState('');

  const handleSaveProfile = async () => {
    const num = parseFloat(presupuestoInput);
    if (!isNaN(num) && num > 0) {
      await updateProfile({
        nombre: nombreInput.trim() || userProfile.nombre,
        presupuestoMensual: num,
      });
      setIsEditingProfile(false);
    }
  };

  const handleSaveCategoryLimit = async (catId: string) => {
    const num = parseFloat(catLimitInput);
    if (!isNaN(num) && num > 0) {
      await updateCategory(catId, { limiteMensual: num });
      setEditingCatId(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(catLimitInput);
    if (catNameInput.trim() && !isNaN(num) && num > 0) {
      await addCategory({
        nombre: catNameInput.trim(),
        limiteMensual: num,
        icono: 'tag',
        color: '#4A5A2E',
      });
      setCatNameInput('');
      setCatLimitInput('');
      setIsAddingCat(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(goalTarget);
    if (goalName.trim() && !isNaN(targetNum) && targetNum > 0) {
      await addMeta({
        nombre: goalName.trim(),
        objetivo: targetNum,
        ahorrado: 0,
        icono: 'plane',
      });
      setGoalName('');
      setGoalTarget('');
      setIsAddingGoal(false);
    }
  };

  const handleAddFunds = async (goalId: string) => {
    const num = parseFloat(fundsAmount);
    if (!isNaN(num) && num > 0) {
      await addFundsToMeta(goalId, num);
      setAddingFundsGoalId(null);
      setFundsAmount('');
    }
  };

  return (
    <div className="w-full pb-3 pt-3 px-4 max-w-md mx-auto space-y-5">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#2B2D26] tracking-tight">
          Perfil y Ajustes
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Configuración personal, límites de gasto y metas de ahorro
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-[24px] p-5 border border-stone-200/70 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-[#C5A566] text-[#2B2D26] font-bold text-lg flex items-center justify-center shadow-xs">
            {userProfile.avatarInitials || 'CR'}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2B2D26]">
              {userProfile.nombre}
            </h2>
            <p className="text-xs text-stone-500">
              {user ? user.email : 'Modo Invitado / Demo'}
            </p>
            {user ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sincronizado con Firebase
              </span>
            ) : (
              <span className="inline-block text-[11px] text-stone-400 mt-1">
                Almacenado localmente
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 text-xs font-bold transition-all duration-150 cursor-pointer shadow-2xs"
        >
          {user ? 'Mi cuenta' : 'Ingresar'}
        </button>
      </div>

      {/* Presupuesto Mensual Configuration */}
      <div className="bg-white rounded-[24px] p-5 border border-stone-200/70 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2B2D26]">
            Presupuesto Mensual General
          </h3>
          {!isEditingProfile && (
            <button
              onClick={() => {
                setNombreInput(userProfile.nombre);
                setPresupuestoInput(userProfile.presupuestoMensual.toString());
                setIsEditingProfile(true);
              }}
              className="text-xs font-semibold text-[#4A5A2E] hover:underline cursor-pointer"
            >
              Editar
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">
                Tu nombre
              </label>
              <input
                type="text"
                value={nombreInput}
                onChange={(e) => setNombreInput(e.target.value)}
                className="w-full bg-[#F5F2EB] border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2B2D26] font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">
                Presupuesto mensual ({userProfile.moneda})
              </label>
              <input
                type="number"
                value={presupuestoInput}
                onChange={(e) => setPresupuestoInput(e.target.value)}
                className="w-full bg-[#F5F2EB] border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2B2D26] font-medium"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-2 text-xs font-bold text-stone-600 bg-stone-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#4A5A2E] hover:bg-[#3B4824] rounded-xl shadow-xs"
              >
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xs text-stone-500">Monto asignado mensual</span>
            <span className="text-xl font-extrabold text-[#2B2D26]">
              {formatCurrency(userProfile.presupuestoMensual, userProfile.moneda)}
            </span>
          </div>
        )}
      </div>

      {/* Categorías y Límites Manager */}
      <div className="bg-white rounded-[24px] p-5 border border-stone-200/70 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2B2D26]">
              Categorías y Límites
            </h3>
            <p className="text-[11px] text-stone-500">
              Ajustá los topes máximos para cada rubro
            </p>
          </div>
          <button
            onClick={() => setIsAddingCat(!isAddingCat)}
            className="flex items-center gap-1 text-xs font-bold text-[#4A5A2E] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva</span>
          </button>
        </div>

        {isAddingCat && (
          <form
            onSubmit={handleCreateCategory}
            className="bg-[#F8F6F0] p-3.5 rounded-2xl space-y-2.5 animate-in fade-in duration-150"
          >
            <input
              type="text"
              placeholder="Nombre (ej. Suscripciones)"
              value={catNameInput}
              onChange={(e) => setCatNameInput(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-[#2B2D26]"
            />
            <input
              type="number"
              placeholder="Límite mensual ($)"
              value={catLimitInput}
              onChange={(e) => setCatLimitInput(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-[#2B2D26]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddingCat(false)}
                className="flex-1 py-1.5 text-xs font-bold text-stone-600 bg-stone-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 text-xs font-bold text-white bg-[#4A5A2E] rounded-lg"
              >
                Crear categoría
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-stone-100">
          {categories.map((cat, idx) => (
            <div key={`${cat.id}-${idx}`} className="py-2.5 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#2B2D26]">
                  {cat.nombre}
                </p>
                <p className="text-[11px] text-stone-500">
                  Límite: {formatCurrency(cat.limiteMensual, userProfile.moneda)}
                </p>
              </div>

              {editingCatId === cat.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={catLimitInput}
                    onChange={(e) => setCatLimitInput(e.target.value)}
                    className="w-20 bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-xs font-bold"
                    placeholder="Límite"
                  />
                  <button
                    onClick={() => handleSaveCategoryLimit(cat.id)}
                    className="p-1.5 bg-[#4A5A2E] text-white rounded-lg hover:bg-[#3B4824]"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {onSelectCategory && (
                    <button
                      onClick={() => onSelectCategory(cat)}
                      className="p-1 text-[#4A5A2E] hover:text-[#3B4824] hover:bg-[#4A5A2E]/10 rounded-md transition-colors"
                      title="Ver insights de gasto"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingCatId(cat.id);
                      setCatLimitInput(cat.limiteMensual.toString());
                    }}
                    className="p-1 text-stone-400 hover:text-stone-700"
                    title="Editar límite"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {categories.length > 2 && (
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1 text-stone-400 hover:text-rose-600"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Metas de Ahorro */}
      <div className="bg-white rounded-[24px] p-5 border border-stone-200/70 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#2B2D26]">Metas de Ahorro</h3>
            <p className="text-[11px] text-stone-500">
              Proyectos a corto y mediano plazo
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setProjectorMetaId(undefined);
                setIsProjectorOpen(!isProjectorOpen);
              }}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer active:scale-95 ${
                isProjectorOpen
                  ? 'bg-[#4A5A2E] text-white shadow-xs'
                  : 'text-[#4A5A2E] bg-[#4A5A2E]/10 hover:bg-[#4A5A2E]/20'
              }`}
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span>{isProjectorOpen ? 'Cerrar proyector' : 'Proyectar tiempo'}</span>
            </button>

            <button
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva meta</span>
            </button>
          </div>
        </div>

        {/* Embedded Savings Goal Projection Tool */}
        <AnimatePresence>
          {isProjectorOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden pt-1"
            >
              <SavingsGoalProjector
                metas={metas}
                disponibleMes={disponibleMes}
                moneda={userProfile.moneda}
                defaultMetaId={projectorMetaId}
                onClose={() => setIsProjectorOpen(false)}
                onAddFundsToMeta={addFundsToMeta}
                onCreateMeta={async (nombre, objetivo) => {
                  await addMeta({
                    nombre,
                    objetivo,
                    ahorrado: 0,
                    icono: 'sparkles',
                  });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isAddingGoal && (
          <form
            onSubmit={handleCreateGoal}
            className="bg-[#F8F6F0] p-3.5 rounded-2xl space-y-2.5 animate-in fade-in duration-150"
          >
            <input
              type="text"
              placeholder="Nombre (ej. Computadora nueva)"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-[#2B2D26]"
            />
            <input
              type="number"
              placeholder="Monto objetivo ($)"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-[#2B2D26]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className="flex-1 py-1.5 text-xs font-bold text-stone-600 bg-stone-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 text-xs font-bold text-white bg-[#4A5A2E] rounded-lg"
              >
                Crear meta
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {metas.map((meta, idx) => {
            const pct = Math.min(Math.round((meta.ahorrado / meta.objetivo) * 100), 100);

            return (
              <div
                key={`${meta.id}-${idx}`}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✈️</span>
                    <span className="text-xs sm:text-sm font-bold text-[#2B2D26]">
                      {meta.nombre}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#4A5A2E]">
                    {pct}%
                  </span>
                </div>

                {/* Clean matte solid progress bar */}
                <div className="relative w-full h-2.5 bg-[#E4DFD5] rounded-full overflow-hidden p-[1px] shadow-inner">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: animateGoals ? `${pct}%` : '0%' }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-[#4A5A2E] to-[#687F40] rounded-full"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
                  <span>
                    Ahorrado: {formatCurrency(meta.ahorrado, userProfile.moneda)}
                  </span>
                  <span>
                    Objetivo: {formatCurrency(meta.objetivo, userProfile.moneda)}
                  </span>
                </div>

                {/* Actions row: Add funds + Project Time */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/50">
                  {/* Add funds toggle */}
                  {addingFundsGoalId === meta.id ? (
                    <div className="pt-1 flex items-center gap-2 w-full">
                      <input
                        type="number"
                        placeholder="Monto a sumar ($)"
                        value={fundsAmount}
                        onChange={(e) => setFundsAmount(e.target.value)}
                        className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs"
                      />
                      <button
                        onClick={() => handleAddFunds(meta.id)}
                        className="px-3 py-1 bg-[#4A5A2E] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Sumar
                      </button>
                      <button
                        onClick={() => setAddingFundsGoalId(null)}
                        className="px-2 py-1 text-xs text-stone-500 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingFundsGoalId(meta.id)}
                      className="text-[11px] font-bold text-[#4A5A2E] hover:underline cursor-pointer"
                    >
                      + Sumar dinero a esta meta
                    </button>
                  )}

                  {/* Project Time Button for this specific goal */}
                  {addingFundsGoalId !== meta.id && (
                    <button
                      onClick={() => {
                        setProjectorMetaId(meta.id);
                        setIsProjectorOpen(true);
                      }}
                      className="text-[11px] font-bold text-stone-600 hover:text-[#4A5A2E] flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-stone-200/70 hover:border-[#4A5A2E]/50 transition-all shadow-2xs"
                    >
                      <Clock className="w-3 h-3 text-[#4A5A2E]" />
                      <span>Proyectar cuánto tardarás →</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desafíos & Admin Management Card */}
      <div className="bg-white rounded-[24px] p-5 border border-stone-200/70 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎲</span>
            <div>
              <h3 className="text-sm font-bold text-[#2B2D26]">Desafíos & Juego de Mesa</h3>
              <p className="text-[11px] text-stone-500">
                {desafios.length} desafíos en banco • {historialDesafios.length} completados
              </p>
            </div>
          </div>
          {onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className="py-1.5 px-3 bg-[#4A5A2E] text-white text-xs font-bold rounded-xl hover:bg-[#3B4824] transition cursor-pointer"
            >
              Gestionar
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {onOpenQRModal && (
            <button
              onClick={onOpenQRModal}
              className="p-3 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 text-left transition cursor-pointer"
            >
              <Dice5 className="w-4 h-4 text-amber-600 mb-1" />
              <span className="text-xs font-bold text-amber-950 block">Casilla QR</span>
              <span className="text-[10px] text-amber-800">Ver código para el tablero</span>
            </button>
          )}

          <button
            onClick={toggleAdminMode}
            className="p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 text-left transition cursor-pointer"
          >
            {userProfile.isAdmin ? (
              <ToggleRight className="w-4 h-4 text-[#4A5A2E] mb-1" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-stone-400 mb-1" />
            )}
            <span className="text-xs font-bold text-[#2B2D26] block">
              {userProfile.isAdmin ? 'Admin: Activo' : 'Admin: Inactivo'}
            </span>
            <span className="text-[10px] text-stone-500">
              {userProfile.isAdmin ? 'Tenés permisos de edición' : 'Tocar para activar'}
            </span>
          </button>
        </div>
      </div>

      {/* PWA & System Options */}
      <div className="bg-white rounded-[24px] p-5 border border-stone-200/70 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#2B2D26]">App y Datos</h3>

        <div className="pt-1">
          <PWAInstallButton />
        </div>

        <button
          onClick={logout}
          className="w-full py-3 px-3.5 bg-rose-50 hover:bg-rose-100 active:scale-[0.98] text-rose-700 text-xs font-bold rounded-2xl border border-rose-200/70 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión / Ir a pantalla de login</span>
        </button>

        {!user && (
          <button
            onClick={async () => {
              if (confirm('¿Restablecer los datos de ejemplo del diseño original (Camila Ríos)?')) {
                await resetToDemoData();
              }
            }}
            className="w-full py-3 px-3.5 bg-stone-100 hover:bg-stone-200 active:scale-[0.98] text-stone-700 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer datos de ejemplo (Modo Demo)</span>
          </button>
        )}
      </div>
    </div>
  );
});

ProfileView.displayName = 'ProfileView';

