import { Desafio, ChallengeCategory, DesafioOpcion, UserProfile, Movimiento, Categoria, HistorialDesafio } from '../types';

export const CATEGORY_META: Record<ChallengeCategory, { label: string; color: string; badgeBg: string; icon: string }> = {
  gastos_cotidianos: { label: 'Gastos Cotidianos', color: '#4A5A2E', badgeBg: 'bg-[#E2E7D5] text-[#4A5A2E]', icon: 'coffee' },
  imprevistos: { label: 'Imprevistos', color: '#D97706', badgeBg: 'bg-amber-100 text-amber-800', icon: 'alert-triangle' },
  ahorro: { label: 'Ahorro', color: '#2563EB', badgeBg: 'bg-blue-100 text-blue-800', icon: 'piggy-bank' },
  presupuesto: { label: 'Presupuesto', color: '#0D9488', badgeBg: 'bg-teal-100 text-teal-800', icon: 'calculator' },
  inversion: { label: 'Inversión', color: '#7C3AED', badgeBg: 'bg-purple-100 text-purple-800', icon: 'trending-up' },
  compras: { label: 'Compras Inteligentes', color: '#DB2777', badgeBg: 'bg-pink-100 text-pink-800', icon: 'shopping-bag' },
  deudas: { label: 'Deudas y Crédito', color: '#DC2626', badgeBg: 'bg-rose-100 text-rose-800', icon: 'credit-card' },
  ingresos: { label: 'Ingresos Extra', color: '#16A34A', badgeBg: 'bg-emerald-100 text-emerald-800', icon: 'dollar-sign' },
  oportunidades: { label: 'Oportunidades', color: '#EA580C', badgeBg: 'bg-orange-100 text-orange-800', icon: 'sparkles' },
  transporte: { label: 'Transporte', color: '#4F46E5', badgeBg: 'bg-indigo-100 text-indigo-800', icon: 'bus' },
  alimentacion: { label: 'Alimentación', color: '#65A30D', badgeBg: 'bg-lime-100 text-lime-800', icon: 'utensils' },
  necesidad_vs_deseo: { label: 'Necesidad vs Deseo', color: '#9333EA', badgeBg: 'bg-fuchsia-100 text-fuchsia-800', icon: 'scale' },
};

