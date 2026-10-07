import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { HomeView } from './views/HomeView';
import { MovementsView } from './views/MovementsView';
import { ChallengesView } from './views/ChallengesView';
import { ProfileView } from './views/ProfileView';
import { LoginView } from './views/LoginView';
import { BottomNav } from './components/BottomNav';
import { MovementModal } from './components/MovementModal';
import { ChallengeModal } from './components/ChallengeModal';
import { QRGameModal } from './components/QRGameModal';
import { AdminChallengesModal } from './components/AdminChallengesModal';
import { AuthModal } from './components/AuthModal';
import { CategoryInsightsModal } from './components/CategoryInsightsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ToastContainer } from './components/ToastContainer';
import { AestheticLoader } from './components/AestheticLoader';
import { FinanceLogo } from './components/FinanceLogo';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { Movimiento, ActiveTab, Categoria, Desafio } from './types';
import { Home, Clock, Target, Menu, Plus, Dice5, Settings } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    loginAsDemoUser,
    toasts,
    dismissToast,
    movements,
    desafioDelDia,
    obtenerDesafioAleatorioQR,
  } = useFinance();

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementToEdit, setMovementToEdit] = useState<Movimiento | null>(null);
  const [initialCategoryForMovement, setInitialCategoryForMovement] = useState<string | undefined>(undefined);
  
  // Challenge Modals State
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [selectedDesafioForModal, setSelectedDesafioForModal] = useState<Desafio | null>(null);
  const [modalModo, setModalModo] = useState<'diario' | 'qr_juego' | 'personalizado' | 'explorar'>('diario');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedCategoryForInsights, setSelectedCategoryForInsights] = useState<Categoria | null>(null);
  const [isCategoryInsightsOpen, setIsCategoryInsightsOpen] = useState(false);

  // Lock background scrolling whenever any card or modal is open
  const isAnyModalOpen = Boolean(
    isMovementModalOpen ||
    isCategoryInsightsOpen ||
    isChallengeModalOpen ||
    isQRModalOpen ||
    isAdminModalOpen ||
    isAuthModalOpen
  );
  useBodyScrollLock(isAnyModalOpen);

  // Clean scroll to top on tab change without layout thrashing
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Clean any residual URL query parameter or hash on startup to prevent unwanted state or repeat triggers
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (
        searchParams.has('qr') ||
        searchParams.has('juego') ||
        searchParams.has('casilla') ||
        window.location.hash.includes('qr')
      ) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  const handleOpenChallenge = (
    desafio?: Desafio,
    modo: 'diario' | 'qr_juego' | 'personalizado' | 'explorar' = 'diario'
  ) => {
    setSelectedDesafioForModal(desafio || desafioDelDia);
    setModalModo(modo);
    setIsChallengeModalOpen(true);
  };

  const handleNextQRChallenge = () => {
    const nextRandom = obtenerDesafioAleatorioQR();
    setSelectedDesafioForModal(nextRandom);
  };

  const handleOpenAddMovement = () => {
    setMovementToEdit(null);
    setInitialCategoryForMovement(undefined);
    setIsMovementModalOpen(true);
  };

  const handleEditMovement = (mov: Movimiento) => {
    setMovementToEdit(mov);
    setInitialCategoryForMovement(undefined);
    setIsMovementModalOpen(true);
  };

  const handleOpenCategoryInsights = (cat: Categoria) => {
    setSelectedCategoryForInsights(cat);
    setIsCategoryInsightsOpen(true);
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loader-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <AestheticLoader
            message="Cargando tus finanzas..."
            submessage="Preparando presupuesto y desafíos de Ciudad Financiera"
          />
        </motion.div>
      ) : !isAuthenticated ? (
        <motion.div
          key="login-screen-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98, filter: 'blur(3px)' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full min-h-screen"
        >
          <LoginView />
        </motion.div>
      ) : (
        <motion.div
          key="app-main-layout"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen w-full bg-[#EEEDE4] flex justify-center text-[#2B2D26]"
        >
          {/* Desktop Sidebar (visible on large screens, cleanly positioned) */}
          <aside className="hidden xl:flex flex-col w-64 fixed left-10 top-8 bottom-8 bg-white/80 backdrop-blur-md rounded-[28px] p-6 border border-stone-200/70 shadow-xs z-30 justify-between">
            <div className="space-y-6">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3 px-2">
                <FinanceLogo size="sm" animated={false} />
                <div>
                  <h2 className="font-extrabold text-base tracking-tight text-[#2B2D26]">
                    Ciudad Financiera
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">Juego & Presupuesto</p>
                </div>
              </div>

              {/* User Profile Summary */}
              <button
                onClick={() => setActiveTab('perfil')}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#F5F2EB] hover:bg-[#EBE7DD] transition text-left cursor-pointer active:scale-98"
              >
                <div className="w-10 h-10 rounded-full bg-[#C5A566] text-[#2B2D26] font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                  {userProfile.avatarInitials || 'CR'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#2B2D26] truncate">
                    {userProfile.nombre}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    {user ? user.email : 'Usuario de Prueba (Demo)'}
                  </p>
                </div>
              </button>

              {/* Navigation Links */}
              <nav aria-label="Navegación principal de escritorio" className="space-y-1.5">
                {[
                  { id: 'inicio' as ActiveTab, label: 'Inicio', icon: Home },
                  { id: 'retos' as ActiveTab, label: 'Desafíos Financieros', icon: Target },
                  { id: 'movimientos' as ActiveTab, label: 'Movimientos', icon: Clock },
                  { id: 'perfil' as ActiveTab, label: 'Perfil y Metas', icon: Menu },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                        isActive
                          ? 'bg-[#4A5A2E] text-white shadow-sm ring-1 ring-[#4A5A2E]/30'
                          : 'text-stone-600 hover:bg-[#EBE7DD]/70 hover:text-stone-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Game Tile Tools */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    const randomD = obtenerDesafioAleatorioQR();
                    handleOpenChallenge(randomD, 'qr_juego');
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-stone-900 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Dice5 className="w-4 h-4 text-amber-700" />
                  <span>Casilla Juego QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-stone-500 hover:text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Gestor de Desafíos</span>
                </button>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <button
                onClick={handleOpenAddMovement}
                aria-label="Registrar nuevo movimiento"
                className="w-full py-3.5 bg-[#2B2D26] hover:bg-[#1A1C16] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-150 active:scale-[0.97] cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nuevo movimiento</span>
              </button>

              <div className="flex justify-center">
                <PWAInstallButton />
              </div>
            </div>
          </aside>

          {/* Main Container */}
          <main aria-label="Contenido principal" className="w-full max-w-md min-h-screen bg-[#EEEDE4] relative flex flex-col pb-20">
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="w-full"
                >
                  {activeTab === 'inicio' && (
                    <HomeView
                      onOpenChallenge={() => handleOpenChallenge(desafioDelDia, 'diario')}
                      onOpenMovementModal={handleOpenAddMovement}
                      onOpenAuthModal={() => setIsAuthModalOpen(true)}
                      onSelectCategory={handleOpenCategoryInsights}
                    />
                  )}

                  {activeTab === 'retos' && (
                    <ChallengesView
                      onOpenChallenge={handleOpenChallenge}
                      onOpenQRModal={() => setIsQRModalOpen(true)}
                      onOpenAdminModal={() => setIsAdminModalOpen(true)}
                    />
                  )}

                  {activeTab === 'movimientos' && (
                    <MovementsView
                      onOpenAddModal={handleOpenAddMovement}
                      onEditMovement={handleEditMovement}
                    />
                  )}

                  {activeTab === 'perfil' && (
                    <ProfileView
                      onOpenAuthModal={() => setIsAuthModalOpen(true)}
                      onSelectCategory={handleOpenCategoryInsights}
                      onOpenAdminModal={() => setIsAdminModalOpen(true)}
                      onOpenQRModal={() => setIsQRModalOpen(true)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile Fixed Bottom Navigation */}
            <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
          </main>

          {/* Global Toast Notification Layer */}
          <ToastContainer
            toasts={toasts}
            onDismiss={dismissToast}
            onViewCategory={(_catName) => {
              setActiveTab('inicio');
            }}
          />

          {/* Movement & Category Modals */}
          <MovementModal
            isOpen={isMovementModalOpen}
            onClose={() => {
              setIsMovementModalOpen(false);
              setMovementToEdit(null);
              setInitialCategoryForMovement(undefined);
            }}
            movementToEdit={movementToEdit}
            initialCategoryId={initialCategoryForMovement}
          />

          <CategoryInsightsModal
            isOpen={isCategoryInsightsOpen}
            onClose={() => {
              setIsCategoryInsightsOpen(false);
              setSelectedCategoryForInsights(null);
            }}
            category={selectedCategoryForInsights}
            movements={movements}
            moneda={userProfile.moneda}
            onAddMovementForCategory={(catId) => {
              setMovementToEdit(null);
              setInitialCategoryForMovement(catId);
              setIsMovementModalOpen(true);
            }}
          />

          {/* Interactive Challenge Modal (Central Pillar) */}
          <ChallengeModal
            isOpen={isChallengeModalOpen}
            onClose={() => setIsChallengeModalOpen(false)}
            desafio={selectedDesafioForModal}
            modo={modalModo}
            onNextQRChallenge={handleNextQRChallenge}
          />

          {/* QR Game Tile Modal */}
          <QRGameModal
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
            onLaunchRandomChallenge={() => {
              const randomD = obtenerDesafioAleatorioQR();
              handleOpenChallenge(randomD, 'qr_juego');
            }}
          />

          {/* Admin Challenges Modal */}
          <AdminChallengesModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
          />

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
