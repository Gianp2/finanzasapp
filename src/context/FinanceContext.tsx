import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  UserProfile,
  Categoria,
  Movimiento,
  Meta,
  Reto,
  TipGasto,
  ToastNotification,
  ActiveTab,
  Desafio,
  HistorialDesafio,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_CATEGORIES,
  INITIAL_MOVEMENTS,
  INITIAL_METAS,
  INITIAL_CHALLENGES,
} from '../lib/mockData';
import {
  INITIAL_DESAFIOS,
  seleccionarDesafioQR,
  seleccionarDesafioDiarioUnico,
  getTiempoRestanteProximoDesafio,
  generarDesafioPersonalizado,
} from '../lib/challengesData';
import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  User,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  deleteDoc,
} from 'firebase/firestore';

interface FinanceContextType {
  user: User | null;
  userProfile: UserProfile;
  categories: Categoria[];
  movements: Movimiento[];
  metas: Meta[];
  retos: Reto[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  isAuthenticated: boolean;
  isDemoUser: boolean;
  isOnline: boolean;
  isMovementsSynced: boolean;
  isSyncing: boolean;
  setIsAuthenticated: (val: boolean) => void;
  loginAsDemoUser: () => void;
  logout: () => Promise<void>;
  
  // Computed values
  totalIngresosMes: number;
  totalGastosMes: number;
  disponibleMes: number;
  diaActual: number;
  totalDiasMes: number;
  gastadoPorCategoria: (catId: string) => number;
  porcentajePorCategoria: (catId: string) => number;
  tips: TipGasto[];
  toasts: ToastNotification[];

  // Desafíos Financieros
  desafios: Desafio[];
  historialDesafios: HistorialDesafio[];
  desafioDelDia: Desafio;
  desafioDelDiaCompletado: boolean;
  tiempoRestanteProximoDesafio: { horas: number; minutos: number; formatted: string };
  desafioPersonalizado: Desafio | null;
  obtenerDesafioAleatorioQR: () => Desafio;
  responderDesafio: (
    desafio: Desafio,
    opcionId: string,
    origen: 'diario' | 'qr_juego' | 'personalizado' | 'explorar'
  ) => Promise<HistorialDesafio>;

  // Admin Desafíos
  addDesafio: (desafio: Omit<Desafio, 'id'>) => Promise<void>;
  updateDesafio: (id: string, desafio: Partial<Desafio>) => Promise<void>;
  toggleDesafioActivo: (id: string) => Promise<void>;
  deleteDesafio: (id: string) => Promise<void>;
  seedDesafiosDefault: () => Promise<void>;
  actualizarMontosPorInflacion: (porcentaje: number) => Promise<void>;
  toggleAdminMode: () => Promise<void>;

  // Actions
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  dismissToast: (id: string) => void;
  addMovement: (movement: Omit<Movimiento, 'id' | 'createdAt'>) => Promise<void>;
  updateMovement: (id: string, movement: Partial<Movimiento>) => Promise<void>;
  deleteMovement: (id: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addCategory: (category: Omit<Categoria, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Categoria>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addMeta: (meta: Omit<Meta, 'id'>) => Promise<void>;
  addFundsToMeta: (metaId: string, amount: number) => Promise<void>;
  completeChallenge: (challengeId: string, decision: 'A' | 'B') => Promise<void>;
  resetToDemoData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_PROFILE: 'finanzas_user_profile',
  CATEGORIES: 'finanzas_categories',
  MOVEMENTS: 'finanzas_movements',
  METAS: 'finanzas_metas',
  RETOS: 'finanzas_retos',
  DESAFIOS: 'finanzas_desafios',
  HISTORIAL_DESAFIOS: 'finanzas_historial_desafios',
  SESSION_ACTIVE: 'finanzas_session_active',
  IS_DEMO: 'finanzas_is_demo',
  LAST_USER_ID: 'finanzas_last_user_id',
};

// Helper to guarantee items have unique IDs across lists and prevent duplicate keys
export function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

// Default standard categories for real new users
export const DEFAULT_USER_CATEGORIES: Categoria[] = [
  { id: 'cat-comida', nombre: 'Alimentos y Supermercado', limiteMensual: 180000, icono: 'shopping-cart' },
  { id: 'cat-transporte', nombre: 'Transporte y Combustible', limiteMensual: 60000, icono: 'car' },
  { id: 'cat-servicios', nombre: 'Servicios e Impuestos', limiteMensual: 75000, icono: 'home' },
  { id: 'cat-entretenimiento', nombre: 'Salidas y Ocio', limiteMensual: 50000, icono: 'coffee' },
  { id: 'cat-salud', nombre: 'Salud y Farmacia', limiteMensual: 35000, icono: 'heart' },
  { id: 'cat-otros', nombre: 'Gastos Varios', limiteMensual: 50000, icono: 'tag' },
];

// Helper to safely load movements from localStorage
function getInitialMovements(): Movimiento[] {
  if (typeof window === 'undefined') return [];
  try {
    const isDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
    if (isDemo) return deduplicateById(INITIAL_MOVEMENTS);
    const lastUid = localStorage.getItem(STORAGE_KEYS.LAST_USER_ID);
    if (lastUid) {
      const userCached = localStorage.getItem(`${STORAGE_KEYS.MOVEMENTS}_${lastUid}`);
      if (userCached) {
        const parsed = JSON.parse(userCached);
        if (Array.isArray(parsed)) return deduplicateById(parsed);
      }
      return [];
    }
  } catch (e) {
    console.warn('Error reading cached movements from localStorage:', e);
  }
  return [];
}

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const demo = localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
      if (demo) {
        return false;
      }
    }
    return true;
  });
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isMovementsSynced, setIsMovementsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [activeTab, setActiveTabRaw] = useState<ActiveTab>('inicio');

  const setActiveTab = useCallback((tab: ActiveTab) => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    setActiveTabRaw(tab);
  }, []);

  // Authentication & Demo User tracking
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
      if (isDemo) return true;
      const session = localStorage.getItem(STORAGE_KEYS.SESSION_ACTIVE);
      return session === 'true';
    }
    return false;
  });

  const [isDemoUser, setIsDemoUser] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
    }
    return false;
  });

  // App state with fallback to localStorage / mock data
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [categories, setCategories] = useState<Categoria[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? deduplicateById(JSON.parse(saved)) : deduplicateById(INITIAL_CATEGORIES);
  });

  const [movements, setMovements] = useState<Movimiento[]>(getInitialMovements);

  const [metas, setMetas] = useState<Meta[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.METAS);
    return saved ? deduplicateById(JSON.parse(saved)) : deduplicateById(INITIAL_METAS);
  });

  const [retos, setRetos] = useState<Reto[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RETOS);
    return saved ? deduplicateById(JSON.parse(saved)) : deduplicateById(INITIAL_CHALLENGES);
  });

  const [desafios, setDesafios] = useState<Desafio[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DESAFIOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return deduplicateById(parsed);
      }
    } catch (e) {
      console.warn('Error reading desafios from localStorage:', e);
    }
    return deduplicateById(INITIAL_DESAFIOS);
  });

  const [historialDesafios, setHistorialDesafios] = useState<HistorialDesafio[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORIAL_DESAFIOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed);
      }
    } catch (e) {
      console.warn('Error reading historialDesafios from localStorage:', e);
    }
    return [];
  });

  // Persist Desafios & Historial
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DESAFIOS, JSON.stringify(desafios));
    } catch (e) {
      console.warn(e);
    }
  }, [desafios]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORIAL_DESAFIOS, JSON.stringify(historialDesafios));
    } catch (e) {
      console.warn(e);
    }
  }, [historialDesafios]);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (toastData: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastNotification = { ...toastData, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 6.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Local persistence for movements: persist whenever movements change!
  // This guarantees that offline users can immediately see all their past transactions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
      if (user) {
        localStorage.setItem(`${STORAGE_KEYS.MOVEMENTS}_${user.uid}`, JSON.stringify(movements));
        localStorage.setItem(STORAGE_KEYS.LAST_USER_ID, user.uid);
      }
    } catch (err) {
      console.warn('Could not save movements to localStorage:', err);
    }
  }, [movements, user]);

  // Save demo state locally only when in demo mode
  useEffect(() => {
    if (!user && isDemoUser) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
    }
  }, [userProfile, user, isDemoUser]);

  useEffect(() => {
    if (!user && isDemoUser) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
  }, [categories, user, isDemoUser]);

  useEffect(() => {
    if (!user && isDemoUser) {
      localStorage.setItem(STORAGE_KEYS.METAS, JSON.stringify(metas));
    }
  }, [metas, user, isDemoUser]);

  useEffect(() => {
    if (!user && isDemoUser) {
      localStorage.setItem(STORAGE_KEYS.RETOS, JSON.stringify(retos));
    }
  }, [retos, user, isDemoUser]);

  // Test Firestore Connection once at mount
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // Listen to Auth state
  useEffect(() => {
    // Safety timeout so UI never hangs waiting for network auth check
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(safetyTimer);
      setIsLoading(false);

      if (currentUser) {
        const uid = currentUser.uid;
        setUser(currentUser);
        setIsAuthenticated(true);
        setIsDemoUser(false);
        localStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, 'true');
        localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
        localStorage.setItem(STORAGE_KEYS.LAST_USER_ID, uid);

        // Preload any cached movements for this specific user from localStorage immediately
        try {
          const cachedMovementsStr = localStorage.getItem(`${STORAGE_KEYS.MOVEMENTS}_${uid}`);
          if (cachedMovementsStr) {
            const cachedList: Movimiento[] = JSON.parse(cachedMovementsStr);
            if (Array.isArray(cachedList)) {
              setMovements(deduplicateById(cachedList));
            }
          } else {
            setMovements([]);
          }
        } catch (e) {
          console.warn('Failed to read cached user movements:', e);
        }

        const userDocRef = doc(db, 'users', uid);

        try {
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
            // Seed initial data for a brand NEW real Firebase user with their real details
            const userName = currentUser.displayName?.trim() || currentUser.email?.split('@')[0] || 'Mi Usuario';
            const initials = userName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            const initialData: UserProfile = {
              nombre: userName,
              email: currentUser.email || '',
              presupuestoMensual: 450000,
              moneda: '$',
              rachaRetos: 0,
              totalDesafiosCompletados: 0,
              avatarInitials: initials || 'U',
            };
            await setDoc(userDocRef, initialData);
            setUserProfile(initialData);

            // Populate initial standard categories for this new user
            for (const cat of DEFAULT_USER_CATEGORIES) {
              await setDoc(doc(db, 'users', uid, 'categorias', cat.id), cat);
            }
            setCategories(DEFAULT_USER_CATEGORIES);

            // Populate starter emergency goal
            const starterMeta: Meta = {
              id: 'meta-emergencia',
              nombre: 'Fondo de Emergencia',
              objetivo: 350000,
              ahorrado: 0,
              icono: 'shield',
            };
            await setDoc(doc(db, 'users', uid, 'metas', starterMeta.id), starterMeta);
            setMetas([starterMeta]);

            // Real new user starts with 0 mock movements and 0 completed challenges
            setMovements([]);
            setHistorialDesafios([]);
          } else {
            setUserProfile(userDocSnap.data() as UserProfile);
          }
        } catch (error) {
          console.error('Error seeding/reading user doc:', error);
        }

        // Subscriptions
        const unsubProfile = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            }
          },
          (error) => console.warn(`Firestore users/${uid} onSnapshot error:`, error)
        );

        const unsubCategories = onSnapshot(
          collection(db, 'users', uid, 'categorias'),
          (snap) => {
            const list: Categoria[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Categoria, 'id'>) }));
            if (list.length > 0) {
              setCategories(deduplicateById(list));
            } else {
              setCategories(DEFAULT_USER_CATEGORIES);
            }
          },
          (error) => console.warn(`Firestore users/${uid}/categorias onSnapshot error:`, error)
        );

        const unsubMovements = onSnapshot(
          collection(db, 'users', uid, 'movimientos'),
          (snap) => {
            const list: Movimiento[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Movimiento, 'id'>) }));
            list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            setMovements(deduplicateById(list));
            setIsMovementsSynced(true);
            try {
              localStorage.setItem(`${STORAGE_KEYS.MOVEMENTS}_${uid}`, JSON.stringify(list));
            } catch (e) {
              console.warn('Could not persist movements cache:', e);
            }
          },
          (error) => {
            console.warn('Firestore movements onSnapshot error (likely offline):', error);
          }
        );

        const unsubMetas = onSnapshot(
          collection(db, 'users', uid, 'metas'),
          (snap) => {
            const list: Meta[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Meta, 'id'>) }));
            setMetas(deduplicateById(list));
          },
          (error) => console.warn(`Firestore users/${uid}/metas onSnapshot error:`, error)
        );

        const unsubHistorial = onSnapshot(
          collection(db, 'users', uid, 'historial_desafios'),
          (snap) => {
            const list: HistorialDesafio[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<HistorialDesafio, 'id'>) }));
            list.sort((a, b) => new Date(b.fechaCompletado).getTime() - new Date(a.fechaCompletado).getTime());
            setHistorialDesafios(deduplicateById(list));
          },
          (error) => console.warn('Firestore historial_desafios onSnapshot error:', error)
        );

        const unsubDesafios = onSnapshot(
          collection(db, 'desafios'),
          (snap) => {
            const list: Desafio[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Desafio, 'id'>) }));
            if (list.length > 0) {
              setDesafios(deduplicateById(list));
            } else if (currentUser) {
              // Auto-sembrar los desafíos educativos en Firestore si la colección está vacía
              for (const d of INITIAL_DESAFIOS) {
                setDoc(doc(db, 'desafios', d.id), d).catch((e) => console.warn('Auto-seed desafio error:', e));
              }
            }
          },
          (error) => console.warn('Firestore desafios onSnapshot error:', error)
        );

        return () => {
          unsubProfile();
          unsubCategories();
          unsubMovements();
          unsubMetas();
          unsubHistorial();
          unsubDesafios();
        };
      } else {
        // No authenticated Firebase user
        setUser(null);
        const isDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
        if (!isDemo) {
          setIsAuthenticated(false);
          setIsDemoUser(false);
          setMovements([]);
          setHistorialDesafios([]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Time calculations
  const diaActual = 15; // Set to 15 to match the exact mockup "día 15 de 30" (or fallback to current day)
  const totalDiasMes = 30;

  // Month totals
  const { totalIngresosMes, totalGastosMes } = useMemo(() => {
    let ingresos = 0;
    let gastos = 0;

    movements.forEach((mov) => {
      if (mov.tipo === 'ingreso') {
        ingresos += mov.monto;
      } else {
        gastos += mov.monto;
      }
    });

    return {
      totalIngresosMes: ingresos,
      totalGastosMes: gastos,
    };
  }, [movements]);

  // Disponible este mes = ingresos - gastos
  const disponibleMes = useMemo(() => {
    return totalIngresosMes - totalGastosMes;
  }, [totalIngresosMes, totalGastosMes]);

  // Precomputed category spent map for instant O(1) lookups
  const categorySpentMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (let i = 0; i < movements.length; i++) {
      const m = movements[i];
      if (m.tipo === 'gasto' && m.categoriaId) {
        map[m.categoriaId] = (map[m.categoriaId] || 0) + m.monto;
      }
    }
    return map;
  }, [movements]);

  const gastadoPorCategoria = useCallback((catId: string): number => {
    return categorySpentMap[catId] || 0;
  }, [categorySpentMap]);

  const porcentajePorCategoria = useCallback((catId: string): number => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat || cat.limiteMensual <= 0) return 0;
    const gastado = categorySpentMap[catId] || 0;
    return Math.round((gastado / cat.limiteMensual) * 100);
  }, [categories, categorySpentMap]);

  // Rule-based Tips Generator matching mockup
  const tips = useMemo((): TipGasto[] => {
    const list: TipGasto[] = [];

    // Find category nearing limit (>= 90%)
    const highCat = categories.find((c) => {
      const pct = porcentajePorCategoria(c.id);
      return pct >= 90 && pct < 100;
    });

    if (highCat) {
      const pct = porcentajePorCategoria(highCat.id);
      list.push({
        id: 'tip-cat-high',
        icono: 'bulb',
        titulo: `${highCat.nombre} al límite`,
        texto: `Vas en ${pct}% de tu presupuesto de ${highCat.nombre.toLowerCase()}. Si esta semana salís, considerá opciones gratuitas o de bajo costo.`,
        tipo: 'warning',
      });
    } else {
      list.push({
        id: 'tip-cat-default',
        icono: 'bulb',
        titulo: 'Entretenimiento al límite',
        texto: 'Vas en 90% de tu presupuesto de entretenimiento. Si esta semana salís, considerá opciones gratuitas o de bajo costo.',
        tipo: 'warning',
      });
    }

    // Good pace in food / essential category (~80% at day 15)
    const foodCat = categories.find((c) => c.nombre.toLowerCase().includes('comida'));
    if (foodCat) {
      const pct = porcentajePorCategoria(foodCat.id);
      list.push({
        id: 'tip-food',
        icono: 'chart',
        titulo: `Buen ritmo en ${foodCat.nombre.toLowerCase()}`,
        texto: `Llevás gastado el ${pct}% del presupuesto de ${foodCat.nombre.toLowerCase()} con ${totalDiasMes - diaActual} días por delante. Cociná en casa 2 veces esta semana para no pasarte.`,
        tipo: 'info',
      });
    }

    // Savings opportunity based on available funds
    const primaryMeta = metas[0];
    const ahorroSugerido = Math.round(disponibleMes * 0.2);
    if (disponibleMes > 0 && primaryMeta) {
      list.push({
        id: 'tip-savings',
        icono: 'piggy',
        titulo: 'Oportunidad de ahorro',
        texto: `Te quedan $${disponibleMes.toLocaleString('es-AR')} disponibles. Guardar solo el 20% este mes te acercaría $${ahorroSugerido.toLocaleString('es-AR')} a tu meta de ${primaryMeta.nombre.toLowerCase().replace('viaje a', '').trim() || 'viaje'}.`,
        tipo: 'success',
      });
    }

    return list;
  }, [categories, movements, disponibleMes, metas, diaActual, totalDiasMes]);

  // Actions
  const addMovement = async (movData: Omit<Movimiento, 'id' | 'createdAt'>) => {
    const newId = `mov-${Date.now()}`;
    const newMov: Movimiento = {
      ...movData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    // Alerta (Toast) si el gasto nuevo hace que la categoría supere el 95% de su límite presupuestario
    if (movData.tipo === 'gasto' && movData.categoriaId) {
      const cat = categories.find((c) => c.id === movData.categoriaId);
      if (cat && cat.limiteMensual > 0) {
        const currentSpent = gastadoPorCategoria(cat.id);
        const newSpent = currentSpent + movData.monto;
        const newPercent = Math.round((newSpent / cat.limiteMensual) * 100);

        if (newPercent >= 95) {
          addToast({
            tipo: 'danger',
            titulo: `¡${cat.nombre} superó el 95% del límite!`,
            mensaje: `Con este gasto de $${movData.monto.toLocaleString('es-AR')}, alcanzaste el ${newPercent}% ($${newSpent.toLocaleString('es-AR')} de $${cat.limiteMensual.toLocaleString('es-AR')}). ¡Ajustá tus próximos gastos para no excederte!`,
            categoriaNombre: cat.nombre,
            porcentaje: newPercent,
            gastado: newSpent,
            limite: cat.limiteMensual,
          });
        }
      }
    }

    // Optimistic local update & instant localStorage persistence
    setMovements((prev) => {
      const next = [newMov, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(next));
        if (user) {
          localStorage.setItem(`${STORAGE_KEYS.MOVEMENTS}_${user.uid}`, JSON.stringify(next));
        }
      } catch (err) {
        console.warn('Error saving movement to localStorage:', err);
      }
      return next;
    });

    if (user) {
      setIsSyncing(true);
      // Non-blocking background sync
      setDoc(doc(db, 'users', user.uid, 'movimientos', newId), newMov)
        .then(() => {
          setIsMovementsSynced(true);
        })
        .catch((error) => {
          console.warn('Firestore write error (offline or network):', error);
          addToast({
            tipo: 'info',
            titulo: 'Guardado en tu dispositivo',
            mensaje: 'Tu movimiento se guardó localmente. Lo verás siempre, incluso sin conexión.',
          });
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  };

  const updateMovement = async (id: string, updated: Partial<Movimiento>) => {
    // Verificar si la edición del movimiento hace que la categoría alcance o supere el 95%
    const existingMov = movements.find((m) => m.id === id);
    if (existingMov) {
      const finalTipo = updated.tipo !== undefined ? updated.tipo : existingMov.tipo;
      const finalCatId = updated.categoriaId !== undefined ? updated.categoriaId : existingMov.categoriaId;
      const finalMonto = updated.monto !== undefined ? updated.monto : existingMov.monto;

      if (finalTipo === 'gasto' && finalCatId) {
        const cat = categories.find((c) => c.id === finalCatId);
        if (cat && cat.limiteMensual > 0) {
          const otherSpent = movements
            .filter((m) => m.id !== id && m.tipo === 'gasto' && m.categoriaId === finalCatId)
            .reduce((sum, m) => sum + m.monto, 0);
          const newSpent = otherSpent + finalMonto;
          const newPercent = Math.round((newSpent / cat.limiteMensual) * 100);

          if (newPercent >= 95) {
            addToast({
              tipo: 'danger',
              titulo: `¡${cat.nombre} superó el 95% del límite!`,
              mensaje: `Al actualizar este movimiento, alcanzaste el ${newPercent}% ($${newSpent.toLocaleString('es-AR')} de $${cat.limiteMensual.toLocaleString('es-AR')}).`,
              categoriaNombre: cat.nombre,
              porcentaje: newPercent,
              gastado: newSpent,
              limite: cat.limiteMensual,
            });
          }
        }
      }
    }

    // Optimistic local update & instant localStorage persistence
    setMovements((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...updated } : m));
      try {
        localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(next));
        if (user) {
          localStorage.setItem(`${STORAGE_KEYS.MOVEMENTS}_${user.uid}`, JSON.stringify(next));
        }
      } catch (err) {
        console.warn('Error updating localStorage:', err);
      }
      return next;
    });

    if (user) {
      setIsSyncing(true);
      // Non-blocking background sync
      setDoc(doc(db, 'users', user.uid, 'movimientos', id), updated, { merge: true })
        .then(() => {
          setIsMovementsSynced(true);
        })
        .catch((error) => {
          console.warn('Firestore update error (offline or network):', error);
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  };

  const deleteMovement = async (id: string) => {
    // Optimistic local deletion & instant localStorage persistence
    setMovements((prev) => {
      const next = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(next));
        if (user) {
          localStorage.setItem(`${STORAGE_KEYS.MOVEMENTS}_${user.uid}`, JSON.stringify(next));
        }
      } catch (err) {
        console.warn('Error deleting from localStorage:', err);
      }
      return next;
    });

    if (user) {
      setIsSyncing(true);
      // Non-blocking background sync
      deleteDoc(doc(db, 'users', user.uid, 'movimientos', id))
        .then(() => {
          setIsMovementsSynced(true);
        })
        .catch((error) => {
          console.warn('Firestore delete error (offline or network):', error);
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...updated };
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), newProfile, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    } else {
      setUserProfile(newProfile);
    }
  };

  const addCategory = async (catData: Omit<Categoria, 'id'>) => {
    const newId = `cat-${Date.now()}`;
    const newCat: Categoria = { ...catData, id: newId };
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'categorias', newId), newCat);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/categorias/${newId}`);
      }
    } else {
      setCategories((prev) => [...prev, newCat]);
    }
  };

  const updateCategory = async (id: string, updated: Partial<Categoria>) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'categorias', id), updated, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/categorias/${id}`);
      }
    } else {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    }
  };

  const deleteCategory = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'categorias', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/categorias/${id}`);
      }
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const addMeta = async (metaData: Omit<Meta, 'id'>) => {
    const newId = `meta-${Date.now()}`;
    const newMeta: Meta = { ...metaData, id: newId };
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'metas', newId), newMeta);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/metas/${newId}`);
      }
    } else {
      setMetas((prev) => [...prev, newMeta]);
    }
  };

  const addFundsToMeta = async (metaId: string, amount: number) => {
    const meta = metas.find((m) => m.id === metaId);
    if (!meta) return;
    const newAhorrado = meta.ahorrado + amount;

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'metas', metaId), { ahorrado: newAhorrado }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/metas/${metaId}`);
      }
    } else {
      setMetas((prev) => prev.map((m) => (m.id === metaId ? { ...m, ahorrado: newAhorrado } : m)));
    }
  };

  const completeChallenge = async (challengeId: string, decision: 'A' | 'B') => {
    const reto = retos.find((r) => r.id === challengeId);
    if (!reto) return;

    const chosenOption = decision === 'A' ? reto.opcionA : reto.opcionB;
    const impactText =
      chosenOption.tipo === 'ahorro'
        ? `Sumaste $${chosenOption.monto.toLocaleString('es-AR')} a tu ahorro inteligente.`
        : `Registraste $${chosenOption.monto.toLocaleString('es-AR')} para disfrutar con amigos.`;

    const updatedReto: Reto = {
      ...reto,
      decision,
      completado: true,
      impacto: impactText,
    };

    // Update streak +1
    const newStreak = userProfile.rachaRetos + 1;
    await updateProfile({ rachaRetos: newStreak });

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'retos', challengeId), updatedReto, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/retos/${challengeId}`);
      }
    } else {
      setRetos((prev) => prev.map((r) => (r.id === challengeId ? updatedReto : r)));
    }

    // If decision was to save, optionally contribute to first meta
    if (chosenOption.tipo === 'ahorro' && metas.length > 0) {
      await addFundsToMeta(metas[0].id, chosenOption.monto);
    }
  };

  // Desafío del día (estrictamente 1 cada 24 horas, único, basado en el historial completo del usuario)
  const { desafio: desafioDelDia, completadoHoy: desafioDelDiaCompletado } = useMemo(() => {
    return seleccionarDesafioDiarioUnico(desafios, historialDesafios);
  }, [desafios, historialDesafios]);

  const tiempoRestanteProximoDesafio = useMemo(() => {
    return getTiempoRestanteProximoDesafio();
  }, [desafios, historialDesafios]);

  // Desafío personalizado basado en el presupuesto real del usuario
  const desafioPersonalizado = useMemo(() => {
    return generarDesafioPersonalizado(userProfile, movements, categories, disponibleMes);
  }, [userProfile, movements, categories, disponibleMes]);

  const obtenerDesafioAleatorioQR = useCallback(() => {
    return seleccionarDesafioQR(desafios, historialDesafios);
  }, [desafios, historialDesafios]);

  const responderDesafio = useCallback(
    async (
      desafio: Desafio,
      opcionId: string,
      origen: 'diario' | 'qr_juego' | 'personalizado' | 'explorar'
    ): Promise<HistorialDesafio> => {
      const opcion = desafio.opciones.find((o) => o.id === opcionId) || desafio.opciones[0];

      const historialItem: HistorialDesafio = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        desafioId: desafio.id,
        desafioTitulo: desafio.titulo,
        categoria: desafio.categoria,
        opcionElegidaId: opcion.id,
        opcionElegidaTexto: opcion.texto,
        tipoImpacto: opcion.tipoImpacto,
        impactoMonto: opcion.impactoMonto,
        consecuencia: opcion.consecuencia,
        explicacionEducativa: opcion.explicacionEducativa,
        conceptoClave: opcion.conceptoClave,
        fechaCompletado: new Date().toISOString(),
        origen,
      };

      setHistorialDesafios((prev) => deduplicateById([historialItem, ...prev]));

      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'historial_desafios', historialItem.id), historialItem);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/historial_desafios/${historialItem.id}`);
        }
      }

      // Update streak and total completed count
      const newStreak = userProfile.rachaRetos + 1;
      const newTotal = (userProfile.totalDesafiosCompletados || 0) + 1;
      await updateProfile({ rachaRetos: newStreak, totalDesafiosCompletados: newTotal });

      // If decision was to save, optionally contribute to first meta
      if (opcion.tipoImpacto === 'ahorro' && opcion.impactoMonto > 0 && metas.length > 0) {
        await addFundsToMeta(metas[0].id, opcion.impactoMonto);
      }

      addToast({
        tipo: 'success',
        titulo: '¡Decisión Registrada!',
        mensaje: `Concepto clave aprendido: ${opcion.conceptoClave}`,
      });

      return historialItem;
    },
    [user, userProfile, metas, addFundsToMeta, updateProfile, addToast]
  );

  // Admin methods
  const addDesafio = useCallback(
    async (desafioData: Omit<Desafio, 'id'>) => {
      const newId = `desafio-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newDesafio: Desafio = {
        ...desafioData,
        id: newId,
        activo: desafioData.activo ?? true,
        fechaCreacion: new Date().toISOString(),
      };

      setDesafios((prev) => [newDesafio, ...prev]);

      if (user) {
        try {
          await setDoc(doc(db, 'desafios', newId), newDesafio);
        } catch (e) {
          console.warn('Error adding desafio to Firestore:', e);
        }
      }

      addToast({
        tipo: 'success',
        titulo: 'Desafío Creado',
        mensaje: `El desafío "${newDesafio.titulo}" ya está activo en el banco.`,
      });
    },
    [user, addToast]
  );

  const updateDesafio = useCallback(
    async (id: string, partial: Partial<Desafio>) => {
      setDesafios((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...partial, fechaActualizacion: new Date().toISOString() } : d))
      );

      if (user) {
        try {
          await setDoc(
            doc(db, 'desafios', id),
            { ...partial, fechaActualizacion: new Date().toISOString() },
            { merge: true }
          );
        } catch (e) {
          console.warn('Error updating desafio in Firestore:', e);
        }
      }

      addToast({
        tipo: 'info',
        titulo: 'Desafío Actualizado',
        mensaje: 'Los cambios fueron guardados exitosamente.',
      });
    },
    [user, addToast]
  );

  const toggleDesafioActivo = useCallback(
    async (id: string) => {
      const desafio = desafios.find((d) => d.id === id);
      if (!desafio) return;
      const nuevoEstado = !desafio.activo;
      await updateDesafio(id, { activo: nuevoEstado });
    },
    [desafios, updateDesafio]
  );

  const deleteDesafio = useCallback(
    async (id: string) => {
      setDesafios((prev) => prev.filter((d) => d.id !== id));
      if (user) {
        try {
          await deleteDoc(doc(db, 'desafios', id));
        } catch (e) {
          console.warn('Error deleting desafio in Firestore:', e);
        }
      }
      addToast({
        tipo: 'warning',
        titulo: 'Desafío Eliminado',
        mensaje: 'El desafío fue removido del banco.',
      });
    },
    [user, addToast]
  );

  const seedDesafiosDefault = useCallback(async () => {
    setDesafios(INITIAL_DESAFIOS);
    if (user) {
      for (const d of INITIAL_DESAFIOS) {
        try {
          await setDoc(doc(db, 'desafios', d.id), d);
        } catch (e) {
          // ignore
        }
      }
    }
    addToast({
      tipo: 'success',
      titulo: 'Banco Restaurado',
      mensaje: `Se cargaron ${INITIAL_DESAFIOS.length} desafíos realistas iniciales.`,
    });
  }, [user, addToast]);

  const actualizarMontosPorInflacion = useCallback(
    async (porcentaje: number) => {
      const factor = 1 + porcentaje / 100;
      const actualizados = desafios.map((d) => ({
        ...d,
        montoInvolucrado: Math.round((d.montoInvolucrado * factor) / 500) * 500,
        opciones: d.opciones.map((o) => ({
          ...o,
          impactoMonto: Math.round((o.impactoMonto * factor) / 500) * 500,
        })),
        fechaActualizacion: new Date().toISOString(),
      }));

      setDesafios(actualizados);

      if (user) {
        for (const act of actualizados) {
          try {
            await setDoc(doc(db, 'desafios', act.id), act, { merge: true });
          } catch (e) {
            // ignore
          }
        }
      }

      addToast({
        tipo: 'info',
        titulo: 'Montos Ajustados',
        mensaje: `Se actualizaron todos los montos de desafíos en un ${porcentaje > 0 ? '+' : ''}${porcentaje}%.`,
      });
    },
    [desafios, user, addToast]
  );

  const toggleAdminMode = useCallback(async () => {
    const nuevoAdmin = !userProfile.isAdmin;
    await updateProfile({ isAdmin: nuevoAdmin });
    addToast({
      tipo: 'info',
      titulo: nuevoAdmin ? 'Modo Administrador Activado' : 'Modo Administrador Desactivado',
      mensaje: nuevoAdmin
        ? 'Ahora podés crear, editar, activar/desactivar y ajustar montos de desafíos.'
        : 'Volviste al modo jugador / usuario regular.',
    });
  }, [userProfile.isAdmin, updateProfile, addToast]);

  const loginAsDemoUser = () => {
    setUser(null);
    setUserProfile(INITIAL_USER);
    setCategories(deduplicateById(INITIAL_CATEGORIES));
    setMovements(deduplicateById(INITIAL_MOVEMENTS));
    setMetas(deduplicateById(INITIAL_METAS));
    setRetos(deduplicateById(INITIAL_CHALLENGES));
    setIsDemoUser(true);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, 'true');
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(INITIAL_USER));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem(STORAGE_KEYS.METAS, JSON.stringify(INITIAL_METAS));
    setActiveTab('inicio');
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setUser(null);
    setIsDemoUser(false);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ACTIVE);
    localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
    localStorage.removeItem(STORAGE_KEYS.LAST_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    // Reset state cleanly
    setUserProfile(INITIAL_USER);
    setCategories(INITIAL_CATEGORIES);
    setMovements([]);
    setMetas([]);
    setHistorialDesafios([]);
    setActiveTab('inicio');
    addToast({
      tipo: 'info',
      titulo: 'Sesión cerrada',
      mensaje: 'Has cerrado sesión correctamente.',
    });
  };

  const resetToDemoData = async () => {
    setUserProfile(INITIAL_USER);
    setCategories(deduplicateById(INITIAL_CATEGORIES));
    setMovements(deduplicateById(INITIAL_MOVEMENTS));
    setMetas(deduplicateById(INITIAL_METAS));
    setRetos(deduplicateById(INITIAL_CHALLENGES));

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(INITIAL_USER));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem(STORAGE_KEYS.METAS, JSON.stringify(INITIAL_METAS));
    localStorage.setItem(STORAGE_KEYS.RETOS, JSON.stringify(INITIAL_CHALLENGES));
  };

  const contextValue: FinanceContextType = useMemo(
    () => ({
      user,
      userProfile,
      categories,
      movements,
      metas,
      retos,
      activeTab,
      setActiveTab,
      isLoading,
      isFirebaseConnected,
      isAuthenticated,
      isDemoUser,
      isOnline,
      isMovementsSynced,
      isSyncing,
      setIsAuthenticated,
      loginAsDemoUser,
      logout,
      totalIngresosMes,
      totalGastosMes,
      disponibleMes,
      diaActual,
      totalDiasMes,
      gastadoPorCategoria,
      porcentajePorCategoria,
      tips,
      toasts,
      desafios,
      historialDesafios,
      desafioDelDia,
      desafioDelDiaCompletado,
      tiempoRestanteProximoDesafio,
      desafioPersonalizado,
      obtenerDesafioAleatorioQR,
      responderDesafio,
      addDesafio,
      updateDesafio,
      toggleDesafioActivo,
      deleteDesafio,
      seedDesafiosDefault,
      actualizarMontosPorInflacion,
      toggleAdminMode,
      addToast,
      dismissToast,
      addMovement,
      updateMovement,
      deleteMovement,
      updateProfile,
      addCategory,
      updateCategory,
      deleteCategory,
      addMeta,
      addFundsToMeta,
      completeChallenge,
      resetToDemoData,
    }),
    [
      user,
      userProfile,
      categories,
      movements,
      metas,
      retos,
      desafios,
      historialDesafios,
      desafioDelDia,
      desafioDelDiaCompletado,
      tiempoRestanteProximoDesafio,
      desafioPersonalizado,
      obtenerDesafioAleatorioQR,
      responderDesafio,
      addDesafio,
      updateDesafio,
      toggleDesafioActivo,
      deleteDesafio,
      seedDesafiosDefault,
      actualizarMontosPorInflacion,
      toggleAdminMode,
      activeTab,
      setActiveTab,
      isLoading,
      isFirebaseConnected,
      isAuthenticated,
      isDemoUser,
      isOnline,
      isMovementsSynced,
      isSyncing,
      setIsAuthenticated,
      loginAsDemoUser,
      logout,
      totalIngresosMes,
      totalGastosMes,
      disponibleMes,
      diaActual,
      totalDiasMes,
      gastadoPorCategoria,
      porcentajePorCategoria,
      tips,
      toasts,
      addToast,
      dismissToast,
      addMovement,
      updateMovement,
      deleteMovement,
      updateProfile,
      addCategory,
      updateCategory,
      deleteCategory,
      addMeta,
      addFundsToMeta,
      completeChallenge,
      resetToDemoData,
    ]
  );

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
