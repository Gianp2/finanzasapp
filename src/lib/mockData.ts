import { Categoria, Movimiento, Meta, Reto, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  nombre: 'Camila Ríos',
  email: 'camila.rios@ejemplo.com',
  presupuestoMensual: 18500,
  moneda: '$',
  rachaRetos: 5,
  avatarInitials: 'CR',
};

export const INITIAL_CATEGORIES: Categoria[] = [
  {
    id: 'cat-comida',
    nombre: 'Comida',
    icono: 'shopping-cart',
    limiteMensual: 4000,
    color: '#4A5A2E',
  },
  {
    id: 'cat-transporte',
    nombre: 'Transporte',
    icono: 'bus',
    limiteMensual: 1200,
    color: '#4A5A2E',
  },
  {
    id: 'cat-entretenimiento',
    nombre: 'Entretenimiento',
    icono: 'film',
    limiteMensual: 800,
    color: '#B58A4A',
  },
  {
    id: 'cat-servicios',
    nombre: 'Servicios',
    icono: 'zap',
    limiteMensual: 2100,
    color: '#A85D4A',
  },
  {
    id: 'cat-salud',
    nombre: 'Salud y Cuidado',
    icono: 'heart-pulse',
    limiteMensual: 2500,
    color: '#4A5A2E',
  },
  {
    id: 'cat-hogar',
    nombre: 'Hogar y Otros',
    icono: 'home',
    limiteMensual: 3500,
    color: '#4A5A2E',
  },
];

const MS_DAY = 24 * 60 * 60 * 1000;

export const INITIAL_MOVEMENTS: Movimiento[] = [
  {
    id: 'mov-1',
    tipo: 'gasto',
    monto: 185,
    categoriaId: 'cat-comida',
    categoriaNombre: 'Comida',
    fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hoy
    nota: 'Supermercado La Colonia',
    recurrente: false,
  },
  {
    id: 'mov-2',
    tipo: 'gasto',
    monto: 320,
    categoriaId: 'cat-transporte',
    categoriaNombre: 'Transporte',
    fecha: new Date(Date.now() - 1 * MS_DAY - 3 * 3600 * 1000).toISOString(), // Ayer
    nota: 'Recarga transporte y viaje Uber',
    recurrente: false,
  },
  {
    id: 'mov-3',
    tipo: 'ingreso',
    monto: 4500,
    categoriaId: 'ingreso',
    categoriaNombre: 'Ingreso',
    fecha: new Date(Date.now() - 2 * MS_DAY - 4 * 3600 * 1000).toISOString(), // Hace 2 días
    nota: 'Cobro de proyecto freelance',
    recurrente: false,
  },
  {
    id: 'mov-4',
    tipo: 'gasto',
    monto: 850,
    categoriaId: 'cat-entretenimiento',
    categoriaNombre: 'Entretenimiento',
    fecha: new Date(Date.now() - 2 * MS_DAY - 8 * 3600 * 1000).toISOString(), // Hace 2 días
    nota: 'Cena con amigos + cine',
    recurrente: false,
  },
  {
    id: 'mov-5',
    tipo: 'gasto',
    monto: 1250,
    categoriaId: 'cat-comida',
    categoriaNombre: 'Comida',
    fecha: new Date(Date.now() - 3 * MS_DAY - 5 * 3600 * 1000).toISOString(), // Hace 3 días
    nota: 'Compra semanal frutas, verduras y carnicería',
    recurrente: false,
  },
  {
    id: 'mov-6',
    tipo: 'gasto',
    monto: 420,
    categoriaId: 'cat-servicios',
    categoriaNombre: 'Servicios',
    fecha: new Date(Date.now() - 4 * MS_DAY - 6 * 3600 * 1000).toISOString(), // Hace 4 días
    nota: 'Abono telefonía e internet móvil',
    recurrente: true,
  },
  {
    id: 'mov-7',
    tipo: 'ingreso',
    monto: 18500,
    categoriaId: 'ingreso',
    categoriaNombre: 'Ingreso',
    fecha: new Date(Date.now() - 5 * MS_DAY - 2 * 3600 * 1000).toISOString(), // Hace 5 días
    nota: 'Pago de sueldo / nómina mensual',
    recurrente: true,
  },
  {
    id: 'mov-8',
    tipo: 'gasto',
    monto: 690,
    categoriaId: 'cat-salud',
    categoriaNombre: 'Salud y Cuidado',
    fecha: new Date(Date.now() - 5 * MS_DAY - 7 * 3600 * 1000).toISOString(), // Hace 5 días
    nota: 'Farmacia y vitaminas',
    recurrente: false,
  },
  {
    id: 'mov-9',
    tipo: 'gasto',
    monto: 540,
    categoriaId: 'cat-hogar',
    categoriaNombre: 'Hogar y Otros',
    fecha: new Date(Date.now() - 6 * MS_DAY - 4 * 3600 * 1000).toISOString(), // Hace 6 días
    nota: 'Artículos de limpieza y hogar',
    recurrente: false,
  },
  {
    id: 'mov-10',
    tipo: 'ingreso',
    monto: 2200,
    categoriaId: 'ingreso',
    categoriaNombre: 'Ingreso',
    fecha: new Date(Date.now() - 6 * MS_DAY - 9 * 3600 * 1000).toISOString(), // Hace 6 días
    nota: 'Rendimientos de inversión',
    recurrente: false,
  },
  {
    id: 'mov-11',
    tipo: 'gasto',
    monto: 980,
    categoriaId: 'cat-comida',
    categoriaNombre: 'Comida',
    fecha: new Date(Date.now() - 10 * MS_DAY - 3 * 3600 * 1000).toISOString(), // Hace 10 días
    nota: 'Supermercado Coto',
    recurrente: false,
  },
  {
    id: 'mov-12',
    tipo: 'gasto',
    monto: 450,
    categoriaId: 'cat-comida',
    categoriaNombre: 'Comida',
    fecha: new Date(Date.now() - 15 * MS_DAY - 5 * 3600 * 1000).toISOString(), // Hace 15 días
    nota: 'Café Martínez & Panadería',
    recurrente: false,
  },
  {
    id: 'mov-13',
    tipo: 'gasto',
    monto: 650,
    categoriaId: 'cat-transporte',
    categoriaNombre: 'Transporte',
    fecha: new Date(Date.now() - 12 * MS_DAY - 6 * 3600 * 1000).toISOString(), // Hace 12 días
    nota: 'Cabify aeropuerto y viajes',
    recurrente: false,
  },
  {
    id: 'mov-14',
    tipo: 'gasto',
    monto: 1680,
    categoriaId: 'cat-servicios',
    categoriaNombre: 'Servicios',
    fecha: new Date(Date.now() - 18 * MS_DAY - 4 * 3600 * 1000).toISOString(), // Hace 18 días
    nota: 'Edenor Luz y Metrogas',
    recurrente: true,
  },
  {
    id: 'mov-15',
    tipo: 'gasto',
    monto: 620,
    categoriaId: 'cat-entretenimiento',
    categoriaNombre: 'Entretenimiento',
    fecha: new Date(Date.now() - 22 * MS_DAY - 7 * 3600 * 1000).toISOString(), // Hace 22 días
    nota: 'Spotify & suscripción streaming',
    recurrente: true,
  },
  {
    id: 'mov-16',
    tipo: 'gasto',
    monto: 850,
    categoriaId: 'cat-salud',
    categoriaNombre: 'Salud y Cuidado',
    fecha: new Date(Date.now() - 25 * MS_DAY - 8 * 3600 * 1000).toISOString(), // Hace 25 días
    nota: 'Farmacity cuidado personal',
    recurrente: false,
  },
];