export const INITIAL_DESAFIOS: Desafio[] = [
  {
    id: 'desafio-1-aguinaldo',
    titulo: 'Cobro de Aguinaldo / Bono inesperado',
    situacion: 'Recibiste un bono extraordinario de $250.000 en tu trabajo. Tus amigos planean una escapada de fin de semana, pero también tenés el saldo rotativo de la tarjeta de crédito acumulando intereses y querés iniciar tu fondo de emergencia.',
    categoria: 'ingresos',
    montoInvolucrado: 250000,
    dificultad: 'medio',
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Pagar deudas caras ($150.000) y destinar el resto ($100.000) al fondo de emergencia',
        tipoImpacto: 'ahorro',
        impactoMonto: 100000,
        consecuencia: 'Eliminás la tasa de interés más costosa del mercado (CFT superior al 120%) y creás un colchón seguro para imprevistos.',
        explicacionEducativa: 'Liquidar pasivos tóxicos antes de gastar te otorga una rentabilidad implícita inmediata igual a los intereses que dejás de pagar. La tranquilidad financiera es el mejor activo.',
        conceptoClave: 'Costo Financiero Total (CFT) y Fondo de Emergencia'
      },
      {
        id: 'B',
        texto: 'Gastar todo en el viaje de fin de semana y postergar las deudas para el próximo mes',
        tipoImpacto: 'gasto',
        impactoMonto: 250000,
        consecuencia: 'Disfrutás el momento social, pero la deuda de tarjeta se incrementará con intereses punitorios y tu disponible del próximo mes estará asfixiado.',
        explicacionEducativa: 'Gastar ingresos extraordinarios sin blindar tus obligaciones profundiza el estrés financiero a mediano plazo y convierte una oportunidad de desahogo en una bola de nieve.',
        conceptoClave: 'Sesgo del presente y deuda rotativa'
      },
      {
        id: 'C',
        texto: 'Destinar 50% al fondo de emergencia, 30% a deudas y 20% a un festejo moderado ($50.000)',
        tipoImpacto: 'neutro',
        impactoMonto: 50000,
        consecuencia: 'Equilibrás recompensa personal con disciplina: avanzás en tus metas y amortizás parte de tus compromisos sin culpa.',
        explicacionEducativa: 'La regla 50-30-20 adaptada a ingresos extraordinarios previene el efecto rebote de privarse totalmente, manteniendo la estabilidad presupuestaria.',
        conceptoClave: 'Regla de asignación balanceada'
      }
    ]
  },
  {
    id: 'desafio-2-tarjeta-cuotas',
    titulo: 'Electrodoméstico roto: ¿Contado o cuotas?',
    situacion: 'Se te rompió el lavarropas. El nuevo cuesta $420.000 al contado, o 12 cuotas fijas de $49.000 (total financiado: $588.000). Tenés ahorros en dólares/pesos que cubren el monto, pero tu fondo de emergencia quedaría al 40%.',
    categoria: 'deudas',
    montoInvolucrado: 420000,
    dificultad: 'avanzado' as any,
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Comprar en 12 cuotas fijas invirtiendo el dinero líquido en un instrumento que devengue tasa',
        tipoImpacto: 'inversion',
        impactoMonto: 49000,
        consecuencia: 'Mantenés la liquidez de tu fondo de emergencia. Si la inflación o tasa supera el recargo financiero (40% anual vs inflación), salís ganando en términos reales.',
        explicacionEducativa: 'El valor tiempo del dinero y la tasa real negativa: cuando la cuota fija es inferior a la expectativa de inflación más rendimiento de inversión, el financiamiento preserva capital operativo.',
        conceptoClave: 'Valor tiempo del dinero y Tasa Real'
      },
      {
        id: 'B',
        texto: 'Pagar 100% de contado gastando la mayor parte del fondo de emergencia',
        tipoImpacto: 'gasto',
        impactoMonto: 420000,
        consecuencia: 'Te ahorrás $168.000 de recargo financiero nominal, pero quedás vulnerable ante cualquier emergencia médica o laboral durante los próximos 3 meses.',
        explicacionEducativa: 'Ahorrar intereses no siempre compensa quedarse ilíquido. El fondo de emergencia existe para evitar endeudarse de urgencia en condiciones mucho peores.',
        conceptoClave: 'Riesgo de iliquidez vs Descuento financiero'
      },
      {
        id: 'C',
        texto: 'Pedir presupuesto para repararlo por $85.000 con garantía de 6 meses mientras ahorrás para el nuevo',
        tipoImpacto: 'ahorro',
        impactoMonto: 85000,
        consecuencia: 'Resolvés el problema inmediato desembolsando solo el 20% del costo y ganás tiempo para planificar la compra definitiva sin endeudarte.',
        explicacionEducativa: 'La extensión de vida útil de activos fijos reduce el costo por uso y protege el flujo de fondos disponible mes a mes.',
        conceptoClave: 'Costo por ciclo de vida y postergación estratégica'
      }
    ]
  },
  {
    id: 'desafio-3-supermercado',
    titulo: 'Inflación en el supermercado y compras mayoristas',
    situacion: 'Cobraste el sueldo. El hipermercado ofrece 25% de reintegro con tarjeta de débito en alimentos no perecederos si comprás para todo el mes ($180.000). Sin embargo, te deja con poco disponible para las salidas de las próximas dos semanas.',
    categoria: 'compras',
    montoInvolucrado: 180000,
    dificultad: 'facil',
    tipoDesafio: 'oportunidad',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Aprovechar la promoción mayorista y stockearte con $45.000 de ahorro directo',
        tipoImpacto: 'ahorro',
        impactoMonto: 45000,
        consecuencia: 'Congelás precios de la canasta básica antes de futuros aumentos y ahorrás un 25% neto real en alimentos esenciales.',
        explicacionEducativa: 'La compra programada de bienes no perecederos de consumo garantizado es una de las mejores inversiones domésticas en contextos inflacionarios.',
        conceptoClave: 'Cobertura inflacionaria en bienes básicos'
      },
      {
        id: 'B',
        texto: 'Comprar solo para 3 días en el almacén de barrio ($35.000) para preservar el disponible del finde',
        tipoImpacto: 'gasto',
        impactoMonto: 35000,
        consecuencia: 'Pagás precios por unidad hasta 30% más caros a lo largo del mes y perdés el reintegro bancario, encareciendo tu presupuesto total.',
        explicacionEducativa: 'El sesgo de micro-compras cotidianas genera un sobrecosto acumulado invisible ("gasto hormiga amplificado") que carcome la capacidad de ahorro.',
        conceptoClave: 'Sobrecosto de compra atomizada'
      }
    ]
  },
  {
    id: 'desafio-4-suscripciones',
    titulo: 'Auditoría de suscripciones y gastos vampiro',
    situacion: 'Revisando tu resumen encontrás 4 plataformas de streaming, una app de fitness que no usás hace meses y un almacenamiento cloud duplicado. En total suman $38.500 mensuales en débito automático.',
    categoria: 'gastos_cotidianos',
    montoInvolucrado: 38500,
    dificultad: 'facil',
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Cancelar 3 servicios inactivos y ahorrar $26.000 mensuales automatizando ese monto a una meta',
        tipoImpacto: 'ahorro',
        impactoMonto: 26000,
        consecuencia: 'Recuperás $312.000 al año sin perder calidad de vida, redirigiendo el dinero a tus proyectos prioritarios.',
        explicacionEducativa: 'Los costos fijos automáticos pasan desapercibidos por inercia cognitiva. Cancelar servicios subutilizados libera flujo de caja inmediato.',
        conceptoClave: 'Gastos vampiro y costo recurrente anualizado'
      },
      {
        id: 'B',
        texto: 'Dejarlos "por las dudas" porque el proceso de reactivación da pereza',
        tipoImpacto: 'gasto',
        impactoMonto: 38500,
        consecuencia: 'Seguís pagando por servicios no consumidos, drenando dinero que podría financiar tus vacaciones o emergencias.',
        explicacionEducativa: 'El sesgo de statu quo: las empresas de suscripción diseñan modelos de cobro recurrente precisamente porque el usuario posterga la baja por fricción psicológica.',
        conceptoClave: 'Sesgo de Statu Quo y costo de inacción'
      }
    ]
  },
  {
    id: 'desafio-5-delivery-vs-cocina',
    titulo: 'Cansancio nocturno: ¿Delivery o cocinar?',
    situacion: 'Es jueves a la noche, saliste cansado del trabajo y la heladera está vacía. Un pedido de hamburguesas gourmet con envío y propina cuesta $24.000 para dos personas. En el congelador tenés fideos caseros y salsa que se preparan en 15 minutos.',
    categoria: 'alimentacion',
    montoInvolucrado: 24000,
    dificultad: 'facil',
    tipoDesafio: 'dilema',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Cocinar los fideos en 15 minutos y reservar el delivery para un festejo especial el fin de semana',
        tipoImpacto: 'ahorro',
        impactoMonto: 24000,
        consecuencia: 'Cuidás tu dinero en un día rutinario y dejás el gasto recreativo para cuando realmente lo disfrutes con tiempo y calma.',
        explicacionEducativa: 'Diferenciar fatiga transitoria de disfrute real. La conveniencia tiene un precio premium; usarla como hábito en vez de excepción multiplica los egresos mensuales.',
        conceptoClave: 'Gratificación postergada vs Gasto de conveniencia'
      },
      {
        id: 'B',
        texto: 'Pedir el delivery gourmet con entrega rápida',
        tipoImpacto: 'gasto',
        impactoMonto: 24000,
        consecuencia: 'Descansás de cocinar, pero consumís en una sola cena de jueves el presupuesto de comida de 3 días completos.',
        explicacionEducativa: 'El costo por caloría y conveniencia del delivery suele superar 4 a 5 veces el costo del menú casero. Controlar la frecuencia mensual es clave.',
        conceptoClave: 'Gasto por fricción y costo relativo de conveniencia'
      }
    ]
  },
  {
    id: 'desafio-6-transporte-lluvia',
    titulo: 'Día de lluvia torrencial y transporte colapsado',
    situacion: 'Llueve fuerte en la ciudad y el transporte público está demorado. La app de viajes tiene tarifa dinámica multiplicada x2.5: el viaje a tu casa cuesta $22.000 en vez de $4.500. El colectivo tarda 30 minutos más pero cuesta $650 con tu tarjeta SUBE.',
    categoria: 'transporte',
    montoInvolucrado: 22000,
    dificultad: 'medio',
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Tomar un café en una librería por $3.500, esperar 45 min a que baje la tarifa dinámica y luego viajar',
        tipoImpacto: 'ahorro',
        impactoMonto: 14000,
        consecuencia: 'Pasás un momento agradable y seco, pagando en total $8.000 ($3.500 café + $4.500 viaje normal), ahorrando $14.000 respecto a la tarifa inflada.',
        explicacionEducativa: 'Arbitraje temporal: esperar activamente a que los picos de demanda artificial se normalicen evita pagar sobreprecios desmedidos por urgencias relativas.',
        conceptoClave: 'Tarifa dinámica y paciencia estratégica'
      },
      {
        id: 'B',
        texto: 'Pagar los $22.000 de inmediato para no esperar un solo minuto',
        tipoImpacto: 'gasto',
        impactoMonto: 22000,
        consecuencia: 'Llegás antes a tu casa, pero pagás una penalización económica desproporcionada por 30 minutos de tiempo.',
        explicacionEducativa: 'Calcular el valor de tu hora de trabajo vs el sobreprecio: si pagar $22.000 equivale a 4 horas de tu sueldo por ahorrar 30 minutos, la ecuación es deficitaria.',
        conceptoClave: 'Relación valor-hora vs sobreprecio de conveniencia'
      },
      {
        id: 'C',
        texto: 'Tomar el colectivo con impermeable y paraguas por $650',
        tipoImpacto: 'ahorro',
        impactoMonto: 21350,
        consecuencia: 'Ahorrás más de $21.000 en un solo trayecto protegiendo tu presupuesto mensual de transporte.',
        explicacionEducativa: 'La resiliencia en gastos diarios cotidianos es la base que permite acumular excedente para metas de largo plazo.',
        conceptoClave: 'Cuidado del presupuesto operativo'
      }
    ]
  },
  {
    id: 'desafio-7-inversion-rendimientos',
    titulo: 'Dinero parado en cuenta a la vista vs Rendimiento diario',
    situacion: 'Cobraste $600.000 destinados a pagar alquiler y servicios dentro de 15 días. Si el dinero queda en la caja de ahorro bancaria tradicional rinde 0%. Una cuenta remunerada o fondo común de liquidez inmediata (T+0) paga tasa diaria.',
    categoria: 'inversion',
    montoInvolucrado: 600000,
    dificultad: 'medio',
    tipoDesafio: 'oportunidad',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Colocar el dinero en cuenta remunerada T+0 durante los 15 días antes de pagar',
        tipoImpacto: 'inversion',
        impactoMonto: 18000,
        consecuencia: 'Generás aproximadamente $18.000 de rendimientos automáticos con disponibilidad inmediata para pagar tus compromisos a término.',
        explicacionEducativa: 'La gestión de tesorería personal: en economías con inflación, el dinero ocioso pierde poder adquisitivo día a día. Los fondos de dinero T+0 generan intereses diarios sin riesgo de bloqueo.',
        conceptoClave: 'Cash management personal y Costo de oportunidad del dinero ocioso'
      },
      {
        id: 'B',
        texto: 'Dejarlo en la caja de ahorro tradicional para no complicarse con transferencias',
        tipoImpacto: 'neutro',
        impactoMonto: 0,
        consecuencia: 'El dinero pierde valor real día tras día por inflación y dejás sobre la mesa dinero gratis que cubría las expensas o el abono de internet.',
        explicacionEducativa: 'La fricción operativa no debe ser excusa: mover el dinero a fondos remunerados hoy toma 30 segundos y protege el valor de tus fondos comprometidos.',
        conceptoClave: 'Erosión inflacionaria del saldo a la vista'
      }
    ]
  },
  {
    id: 'desafio-8-tecnologia-cambio',
    titulo: 'Nuevo modelo de smartphone disponible',
    situacion: 'Tu teléfono actual funciona perfectamente, pero la marca acaba de lanzar la nueva versión con mejor cámara. Ofrecen entregarlo como parte de pago y abonar la diferencia en 6 cuotas de $65.000 ($390.000 total). Tu meta para las vacaciones está al 50%.',
    categoria: 'necesidad_vs_deseo',
    montoInvolucrado: 390000,
    dificultad: 'facil',
    tipoDesafio: 'dilema',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Mantener tu teléfono actual y seguir aportando a tu meta de vacaciones',
        tipoImpacto: 'ahorro',
        impactoMonto: 390000,
        consecuencia: 'Evitás comprometer $65.000 mensuales durante medio año y tu viaje de descanso soñado queda garantizado.',
        explicacionEducativa: 'Obsolescencia percibida: el marketing crea la ilusión de necesidad sobre bienes que ya satisfacen completamente su función utilitaria.',
        conceptoClave: 'Obsolescencia percibida y Costo de oportunidad'
      },
      {
        id: 'B',
        texto: 'Comprar el nuevo teléfono para estar actualizado',
        tipoImpacto: 'gasto',
        impactoMonto: 390000,
        consecuencia: 'Estrenás dispositivo durante las primeras dos semanas, pero tenés que postergar o cancelar tus vacaciones por falta de presupuesto.',
        explicacionEducativa: 'La adaptación hedónica: la satisfacción por la compra de novedades tecnológicas decae rápidamente a las pocas semanas, mientras que la deuda perdura en el tiempo.',
        conceptoClave: 'Adaptación hedónica y priorización de metas'
      }
    ]
  },
  {
    id: 'desafio-9-reparacion-hogar',
    titulo: 'Humedad en la pared: ¿Arreglar hoy o esperar?',
    situacion: 'Apareció una mancha de humedad en la pared del baño. El plomero cobra $60.000 por cambiar el caño pinchado hoy. Si esperás a que empeore, puede romper cerámicos y filtrarse al vecino, con un costo estimado de más de $350.000.',
    categoria: 'imprevistos',
    montoInvolucrado: 600000,
    dificultad: 'medio',
    tipoDesafio: 'imprevisto',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Reparar de inmediato usando $60.000 de tu fondo de emergencia',
        tipoImpacto: 'ahorro',
        impactoMonto: 290000,
        consecuencia: 'Frenás el daño en seco, gastás lo mínimo indispensable y evitás un siniestro mayor de $350.000.',
        explicacionEducativa: 'Mantenimiento preventivo vs correctivo: atender imprevistos en su etapa inicial tiene un retorno sobre la inversión enorme al evitar daños colaterales exponenciales.',
        conceptoClave: 'Mantenimiento preventivo y contención de pérdidas'
      },
      {
        id: 'B',
        texto: 'Pintar encima con pintura antihumedad barata ($12.000) y postergar el arreglo',
        tipoImpacto: 'gasto',
        impactoMonto: 12000,
        consecuencia: 'Tapás el síntoma visual pero el caño sigue perdiendo: en 2 meses el daño estructural será mucho más grave y costoso.',
        explicacionEducativa: 'Los parches superficiales en activos esenciales multiplican el costo futuro y suelen terminar en deudas de emergencia imprevistas.',
        conceptoClave: 'Trampa del ahorro miope o falso ahorro'
      }
    ]
  },
  {
    id: 'desafio-10-emprendimiento-oportunidad',
    titulo: 'Venta de garage y descarte consciente',
    situacion: 'Tenés ropa en excelente estado, una bicicleta que no usás y dos muebles guardados en el depósito. Una plataforma online de segunda mano te permite publicarlos con envíos asegurados. Calculás obtener cerca de $160.000.',
    categoria: 'ingresos',
    montoInvolucrado: 160000,
    dificultad: 'facil',
    tipoDesafio: 'oportunidad',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Dedicar el sábado a tomar fotos y publicarlos para monetizar bienes estancados',
        tipoImpacto: 'inversion',
        impactoMonto: 160000,
        consecuencia: 'Despejás espacio físico en tu hogar e inyectás $160.000 frescos directamente en tu fondo de ahorro o inversión.',
        explicacionEducativa: 'Monetización de capital ocioso: los objetos en desuso pierden valor por paso del tiempo. Convertirlos en activos líquidos potencia tus finanzas.',
        conceptoClave: 'Activos ociosos y economía circular'
      },
      {
        id: 'B',
        texto: 'Dejar las cosas guardadas "por si alguna vez las vuelvo a usar"',
        tipoImpacto: 'neutro',
        impactoMonto: 0,
        consecuencia: 'Las cosas siguen ocupando lugar y perdiendo valor de reventa año tras año sin generar ningún beneficio.',
        explicacionEducativa: 'La falacia del costo hundido y apego emocional a bienes materiales: si no usaste un artículo en 12 meses, la probabilidad de que lo uses es menor al 5%.',
        conceptoClave: 'Falacia del costo hundido y desapego financiero'
      }
    ]
  },
  {
    id: 'desafio-11-gimnasio-anual',
    titulo: 'Pase anual de gimnasio con 50% de descuento',
    situacion: 'El gimnasio promociona su membresía anual a $180.000 de contado (equivalente a $15.000 por mes vs $30.000 mensual). Históricamente vas 2 o 3 meses al año y luego dejás por falta de tiempo.',
    categoria: 'presupuesto',
    montoInvolucrado: 180000,
    dificultad: 'medio',
    tipoDesafio: 'dilema',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Pagar mes a mes ($30.000) o entrenar en parques y calistenia gratis hasta afianzar el hábito durante 3 meses seguidos',
        tipoImpacto: 'ahorro',
        impactoMonto: 120000,
        consecuencia: 'Evitás inmovilizar $180.000 de golpe. Solo si demostrás consistencia evaluarás contratar un plazo largo.',
        explicacionEducativa: 'El sesgo de aspiración: compramos pases anuales para la "persona ideal" que quisiéramos ser, no para la persona real que somos. El compromiso gradual protege tu capital.',
        conceptoClave: 'Sesgo de aspiración y validación de hábitos'
      },
      {
        id: 'B',
        texto: 'Pagar el año completo convencido de que el desembolso te obligará a ir',
        tipoImpacto: 'gasto',
        impactoMonto: 180000,
        consecuencia: 'A los 45 días la motivación decae, dejás de ir y habrás desperdiciado más de $120.000 en meses no utilizados.',
        explicacionEducativa: 'La motivación financiera forzada rara vez sostiene hábitos de salud. Los gimnasios basan su rentabilidad en el 80% de miembros que pagan pero no asisten.',
        conceptoClave: 'Modelo de no asistencia y dinero irrecuperable'
      }
    ]
  },
  {
    id: 'desafio-12-prestamo-familiar',
    titulo: 'Un conocido te pide dinero prestado',
    situacion: 'Un amigo cercano te pide $120.000 para llegar a fin de mes prometiendo devolverlos el mes siguiente. No tenés certeza sobre su estabilidad de ingresos y ese dinero representa el 70% de tus ahorros líquidos del mes.',
    categoria: 'deudas',
    montoInvolucrado: 120000,
    dificultad: 'dificil',
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Explicar amablemente que tu presupuesto está comprometido en metas fijas, o regalarle $20.000 como ayuda sin esperar devolución',
        tipoImpacto: 'ahorro',
        impactoMonto: 100000,
        consecuencia: 'Preservás tanto la relación de amistad como tu propia solvencia financiera, sin generar resentimientos futuros.',
        explicacionEducativa: 'Regla de oro de los préstamos informales: nunca prestes dinero que no estés dispuesto a regalar. Prestar ahorros esenciales pone en jaque tus propias finanzas.',
        conceptoClave: 'Gestión de límites financieros y riesgo de incobrabilidad'
      },
      {
        id: 'B',
        texto: 'Prestarle todos tus ahorros ($120.000) por compromiso social',
        tipoImpacto: 'gasto',
        impactoMonto: 120000,
        consecuencia: 'Si tu amigo se retrasa, vos no podrás pagar tus cuentas ni afrontar imprevistos, generando tensión vincular.',
        explicacionEducativa: 'Transferir la fragilidad ajena a tus propias finanzas crea un efecto dominó que daña la estabilidad de ambos.',
        conceptoClave: 'Contagio de vulnerabilidad financiera'
      }
    ]
  },
  {
    id: 'desafio-13-combustible-tanque',
    titulo: 'Aumento inminente de combustible a medianoche',
    situacion: 'Se anunció un incremento del 7% en los combustibles a partir de las 00:00 hs. Tenés el tanque a un cuarto. Llenarlo hoy cuesta $52.000 de nafta súper en la estación de servicio, pero hay 25 minutos de cola.',
    categoria: 'transporte',
    montoInvolucrado: 52000,
    dificultad: 'facil',
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Llenar el tanque hoy y aprovechar el precio viejo ($3.640 de ahorro neto en el mes)',
        tipoImpacto: 'ahorro',
        impactoMonto: 3640,
        consecuencia: 'Ahorrás el incremento directo y garantizás movilidad para las próximas dos semanas sin pagar de más.',
        explicacionEducativa: 'Aprovechar ventanas de precio antes de ajustes programados en bienes de consumo inelástico protege tu poder de compra.',
        conceptoClave: 'Consumo inelástico y arbitraje temporal'
      },
      {
        id: 'B',
        texto: 'Cargar normalmente mañana sin hacer cola y optimizar tus viajes usando transporte público',
        tipoImpacto: 'neutro',
        impactoMonto: 2000,
        consecuencia: 'No perdés tiempo valioso en la fila y compensás el sobreprecio reduciendo el uso innecesario del vehículo.',
        explicacionEducativa: 'El costo de oportunidad de tu tiempo: hacer 45 minutos de fila para ahorrar un monto menor puede ser antieconómico si tu hora vale más.',
        conceptoClave: 'Costo de oportunidad del tiempo'
      },
      {
        id: 'C',
        texto: 'Cargar Premium mañana con recargo innecesario ($68.000)',
        tipoImpacto: 'gasto',
        impactoMonto: 68000,
        consecuencia: 'Gastás hasta un 30% adicional en combustible con beneficios mecánicos casi nulos en motores estándar.',
        explicacionEducativa: 'Pagar por especificaciones que tu vehículo no requiere es una fuga silenciosa recurrente en el presupuesto mensual.',
        conceptoClave: 'Sobreprecio innecesario en insumos'
      }
    ]
  },
  {
    id: 'desafio-14-servicios-tarifa-luz',
    titulo: 'Aumento de tarifa en servicios del hogar',
    situacion: 'Llegó la factura de luz bimestral con un salto a $58.000 debido a la quita de subsidios y consumo de calefacción/aire. El presupuesto destinado a servicios era de $35.000.',
    categoria: 'servicios' as any,
    montoInvolucrado: 58000,
    dificultad: 'medio',
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Pagar en fecha reajustando gastos prescindibles del mes e implementar hábitos de eficiencia energética',
        tipoImpacto: 'ahorro',
        impactoMonto: 15000,
        consecuencia: 'Evitás intereses por mora y cortás el consumo pasivo de electrodomésticos en stand-by para la próxima factura.',
        explicacionEducativa: 'Los servicios públicos son costos fijos de primera necesidad. Postergar su pago genera multas e intereses acumulativos rápidos.',
        conceptoClave: 'Priorización de costos fijos esenciales y eficiencia energética'
      },
      {
        id: 'B',
        texto: 'Pagar con tarjeta de crédito en 3 cuotas con interés del banco',
        tipoImpacto: 'gasto',
        impactoMonto: 22000,
        consecuencia: 'Pateás la deuda pero sumás costo financiero a un gasto recurrente que volverá a vencer el mes que viene.',
        explicacionEducativa: 'Financiar con intereses los gastos corrientes de consumo mensual destruye la liquidez estructural.',
        conceptoClave: 'Financiamiento tóxico de gastos corrientes'
      },
      {
        id: 'C',
        texto: 'Verificar categoría en el Registro de Acceso a los Subsidios a la Energía (RASE) por si corresponde tarifa social',
        tipoImpacto: 'ahorro',
        impactoMonto: 25000,
        consecuencia: 'Podés regularizar tu segmento tarifario y reducir futuras facturas hasta un 40% si calificás por ingresos.',
        explicacionEducativa: 'Auditar los derechos y subsidios vigentes es una vía legítima y activa de protección patrimonial.',
        conceptoClave: 'Auditoría tarifaria y derechos de subsidio'
      }
    ]
  },
  {
    id: 'desafio-15-salida-amigos-cuenta',
    titulo: 'Salida con amigos: ¿Dividir en partes iguales?',
    situacion: 'Fuiste a cenar con un grupo a un bar. Vos pediste un plato simple y agua ($18.000), pero la mayoría pidió cócteles caros, entradas y postres. Al final, proponen dividir la cuenta en partes iguales: $36.000 por persona.',
    categoria: 'gastos_cotidianos',
    montoInvolucrado: 36000,
    dificultad: 'medio',
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Plantear amablemente pagar tu consumo exacto más propina ($20.000)',
        tipoImpacto: 'ahorro',
        impactoMonto: 16000,
        consecuencia: 'Ahorrás $16.000 de forma justa y establecés límites sanos de consumo sin dañar la amistad.',
        explicacionEducativa: 'La presión social en consumos compartidos suele desbordar presupuestos personales. Hablar con naturalidad de dinero evita resentimientos.',
        conceptoClave: 'Presión social y asertividad financiera'
      },
      {
        id: 'B',
        texto: 'Pagar los $36.000 callado por vergüenza a desentonar con el grupo',
        tipoImpacto: 'gasto',
        impactoMonto: 36000,
        consecuencia: 'Subsidiaste el consumo ajeno duplicando tu presupuesto de salidas de toda la quincena.',
        explicacionEducativa: 'El "impuesto a la vergüenza" corroe las finanzas personales cuando el temor al juicio ajeno supera la sensatez económica.',
        conceptoClave: 'Impuesto social y subsidio involuntario'
      },
      {
        id: 'C',
        texto: 'Proponer transferir un monto intermedio ($25.000) cubriendo tu consumo y una ronda compartida',
        tipoImpacto: 'neutro',
        impactoMonto: 25000,
        consecuencia: 'Mantenés la camaradería sin pagar el doble de lo consumido.',
        explicacionEducativa: 'Buscar un punto de equilibrio social permite disfrutar de la vida comunitaria sin descuidar el control financiero.',
        conceptoClave: 'Negociación empática'
      }
    ]
  },
  {
    id: 'desafio-16-tarjeta-pago-minimo',
    titulo: 'La trampa del pago mínimo de la tarjeta de crédito',
    situacion: 'Cerró el resumen de tu tarjeta de crédito con un saldo total de $310.000. El banco te muestra en letra grande la opción de pagar el "Pago Mínimo" de $38.000 para no entrar en mora.',
    categoria: 'deudas',
    montoInvolucrado: 310000,
    dificultad: 'dificil',
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Pagar el total ($310.000) usando parte del ahorro corriente para liquidar la deuda sin intereses',
        tipoImpacto: 'ahorro',
        impactoMonto: 180000,
        consecuencia: 'Evitás tasas de interés compensatorias y punitorias que superan el 140% anual en Argentina.',
        explicacionEducativa: 'El pago total de la tarjeta es la regla de oro: el interés rotativo de tarjeta es la deuda más cara del sistema bancario.',
        conceptoClave: 'Interés rotativo y Costo Financiero Total'
      },
      {
        id: 'B',
        texto: 'Pagar únicamente el mínimo de $38.000 y usar el resto para gastar en el mes',
        tipoImpacto: 'gasto',
        impactoMonto: 310000,
        consecuencia: 'El saldo restante generará intereses masivos. En 3 meses tu deuda habrá aumentado considerablemente sin haber hecho nuevas compras.',
        explicacionEducativa: 'El pago mínimo es un producto diseñado para que el cliente pague intereses perpetuos sin reducir el capital adeudado.',
        conceptoClave: 'Espiral de deuda rotativa'
      },
      {
        id: 'C',
        texto: 'Pagar $220.000 ahora y refinanciar el saldo restante a tasa fija si no alcanzás al total',
        tipoImpacto: 'neutro',
        impactoMonto: 90000,
        consecuencia: 'Reducís drásticamente la base sobre la que se calculan los intereses y acotás el costo financiero.',
        explicacionEducativa: 'Amortizar el máximo monto posible reduce el capital sobre el cual corren los intereses diarios de la tarjeta.',
        conceptoClave: 'Amortización de capital adeudado'
      }
    ]
  },
  {
    id: 'desafio-17-almuerzo-oficina-tupper',
    titulo: 'Almuerzo laboral: Delivery diario vs cocina en casa',
    situacion: 'En tus días de trabajo gastás en promedio $9.500 por día en menús ejecutivos o empanadas ($190.000 al mes en 20 días hábiles). Cocinar viandas el domingo te llevaría 2 horas y $45.000 en insumos de supermercado.',
    categoria: 'alimentacion',
    montoInvolucrado: 190000,
    dificultad: 'facil',
    tipoDesafio: 'oportunidad',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Preparar viandas caseras 4 días a la semana y reservar 1 día para comer afuera ($145.000 de ahorro mensual)',
        tipoImpacto: 'ahorro',
        impactoMonto: 145000,
        consecuencia: 'Ahorrás más de $140.000 netos mensuales que van directo a tu fondo de metas o vacaciones, comiendo más sano.',
        explicacionEducativa: 'El "gasto hormiga gourmet" es una de las mayores fugas de la clase trabajadora: cocinar en lote (meal prep) reduce el costo por porción en un 70%.',
        conceptoClave: 'Economías de escala doméstica (Meal Prep)'
      },
      {
        id: 'B',
        texto: 'Seguir comprando comida rápida todos los mediodías ($190.000/mes)',
        tipoImpacto: 'gasto',
        impactoMonto: 190000,
        consecuencia: 'Gastás casi medio sueldo básico en almuerzos rutinarios sin darte cuenta y perjudicás tu salud.',
        explicacionEducativa: 'La inercia de conveniencia inmediata genera un alto costo oculto que frena tus metas de ahorro a largo plazo.',
        conceptoClave: 'Costo oculto de la conveniencia'
      },
      {
        id: 'C',
        texto: 'Organizar almuerzos compartidos con un compañero de trabajo alternando días de cocina',
        tipoImpacto: 'ahorro',
        impactoMonto: 120000,
        consecuencia: 'Dividís el esfuerzo de cocinar a la mitad y disfrutás de comida casera variada ahorrando significativamente.',
        explicacionEducativa: 'La colaboración cooperativa genera eficiencias de tiempo y recursos superiores al esfuerzo individual.',
        conceptoClave: 'Economía colaborativa y reciprocidad'
      }
    ]
  },
  {
    id: 'desafio-18-cuenta-remunerada-inversion',
    titulo: 'Pesos ociosos: Caja de ahorro tradicional vs Billetera con rendimiento',
    situacion: 'Tenés $350.000 en la caja de ahorro bancaria destinados a pagar servicios y gastos en los próximos 20 días. En la caja de ahorro tradicional rinden 0% de interés mientras la inflación erosiona su valor.',
    categoria: 'inversion',
    montoInvolucrado: 350000,
    dificultad: 'facil',
    tipoDesafio: 'oportunidad',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Colocar los fondos en una cuenta remunerada o Fondo Común Money Market con liquidez 24/7',
        tipoImpacto: 'inversion',
        impactoMonto: 28000,
        consecuencia: 'Tus pesos generan intereses diarios sin quedar bloqueados; retirás al instante cuando debés pagar cada cuenta.',
        explicacionEducativa: 'El dinero a la vista en cuentas remuneradas minimiza la pérdida por inflación sin sacrificar liquidez operativa diaria.',
        conceptoClave: 'Liquidez inmediata y Rendimiento de saldos transaccionales'
      },
      {
        id: 'B',
        texto: 'Dejar el dinero quieto en la caja de ahorro bancaria por comodidad',
        tipoImpacto: 'gasto',
        impactoMonto: 28000,
        consecuencia: 'Dejás dinero sobre la mesa: la inflación devora el poder de compra de tus fondos transaccionales.',
        explicacionEducativa: 'Tener pesos quietos al 0% es regalarle valor al banco: ponerlos a trabajar a corto plazo es disciplina básica de finanzas personales.',
        conceptoClave: 'Erosión inflacionaria de saldos a la vista'
      },
      {
        id: 'C',
        texto: 'Constituir un Plazo Fijo tradicional a 30 días',
        tipoImpacto: 'neutro',
        impactoMonto: 32000,
        consecuencia: 'Ganás algo más de tasa, pero no podrás disponer del dinero para pagar las cuentas del día 15, obligándote a endeudarte.',
        explicacionEducativa: 'Calzar vencimientos: nunca inmovilices dinero a plazo si tenés compromisos de pago previos a la fecha de vencimiento.',
        conceptoClave: 'Calce de plazos y liquidez'
      }
    ]
  },
  {
    id: 'desafio-19-service-auto-preventivo',
    titulo: 'Service del vehículo: Mantenimiento preventivo vs correctivo',
    situacion: 'Tu auto llegó a los 10.000 km desde el último service. El cambio de aceite, filtros y chequeo general cuesta $115.000. El auto no falla, pero postergarlo 6 meses más puede desgastar piezas del motor cuya reparación costaría $850.000.',
    categoria: 'imprevistos',
    montoInvolucrado: 115000,
    dificultad: 'medio',
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Hacer el service en tiempo y forma ($115.000) programándolo en el presupuesto del mes',
        tipoImpacto: 'ahorro',
        impactoMonto: 115000,
        consecuencia: 'Preservás la vida útil del motor, mantenés el valor de reventa del vehículo y evitás una rotura catastrófica.',
        explicacionEducativa: 'El mantenimiento preventivo siempre es una inversión, no un gasto. Previene costos correctivos de 5 a 10 veces superiores.',
        conceptoClave: 'Mantenimiento preventivo vs correctivo'
      },
      {
        id: 'B',
        texto: 'Postergar el service hasta fin de año para no gastar ahora',
        tipoImpacto: 'gasto',
        impactoMonto: 400000,
        consecuencia: 'El aceite degradado dañará componentes internos, terminando en el taller con una cuenta millonaria inesperada.',
        explicacionEducativa: 'El ahorro aparente de no mantener bienes durables es una ilusión que deviene en pérdidas financieras graves.',
        conceptoClave: 'Falso ahorro por desidia preventiva'
      },
      {
        id: 'C',
        texto: 'Comprar vos mismo los insumos certificados y pagar solo la mano de obra del mecánico ($80.000)',
        tipoImpacto: 'ahorro',
        impactoMonto: 35000,
        consecuencia: 'Ahorrás $35.000 de sobreprecio en repuestos sin sacrificar la calidad ni el mantenimiento.',
        explicacionEducativa: 'La autogestión de compras de repuestos permite optimizar costos de mantenimiento sin recortar calidad técnica.',
        conceptoClave: 'Optimización de compras técnicas'
      }
    ]
  },
  {
    id: 'desafio-20-cuotas-sin-interes-descuento',
    titulo: 'Electrodoméstico: ¿Descuento en efectivo o cuotas sin interés?',
    situacion: 'Vas a comprar un microondas de $160.000. El comercio te ofrece dos alternativas: 6 cuotas fijas de $26.666 (total $160.000 sin interés aparente) o 15% de descuento por transferencia o efectivo inmediato ($136.000). Tenés el dinero disponible.',
    categoria: 'compras',
    montoInvolucrado: 160000,
    dificultad: 'avanzado' as any,
    tipoDesafio: 'decision',
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: 'Pagar de contado por transferencia aprovechando el 15% de descuento ($24.000 de ahorro inmediato)',
        tipoImpacto: 'ahorro',
        impactoMonto: 24000,
        consecuencia: 'Obtenés un 15% de ganancia segura e inmediata, superando la inflación mensual esperada y cerrando la compra sin deuda.',
        explicacionEducativa: 'Un descuento al contado superior al 12-15% suele ser matemáticamente superior a financiar en 6 cuotas con inflación moderada.',
        conceptoClave: 'Tasa implícita de descuento al contado'
      },
      {
        id: 'B',
        texto: 'Elegir 6 cuotas e invertir los $136.000 en un instrumento a tasa fija que supere el descuento',
        tipoImpacto: 'inversion',
        impactoMonto: 26666,
        consecuencia: 'Mantenés la liquidez en tu poder devengando rendimientos mes a mes mientras pagás cuotas licuadas por el tiempo.',
        explicacionEducativa: 'El costo financiero implícito: si la tasa que podés obtener con tu dinero supera el recargo de financiar, las cuotas son una herramienta inteligente.',
        conceptoClave: 'Arbitraje de tasas y preservación de liquidez'
      },
      {
        id: 'C',
        texto: 'Financiar en 6 cuotas y gastar los $136.000 en salidas del fin de semana',
        tipoImpacto: 'gasto',
        impactoMonto: 160000,
        consecuencia: 'Te quedaste sin el dinero líquido y comprometiste tu sueldo de los próximos 6 meses con cuotas fijas.',
        explicacionEducativa: 'Usar el margen de la tarjeta para liberar efectivo y gastarlo en consumo inmediato es el camino directo al sobreendeudamiento.',
        conceptoClave: 'Efecto sustitución perjudicial'
      }
    ]
  }
];

