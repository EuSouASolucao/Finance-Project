export interface NavLinkT {
  label: string;
  sectionId: string;
}

export interface PlanDetailT {
  title: string;
  description: string;
}

export interface PlanT {
  apiName: string;
  displayName: string;
  price: string;
  description: string;
  idealFor: string;
  featured?: boolean;
  details: PlanDetailT[];
  features: string[];
}

export interface PlanComparisonRowT {
  feature: string;
  essencial: boolean;
  profissional: boolean;
  empresarial: boolean;
}

export interface FeatureT {
  title: string;
  description: string;
}

export interface PanelScreenT {
  title: string;
  description: string;
  metric: string;
  label: string;
  bullets: string[];
}

export interface ModuleT {
  title: string;
  description: string;
}

export interface PillarT {
  title: string;
  description: string;
}

export interface ProfileT {
  title: string;
  description: string;
}

export interface StepT {
  title: string;
  description: string;
}

export interface StatT {
  value: string;
  label: string;
}

export interface PremiumKpiT {
  label: string;
  value: string;
}

export interface CategoryDemoT {
  name: string;
  value: string;
  amount: string;
}

export interface BottomCardT {
  title: string;
  description: string;
}

export interface FooterT {
  tagline: string;
  description: string;
  securityNote: string;
  companyTitle: string;
  companyLines: string[];
  contactTitle: string;
  copyright: string;
  links: { label: string; href: string }[];
}

export interface ChatIntentT {
  keywords: string[];
  answer: string;
}

export interface ChatT {
  welcome: string;
  online: string;
  closeAria: string;
  typingPrefix: string;
  typingSuffix: string;
  placeholder: string;
  humanTitle: string;
  humanSubtitle: string;
  supportCta: string;
  openAria: string;
  fallback: string;
}

export interface SiteTranslations {
  landing: {
    brandTagline: string;
    nav: NavLinkT[];
    themeLight: string;
    themeDark: string;
    enterPanel: string;
    cartFloating: string;
    cartTitle: string;
    cartSubtitle: string;
    cartClose: string;
    cartEmpty: string;
    cartTotalPending: string;
    cartCheckout: string;
    cartInvoiceHash: string;
    cartRemove: string;
    toastCartRemoved: string;
    toastPlanAdded: string;
    toastInvoiceError: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroPrimary: string;
    heroSecondary: string;
    benefits: string[];
    stats: StatT[];
    demoMonthSavings: string;
    mockBalance: string;
    mockIncome: string;
    mockVsTitle: string;
    mockVsSubtitle: string;
    mockGoalsTitle: string;
    mockGoalsSubtitle: string;
    mockGoalRow: string;
    resourcesKicker: string;
    resourcesTitle: string;
    resourcesSubtitle: string;
    telasKicker: string;
    telasTitle: string;
    telasSubtitle: string;
    telasCta: string;
    telasBrowser: string;
    telasMiniBalance: string;
    telasMiniIncome: string;
    telasMiniExpense: string;
    telasForecastTitle: string;
    telasForecastRows: string[];
    telasScreenBadge: string;
    animatedKicker: string;
    animatedTitle: string;
    animatedSubtitle: string;
    animatedTicker: string[];
    analyticsBrand: string;
    analyticsSubtitle: string;
    execVisionTag: string;
    execVisionTitle: string;
    execVisionDesc: string;
    premiumKpis: PremiumKpiT[];
    chartFlowTitle: string;
    chartFlowSubtitle: string;
    liveBadge: string;
    aiInsightTag: string;
    aiInsightBody: string;
    emergencyTitle: string;
    emergencyProgress: string;
    alertsCardTitle: string;
    alertsCardLines: string[];
    dualChartTitle: string;
    dualChartSubtitle: string;
    dualLegendIncome: string;
    dualLegendExpense: string;
    dualLegendMeta: string;
    dualMonths: string[];
    balanceForecastBadge: string;
    balanceForecastTitle: string;
    balanceForecastSub: string;
    balance30Label: string;
    trendLabel: string;
    week1: string;
    week4: string;
    categorySpendTitle: string;
    categorySpendSub: string;
    insightsBadge: string;
    totalMonthLabel: string;
    vsPreviousLabel: string;
    categoryInsightBanner: string;
    categoryDemo: CategoryDemoT[];
    sistemaKicker: string;
    sistemaTitle: string;
    sistemaSubtitle: string;
    sistemaBalanceTitle: string;
    sistemaBalanceText: string;
    sistemaTags: string[];
    profilesKicker: string;
    profilesTitle: string;
    profilesSubtitle: string;
    modulesKicker: string;
    modulesTitle: string;
    modulesSubtitle: string;
    modulesCta: string;
    funcHeroTitle: string;
    funcHeroSubtitle: string;
    funcStat1: string;
    funcStat2: string;
    professionalFunctions: string[];
    stepsKicker: string;
    stepsTitle: string;
    stepsSubtitle: string;
    plansKicker: string;
    plansTitle: string;
    plansSubtitle: string;
    planRecommended: string;
    planPerMonth: string;
    planBuy: string;
    planGenerating: string;
    planHowHelps: string;
    planIncluded: string;
    comparisonTitle: string;
    comparisonSubtitle: string;
    comparisonFeature: string;
    comparisonEssential: string;
    comparisonPro: string;
    comparisonEnterprise: string;
    bottomCards: BottomCardT[];
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    features: FeatureT[];
    panelScreens: PanelScreenT[];
    modules: ModuleT[];
    idealPillars: PillarT[];
    userProfiles: ProfileT[];
    plans: PlanT[];
    planComparison: PlanComparisonRowT[];
    steps: StepT[];
  };
  footer: FooterT;
  chat: ChatT;
  chatIntents: ChatIntentT[];
}
