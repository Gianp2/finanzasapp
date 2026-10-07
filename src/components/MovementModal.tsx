import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Movimiento, TransactionType } from '../types';
import { X, Calendar, Tag, FileText, Repeat, RefreshCw } from 'lucide-react';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  movementToEdit?: Movimiento | null;
  initialCategoryId?: string;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  movementToEdit,
  initialCategoryId,
}) => {
  const { categories, addMovement, updateMovement, userProfile } = useFinance();

  const [tipo, setTipo] = useState<TransactionType>('gasto');
  const [monto, setMonto] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [nota, setNota] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [recurrente, setRecurrente] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Lock background scroll when modal card is open
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (movementToEdit) {
      setTipo(movementToEdit.tipo);
      setMonto(movementToEdit.monto.toString());
      setCategoriaId(movementToEdit.categoriaId);
      setNota(movementToEdit.nota);
      setFecha(new Date(movementToEdit.fecha).toISOString().slice(0, 10));
      setRecurrente(movementToEdit.recurrente);
    } else {
      setTipo('gasto');
      setMonto('');
      setCategoriaId(initialCategoryId || categories[0]?.id || '');
      setNota('');
      setFecha(new Date().toISOString().slice(0, 10));
      setRecurrente(false);
    }
    setError('');
  }, [movementToEdit, initialCategoryId, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numMonto = parseFloat(monto);

    if (isNaN(numMonto) || numMonto <= 0) {
      setError('Por favor ingresá un monto válido mayor a 0');
      return;
    }
    if (!nota.trim()) {
      setError('Por favor escribí una descripción o comercio');
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoriaId);
    const catNombre = tipo === 'ingreso' ? 'Ingreso' : selectedCat?.nombre || 'General';

    setIsSubmitting(true);
    try {
      if (movementToEdit) {
        await updateMovement(movementToEdit.id, {
          tipo,
          monto: numMonto,
          categoriaId: tipo === 'ingreso' ? 'ingreso' : categoriaId,
          categoriaNombre: catNombre,
          fecha: new Date(fecha).toISOString(),
          nota: nota.trim(),
          recurrente,
        });
      } else {
        await addMovement({
          tipo,
          monto: numMonto,
          categoriaId: tipo === 'ingreso' ? 'ingreso' : categoriaId,
          categoriaNombre: catNombre,
          fecha: new Date(fecha).toISOString(),
          nota: nota.trim(),
          recurrente,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar el movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative z-10 w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden border border-stone-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h2 className="text-lg font-bold text-[#2B2D26]">
                {movementToEdit ? 'Editar movimiento' : 'Nuevo movimiento'}
              </h2>
              <button
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Tipo Selector (Gasto / Ingreso) */}
          <div className="grid grid-cols-2 gap-2 bg-[#F3EFE6] p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setTipo('gasto')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                tipo === 'gasto'
                  ? 'bg-white text-[#A85D4A] shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setTipo('ingreso')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                tipo === 'ingreso'
                  ? 'bg-white text-[#4A5A2E] shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Amount input */}
          <div className="text-center py-2">
            <label className="text-xs font-semibold text-stone-500 block mb-1">
              Monto
            </label>
            <div className="flex items-center justify-center">
              <span className="text-3xl font-extrabold text-[#2B2D26] mr-1">
                {userProfile.moneda}
              </span>
              <input
                type="number"
                step="any"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-48 text-3xl font-extrabold text-[#2B2D26] placeholder:text-stone-300 focus:outline-none text-center bg-transparent"
              />
            </div>
          </div>

          {/* Error alert */}
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
              {error}
            </p>
          )}

          {/* Category selection (only for Gasto) */}
          {tipo === 'gasto' && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#2B2D26] mb-1.5">
                <Tag className="w-3.5 h-3.5 text-[#4A5A2E]" />
                Categoría
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full bg-[#F5F2EB] border border-stone-200/70 rounded-xl px-3.5 py-2.5 text-sm text-[#2B2D26] font-medium focus:outline-none focus:ring-2 focus:ring-[#4A5A2E]/30"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre} (Límite: {userProfile.moneda}{cat.limiteMensual})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Note / Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#2B2D26] mb-1.5">
              <FileText className="w-3.5 h-3.5 text-[#4A5A2E]" />
              Descripción o comercio
            </label>
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej. Supermercado, Farmacia, Cena..."
              className="w-full bg-[#F5F2EB] border border-stone-200/70 rounded-xl px-3.5 py-2.5 text-sm text-[#2B2D26] focus:outline-none focus:ring-2 focus:ring-[#4A5A2E]/30"
            />
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#2B2D26] mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#4A5A2E]" />
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-[#F5F2EB] border border-stone-200/70 rounded-xl px-3.5 py-2.5 text-sm text-[#2B2D26] focus:outline-none focus:ring-2 focus:ring-[#4A5A2E]/30"
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between py-2 px-1">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#4A5A2E]" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#2B2D26]">¿Es recurrente?</p>
                <p className="text-[11px] text-stone-500">Se repite todos los meses</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRecurrente(!recurrente)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                recurrente ? 'bg-[#4A5A2E]' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  recurrente ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs sm:text-sm font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 text-xs sm:text-sm font-bold text-white bg-[#2B2D26] hover:bg-black rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-300" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{movementToEdit ? 'Actualizar' : 'Guardar'}</span>
              )}
            </button>
          </div>
        </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