/**
 * Genera un desafío contextualizado dinámicamente con los datos reales del usuario.
 */
export function generarDesafioPersonalizado(
  userProfile: UserProfile,
  movements: Movimiento[],
  categories: Categoria[],
  disponibleMes: number
): Desafio | null {
  if (movements.length < 2) return null;

  // Encontrar la categoría con más gasto del usuario
  const gastosPorCat = new Map<string, number>();
  for (const m of movements) {
    if (m.tipo === 'gasto') {
      gastosPorCat.set(m.categoriaId, (gastosPorCat.get(m.categoriaId) || 0) + m.monto);
    }
  }

  let mayorCatId = '';
  let mayorGasto = 0;
  for (const [catId, gasto] of gastosPorCat.entries()) {
    if (gasto > mayorGasto) {
      mayorGasto = gasto;
      mayorCatId = catId;
    }
  }

  const catEncontrada = categories.find((c) => c.id === mayorCatId);
  const nombreCat = catEncontrada ? catEncontrada.nombre : 'Gastos Generales';
  const limite = catEncontrada?.limiteMensual || (userProfile.presupuestoMensual * 0.3);
  const porcentajeConsumido = Math.round((mayorGasto / Math.max(1, limite)) * 100);

  const montoAhorroSugerido = Math.round(mayorGasto * 0.15);

  return {
    id: `desafio-personalizado-${Date.now()}`,
    titulo: `Optimización en ${nombreCat}: Tus datos reales`,
    situacion: `Llevás gastado $${mayorGasto.toLocaleString('es-AR')} en ${nombreCat} este mes (${porcentajeConsumido}% de su asignación). Tu saldo disponible actual es de $${Math.max(0, disponibleMes).toLocaleString('es-AR')}. Si aplicás un ajuste del 15% en compras no prioritarias de este rubro, podés recuperar $${montoAhorroSugerido.toLocaleString('es-AR')}.`,
    categoria: 'presupuesto',
    montoInvolucrado: montoAhorroSugerido,
    dificultad: 'medio',
    tipoDesafio: 'presupuesto_real',
    esPersonalizado: true,
    activo: true,
    opciones: [
      {
        id: 'A',
        texto: `Aplicar una pausa en ${nombreCat} por 7 días y reasignar $${montoAhorroSugerido.toLocaleString('es-AR')} a tu fondo de metas`,
        tipoImpacto: 'ahorro',
        impactoMonto: montoAhorroSugerido,
        consecuencia: `Tu disponible mensual se protege de sobregiros y tu racha de ahorro recibe una inyección inmediata.`,
        explicacionEducativa: `El rebalanceo en tiempo real: monitorear desvíos a mitad de mes permite frenar fugas antes de que el presupuesto mensual se agote.`,
        conceptoClave: 'Control de desvíos presupuestarios'
      },
      {
        id: 'B',
        texto: `Mantener el ritmo de consumo actual en ${nombreCat}`,
        tipoImpacto: 'gasto',
        impactoMonto: montoAhorroSugerido,
        consecuencia: `Terminarás el mes excediendo el límite de la categoría y comprometerás tu dinero disponible de los últimos días del mes.`,
        explicacionEducativa: `La inercia de gasto sin revisión genera sorpresas desagradables al cierre de mes cuando ya no queda margen de maniobra.`,
        conceptoClave: 'Riesgo de sobregiro por inercia'
      }
    ]
  };
}

