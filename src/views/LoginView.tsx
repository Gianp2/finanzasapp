import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { PantallaInicio } from '../components/PantallaInicio';
import { FinanceLogo } from '../components/FinanceLogo';
import {
  auth,
  loginWithGoogle,
  getFriendlyAuthErrorMessage,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateAuthProfile,
} from '../lib/firebase';
import {
  ArrowRight,
  LogIn,
  UserPlus,
  RefreshCw,
  Mail,
  Lock,
  User,
  ShieldCheck,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginAsDemoUser, updateProfile } = useFinance();
  const [showIntro, setShowIntro] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEnteringDemo, setIsEnteringDemo] = useState(false);

  // Quick 1-click test user login
  const handleDemoLogin = () => {
    setIsEnteringDemo(true);
    setTimeout(() => {
      loginAsDemoUser();
    }, 150);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      // onAuthStateChanged in FinanceContext immediately sets user, creates Firestore profile if new, and transitions to app
    } catch (err: unknown) {
      console.warn('Google login error:', err);
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
      setError('Por favor completá tu correo y contraseña.');
      return;
    }
    if (isRegister && !nombre.trim()) {
      setError('Por favor ingresá tu nombre para tu perfil.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener como mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const authRes = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (nombre.trim() && authRes.user) {
          try {
            await updateAuthProfile(authRes.user, { displayName: nombre.trim() });
          } catch (e) {
            // ignore
          }
        }
        if (nombre.trim()) {
          const initials = nombre
            .trim()
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          await updateProfile({
            nombre: nombre.trim(),
            email: cleanEmail,
            avatarInitials: initials,
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }
    } catch (err: unknown) {
      console.warn('Firebase email auth error:', err);
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <PantallaInicio
          key="pantalla-inicio"
          onComplete={() => setShowIntro(false)}
        />
      ) : (
        <motion.div
          key="login-screen-actual"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="h-[100dvh] max-h-[100dvh] w-full bg-[#EEEDE4] relative overflow-hidden flex flex-col justify-between px-3.5 sm:px-6 py-2.5 sm:py-4 select-none"
        >
          {/* Soft Ambient Background Glows */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#4A5A2E]/12 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-24 w-64 h-64 rounded-full bg-[#C5A566]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-[#4A5A2E]/10 blur-3xl pointer-events-none" />

          {/* Main Centered Box (Responsive Compact Layout that fits in 1 screen) */}
          <div className="relative z-10 w-full max-w-sm mx-auto flex-1 flex flex-col justify-center min-h-0 py-1">
            {/* 1. Header: Logo, Tag, Title and Short Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-2 shrink-0 flex flex-col items-center"
            >
              {/* Logo */}
              <div className="mb-1">
                <FinanceLogo size="sm" animated={true} />
              </div>

              {/* Tag Pill */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-[#4A5A2E] bg-[#4A5A2E]/10 border border-[#4A5A2E]/20 mb-1">
                Ciudad Financiera
              </span>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2B2D26] tracking-tight leading-none">
                Finanzas Personales
              </h1>
              <p className="text-stone-600 text-[11px] sm:text-xs mt-0.5 max-w-xs mx-auto font-medium leading-tight">
                Control de gastos, presupuesto consciente y retos diarios
              </p>
            </motion.div>

            {/* 2. Compact 3-Pillar Feature Strip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-3 gap-1 py-1 px-2 bg-white/75 backdrop-blur-xs rounded-xl border border-white/80 shadow-2xs mb-2 text-center shrink-0"
            >
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#2B2D26]">
                <span className="text-xs">📊</span>
                <span className="truncate">Presupuesto</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#2B2D26] border-x border-stone-200">
                <span className="text-xs">🎯</span>
                <span className="truncate">Retos 24h</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#2B2D26]">
                <span className="text-xs">🔒</span>
                <span className="truncate">Privacidad</span>
              </div>
            </motion.div>

            {/* 3. Main Form & Access Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="w-full bg-white/85 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-2 shrink-0"
            >
              {/* Tabs Switcher: Iniciar Sesión / Crear Cuenta */}
              <div className="flex bg-[#F5F2EB] p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError('');
                  }}
                  className={`flex-1 py-1 rounded-lg transition ${
                    !isRegister
                      ? 'bg-white text-[#2B2D26] shadow-2xs'
                      : 'text-stone-500 hover:text-[#2B2D26]'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError('');
                  }}
                  className={`flex-1 py-1 rounded-lg transition ${
                    isRegister
                      ? 'bg-white text-[#2B2D26] shadow-2xs'
                      : 'text-stone-500 hover:text-[#2B2D26]'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg font-medium leading-tight">
                  {error}
                </p>
              )}

              {/* Email/Password Fields & Submit Button */}
              <form onSubmit={handleEmailAuth} className="space-y-1.5">
                {isRegister && (
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre completo"
                      autoComplete="name"
                      aria-label="Tu nombre completo"
                      className="w-full h-8.5 bg-[#F5F2EB] border border-stone-200 rounded-lg pl-8 pr-2.5 text-xs text-[#2B2D26] focus:outline-none focus:ring-1.5 focus:ring-[#4A5A2E]/40"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    autoComplete="email"
                    aria-label="Correo electrónico"
                    className="w-full h-8.5 bg-[#F5F2EB] border border-stone-200 rounded-lg pl-8 pr-2.5 text-xs text-[#2B2D26] focus:outline-none focus:ring-1.5 focus:ring-[#4A5A2E]/40"
                  />
                </div>

                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña (mínimo 6)"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    aria-label="Contraseña"
                    className="w-full h-8.5 bg-[#F5F2EB] border border-stone-200 rounded-lg pl-8 pr-2.5 text-xs text-[#2B2D26] focus:outline-none focus:ring-1.5 focus:ring-[#4A5A2E]/40"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 bg-[#4A5A2E] hover:bg-[#3B4824] active:bg-[#2F3A1D] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white/90" />
                  ) : isRegister ? (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Registrarme y acceder</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Ingresar con correo</span>
                    </>
                  )}
                </button>
              </form>

              {/* Clean Divider */}
              <div className="relative flex items-center justify-center py-0.5">
                <div className="border-t border-stone-200 w-full" />
                <span className="bg-white px-2 text-[9px] text-stone-400 font-bold uppercase tracking-wider relative shrink-0">
                  o también
                </span>
              </div>

              {/* Alternative Fast Access: Google & Demo */}
              <div className="space-y-1.5">
                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || isEnteringDemo}
                  className="w-full h-9 bg-white hover:bg-stone-50 active:bg-stone-100 text-[#2B2D26] text-xs font-bold rounded-xl border border-stone-300 shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

                {/* Demo User 1-Click Access Card */}
                <div
                  onClick={handleDemoLogin}
                  className="w-full h-9.5 bg-[#E2E7D5] hover:bg-[#D9DFC9] active:bg-[#D1D8C0] rounded-xl px-2.5 border border-[#D0D9BF] shadow-2xs flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#4A5A2E] text-white flex items-center justify-center font-extrabold text-[10px] shrink-0 shadow-2xs">
                      CR
                    </div>
                    <div className="min-w-0 truncate text-left">
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="text-[11px] font-extrabold text-[#2B2D26] truncate">
                          Modo Demo (Camila Ríos)
                        </span>
                        <span className="px-1 py-0.2 bg-[#4A5A2E] text-white text-[8px] font-bold rounded-sm uppercase">
                          1 Clic
                        </span>
                      </div>
                      <span className="text-[9px] text-stone-600 font-medium truncate block mt-0.5">
                        Explorá con datos ya cargados
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 text-[#4A5A2E] font-bold text-xs pl-1">
                    {isEnteringDemo ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4A5A2E]" />
                    ) : (
                      <>
                        <span className="text-[11px]">Entrar</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 4. Footer Branding & Author Credit (Ultra-compact, clean) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative z-10 text-center pb-1 pt-1 shrink-0 space-y-0.5"
          >
            <div>
              <a
                href="https://instagram.com/gian_pasquinelli"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#2B2D26] hover:text-[#4A5A2E] bg-white/75 hover:bg-white border border-stone-300/80 shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <span>Desarrollado por Pasquinelli G.</span>
                <span className="text-[9px] text-stone-400">↗</span>
              </a>
            </div>
            <p className="text-[9px] text-stone-500 font-medium flex items-center justify-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-[#4A5A2E]" />
              <span>Privacidad garantizada · Conexión segura Firebase</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
