export type TransactionType = 'ingreso' | 'gasto';

export type ChallengeCategory =
  | 'gastos_cotidianos'
  | 'imprevistos'
  | 'ahorro'
  | 'presupuesto'
  | 'inversion'
  | 'compras'
  | 'deudas'
  | 'ingresos'
  | 'oportunidades'
  | 'transporte'
  | 'alimentacion'
  | 'necesidad_vs_deseo';

export type ChallengeDifficulty = 'facil' | 'medio' | 'dificil';

export type ChallengeType =
  | 'decision'
  | 'presupuesto_real'
  | 'dilema'
  | 'oportunidad'
  | 'imprevisto';

export interface DesafioOpcion {
  id: string; // 'A', 'B', 'C', 'D'
  texto: string;
  tipoImpacto: 'ahorro' | 'gasto' | 'inversion' | 'neutro';
  impactoMonto: number;
  consecuencia: string;
  explicacionEducativa: string;
  conceptoClave: string;
}

export interface Desafio {
  id: string;
  titulo: string;
  situacion: string;
  categoria: ChallengeCategory;
  montoInvolucrado: number; // Montos realistas argentinos (ej. $25.000, $80.000)
  dificultad: ChallengeDifficulty;
  tipoDesafio: ChallengeType;
  opciones: DesafioOpcion[];
  activo: boolean;
  esPersonalizado?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface HistorialDesafio {
  id: string;
  desafioId: string;
  desafioTitulo: string;
  categoria: ChallengeCategory;
  opcionElegidaId: string;
  opcionElegidaTexto: string;
  tipoImpacto: 'ahorro' | 'gasto' | 'inversion' | 'neutro';
  impactoMonto: number;
  consecuencia: string;
  explicacionEducativa: string;
  conceptoClave: string;
  fechaCompletado: string; // ISO string
  origen: 'diario' | 'qr_juego' | 'personalizado' | 'explorar';
}

export interface Insignia {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  rachaRequerida: number;
  desbloqueada: boolean;
  categoriaTipo: 'racha' | 'juego' | 'conocimiento' | 'especial';
  progresoActual: number;
  progresoTotal: number;
  rareza?: 'comun' | 'rara' | 'epica' | 'legendaria';
}

export interface NivelFinanciero {
  nivel: number;
  titulo: string;
  descripcion: string;
  rachaMinima: number;
  rachaSiguiente: number;
  icono: string;
  color: string;
  beneficio: string;
}

export interface UserProfile {
  nombre: string;
  email?: string;
  presupuestoMensual: number;
  moneda: string;
  rachaRetos: number;
  avatarInitials?: string;
  isAdmin?: boolean;
  totalDesafiosCompletados?: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  limiteMensual: number;
  color?: string;
}

export interface Movimiento {
  id: string;
  tipo: TransactionType;
  monto: number;
  categoriaId: string;
  categoriaNombre: string;
  fecha: string; // ISO date string
  nota: string;
  recurrente: boolean;
  createdAt?: string;
}

export interface Meta {
  id: string;
  nombre: string;
  objetivo: number;
  ahorrado: number;
  icono?: string;
}

// Backward-compatible Reto interface
export interface Reto {
  id: string;
  fecha: string; // YYYY-MM-DD
  pregunta: string;
  descripcion: string;
  opcionA: {
    titulo: string;
    descripcion: string;
    tipo: 'ahorro' | 'gasto';
    monto: number;
  };
  opcionB: {
    titulo: string;
    descripcion: string;
    tipo: 'ahorro' | 'gasto';
    monto: number;
  };
  decision?: 'A' | 'B';
  completado: boolean;
  impacto?: string;
}

export interface TipGasto {
  id: string;
  icono: 'bulb' | 'chart' | 'piggy' | 'alert';
  titulo: string;
  texto: string;
  tipo: 'warning' | 'info' | 'success';
}

export interface ToastNotification {
  id: string;
  tipo: 'warning' | 'info' | 'success' | 'danger';
  titulo: string;
  mensaje: string;
  categoriaNombre?: string;
  porcentaje?: number;
  gastado?: number;
  limite?: number;
}

export type ActiveTab = 'inicio' | 'movimientos' | 'retos' | 'perfil' | 'admin';