/**
 * Retorna la clave de fecha local (YYYY-MM-DD) para el ciclo de 24 horas del usuario.
 */
export function getLocalTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula el tiempo restante hasta las 00:00 del próximo día (próximo desafío de 24h).
 */
export function getTiempoRestanteProximoDesafio(): { horas: number; minutos: number; formatted: string } {
  const now = new Date();
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const diffMs = Math.max(0, nextDay.getTime() - now.getTime());
  const horas = Math.floor(diffMs / (1000 * 60 * 60));
  const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return {
    horas,
    minutos,
    formatted: `${horas}h ${minutos}m`,
  };
}

/**
 * Selecciona un desafío aleatorio para el juego de mesa QR,
 * evitando desafíos completados recientemente para garantizar frescura y variedad.
 */
export function seleccionarDesafioQR(
  desafiosDisponibles: Desafio[],
  historialDesafios: HistorialDesafio[] | string[] = []
): Desafio {
  const activos = desafiosDisponibles.filter((d) => d.activo !== false);
  const pool = activos.length > 0 ? activos : INITIAL_DESAFIOS;

  const idsExcluir = Array.isArray(historialDesafios)
    ? historialDesafios.map((item) => (typeof item === 'string' ? item : item.desafioId))
    : [];

  // Excluir los últimos 6 completados para evitar repeticiones consecutivas en el tablero
  const ultimosIds = idsExcluir.slice(0, 6);
  const noRecientes = pool.filter((d) => !ultimosIds.includes(d.id));
  const poolFinal = noRecientes.length > 0 ? noRecientes : pool;

  const randomIndex = Math.floor(Math.random() * poolFinal.length);
  return poolFinal[randomIndex];
}

