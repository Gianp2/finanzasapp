import { NivelFinanciero, Insignia, HistorialDesafio } from '../types';

export const NIVELES_FINANCIEROS: NivelFinanciero[] = [
  {
    nivel: 1,
    titulo: 'Novato Consciente',
    descripcion: 'Dando tus primeros pasos en la toma de decisiones meditadas.',
    rachaMinima: 0,
    rachaSiguiente: 3,
    icono: '🌱',
    color: '#4A5A2E',
    beneficio: 'Desbloqueo de desafíos diarios básicos'
  },
  {
    nivel: 2,
    titulo: 'Aprendiz Disciplinado',
    descripcion: '3 días seguidos resistiendo compras impulsivas.',
    rachaMinima: 3,
    rachaSiguiente: 7,
    icono: '🥉',
    color: '#B58A4A',
    beneficio: 'Acceso a desafíos de imprevistos y fondo de reserva'
  },
  {
    nivel: 3,
    titulo: 'Estratega del Ahorro',
    descripcion: 'Una semana completa blindando tu presupuesto.',
    rachaMinima: 7,
    rachaSiguiente: 14,
    icono: '🥈',
    color: '#2563EB',
    beneficio: 'Desafíos de arbitraje temporal y costo de oportunidad'
  },
  {
    nivel: 4,
    titulo: 'Guardián del Presupuesto',
    descripcion: '14 días consecutivos protegiendo tu economía.',
    rachaMinima: 14,
    rachaSiguiente: 21,
    icono: '🛡️',
    color: '#7C3AED',
    beneficio: 'Desafíos avanzados de deuda, CFT e inflación'
  },
  {
    nivel: 5,
    titulo: 'Maestro del Patrimonio',
    descripcion: '21 días seguidos: el hábito financiero está forjado.',
    rachaMinima: 21,
    rachaSiguiente: 30,
    icono: '🥇',
    color: '#D97706',
    beneficio: 'Dilemas de tesorería y rendimientos diarios T+0'
  },
  {
    nivel: 6,
    titulo: 'Leyenda de Ciudad Financiera',
    descripcion: 'Más de 30 días seguidos de excelencia y control total.',
    rachaMinima: 30,
    rachaSiguiente: 60,
    icono: '👑',
    color: '#059669',
    beneficio: 'Maestría total y distinción dorada en la app'
  }
];

export function calcularNivel(racha: number) {
  let nivelActual = NIVELES_FINANCIEROS[0];
  let siguienteNivel: NivelFinanciero | null = NIVELES_FINANCIEROS[1];

  for (let i = NIVELES_FINANCIEROS.length - 1; i >= 0; i--) {
    if (racha >= NIVELES_FINANCIEROS[i].rachaMinima) {
      nivelActual = NIVELES_FINANCIEROS[i];
      siguienteNivel = NIVELES_FINANCIEROS[i + 1] || null;
      break;
    }
  }

  let porcentajeProgreso = 100;
  let diasRestantes = 0;

  if (siguienteNivel) {
    const rango = siguienteNivel.rachaMinima - nivelActual.rachaMinima;
    const progresoEnRango = racha - nivelActual.rachaMinima;
    porcentajeProgreso = Math.min(100, Math.max(0, Math.round((progresoEnRango / rango) * 100)));
    diasRestantes = Math.max(0, siguienteNivel.rachaMinima - racha);
  }

  return {
    nivelActual,
    siguienteNivel,
    porcentajeProgreso,
    diasRestantes,
  };
}