export const INITIAL_METAS: Meta[] = [
  {
    id: 'meta-viaje',
    nombre: 'Viaje a Bariloche',
    objetivo: 50000,
    ahorrado: 18400,
    icono: 'plane',
  },
  {
    id: 'meta-emergencia',
    nombre: 'Fondo de Emergencia',
    objetivo: 80000,
    ahorrado: 32000,
    icono: 'shield',
  },
];

export const INITIAL_CHALLENGES: Reto[] = [
  {
    id: 'reto-hoy',
    fecha: new Date().toISOString().slice(0, 10),
    pregunta: '¿Lo necesitás o lo querés?',
    descripcion:
      'Te sobraron $1,270 esta semana. ¿Los usás para salir con amigos o los sumás a tu ahorro para el viaje? Tomá una decisión y mirá cómo queda tu presupuesto.',
    opcionA: {
      titulo: 'Sumar al ahorro para el viaje',
      descripcion: 'Guardás los $1,270. Tu meta de vacaciones avanza y mantenés tu disponible intacto.',
      tipo: 'ahorro',
      monto: 1270,
    },
    opcionB: {
      titulo: 'Salir con amigos',
      descripcion: 'Disfrutás el finde con tus amigos. Se registra como gasto en entretenimiento.',
      tipo: 'gasto',
      monto: 1270,
    },
    completado: false,
  },
  {
    id: 'reto-ayer',
    fecha: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    pregunta: 'Café al paso vs. termo en casa',
    descripcion: '¿Comprás café en cafetería toda la semana ($1,800) o preparás tu café en casa?',
    opcionA: {
      titulo: 'Café en casa',
      descripcion: 'Ahorraste $1,800 preparando tu propio café.',
      tipo: 'ahorro',
      monto: 1800,
    },
    opcionB: {
      titulo: 'Cafetería de especialidad',
      descripcion: 'Te diste un gusto diario.',
      tipo: 'gasto',
      monto: 1800,
    },
    decision: 'A',
    completado: true,
    impacto: 'Ahorraste $1,800 y mantuviste tu racha positiva.',
  },
  {
    id: 'reto-antier',
    fecha: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
    pregunta: 'Delivery vs. cocinar con lo que hay',
    descripcion: 'Llegás con cansancio a la noche. ¿Pedís comida por app o improvisás una cena rápida?',
    opcionA: {
      titulo: 'Cocinaste en casa',
      descripcion: 'Aprovechaste lo que había en la heladera.',
      tipo: 'ahorro',
      monto: 2200,
    },
    opcionB: {
      titulo: 'Delivery',
      descripcion: 'Gasto no planeado.',
      tipo: 'gasto',
      monto: 2200,
    },
    decision: 'A',
    completado: true,
    impacto: 'Ahorro de $2,200 en comida semanal.',
  },
];

// Utility currency formatter: $7,270
export function formatCurrency(amount: number, symbol = '$'): string {
  const formatted = Math.round(amount).toLocaleString('es-AR');
  return `${symbol}${formatted}`;
}

export function formatMovementDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isYesterday =
    date.getDate() === now.getDate() - 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  const timeFormatted = date
    .toLocaleTimeString('es-AR', timeOptions)
    .toLowerCase()
    .replace(' ', ' ');

  if (isToday) {
    return `Hoy, ${timeFormatted}`;
  }
  if (isYesterday) {
    return `Ayer, ${timeFormatted}`;
  }

  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  return `${day} ${month}, ${timeFormatted}`;
}
