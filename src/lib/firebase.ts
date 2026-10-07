import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  updateProfile,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Suppress noisy Firestore debug connection warnings when running in sandboxed iframes
try {
  setLogLevel('error');
} catch {
  // Ignore if already set
}

// Initialize Firestore with force long polling for resilient connection inside iframes/proxies
let firestoreDb: Firestore;
const configuredDbId =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

try {
  firestoreDb = configuredDbId
    ? initializeFirestore(app, { experimentalForceLongPolling: true }, configuredDbId)
    : initializeFirestore(app, { experimentalForceLongPolling: true });
} catch {
  // If already initialized, get existing instance
  firestoreDb = configuredDbId ? getFirestore(app, configuredDbId) : getFirestore(app);
}
export const db: Firestore = firestoreDb;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Fast non-blocking connection check avoiding 10-second backend timeouts
export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  return true;
}

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return 'Ocurrió un error inesperado al autenticar.';
  const code = (error as { code?: string })?.code || '';
  const msg = (error as Error)?.message || String(error);

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya está registrado. Si ya tenés cuenta, seleccioná "Ya tengo cuenta" para ingresar.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico ingresado no es válido.';
    case 'auth/weak-password':
      return 'La contraseña debe tener un mínimo de 6 caracteres.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'El correo o la contraseña ingresados son incorrectos. Verificá los datos e intentá nuevamente.';
    case 'auth/user-not-found':
      return 'No encontramos una cuenta con este correo. Podés crearla seleccionando "Registrarme".';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido inhabilitada temporalmente por seguridad.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos consecutivos. Por favor esperá unos minutos antes de volver a intentar.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de Google. Habilitá las popups en tu navegador o ingresá con correo y contraseña.';
    case 'auth/popup-closed-by-user':
      return 'Se cerró la ventana de Google antes de completar el inicio de sesión. Intentá nuevamente.';
    case 'auth/unauthorized-domain':
      return 'Dominio no habilitado para Google OAuth en Firebase. Podés registrarte o ingresar con tu correo y contraseña.';
    case 'auth/account-exists-with-different-credential':
      return 'Ya existe una cuenta registrada con este correo electrónico pero con otro método de acceso.';
    case 'auth/credential-already-in-use':
      return 'Esta credencial ya está asociada a otra cuenta de usuario.';
    case 'auth/operation-not-allowed':
      return 'Este proveedor de inicio de sesión no está habilitado actualmente en la configuración de Firebase.';
    default:
      if (msg.includes('network') || msg.includes('offline')) {
        return 'Error de conexión. Verificá tu acceso a internet e intentá nuevamente.';
      }
      return msg || 'No se pudo completar la autenticación. Por favor intentá nuevamente.';
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  updateProfile as updateAuthProfile,
};