/**
 * Algoritmo robusto de selección del Desafío Diario:
 * - Es estrictamente 1 por día y garantiza una experiencia única cada 24 horas.
 * - Basado en el historial completo de desafíos realizados por el usuario para evitar repeticiones.
 * - Determinístico para toda la jornada (no cambia aleatoriamente durante el mismo día).
 * - Si ya se completó el desafío de hoy, fija ese desafío como completado y no re-asigna otro hasta el día siguiente.
 * - Si se agotaron todos los desafíos del banco sin repetir, cicla priorizando los menos recientes.
 */
export function seleccionarDesafioDiarioUnico(
  desafiosDisponibles: Desafio[],
  historialDesafios: HistorialDesafio[],
  fechaHoyKey?: string
): { desafio: Desafio; completadoHoy: boolean; registroCompletado?: HistorialDesafio } {
  const todayKey = fechaHoyKey || getLocalTodayDateKey();
  const activos = desafiosDisponibles.filter((d) => d.activo !== false);
  const pool = activos.length > 0 ? activos : INITIAL_DESAFIOS;

  // 1. Verificar si ya se completó un desafío en la fecha de hoy (origen diario o completado hoy)
  const completadoHoy = historialDesafios.find(
    (h) => (h.origen === 'diario' && h.fechaCompletado.startsWith(todayKey)) ||
           (h.fechaCompletado.startsWith(todayKey) && h.origen === 'diario')
  );

  if (completadoHoy) {
    const desafioAsociado = pool.find((d) => d.id === completadoHoy.desafioId) || {
      id: completadoHoy.desafioId,
      titulo: completadoHoy.desafioTitulo,
      situacion: completadoHoy.consecuencia || 'Desafío del día completado con éxito.',
      categoria: completadoHoy.categoria,
      montoInvolucrado: completadoHoy.impactoMonto,
      dificultad: 'medio' as const,
      tipoDesafio: 'decision' as const,
      activo: true,
      opciones: [
        {
          id: completadoHoy.opcionElegidaId,
          texto: completadoHoy.opcionElegidaTexto,
          tipoImpacto: completadoHoy.tipoImpacto,
          impactoMonto: completadoHoy.impactoMonto,
          consecuencia: completadoHoy.consecuencia,
          explicacionEducativa: completadoHoy.explicacionEducativa,
          conceptoClave: completadoHoy.conceptoClave,
        },
      ],
    };

    return {
      desafio: desafioAsociado,
      completadoHoy: true,
      registroCompletado: completadoHoy,
    };
  }

  // 2. Verificar si ya fue asignado un desafío para la fecha de hoy en almacenamiento local
  const todosCompletadosIds = new Set(historialDesafios.map((h) => h.desafioId));

  if (typeof window !== 'undefined') {
    try {
      const assignedRaw = localStorage.getItem('finanzas_daily_challenge_assigned');
      if (assignedRaw) {
        const assigned = JSON.parse(assignedRaw);
        if (assigned && assigned.date === todayKey && assigned.desafioId) {
          // Asegurarse de que el asignado no haya sido completado previamente
          if (!todosCompletadosIds.has(assigned.desafioId)) {
            const match = pool.find((d) => d.id === assigned.desafioId);
            if (match) {
              return { desafio: match, completadoHoy: false };
            }
          }
        }
      }
    } catch (e) {
      // Ignorar errores de localStorage
    }
  }

  // 3. Excluir del pool TODOS los desafíos que el usuario ya haya realizado en su historial
  const noRealizados = pool.filter((d) => !todosCompletadosIds.has(d.id));

  // Hash determinístico basado en la fecha (YYYY-MM-DD)
  let hash = 0;
  for (let i = 0; i < todayKey.length; i++) {
    hash = (hash << 5) - hash + todayKey.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  let desafioElegido: Desafio;

  if (noRealizados.length > 0) {
    // Ordenar de forma determinística por ID antes del módulo
    const noRealizadosOrdenados = [...noRealizados].sort((a, b) => a.id.localeCompare(b.id));
    const index = positiveHash % noRealizadosOrdenados.length;
    desafioElegido = noRealizadosOrdenados[index];
  } else {
    // Si ya completó todos los desafíos existentes en el banco,
    // excluir al menos los últimos 7 completados para evitar repeticiones recientes
    const recientesIds = new Set(historialDesafios.slice(0, 7).map((h) => h.desafioId));
    const candidatos = pool.filter((d) => !recientesIds.has(d.id));
    const poolFinal = candidatos.length > 0 ? candidatos : pool;
    const poolOrdenado = [...poolFinal].sort((a, b) => a.id.localeCompare(b.id));
    const index = positiveHash % poolOrdenado.length;
    desafioElegido = poolOrdenado[index];
  }

  // Persistir la asignación para las 24 horas del día
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        'finanzas_daily_challenge_assigned',
        JSON.stringify({ date: todayKey, desafioId: desafioElegido.id })
      );
    } catch (e) {
      // Ignorar errores de localStorage
    }
  }

  return { desafio: desafioElegido, completadoHoy: false };
}

/**
 * Función de compatibilidad legacy
 */
export function getDesafioDelDia(
  desafiosDisponibles: Desafio[],
  idsCompletadosRecientes: string[] = []
): Desafio {
  const pseudoHistorial = idsCompletadosRecientes.map((id) => ({
    id: `temp-${id}`,
    desafioId: id,
    desafioTitulo: '',
    categoria: 'presupuesto' as const,
    opcionElegidaId: 'A',
    opcionElegidaTexto: '',
    tipoImpacto: 'ahorro' as const,
    impactoMonto: 0,
    consecuencia: '',
    explicacionEducativa: '',
    conceptoClave: '',
    fechaCompletado: new Date().toISOString(),
    origen: 'diario' as const,
  }));
  const res = seleccionarDesafioDiarioUnico(desafiosDisponibles, pseudoHistorial);
  return res.desafio;
}
