import type { SiteTranslations } from './types';

export const en: SiteTranslations = {
  landing: {
    brandTagline: 'Smart financial management',
    nav: [
      { label: 'Features', sectionId: 'recursos' },
      { label: 'Screens', sectionId: 'telas-painel' },
      { label: 'Ideal system', sectionId: 'sistema-ideal' },
      { label: 'Modules', sectionId: 'modulos' },
      { label: 'Functions', sectionId: 'funcoes' },
      { label: 'Plans', sectionId: 'planos' },
      { label: 'Benefits', sectionId: 'beneficios' },
    ],
    themeLight: 'Light',
    themeDark: 'Dark',
    enterPanel: 'Open dashboard',
    cartFloating: 'Cart',
    cartTitle: 'Shopping cart',
    cartSubtitle: 'Each item already created a pending invoice in admin.',
    cartClose: 'Close',
    cartEmpty: 'No plans in the cart yet.',
    cartTotalPending: 'Pending total',
    cartCheckout: 'Checkout and pay',
    cartInvoiceHash: 'Invoice #',
    cartRemove: 'Remove from cart',
    toastCartRemoved: 'Removed from cart.',
    toastPlanAdded: 'Plan {{plan}} added to cart. Invoice created in admin.',
    toastInvoiceError: 'Could not create the invoice.',
    heroBadge: 'Financial control for better decisions',
    heroTitle: 'A complete finance system to track, analyze, and plan better.',
    heroSubtitle:
      'FinanceApp brings transactions, goals, payments, budgets, reports, and customer profile together in a professional experience for individuals and small businesses.',
    heroPrimary: 'Open dashboard',
    heroSecondary: 'Explore features',
    benefits: ['No complex installation', 'Responsive dashboard', 'Visual reports', 'Category-based control'],
    stats: [
      { value: '+12', label: 'financial features' },
      { value: '24h', label: 'always-on visibility' },
      { value: '100%', label: 'responsive dashboard' },
      { value: 'BRL', label: 'Brazilian format' },
    ],
    demoMonthSavings: 'Monthly savings',
    mockBalance: 'Current balance',
    mockIncome: 'Income',
    mockVsTitle: 'Income vs expenses',
    mockVsSubtitle: 'Last 6 months',
    mockGoalsTitle: 'Goals',
    mockGoalsSubtitle: 'Overall progress',
    mockGoalRow: 'Goal',
    resourcesKicker: 'Product features',
    resourcesTitle: 'Everything you need to follow your money',
    resourcesSubtitle: 'Designed for control, clarity, planning, and confident decisions.',
    telasKicker: 'Dashboard previews',
    telasTitle: 'See how the system works inside',
    telasSubtitle:
      'Visual previews of main screens so visitors understand the flow before signing in: control, receipt scanning, analytics, and investments.',
    telasCta: 'Open full dashboard',
    telasBrowser: 'financeapp.com.br/painel',
    telasMiniBalance: 'Current balance',
    telasMiniIncome: 'Income',
    telasMiniExpense: 'Expenses',
    telasForecastTitle: 'Monthly forecast',
    telasForecastRows: ['Salary', 'Fixed bills', 'Goals'],
    telasScreenBadge: 'Screen',
    animatedKicker: 'Animated demo',
    animatedTitle: 'Live charts that show value before you buy.',
    animatedSubtitle:
      'Animated preview of the finance dashboard: bars, forecast line, and category breakdown in motion—like a product GIF.',
    animatedTicker: [
      '30-day projected balance',
      'Spending off-pattern',
      'Statement near credit limit',
      'Emergency fund progressing',
      'Budget by category',
      'Automatic monthly report',
    ],
    analyticsBrand: 'FinanceApp Analytics',
    analyticsSubtitle: 'Executive preview with near real-time KPIs',
    execVisionTag: 'Executive view',
    execVisionTitle: 'Premium finance dashboard',
    execVisionDesc: 'Closer to a real dashboard with KPIs, alerts, and trend analysis.',
    premiumKpis: [
      { label: 'Consolidated balance', value: 'R$ 24,860' },
      { label: 'Projected savings', value: 'R$ 3,420' },
      { label: 'Overrun risk', value: 'Low' },
    ],
    chartFlowTitle: 'Smart monthly flow',
    chartFlowSubtitle: 'Income, expenses, and free cash in one chart',
    liveBadge: 'Live',
    aiInsightTag: 'AI insight',
    aiInsightBody: 'Housing is 38% of spending. Renegotiating fixed contracts could free up to R$ 620/mo.',
    emergencyTitle: 'Emergency fund',
    emergencyProgress: '72% complete',
    alertsCardTitle: 'Active alerts',
    alertsCardLines: ['Statement near limit', 'Duplicate subscription detected', 'Fun budget at 84%'],
    dualChartTitle: 'Income vs expenses',
    dualChartSubtitle: 'Monthly comparison with projected margin',
    dualLegendIncome: 'Income',
    dualLegendExpense: 'Expense',
    dualLegendMeta: 'Target',
    dualMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    balanceForecastBadge: 'Forecast',
    balanceForecastTitle: 'Balance forecast',
    balanceForecastSub: 'Cash flow projection',
    balance30Label: 'Balance in 30 days',
    trendLabel: 'Trend',
    week1: 'Week 1',
    week4: 'Week 4',
    categorySpendTitle: 'Spending by category',
    categorySpendSub: 'Monthly concentration map',
    insightsBadge: 'Insights',
    totalMonthLabel: 'Monthly total',
    vsPreviousLabel: '-12% vs previous',
    categoryInsightBanner:
      'Insight: housing concentrates 38% of spending. The AI suggests reviewing fixed contracts before cutting leisure.',
    categoryDemo: [
      { name: 'Housing', value: '38%', amount: 'R$ 2,356' },
      { name: 'Food', value: '26%', amount: 'R$ 1,612' },
      { name: 'Transport', value: '18%', amount: 'R$ 1,116' },
      { name: 'Other', value: '18%', amount: 'R$ 1,116' },
    ],
    sistemaKicker: 'Ideal architecture for individuals',
    sistemaTitle: 'Simple to start, powerful as you grow.',
    sistemaSubtitle:
      'FinanceApp is easy at the core but ready to grow into automation, financial intelligence, security, and pro-grade reporting.',
    sistemaBalanceTitle: 'Product balance',
    sistemaBalanceText:
      'Too complex and people churn. Too simple and it does not solve the problem. Few taps for daily tasks—depth when you need analysis.',
    sistemaTags: ['Ease', 'Automation', 'Intelligence', 'Visual clarity'],
    profilesKicker: 'Accessible for every profile',
    profilesTitle: 'From first budget to advanced analytics',
    profilesSubtitle:
      'The experience scales as users mature: start simple and unlock richer layers when it makes sense.',
    modulesKicker: 'Core modules',
    modulesTitle: 'Complete structure for your finance hub',
    modulesSubtitle:
      'Built to scale: starts local-ready and supports real authentication, database, plans, and automation.',
    modulesCta: 'See the live dashboard',
    funcHeroTitle: 'Recommended professional capabilities',
    funcHeroSubtitle:
      'High-impact features that make the dashboard subscription-worthy for serious users.',
    funcStat1: 'more clarity on spending',
    funcStat2: 'better monthly organization',
    stepsKicker: 'How it works',
    stepsTitle: 'From logging transactions to deciding faster',
    stepsSubtitle: 'Designed for people who want control without friction.',
    plansKicker: 'Subscription plans',
    plansTitle: 'Pick the plan that fits your stage',
    plansSubtitle: 'Demo pricing to illustrate the commercial model.',
    planRecommended: 'Most popular',
    planPerMonth: '/mo',
    planBuy: 'Buy plan',
    planGenerating: 'Creating invoice...',
    planHowHelps: 'How these capabilities help',
    planIncluded: 'Included features',
    comparisonTitle: 'Quick feature comparison',
    comparisonSubtitle: 'See how capabilities evolve across tiers.',
    comparisonFeature: 'Capability',
    comparisonEssential: 'Essential',
    comparisonPro: 'Professional',
    comparisonEnterprise: 'Business',
    bottomCards: [
      {
        title: 'Responsive access',
        description: 'Works on desktop, tablet, and phone for daily finance routines.',
      },
      {
        title: 'Smart alerts',
        description: 'Designed for overdue bills, due dates, budget limits, and stalled goals.',
      },
      {
        title: 'Exportable reports',
        description: 'Ready to generate documents and share data with accountant or family.',
      },
    ],
    ctaTitle: 'Ready to open your dashboard?',
    ctaSubtitle: 'Sign in now and explore the finance experience.',
    ctaButton: 'Open dashboard',
    features: [
      {
        title: 'Smart dashboard',
        description: 'Track balance, income, expenses, and KPIs in one clear view.',
      },
      {
        title: 'Financial goals',
        description: 'Set objectives, monitor progress, and see what is left to reach them.',
      },
      {
        title: 'Organized payments',
        description: 'Manage paid, pending, and overdue bills with just a few taps.',
      },
    ],
    panelScreens: [
      {
        title: 'Finance dashboard',
        description:
          'Opening view with balance, income, expenses, fixed bill/salary forecast, and contribution plan toward goals.',
        metric: 'R$ 15,420.50',
        label: 'current balance',
        bullets: ['Monthly summary', 'Goals & contributions', 'Forecasted bills'],
      },
      {
        title: 'Receipt scanning',
        description:
          'Upload receipts, local OCR, capture merchant, tax ID, date, line items, totals, and auto-log as expense.',
        metric: 'OCR',
        label: 'automatic reading',
        bullets: ['Receipt', 'Items & amounts', 'Auto expense'],
      },
      {
        title: 'Spending analysis',
        description:
          'Spot bottlenecks, low-leverage spending, and estimated savings potential.',
        metric: '35%',
        label: 'cut potential',
        bullets: ['Bottlenecks', 'Low ROI spend', 'Reallocation'],
      },
      {
        title: 'Investment assistant',
        description:
          'Cross-checks income, free cash, saved goals, and profile to suggest contributions and priorities.',
        metric: '20%',
        label: 'of income',
        bullets: ['Risk profile', 'Suggested portfolio', 'Prioritized goals'],
      },
    ],
    modules: [
      {
        title: 'Executive dashboard',
        description:
          'Monthly snapshot, balance, income, expenses, savings, KPIs, and latest movements on one screen.',
      },
      {
        title: 'Transaction management',
        description: 'Log inflows/outflows, categories, date filters, search, and status updates.',
      },
      {
        title: 'Payment control',
        description: 'Paid, pending, and overdue views to surface commitments quickly.',
      },
      {
        title: 'Financial goals',
        description: 'Track objectives, progress, deadlines, saved amounts, and remaining gap.',
      },
      {
        title: 'Analytics & reports',
        description: 'Income vs expense charts, category breakdown, and multi-month history.',
      },
      {
        title: 'Customer profile',
        description: 'Avatar, registration data, local session, and settings ready for future auth.',
      },
    ],
    idealPillars: [
      {
        title: 'Simple foundation',
        description: 'Income, expenses, categories, and accounts in a few taps—friendly for beginners.',
      },
      {
        title: 'Cards & statements',
        description: 'Limits, open/closed statements, installments, and future charges.',
      },
      {
        title: 'Smart budgeting',
        description: 'Planned vs actual per category with alerts when spending drifts.',
      },
      {
        title: 'Cash flow',
        description: 'Current balance, future in/out flows, and forecasts to spot shortfalls.',
      },
      {
        title: 'Automation & alerts',
        description: 'Recurring bills, due invoices, statements, and off-pattern spending.',
      },
      {
        title: 'Security & privacy',
        description: 'Architecture aimed at secure login, backups, encryption, and data protection.',
      },
    ],
    userProfiles: [
      {
        title: 'Beginner mode',
        description: 'Clean UI, plain language, focus on logging flows and monthly balance.',
      },
      {
        title: 'Full mode',
        description: 'Budgets, cards, goals, statements, recurring charges, and reports without clutter.',
      },
      {
        title: 'Advanced mode',
        description: 'Period analytics, exports, forecasts, smart alerts, and strategic overview.',
      },
    ],
    plans: [
      {
        apiName: 'Essencial',
        displayName: 'Essential',
        price: 'R$ 19',
        description: 'Personal finance organization made simple.',
        idealFor: 'Perfect if you are starting to manage money consciously.',
        details: [
          {
            title: 'Core finance control',
            description: 'Record income, expenses, categories, and payments without friction.',
          },
          {
            title: 'Clear monthly picture',
            description: 'See balance, total inflows/outflows, and basic monthly evolution.',
          },
          {
            title: 'Personal goals',
            description: 'Create simple objectives such as emergency fund, trip, or planned purchase.',
          },
        ],
        features: [
          'Unlimited income & expense logging',
          'Basic spending categories',
          'Dashboard with balance, inflows, and outflows',
          'Personal financial goals',
          'Paid vs pending payment tracking',
          'Basic monthly reports',
          'Responsive web access',
        ],
      },
      {
        apiName: 'Profissional',
        displayName: 'Professional',
        price: 'R$ 39',
        description: 'For teams that need analytics, alerts, and more automation.',
        featured: true,
        idealFor: 'Ideal when you want planning backed by data.',
        details: [
          {
            title: 'Category planning',
            description: 'Set monthly caps for food, housing, fun, transport, and more.',
          },
          {
            title: 'Alerts & automation',
            description: 'Notifications for off-pattern spend, due dates, statements, and recurring bills.',
          },
          {
            title: 'Strategic reporting',
            description: 'Analyze charts, export data, and pinpoint money leaks.',
          },
        ],
        features: [
          'Everything in Essential',
          'Monthly budgets per category',
          'Planned vs actual comparison',
          'Smart alerts for spend & due dates',
          'Subscriptions & recurring bills',
          'Installments & statement forecasting',
          'Advanced charts & reporting',
          'PDF/CSV export',
          'Personalized savings insights',
        ],
      },
      {
        apiName: 'Empresarial',
        displayName: 'Business',
        price: 'R$ 79',
        description: 'For small teams that need shared governance.',
        idealFor: 'Families, freelancers, and growing businesses.',
        details: [
          {
            title: 'Shared management',
            description: 'Invite partners, family, or accountants with tailored roles.',
          },
          {
            title: 'Cost-center organization',
            description: 'Separate personal, professional, project, or business areas.',
          },
          {
            title: 'Support & rollout',
            description: 'Priority assistance plus guided setup for your finance structure.',
          },
        ],
        features: [
          'Everything in Professional',
          'Multi-user permissions',
          'Roles for accountant, partner, or family',
          'Dashboards per cost center',
          'Split personal vs business accounts',
          'Decision-ready reporting',
          'Cloud backup & planned sync',
          'Priority support',
          'Assisted onboarding',
        ],
      },
    ],
    planComparison: [
      { feature: 'Finance dashboard', essencial: true, profissional: true, empresarial: true },
      { feature: 'Goals & payments', essencial: true, profissional: true, empresarial: true },
      { feature: 'Budget per category', essencial: false, profissional: true, empresarial: true },
      { feature: 'Smart alerts', essencial: false, profissional: true, empresarial: true },
      { feature: 'PDF/CSV export', essencial: false, profissional: true, empresarial: true },
      { feature: 'Multi-user permissions', essencial: false, profissional: false, empresarial: true },
    ],
    steps: [
      {
        title: 'Log your movements',
        description: 'Capture income, expenses, categories, and payment status.',
      },
      {
        title: 'Monitor KPIs',
        description: 'Watch balance, savings, goals, and critical spend in near real time.',
      },
      {
        title: 'Make better calls',
        description: 'Use reports and alerts to cut waste and plan the month.',
      },
    ],
    professionalFunctions: [
      'Monthly budgets per category',
      'Alerts for upcoming or overdue bills',
      'Monthly report with balance & savings evolution',
      'PDF/CSV export for transactions',
      'Separate profiles for consumers vs micro-businesses',
      'Subscriptions, recurring charges, and installments',
      'Cloud backup & multi-device sync',
      'Permissions for accountant, partner, or family member',
    ],
  },
  footer: {
    tagline: 'Smart financial management',
    description:
      'Personal finance platform built to simplify routines, organize spending, track goals, and support decisions with clarity.',
    securityNote: 'Local data in this build—architecture ready for hardened security.',
    companyTitle: 'Company',
    companyLines: [
      'FinanceApp Financial Technology LLC',
      'Tax ID: 00.000.000/0001-00',
      'Support: Monday–Friday, 9am–6pm',
    ],
    contactTitle: 'Contact',
    copyright: '© 2026 FinanceApp. All rights reserved.',
    links: [
      { label: 'Features', href: '#recursos' },
      { label: 'Ideal system', href: '#sistema-ideal' },
      { label: 'Functions', href: '#funcoes' },
      { label: 'Plans', href: '#planos' },
    ],
  },
  chat: {
    welcome:
      'Hi! I am from FinanceApp support. Ask me about plans, features, cards, security, or purchasing.',
    online: 'Online support',
    closeAria: 'Close chat',
    typingPrefix: '',
    typingSuffix: ' is typing',
    placeholder: 'Type your question...',
    humanTitle: 'Need to talk to a human?',
    humanSubtitle: 'Tap below to reach our commercial team.',
    supportCta: 'Contact support',
    openAria: 'Open questions chat',
    fallback:
      'I do not have a precise answer yet, but I can help with plans, credit cards, goals, reports, budgeting, alerts, security, mobile use, or sales support.',
  },
  chatIntents: [
    {
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'help'],
      answer:
        'Hello! I can help with FinanceApp. Ask about plans, how it works, credit cards, goals, reports, security, onboarding, or support.',
    },
    {
      keywords: ['start', 'begin', 'how', 'works', 'first', 'step', 'track spending', 'organize', 'expense', 'income'],
      answer:
        'Start by logging income, fixed expenses, and variable expenses. Then categorize housing, food, fun, etc. The dashboard shows balance, monthly spend, and where money goes.',
    },
    {
      keywords: ['price', 'cost', 'plan', 'subscription', 'fee', 'pay', 'payment', 'billing', 'charge'],
      answer:
        'Demo tiers: Essential R$19/mo, Professional R$39/mo, Business R$79/mo. Professional adds alerts, category budgets, and exports.',
    },
    {
      keywords: ['card', 'credit', 'statement', 'limit', 'installment', 'billing cycle', 'due'],
      answer:
        'FinanceApp covers cards, open/closed statements, available limit, due dates, and installment automation.',
    },
    {
      keywords: ['phone', 'mobile', 'app', 'responsive', 'tablet', 'computer', 'laptop'],
      answer:
        'The UI is responsive for phones, tablets, and desktops with quick logging and dashboard review.',
    },
    {
      keywords: ['security', 'privacy', 'backup', 'data', 'encryption', 'login', 'password', '2fa', 'protection'],
      answer:
        'This build stores data locally in the browser; the roadmap includes secure login, encryption, backups, and MFA.',
    },
    {
      keywords: ['report', 'reports', 'chart', 'charts', 'analysis', 'dashboard', 'kpi', 'category', 'trend'],
      answer:
        'Charts cover income vs expenses, category breakdown, monthly evolution, goals, and savings insights.',
    },
    {
      keywords: ['goal', 'goals', 'objective', 'emergency', 'trip', 'car', 'save', 'saving'],
      answer:
        'Create goals such as trips or emergency funds, watch progress, and see remaining amounts.',
    },
    {
      keywords: ['budget', 'planning', 'plan', 'planned', 'actual', 'overspend', 'overspending'],
      answer:
        'Budgeting sets monthly caps per category and compares planned vs actual with alerts near limits.',
    },
    {
      keywords: ['alert', 'alerts', 'notification', 'notify', 'due', 'overdue', 'pattern'],
      answer:
        'Alerts cover upcoming bills, statement due dates, overdue payments, budget ceilings, and unusual spending.',
    },
    {
      keywords: ['statement import', 'import', 'bank', 'automation', 'recurring', 'subscription'],
      answer:
        'Planned automation includes statement imports, recurring entries, and smarter categorization.',
    },
    {
      keywords: ['buy', 'purchase', 'demo', 'trial', 'test', 'human', 'contact', 'support', 'sales'],
      answer:
        'Try the dashboard via “Open dashboard”. For contracting or commercial questions use “Contact support”.',
    },
  ],
};