export function obtenerInsignias(racha: number, historial: HistorialDesafio[]): Insignia[] {
  // Contar jugadas en tablero QR
  const jugadasQR = historial.filter((h) => h.origen === 'qr_juego').length;

  // Categorías distintas trabajadas
  const categoriasSet = new Set(historial.map((h) => h.categoria));

  // Conceptos únicos aprendidos
  const conceptosSet = new Set(historial.map((h) => h.conceptoClave).filter(Boolean));

  // Decisiones de inversión
  const decisionesInversion = historial.filter((h) => h.tipoImpacto === 'inversion').length;

  return [
    {
      id: 'insignia-primer-paso',
      titulo: 'Primer Paso Consciente',
      descripcion: 'Completar tu primer desafío y dar inicio a tu racha.',
      icono: 'target',
      rachaRequerida: 1,
      desbloqueada: racha >= 1 || historial.length >= 1,
      categoriaTipo: 'racha',
      progresoActual: Math.min(1, Math.max(racha, historial.length)),
      progresoTotal: 1,
      rareza: 'comun',
    },
    {
      id: 'insignia-fuego-encendido',
      titulo: 'Fuego Encendido',
      descripcion: 'Mantener una racha de 3 días consecutivos de decisiones.',
      icono: 'flame',
      rachaRequerida: 3,
      desbloqueada: racha >= 3,
      categoriaTipo: 'racha',
      progresoActual: Math.min(3, racha),
      progresoTotal: 3,
      rareza: 'comun',
    },
    {
      id: 'insignia-semana-blindada',
      titulo: 'Semana Blindada',
      descripcion: '7 días seguidos protegiendo tu dinero sin interrupciones.',
      icono: 'shield',
      rachaRequerida: 7,
      desbloqueada: racha >= 7,
      categoriaTipo: 'racha',
      progresoActual: Math.min(7, racha),
      progresoTotal: 7,
      rareza: 'rara',
    },
    {
      id: 'insignia-habito-forjado',
      titulo: 'Constancia de Acero',
      descripcion: '14 días seguidos enfrentando dilemas financieros.',
      icono: 'zap',
      rachaRequerida: 14,
      desbloqueada: racha >= 14,
      categoriaTipo: 'racha',
      progresoActual: Math.min(14, racha),
      progresoTotal: 14,
      rareza: 'rara',
    },
    {
      id: 'insignia-regla-21-dias',
      titulo: 'Mente de Acero (21 Días)',
      descripcion: '21 días seguidos: el tiempo neurocientífico para afianzar un hábito.',
      icono: 'brain',
      rachaRequerida: 21,
      desbloqueada: racha >= 21,
      categoriaTipo: 'racha',
      progresoActual: Math.min(21, racha),
      progresoTotal: 21,
      rareza: 'epica',
    },
    {
      id: 'insignia-mes-imparable',
      titulo: 'Patrimonio Imparable',
      descripcion: '30 días consecutivos de disciplina y educación financiera.',
      icono: 'crown',
      rachaRequerida: 30,
      desbloqueada: racha >= 30,
      categoriaTipo: 'racha',
      progresoActual: Math.min(30, racha),
      progresoTotal: 30,
      rareza: 'legendaria',
    },
    {
      id: 'insignia-aventurero-tablero',
      titulo: 'Aventurero del Tablero',
      descripcion: 'Resolver al menos un desafío desde la casilla QR del juego de mesa.',
      icono: 'dice',
      rachaRequerida: 0,
      desbloqueada: jugadasQR >= 1,
      categoriaTipo: 'juego',
      progresoActual: Math.min(1, jugadasQR),
      progresoTotal: 1,
      rareza: 'comun',
    },
    {
      id: 'insignia-vision-integral',
      titulo: 'Estratega Multifacético',
      descripcion: 'Superar desafíos en al menos 4 categorías diferentes.',
      icono: 'compass',
      rachaRequerida: 0,
      desbloqueada: categoriasSet.size >= 4,
      categoriaTipo: 'conocimiento',
      progresoActual: Math.min(4, categoriasSet.size),
      progresoTotal: 4,
      rareza: 'rara',
    },
    {
      id: 'insignia-erudito-financiero',
      titulo: 'Erudito Financiero',
      descripcion: 'Dominar al menos 5 conceptos financieros pedagógicos.',
      icono: 'graduation',
      rachaRequerida: 0,
      desbloqueada: conceptosSet.size >= 5,
      categoriaTipo: 'conocimiento',
      progresoActual: Math.min(5, conceptosSet.size),
      progresoTotal: 5,
      rareza: 'rara',
    },
    {
      id: 'insignia-inversor-inteligente',
      titulo: 'Mente Inversora',
      descripcion: 'Elegir opciones de inversión productiva en al menos 2 ocasiones.',
      icono: 'trending',
      rachaRequerida: 0,
      desbloqueada: decisionesInversion >= 2,
      categoriaTipo: 'especial',
      progresoActual: Math.min(2, decisionesInversion),
      progresoTotal: 2,
      rareza: 'epica',
    },
  ];
}
