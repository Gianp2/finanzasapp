import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  auth,
  loginWithGoogle,
  getFriendlyAuthErrorMessage,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateAuthProfile,
} from '../lib/firebase';
import { X, LogIn, UserPlus, LogOut, CheckCircle, Shield, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, updateProfile, logout } = useFinance();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Lock background scroll when auth modal is open
  useBodyScrollLock(isOpen);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Por favor completá todos los campos.');
      return;
    }
    if (isRegister && !displayName.trim()) {
      setError('Por favor ingresá tu nombre para tu perfil.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const authRes = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (displayName.trim() && authRes.user) {
          try {
            await updateAuthProfile(authRes.user, { displayName: displayName.trim() });
          } catch (e) {
            // ignore
          }
        }
        if (displayName.trim()) {
          await updateProfile({
            nombre: displayName.trim(),
            avatarInitials: displayName
              .trim()
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-contain">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative z-10 w-full max-w-sm bg-white rounded-[28px] shadow-2xl overflow-hidden border border-stone-200"
          >
            {/* Header */}
            <div className="bg-[#4A5A2E] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#E2E7D5]" />
                <h3 className="font-bold text-base sm:text-lg">
                  {user ? 'Tu Cuenta' : isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        <div className="p-6">
          {user ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#C5A566] text-[#2B2D26] font-bold text-xl flex items-center justify-center mx-auto shadow-md">
                {userProfile.avatarInitials || 'CR'}
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#2B2D26]">
                  {userProfile.nombre}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-center gap-1.5 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Datos sincronizados con Firebase Firestore</span>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Iniciá sesión para guardar tus movimientos y retos en la nube de forma segura.
              </p>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl font-bold text-xs sm:text-sm text-[#2B2D26] shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-stone-200" />
                <span className="text-[11px] font-semibold text-stone-400 uppercase">o con email</span>
                <div className="flex-1 h-[1px] bg-stone-200" />
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                  {error}
                </p>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {isRegister && (
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ej. Camila Ríos"
                      className="w-full bg-[#F5F2EB] border border-stone-200/70 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2B2D26] focus:outline-none focus:ring-2 focus:ring-[#4A5A2E]/30"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-[#F5F2EB] border border-stone-200/70 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2B2D26] focus:outline-none focus:ring-2 focus:ring-[#4A5A2E]/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[#F5F2EB] border border-stone-200/70 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2B2D26] focus:outline-none focus:ring-2 focus:ring-[#4A5A2E]/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#2B2D26] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white/80" />
                      <span>Procesando...</span>
                    </>
                  ) : isRegister ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Crear cuenta</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Ingresar</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-[#4A5A2E] font-bold hover:underline cursor-pointer"
                >
                  {isRegister
                    ? '¿Ya tenés cuenta? Iniciá sesión'
                    : '¿No tenés cuenta? Registrate gratis'}
                </button>
              </div>
            </div>
          )}
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
