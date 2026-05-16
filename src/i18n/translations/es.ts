import type { SiteTranslations } from './types';

export const es: SiteTranslations = {
  landing: {
    brandTagline: 'Gestión financiera inteligente',
    nav: [
      { label: 'Recursos', sectionId: 'recursos' },
      { label: 'Pantallas', sectionId: 'telas-painel' },
      { label: 'Sistema ideal', sectionId: 'sistema-ideal' },
      { label: 'Módulos', sectionId: 'modulos' },
      { label: 'Funciones', sectionId: 'funcoes' },
      { label: 'Planes', sectionId: 'planos' },
      { label: 'Beneficios', sectionId: 'beneficios' },
    ],
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    enterPanel: 'Entrar al panel',
    cartFloating: 'Carrito',
    cartTitle: 'Carrito de compra',
    cartSubtitle: 'Cada ítem ya generó una factura pendiente en administración.',
    cartClose: 'Cerrar',
    cartEmpty: 'Aún no hay planes en el carrito.',
    cartTotalPending: 'Total pendiente',
    cartCheckout: 'Finalizar compra y pagar',
    cartInvoiceHash: 'Factura #',
    cartRemove: 'Quitar del carrito',
    toastCartRemoved: 'Artículo quitado del carrito.',
    toastPlanAdded: 'Plan {{plan}} añadido al carrito. Factura creada en administración.',
    toastInvoiceError: 'No fue posible crear la factura.',
    heroBadge: 'Control financiero para decidir mejor',
    heroTitle: 'Un sistema financiero completo para controlar, analizar y planificar mejor.',
    heroSubtitle:
      'FinanceApp reúne transacciones, metas, pagos, presupuestos, informes y perfil en una experiencia profesional.',
    heroPrimary: 'Entrar al panel',
    heroSecondary: 'Ver recursos',
    benefits: ['Sin instalación compleja', 'Panel adaptable', 'Informes visuales', 'Control por categorías'],
    stats: [
      { value: '+12', label: 'funciones financieras' },
      { value: '24h', label: 'disponibilidad continua' },
      { value: '100%', label: 'panel adaptable' },
      { value: 'BRL', label: 'formato Brasil' },
    ],
    demoMonthSavings: 'Ahorro del mes',
    mockBalance: 'Saldo actual',
    mockIncome: 'Ingresos',
    mockVsTitle: 'Ingresos vs gastos',
    mockVsSubtitle: 'Últimos 6 meses',
    mockGoalsTitle: 'Metas',
    mockGoalsSubtitle: 'Progreso general',
    mockGoalRow: 'Objetivo',
    resourcesKicker: 'Funciones del sistema',
    resourcesTitle: 'Todo lo que necesitas para seguir tu dinero',
    resourcesSubtitle: 'Pensado para control, claridad, planificación y decisiones.',
    telasKicker: 'Capturas del panel',
    telasTitle: 'Mira cómo funciona por dentro',
    telasSubtitle:
      'Demostraciones visuales antes de entrar: control, lectura de tickets, análisis e inversiones.',
    telasCta: 'Abrir panel completo',
    telasBrowser: 'financeapp.com.br/painel',
    telasMiniBalance: 'Saldo actual',
    telasMiniIncome: 'Ingresos',
    telasMiniExpense: 'Gastos',
    telasForecastTitle: 'Previsión del mes',
    telasForecastRows: ['Salario', 'Gastos fijos', 'Metas'],
    telasScreenBadge: 'Pantalla',
    animatedKicker: 'Demostración animada',
    animatedTitle: 'Gráficos dinámicos que muestran valor antes de comprar.',
    animatedSubtitle:
      'Vista previa animada del panel: barras, línea de tendencia y distribución por categoría.',
    animatedTicker: [
      'Saldo previsto a 30 días',
      'Gastos fuera del patrón',
      'Extracto cerca del límite',
      'Fondo de emergencia en marcha',
      'Presupuesto por categoría',
      'Informe mensual automático',
    ],
    analyticsBrand: 'FinanceApp Analytics',
    analyticsSubtitle: 'Vista ejecutiva con indicadores casi en tiempo real',
    execVisionTag: 'Visión ejecutiva',
    execVisionTitle: 'Panel financiero premium',
    execVisionDesc: 'Más cercano a un dashboard real, con KPI, alertas y tendencia.',
    premiumKpis: [
      { label: 'Saldo consolidado', value: 'R$ 24.860' },
      { label: 'Ahorro proyectado', value: 'R$ 3.420' },
      { label: 'Riesgo de sobregiro', value: 'Bajo' },
    ],
    chartFlowTitle: 'Flujo mensual inteligente',
    chartFlowSubtitle: 'Ingresos, gastos y saldo libre en un solo gráfico',
    liveBadge: 'En vivo',
    aiInsightTag: 'Insight de IA',
    aiInsightBody:
      'La vivienda representa el 38% del gasto. Renovar contratos fijos podría liberar hasta R$ 620/mes.',
    emergencyTitle: 'Fondo de emergencia',
    emergencyProgress: '72% completado',
    alertsCardTitle: 'Alertas activas',
    alertsCardLines: ['Extracto cerca del límite', 'Suscripción duplicada', 'Ocio al 84% del presupuesto'],
    dualChartTitle: 'Ingresos vs gastos',
    dualChartSubtitle: 'Comparativo mensual con margen proyectada',
    dualLegendIncome: 'Ingreso',
    dualLegendExpense: 'Gasto',
    dualLegendMeta: 'Meta',
    dualMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    balanceForecastBadge: 'Previsto',
    balanceForecastTitle: 'Previsión de saldo',
    balanceForecastSub: 'Proyección de flujo de caja',
    balance30Label: 'Saldo en 30 días',
    trendLabel: 'Tendencia',
    week1: 'Semana 1',
    week4: 'Semana 4',
    categorySpendTitle: 'Gastos por categoría',
    categorySpendSub: 'Mapa de concentración mensual',
    insightsBadge: 'Insights',
    totalMonthLabel: 'Total del mes',
    vsPreviousLabel: '-12% vs anterior',
    categoryInsightBanner:
      'Insight: la vivienda concentra el 38%. La IA sugiere revisar contratos fijos antes de recortar ocio.',
    categoryDemo: [
      { name: 'Vivienda', value: '38%', amount: 'R$ 2.356' },
      { name: 'Alimentación', value: '26%', amount: 'R$ 1.612' },
      { name: 'Transporte', value: '18%', amount: 'R$ 1.116' },
      { name: 'Otros', value: '18%', amount: 'R$ 1.116' },
    ],
    sistemaKicker: 'Arquitectura ideal para personas',
    sistemaTitle: 'Simple al inicio, potente al crecer.',
    sistemaSubtitle:
      'FinanceApp es fácil de usar pero preparado para automatización, inteligencia financiera y seguridad.',
    sistemaBalanceTitle: 'Equilibrio del producto',
    sistemaBalanceText:
      'Demasiado complejo y la gente abandona; demasiado simple y no resuelve. Pocos clics en el día a día y profundidad cuando analices.',
    sistemaTags: ['Facilidad', 'Automatización', 'Inteligencia', 'Claridad visual'],
    profilesKicker: 'Para todos los perfiles',
    profilesTitle: 'Del primer control al análisis avanzado',
    profilesSubtitle:
      'La experiencia evoluciona con el usuario: empieza simple y suma capas cuando tenga sentido.',
    modulesKicker: 'Módulos principales',
    modulesTitle: 'Estructura completa para tu panel financiero',
    modulesSubtitle:
      'Organizado para crecer: control local y preparación para autenticación real, base de datos y planes.',
    modulesCta: 'Ver panel en funcionamiento',
    funcHeroTitle: 'Funciones profesionales recomendadas',
    funcHeroSubtitle:
      'Capacidades que hacen el panel más robusto y valioso como suscripción mensual.',
    funcStat1: 'más claridad en gastos',
    funcStat2: 'más organización mensual',
    stepsKicker: 'Cómo funciona',
    stepsTitle: 'Del registro a la decisión en pocos pasos',
    stepsSubtitle: 'Pensado para quien quiere control sin complicaciones.',
    plansKicker: 'Planes de suscripción',
    plansTitle: 'Elige el plan para tu momento',
    plansSubtitle: 'Valores demo para ilustrar el modelo comercial.',
    planRecommended: 'Más recomendado',
    planPerMonth: '/mes',
    planBuy: 'Comprar plan',
    planGenerating: 'Generando factura...',
    planHowHelps: 'Cómo ayudan estas funciones',
    planIncluded: 'Funciones incluidas',
    comparisonTitle: 'Comparativo rápido',
    comparisonSubtitle: 'Evolución de capacidades entre planes.',
    comparisonFeature: 'Función',
    comparisonEssential: 'Esencial',
    comparisonPro: 'Profesional',
    comparisonEnterprise: 'Empresarial',
    bottomCards: [
      {
        title: 'Acceso adaptable',
        description: 'Funciona en escritorio, tablet y móvil para tu rutina financiera.',
      },
      {
        title: 'Alertas inteligentes',
        description: 'Pensadas para vencimientos, morosidad, límites de presupuesto y metas detenidas.',
      },
      {
        title: 'Informes exportables',
        description: 'Base lista para documentos y compartir con contador o familia.',
      },
    ],
    ctaTitle: '¿Listo para entrar a tu panel?',
    ctaSubtitle: 'Accede ahora y ve la demostración del sistema.',
    ctaButton: 'Entrar al panel',
    features: [
      {
        title: 'Panel inteligente',
        description: 'Saldo, ingresos, gastos e indicadores en una vista clara.',
      },
      {
        title: 'Metas financieras',
        description: 'Define objetivos, ve progreso y cuánto falta.',
      },
      {
        title: 'Pagos organizados',
        description: 'Controla pagados, pendientes y atrasados con pocos clics.',
      },
    ],
    panelScreens: [
      {
        title: 'Panel financiero',
        description:
          'Vista inicial con saldo, ingresos, gastos, previsión de gastos fijos, salarios y aporte a metas.',
        metric: 'R$ 15.420,50',
        label: 'saldo actual',
        bullets: ['Resumen del mes', 'Metas y aportes', 'Cuentas previstas'],
      },
      {
        title: 'Lectura de comprobante',
        description:
          'Subida de ticket, OCR local, empresa, CNPJ, fecha, ítems y registro automático como gasto.',
        metric: 'OCR',
        label: 'lectura automática',
        bullets: ['Ticket', 'Ítems y montos', 'Gasto automático'],
      },
      {
        title: 'Análisis de gastos',
        description:
          'Cuellos de botella, gastos de bajo retorno y potencial de recorte.',
        metric: '35%',
        label: 'potencial de recorte',
        bullets: ['Cuellos de botella', 'Bajo retorno', 'Reasignación'],
      },
      {
        title: 'IA de inversiones',
        description:
          'Cruza ingresos, saldo libre, metas y perfil para sugerir aportes y prioridades.',
        metric: '20%',
        label: 'del ingreso',
        bullets: ['Perfil de riesgo', 'Cartera sugerida', 'Metas priorizadas'],
      },
    ],
    modules: [
      {
        title: 'Panel ejecutivo',
        description: 'Resumen del mes, saldo, ingresos, gastos y últimos movimientos.',
      },
      {
        title: 'Gestión de transacciones',
        description: 'Altas de entradas/salidas, categorías, filtros, búsqueda y estado.',
      },
      {
        title: 'Control de pagos',
        description: 'Pagado, pendiente y atrasado para ver compromisos rápido.',
      },
      {
        title: 'Metas financieras',
        description: 'Objetivos, progreso, plazo y gap restante.',
      },
      {
        title: 'Análisis e informes',
        description: 'Gráficos ingresos vs gastos, por categoría e histórico.',
      },
      {
        title: 'Perfil del cliente',
        description: 'Avatar, datos y configuración lista para autenticación futura.',
      },
    ],
    idealPillars: [
      {
        title: 'Base simple',
        description: 'Ingresos, gastos y categorías en pocos clics para principiantes.',
      },
      {
        title: 'Tarjetas y extractos',
        description: 'Límite, extractos abiertos/cerrados, cuotas y cargos futuros.',
      },
      {
        title: 'Presupuesto inteligente',
        description: 'Planificado vs real con alertas cuando el gasto se desvía.',
      },
      {
        title: 'Flujo de caja',
        description: 'Saldo actual y previsión para detectar faltantes.',
      },
      {
        title: 'Automatización y alertas',
        description: 'Recurrencias, vencimientos, extractos y gastos fuera de patrón.',
      },
      {
        title: 'Seguridad y privacidad',
        description: 'Login seguro, respaldo, cifrado y protección de datos.',
      },
    ],
    userProfiles: [
      {
        title: 'Modo principiante',
        description: 'UI limpia y foco en registrar flujos y saldo mensual.',
      },
      {
        title: 'Modo completo',
        description: 'Presupuestos, tarjetas, metas, extractos y reportes sin sobrecarga.',
      },
      {
        title: 'Modo avanzado',
        description: 'Análisis por periodo, exportación, previsiones y alertas.',
      },
    ],
    plans: [
      {
        apiName: 'Essencial',
        displayName: 'Esencial',
        price: 'R$ 19',
        description: 'Para organizar finanzas personales con simplicidad.',
        idealFor: 'Ideal si empiezas a controlar el dinero.',
        details: [
          {
            title: 'Control financiero básico',
            description: 'Registra ingresos, gastos, categorías y pagos sin fricción.',
          },
          {
            title: 'Visión mensual clara',
            description: 'Saldo, totales de entrada/salida y evolución básica.',
          },
          {
            title: 'Metas personales',
            description: 'Objetivos simples: emergencia, viaje o compra planeada.',
          },
        ],
        features: [
          'Registro ilimitado de ingresos y gastos',
          'Categorías básicas',
          'Panel con saldo y flujos',
          'Metas personales',
          'Pagos pagados y pendientes',
          'Informes básicos mensuales',
          'Acceso adaptable móvil y escritorio',
        ],
      },
      {
        apiName: 'Profissional',
        displayName: 'Profesional',
        price: 'R$ 39',
        description: 'Para quien necesita análisis, alertas y más automatización.',
        featured: true,
        idealFor: 'Ideal para planificar con datos.',
        details: [
          {
            title: 'Planificación por categoría',
            description: 'Límites mensuales para alimentación, vivienda, ocio y más.',
          },
          {
            title: 'Alertas y automatización',
            description: 'Avisos por gastos fuera de patrón, vencimientos y recurrencias.',
          },
          {
            title: 'Informes estratégicos',
            description: 'Gráficos, exportación y foco en fugas de dinero.',
          },
        ],
        features: [
          'Todo lo del plan Esencial',
          'Presupuesto mensual por categoría',
          'Planificado vs realizado',
          'Alertas inteligentes',
          'Suscripciones y recurrencias',
          'Cuotas y previsión de extractos',
          'Informes avanzados',
          'Exportación PDF/CSV',
          'Insights personalizados',
        ],
      },
      {
        apiName: 'Empresarial',
        displayName: 'Empresarial',
        price: 'R$ 79',
        description: 'Para equipos con gestión compartida.',
        idealFor: 'Familias, autónomos y pequeños negocios.',
        details: [
          {
            title: 'Gestión compartida',
            description: 'Accesos para socios, familia o contador con roles.',
          },
          {
            title: 'Centro de coste',
            description: 'Separa personal, profesional y proyectos.',
          },
          {
            title: 'Soporte e implementación',
            description: 'Prioridad y ayuda inicial para configurar la estructura.',
          },
        ],
        features: [
          'Todo lo del Profesional',
          'Multiusuario con permisos',
          'Roles para contador o socio',
          'Panel por centro de coste',
          'Separación personal/profesional',
          'Informes para decisiones',
          'Backup en la nube',
          'Soporte prioritario',
          'Onboarding asistido',
        ],
      },
    ],
    planComparison: [
      { feature: 'Panel financiero', essencial: true, profissional: true, empresarial: true },
      { feature: 'Metas y pagos', essencial: true, profissional: true, empresarial: true },
      { feature: 'Presupuesto por categoría', essencial: false, profissional: true, empresarial: true },
      { feature: 'Alertas inteligentes', essencial: false, profissional: true, empresarial: true },
      { feature: 'Exportación PDF/CSV', essencial: false, profissional: true, empresarial: true },
      { feature: 'Multiusuario y permisos', essencial: false, profissional: false, empresarial: true },
    ],
    steps: [
      {
        title: 'Registra tus movimientos',
        description: 'Ingresos, gastos, categorías y estado de pago.',
      },
      {
        title: 'Sigue los indicadores',
        description: 'Saldo, ahorro, metas y gastos críticos casi en tiempo real.',
      },
      {
        title: 'Toma mejores decisiones',
        description: 'Usa informes y alertas para recortar y planificar.',
      },
    ],
    professionalFunctions: [
      'Presupuesto mensual por categoría',
      'Alertas de vencimientos y morosidad',
      'Informe mensual con evolución de saldo',
      'Exportación PDF/CSV',
      'Perfiles persona física vs negocio',
      'Suscripciones, recurrencias y cuotas',
      'Backup en la nube y sincronización',
      'Permisos para contador o familiar',
    ],
  },
  footer: {
    tagline: 'Gestión financiera inteligente',
    description:
      'Plataforma personal para simplificar rutinas, ordenar gastos, seguir metas y decidir con claridad.',
    securityNote: 'Datos locales en esta versión; preparado para seguridad avanzada.',
    companyTitle: 'Empresa',
    companyLines: [
      'FinanceApp Tecnología Financiera Ltda.',
      'CNPJ: 00.000.000/0001-00',
      'Atención: Lun–Vie, 9h–18h',
    ],
    contactTitle: 'Contacto',
    copyright: '© 2026 FinanceApp. Todos los derechos reservados.',
    links: [
      { label: 'Recursos', href: '#recursos' },
      { label: 'Sistema ideal', href: '#sistema-ideal' },
      { label: 'Funciones', href: '#funcoes' },
      { label: 'Planes', href: '#planos' },
    ],
  },
  chat: {
    welcome:
      '¡Hola! Soy del equipo FinanceApp. Pregunta por planes, funciones, tarjetas, seguridad o contratación.',
    online: 'Atención online',
    closeAria: 'Cerrar chat',
    typingPrefix: '',
    typingSuffix: ' está escribiendo',
    placeholder: 'Escribe tu pregunta...',
    humanTitle: '¿Necesitas hablar con una persona?',
    humanSubtitle: 'Pulsa abajo para ir al equipo comercial.',
    supportCta: 'Ir a atención',
    openAria: 'Abrir chat de dudas',
    fallback:
      'No tengo una respuesta exacta; puedo ayudar con planes, tarjetas, metas, informes, presupuesto, alertas, seguridad, móvil o ventas.',
  },
  chatIntents: [
    {
      keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'ayuda', 'hey'],
      answer:
        '¡Hola! Puedo ayudarte con FinanceApp: planes, funcionamiento, tarjetas, metas, informes, seguridad o soporte.',
    },
    {
      keywords: ['empezar', 'inicio', 'funciona', 'primer', 'paso', 'gasto', 'ingreso', 'organizar'],
      answer:
        'Empieza registrando ingresos y gastos fijos y variables; categoriza vivienda, comida y ocio. El panel muestra saldo y tendencias.',
    },
    {
      keywords: ['precio', 'cuanto', 'plan', 'suscripcion', 'mensualidad', 'pagar', 'pago'],
      answer:
        'Planes demo: Esencial R$19/mes, Profesional R$39/mes, Empresarial R$79/mes. Profesional incluye alertas y presupuesto.',
    },
    {
      keywords: ['tarjeta', 'credito', 'extracto', 'limite', 'cuota', 'vencimiento'],
      answer:
        'El producto contempla tarjetas, extractos abiertos/cerrados, límite, vencimiento y cuotas.',
    },
    {
      keywords: ['movil', 'celular', 'tablet', 'ordenador', 'responsive'],
      answer:
        'La interfaz es adaptable para móvil, tablet y escritorio con registro rápido.',
    },
    {
      keywords: ['seguridad', 'privacidad', 'respaldo', 'datos', 'cifrado', 'clave'],
      answer:
        'Esta versión usa datos locales; la arquitectura evoluciona hacia login seguro, cifrado y MFA.',
    },
    {
      keywords: ['informe', 'grafico', 'analisis', 'panel', 'categoria'],
      answer:
        'Gráficos de ingresos vs gastos, categorías, evolución mensual y metas.',
    },
    {
      keywords: ['meta', 'objetivo', 'emergencia', 'viaje', 'ahorrar'],
      answer:
        'Crea metas y sigue el progreso con montos restantes.',
    },
    {
      keywords: ['presupuesto', 'planeado', 'realizado', 'limite'],
      answer:
        'Presupuesto por categoría con comparación planificado vs real y alertas.',
    },
    {
      keywords: ['alerta', 'notificacion', 'vencer', 'atrasado'],
      answer:
        'Alertas por facturas, vencimientos, morosidad y gastos fuera de patrón.',
    },
    {
      keywords: ['importar', 'banco', 'recurrente'],
      answer:
        'La hoja de ruta incluye importación de extractos y cargos recurrentes.',
    },
    {
      keywords: ['comprar', 'contratar', 'demo', 'humano', 'contacto', 'soporte'],
      answer:
        'Prueba el panel con “Entrar al panel”; ventas en “Ir a atención”.',
    },
  ],
};
