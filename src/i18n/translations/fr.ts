import type { SiteTranslations } from './types';

export const fr: SiteTranslations = {
  landing: {
    brandTagline: 'Gestion financière intelligente',
    nav: [
      { label: 'Fonctionnalités', sectionId: 'recursos' },
      { label: 'Écrans', sectionId: 'telas-painel' },
      { label: 'Système idéal', sectionId: 'sistema-ideal' },
      { label: 'Modules', sectionId: 'modulos' },
      { label: 'Fonctions', sectionId: 'funcoes' },
      { label: 'Offres', sectionId: 'planos' },
      { label: 'Avantages', sectionId: 'beneficios' },
    ],
    themeLight: 'Clair',
    themeDark: 'Sombre',
    enterPanel: 'Ouvrir le tableau',
    cartFloating: 'Panier',
    cartTitle: 'Panier d’achat',
    cartSubtitle: 'Chaque article a déjà créé une facture en attente côté admin.',
    cartClose: 'Fermer',
    cartEmpty: 'Aucun plan dans le panier.',
    cartTotalPending: 'Total en attente',
    cartCheckout: 'Finaliser et payer',
    cartInvoiceHash: 'Facture #',
    cartRemove: 'Retirer du panier',
    toastCartRemoved: 'Article retiré du panier.',
    toastPlanAdded: 'Offre {{plan}} ajoutée au panier. Facture créée côté admin.',
    toastInvoiceError: 'Impossible de créer la facture.',
    heroBadge: 'Pilotage financier pour mieux décider',
    heroTitle: 'Un système financier complet pour suivre, analyser et planifier.',
    heroSubtitle:
      'FinanceApp regroupe transactions, objectifs, paiements, budgets, rapports et profil dans une expérience professionnelle.',
    heroPrimary: 'Ouvrir le tableau',
    heroSecondary: 'Découvrir les fonctionnalités',
    benefits: ['Pas d’installation lourde', 'Tableau responsive', 'Rapports visuels', 'Pilotage par catégories'],
    stats: [
      { value: '+12', label: 'fonctions financières' },
      { value: '24h', label: 'disponibilité continue' },
      { value: '100%', label: 'interface adaptive' },
      { value: 'BRL', label: 'format Brésil' },
    ],
    demoMonthSavings: 'Épargne du mois',
    mockBalance: 'Solde actuel',
    mockIncome: 'Revenus',
    mockVsTitle: 'Revenus vs dépenses',
    mockVsSubtitle: '6 derniers mois',
    mockGoalsTitle: 'Objectifs',
    mockGoalsSubtitle: 'Progression globale',
    mockGoalRow: 'Objectif',
    resourcesKicker: 'Fonctionnalités',
    resourcesTitle: 'Tout pour suivre votre argent',
    resourcesSubtitle: 'Pensé pour le contrôle, la clarté et la décision.',
    telasKicker: 'Aperçus du tableau',
    telasTitle: 'Découvrez l’intérieur du système',
    telasSubtitle:
      'Visuels des écrans clés avant connexion : contrôle, tickets, analyses et investissements.',
    telasCta: 'Ouvrir le tableau complet',
    telasBrowser: 'financeapp.com.br/painel',
    telasMiniBalance: 'Solde actuel',
    telasMiniIncome: 'Revenus',
    telasMiniExpense: 'Dépenses',
    telasForecastTitle: 'Prévision du mois',
    telasForecastRows: ['Salaire', 'Charges fixes', 'Objectifs'],
    telasScreenBadge: 'Écran',
    animatedKicker: 'Démo animée',
    animatedTitle: 'Des graphiques vivants qui montrent la valeur avant l’achat.',
    animatedSubtitle:
      'Aperçu animé du tableau : barres, ligne de prévision et ventilation par catégorie.',
    animatedTicker: [
      'Solde projeté à 30 jours',
      'Dépenses hors norme',
      'Relevé proche du plafond',
      'Fonds d’urgence en progression',
      'Budget par catégorie',
      'Rapport mensuel automatique',
    ],
    analyticsBrand: 'FinanceApp Analytics',
    analyticsSubtitle: 'Vue exécutive avec indicateurs quasi temps réel',
    execVisionTag: 'Vue exécutive',
    execVisionTitle: 'Tableau financier premium',
    execVisionDesc: 'Proche d’un vrai dashboard : KPI, alertes et tendance.',
    premiumKpis: [
      { label: 'Solde consolidé', value: 'R$ 24 860' },
      { label: 'Épargne projetée', value: 'R$ 3 420' },
      { label: 'Risque de dépassement', value: 'Faible' },
    ],
    chartFlowTitle: 'Flux mensuel intelligent',
    chartFlowSubtitle: 'Revenus, dépenses et cash disponible sur un graphique',
    liveBadge: 'En direct',
    aiInsightTag: 'Insight IA',
    aiInsightBody:
      'Le logement représente 38 % des dépenses. Renégocier les contrats fixes peut libérer jusqu’à R$ 620/mois.',
    emergencyTitle: 'Fonds d’urgence',
    emergencyProgress: '72 % complété',
    alertsCardTitle: 'Alertes actives',
    alertsCardLines: ['Relevé proche du plafond', 'Abonnement en doublon', 'Budget loisirs à 84 %'],
    dualChartTitle: 'Revenus vs dépenses',
    dualChartSubtitle: 'Comparaison mensuelle avec marge projetée',
    dualLegendIncome: 'Revenu',
    dualLegendExpense: 'Dépense',
    dualLegendMeta: 'Cible',
    dualMonths: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    balanceForecastBadge: 'Prévu',
    balanceForecastTitle: 'Prévision de solde',
    balanceForecastSub: 'Projection de trésorerie',
    balance30Label: 'Solde à 30 jours',
    trendLabel: 'Tendance',
    week1: 'Semaine 1',
    week4: 'Semaine 4',
    categorySpendTitle: 'Dépenses par catégorie',
    categorySpendSub: 'Carte de concentration mensuelle',
    insightsBadge: 'Insights',
    totalMonthLabel: 'Total du mois',
    vsPreviousLabel: '-12 % vs mois précédent',
    categoryInsightBanner:
      'Insight : le logement concentre 38 %. L’IA suggère de revoir les charges fixes avant de couper les loisirs.',
    categoryDemo: [
      { name: 'Logement', value: '38 %', amount: 'R$ 2 356' },
      { name: 'Alimentation', value: '26 %', amount: 'R$ 1 612' },
      { name: 'Transport', value: '18 %', amount: 'R$ 1 116' },
      { name: 'Autres', value: '18 %', amount: 'R$ 1 116' },
    ],
    sistemaKicker: 'Architecture idéale pour les particuliers',
    sistemaTitle: 'Simple pour débuter, puissant pour grandir.',
    sistemaSubtitle:
      'FinanceApp reste accessible tout en préparant automatisation, intelligence financière et sécurité.',
    sistemaBalanceTitle: 'Équilibre produit',
    sistemaBalanceText:
      'Trop complexe et les utilisateurs partent ; trop simple et ça ne résout pas le problème. Peu de clics au quotidien, profondeur à l’analyse.',
    sistemaTags: ['Simplicité', 'Automatisation', 'Intelligence', 'Clarté visuelle'],
    profilesKicker: 'Pour tous les profils',
    profilesTitle: 'Du premier budget à l’analyse avancée',
    profilesSubtitle:
      'L’expérience évolue avec l’utilisateur : départ simple, couches enrichies ensuite.',
    modulesKicker: 'Modules principaux',
    modulesTitle: 'Structure complète pour votre tableau financier',
    modulesSubtitle:
      'Organisé pour scaler : départ local et préparation auth réelle, base de données et plans.',
    modulesCta: 'Voir le tableau en action',
    funcHeroTitle: 'Fonctions pros recommandées',
    funcHeroSubtitle:
      'Des briques qui rendent le tableau plus robuste et pertinent en abonnement.',
    funcStat1: 'plus de clarté sur les dépenses',
    funcStat2: 'plus d’organisation mensuelle',
    stepsKicker: 'Comment ça marche',
    stepsTitle: 'De la saisie à la décision en quelques étapes',
    stepsSubtitle: 'Pour celles et ceux qui veulent du contrôle sans friction.',
    plansKicker: 'Offres d’abonnement',
    plansTitle: 'Choisissez l’offre adaptée à votre étape',
    plansSubtitle: 'Tarifs démo pour illustrer le modèle commercial.',
    planRecommended: 'Le plus adapté',
    planPerMonth: '/mois',
    planBuy: 'Acheter le plan',
    planGenerating: 'Création de la facture...',
    planHowHelps: 'Comment ces fonctions aident',
    planIncluded: 'Fonctions incluses',
    comparisonTitle: 'Comparatif rapide',
    comparisonSubtitle: 'Évolution des capacités selon les offres.',
    comparisonFeature: 'Fonction',
    comparisonEssential: 'Essentiel',
    comparisonPro: 'Professionnel',
    comparisonEnterprise: 'Entreprise',
    bottomCards: [
      {
        title: 'Accès responsive',
        description: 'Bureau, tablette et mobile pour suivre votre routine financière.',
      },
      {
        title: 'Alertes intelligentes',
        description: 'Échéances, retards, plafonds budgétaires et objectifs bloqués.',
      },
      {
        title: 'Rapports exportables',
        description: 'Base prête pour documents et partage avec expert-comptable ou famille.',
      },
    ],
    ctaTitle: 'Prêt à ouvrir votre tableau ?',
    ctaSubtitle: 'Connectez-vous pour voir la démonstration.',
    ctaButton: 'Ouvrir le tableau',
    features: [
      {
        title: 'Tableau intelligent',
        description: 'Solde, revenus, dépenses et indicateurs dans une vue claire.',
      },
      {
        title: 'Objectifs financiers',
        description: 'Fixez des cibles, suivez la progression et le reste à financer.',
      },
      {
        title: 'Paiements organisés',
        description: 'Payés, en attente et en retard en quelques clics.',
      },
    ],
    panelScreens: [
      {
        title: 'Tableau financier',
        description:
          'Vue d’accueil avec solde, flux, prévision des charges fixes, salaires et apports aux objectifs.',
        metric: 'R$ 15 420,50',
        label: 'solde actuel',
        bullets: ['Synthèse du mois', 'Objectifs et apports', 'Charges prévues'],
      },
      {
        title: 'Lecture de ticket',
        description:
          'Envoi du ticket, OCR local, société, TVA ID, date, lignes et saisie automatique en dépense.',
        metric: 'OCR',
        label: 'lecture automatique',
        bullets: ['Ticket', 'Lignes et montants', 'Dépense auto'],
      },
      {
        title: 'Analyse des dépenses',
        description:
          'Goulots d’étranglement, dépenses peu rentables et potentiel d’économies.',
        metric: '35 %',
        label: 'potentiel de réduction',
        bullets: ['Goulots', 'Faible levier', 'Réallocation'],
      },
      {
        title: 'Assistant investissement',
        description:
          'Croise revenus, cash disponible, objectifs et profil pour suggérer des priorités.',
        metric: '20 %',
        label: 'du revenu',
        bullets: ['Profil de risque', 'Portefeuille suggéré', 'Objectifs prioritaires'],
      },
    ],
    modules: [
      {
        title: 'Tableau exécutif',
        description: 'Synthèse mensuelle, solde, flux et derniers mouvements.',
      },
      {
        title: 'Gestion des transactions',
        description: 'Entrées/sorties, catégories, filtres, recherche et statuts.',
      },
      {
        title: 'Suivi des paiements',
        description: 'Payé, à payer et en retard pour voir les engagements vite.',
      },
      {
        title: 'Objectifs financiers',
        description: 'Suivi des cibles, jalons et écart restant.',
      },
      {
        title: 'Analyses et rapports',
        description: 'Graphiques revenus vs dépenses et historique multi-mois.',
      },
      {
        title: 'Profil client',
        description: 'Avatar, données et réglages prêts pour auth future.',
      },
    ],
    idealPillars: [
      {
        title: 'Socle simple',
        description: 'Revenus, dépenses et catégories en quelques clics pour débuter.',
      },
      {
        title: 'Cartes et relevés',
        description: 'Plafonds, relevés ouverts/fermés, échéances et futures charges.',
      },
      {
        title: 'Budget intelligent',
        description: 'Plan vs réalisé avec alertes lorsque ça dérape.',
      },
      {
        title: 'Flux de trésorerie',
        description: 'Solde actuel et prévisions pour anticiper les manques.',
      },
      {
        title: 'Automatisation et alertes',
        description: 'Charges récurrentes, échéances et dépenses inhabituelles.',
      },
      {
        title: 'Sécurité et confidentialité',
        description: 'Connexion sécurisée, sauvegardes, chiffrement et protection des données.',
      },
    ],
    userProfiles: [
      {
        title: 'Mode débutant',
        description: 'Interface épurée pour saisir flux et solde mensuel.',
      },
      {
        title: 'Mode complet',
        description: 'Budgets, cartes, objectifs, relevés et rapports sans surcharge.',
      },
      {
        title: 'Mode avancé',
        description: 'Analyses multi-périodes, exports, prévisions et alertes stratégiques.',
      },
    ],
    plans: [
      {
        apiName: 'Essencial',
        displayName: 'Essentiel',
        price: 'R$ 19',
        description: 'Pour organiser ses finances personnelles simplement.',
        idealFor: 'Parfait pour débuter le pilotage de son argent.',
        details: [
          {
            title: 'Pilotage financier de base',
            description: 'Saisissez revenus, dépenses, catégories et paiements sans friction.',
          },
          {
            title: 'Vision mensuelle claire',
            description: 'Solde, flux entrants/sortants et évolution simple.',
          },
          {
            title: 'Objectifs personnels',
            description: 'Urgence, voyage ou achat planifié.',
          },
        ],
        features: [
          'Saisie illimitée de revenus et dépenses',
          'Catégories de base',
          'Tableau avec solde et flux',
          'Objectifs personnels',
          'Suivi payé / à payer',
          'Rapports mensuels simples',
          'Accès responsive web',
        ],
      },
      {
        apiName: 'Profissional',
        displayName: 'Professionnel',
        price: 'R$ 39',
        description: 'Pour analyses, alertes et automatisation.',
        featured: true,
        idealFor: 'Quand vous voulez décider avec des données.',
        details: [
          {
            title: 'Planification par catégorie',
            description: 'Plafonds mensuels nourriture, logement, loisirs, transport.',
          },
          {
            title: 'Alertes et automatisation',
            description: 'Dépenses hors norme, échéances, relevés et charges récurrentes.',
          },
          {
            title: 'Reporting stratégique',
            description: 'Graphiques, exports et recherche des fuites de cash.',
          },
        ],
        features: [
          'Tout du plan Essentiel',
          'Budget mensuel par catégorie',
          'Plan vs réalisé',
          'Alertes intelligentes',
          'Abonnements et récurrences',
          'Échéances et prévision de relevés',
          'Rapports avancés',
          'Export PDF/CSV',
          'Insights personnalisés',
        ],
      },
      {
        apiName: 'Empresarial',
        displayName: 'Entreprise',
        price: 'R$ 79',
        description: 'Pour petites équipes et gestion partagée.',
        idealFor: 'Familles, indépendants et petites structures.',
        details: [
          {
            title: 'Gestion partagée',
            description: 'Invitations pour associés, famille ou expert avec rôles.',
          },
          {
            title: 'Centre de coûts',
            description: 'Séparer personnel, pro et projets.',
          },
          {
            title: 'Support et mise en place',
            description: 'Priorité et accompagnement pour structurer vos finances.',
          },
        ],
        features: [
          'Tout du Professionnel',
          'Multi-utilisateurs avec droits',
          'Rôles comptable ou associé',
          'Tableaux par centre de coûts',
          'Séparation perso / pro',
          'Reporting décisionnel',
          'Sauvegardes cloud',
          'Support prioritaire',
          'Onboarding assisté',
        ],
      },
    ],
    planComparison: [
      { feature: 'Tableau financier', essencial: true, profissional: true, empresarial: true },
      { feature: 'Objectifs et paiements', essencial: true, profissional: true, empresarial: true },
      { feature: 'Budget par catégorie', essencial: false, profissional: true, empresarial: true },
      { feature: 'Alertes intelligentes', essencial: false, profissional: true, empresarial: true },
      { feature: 'Export PDF/CSV', essencial: false, profissional: true, empresarial: true },
      { feature: 'Multi-utilisateurs', essencial: false, profissional: false, empresarial: true },
    ],
    steps: [
      {
        title: 'Enregistrez vos mouvements',
        description: 'Revenus, dépenses, catégories et statuts de paiement.',
      },
      {
        title: 'Suivez les indicateurs',
        description: 'Solde, épargne, objectifs et dépenses critiques quasi temps réel.',
      },
      {
        title: 'Décidez mieux',
        description: 'Exploitez rapports et alertes pour réduire les dépenses.',
      },
    ],
    professionalFunctions: [
      'Budget mensuel par catégorie',
      'Alertes échéances et retards',
      'Rapport mensuel avec évolution du solde',
      'Export PDF/CSV',
      'Profils perso vs micro-entreprise',
      'Abonnements, récurrences et échéances',
      'Sauvegarde cloud et synchro',
      'Permissions comptable ou famille',
    ],
  },
  footer: {
    tagline: 'Gestion financière intelligente',
    description:
      'Plateforme personnelle pour simplifier la routine, organiser les dépenses et suivre les objectifs.',
    securityNote: 'Données locales dans cette version ; prêt pour sécurité renforcée.',
    companyTitle: 'Entreprise',
    companyLines: [
      'FinanceApp Technologies Financières Ltda.',
      'CNPJ : 00.000.000/0001-00',
      'Support : lun–ven, 9h–18h',
    ],
    contactTitle: 'Contact',
    copyright: '© 2026 FinanceApp. Tous droits réservés.',
    links: [
      { label: 'Fonctionnalités', href: '#recursos' },
      { label: 'Système idéal', href: '#sistema-ideal' },
      { label: 'Fonctions', href: '#funcoes' },
      { label: 'Offres', href: '#planos' },
    ],
  },
  chat: {
    welcome:
      'Bonjour ! Je suis l’équipe FinanceApp. Posez vos questions sur les offres, cartes, sécurité ou souscription.',
    online: 'Support en ligne',
    closeAria: 'Fermer le chat',
    typingPrefix: '',
    typingSuffix: ' est en train d’écrire',
    placeholder: 'Écrivez votre question...',
    humanTitle: 'Besoin d’un humain ?',
    humanSubtitle: 'Cliquez ci-dessous pour joindre l’équipe commerciale.',
    supportCta: 'Contacter le support',
    openAria: 'Ouvrir le chat questions',
    fallback:
      'Pas encore de réponse exacte ; je peux aider sur les offres, cartes, objectifs, rapports, budget, alertes, sécurité ou ventes.',
  },
  chatIntents: [
    {
      keywords: ['bonjour', 'salut', 'aide', 'hello'],
      answer:
        'Bonjour ! Je peux parler des offres FinanceApp, cartes, objectifs, rapports, sécurité ou support.',
    },
    {
      keywords: ['commencer', 'debut', 'fonctionne', 'etape', 'depense', 'revenu'],
      answer:
        'Commencez par saisir revenus et dépenses fixes/variables, puis catégorisez logement, nourriture, loisirs.',
    },
    {
      keywords: ['prix', 'combien', 'offre', 'abonnement', 'paiement'],
      answer:
        'Démo : Essentiel R$19/mois, Professionnel R$39/mois, Entreprise R$79/mois.',
    },
    {
      keywords: ['carte', 'credit', 'releve', 'limite', 'echeance'],
      answer:
        'Contrôle des cartes, relevés ouverts/fermés, limite et échéances.',
    },
    {
      keywords: ['mobile', 'telephone', 'tablette'],
      answer:
        'Interface responsive pour mobile, tablette et bureau.',
    },
    {
      keywords: ['securite', 'donnees', 'chiffrement'],
      answer:
        'Version locale dans le navigateur ; évolution vers auth forte et MFA.',
    },
    {
      keywords: ['rapport', 'graphique', 'analyse'],
      answer:
        'Graphiques revenus vs dépenses, catégories et évolution mensuelle.',
    },
    {
      keywords: ['objectif', 'epargne', 'urgence'],
      answer:
        'Suivi d’objectifs avec montants restants.',
    },
    {
      keywords: ['budget', 'prevu', 'reel'],
      answer:
        'Budget par catégorie avec alertes.',
    },
    {
      keywords: ['alerte', 'notification', 'retard'],
      answer:
        'Alertes échéances, retards et budgets.',
    },
    {
      keywords: ['banque', 'import'],
      answer:
        'Feuille de route : import relevés et charges récurrentes.',
    },
    {
      keywords: ['acheter', 'contact', 'commercial'],
      answer:
        'Testez via « Ouvrir le tableau », ventes via « Contacter le support ».',
    },
  ],
};
