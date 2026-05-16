import type { SiteTranslations } from './types';

export const de: SiteTranslations = {
  landing: {
    brandTagline: 'Intelligentes Finanzmanagement',
    nav: [
      { label: 'Funktionen', sectionId: 'recursos' },
      { label: 'Screenshots', sectionId: 'telas-painel' },
      { label: 'Ideales System', sectionId: 'sistema-ideal' },
      { label: 'Module', sectionId: 'modulos' },
      { label: 'Features', sectionId: 'funcoes' },
      { label: 'Pläne', sectionId: 'planos' },
      { label: 'Vorteile', sectionId: 'beneficios' },
    ],
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    enterPanel: 'Zum Dashboard',
    cartFloating: 'Warenkorb',
    cartTitle: 'Warenkorb',
    cartSubtitle: 'Jeder Artikel hat bereits eine ausstehende Admin-Rechnung erzeugt.',
    cartClose: 'Schließen',
    cartEmpty: 'Noch keine Pläne im Warenkorb.',
    cartTotalPending: 'Ausstehend gesamt',
    cartCheckout: 'Zur Kasse und bezahlen',
    cartInvoiceHash: 'Rechnung #',
    cartRemove: 'Aus Warenkorb entfernen',
    toastCartRemoved: 'Artikel aus dem Warenkorb entfernt.',
    toastPlanAdded: 'Plan {{plan}} in den Warenkorb gelegt. Rechnung im Admin erstellt.',
    toastInvoiceError: 'Rechnung konnte nicht erstellt werden.',
    heroBadge: 'Finanzkontrolle für bessere Entscheidungen',
    heroTitle: 'Ein komplettes Finanzsystem zum Steuern, Analysieren und Planen.',
    heroSubtitle:
      'FinanceApp bündelt Transaktionen, Ziele, Zahlungen, Budgets, Reports und Profil – professionell für Privatpersonen und KMU.',
    heroPrimary: 'Zum Dashboard',
    heroSecondary: 'Funktionen entdecken',
    benefits: ['Keine komplexe Installation', 'Responsives Dashboard', 'Visuelle Reports', 'Steuerung nach Kategorien'],
    stats: [
      { value: '+12', label: 'Finanzfunktionen' },
      { value: '24h', label: 'immer verfügbar' },
      { value: '100%', label: 'responsives Panel' },
      { value: 'BRL', label: 'Brasilianisches Format' },
    ],
    demoMonthSavings: 'Ersparnis im Monat',
    mockBalance: 'Aktueller Saldo',
    mockIncome: 'Einnahmen',
    mockVsTitle: 'Einnahmen vs Ausgaben',
    mockVsSubtitle: 'Letzte 6 Monate',
    mockGoalsTitle: 'Ziele',
    mockGoalsSubtitle: 'Gesamtfortschritt',
    mockGoalRow: 'Ziel',
    resourcesKicker: 'Systemfunktionen',
    resourcesTitle: 'Alles, um Ihr Geld zu verfolgen',
    resourcesSubtitle: 'Gebaut für Kontrolle, Klarheit, Planung und Entscheidungen.',
    telasKicker: 'Dashboard-Vorschau',
    telasTitle: 'So arbeitet das System innen',
    telasSubtitle:
      'Visuelle Vorabansichten der wichtigsten Screens: Kontrolle, Belege, Analysen und Investments.',
    telasCta: 'Komplettes Dashboard öffnen',
    telasBrowser: 'financeapp.com.br/painel',
    telasMiniBalance: 'Aktueller Saldo',
    telasMiniIncome: 'Einnahmen',
    telasMiniExpense: 'Ausgaben',
    telasForecastTitle: 'Monatsprognose',
    telasForecastRows: ['Gehalt', 'Fixkosten', 'Ziele'],
    telasScreenBadge: 'Screen',
    animatedKicker: 'Animierte Demo',
    animatedTitle: 'Lebendige Charts zeigen den Nutzen vor dem Kauf.',
    animatedSubtitle:
      'Animierte Vorschau mit Balken, Prognoselinie und Kategorieverteilung – wie ein Produkt-GIF.',
    animatedTicker: [
      '30-Tage-Saldo-Prognose',
      'Ausgaben außerhalb des Musters',
      'Auszug nahe dem Limit',
      'Notfallfonds im Aufbau',
      'Budget je Kategorie',
      'Automatischer Monatsreport',
    ],
    analyticsBrand: 'FinanceApp Analytics',
    analyticsSubtitle: 'Executive Preview mit KPIs in Echtzeit',
    execVisionTag: 'Executive-Ansicht',
    execVisionTitle: 'Premium-Finanzdashboard',
    execVisionDesc: 'Näher an einem echten Dashboard mit KPIs, Alerts und Trends.',
    premiumKpis: [
      { label: 'Konsolidierter Saldo', value: 'R$ 24.860' },
      { label: 'Prognostizierte Ersparnis', value: 'R$ 3.420' },
      { label: 'Überziehungsrisiko', value: 'Niedrig' },
    ],
    chartFlowTitle: 'Intelligenter Monatsfluss',
    chartFlowSubtitle: 'Einnahmen, Ausgaben und freier Cashflow in einem Chart',
    liveBadge: 'Live',
    aiInsightTag: 'KI-Insight',
    aiInsightBody:
      'Wohnen macht 38 % der Ausgaben aus. Neuverhandlung fixer Verträge kann bis zu R$ 620/Monat freisetzen.',
    emergencyTitle: 'Notfallfonds',
    emergencyProgress: '72 % erreicht',
    alertsCardTitle: 'Aktive Alerts',
    alertsCardLines: ['Auszug nahe Limit', 'Doppeltes Abo erkannt', 'Freizeitbudget bei 84 %'],
    dualChartTitle: 'Einnahmen vs Ausgaben',
    dualChartSubtitle: 'Monatsvergleich mit prognostizierter Marge',
    dualLegendIncome: 'Einnahme',
    dualLegendExpense: 'Ausgabe',
    dualLegendMeta: 'Ziel',
    dualMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'],
    balanceForecastBadge: 'Prognose',
    balanceForecastTitle: 'Saldoprognose',
    balanceForecastSub: 'Liquiditätsprognose',
    balance30Label: 'Saldo in 30 Tagen',
    trendLabel: 'Trend',
    week1: 'Woche 1',
    week4: 'Woche 4',
    categorySpendTitle: 'Ausgaben nach Kategorie',
    categorySpendSub: 'Konzentrationskarte des Monats',
    insightsBadge: 'Insights',
    totalMonthLabel: 'Monatssumme',
    vsPreviousLabel: '-12 % zum Vormonat',
    categoryInsightBanner:
      'Insight: Wohnen konzentriert 38 %. Die KI empfiehlt Fixkosten zu prüfen, bevor Freizeit gekürzt wird.',
    categoryDemo: [
      { name: 'Wohnen', value: '38%', amount: 'R$ 2.356' },
      { name: 'Essen', value: '26%', amount: 'R$ 1.612' },
      { name: 'Mobilität', value: '18%', amount: 'R$ 1.116' },
      { name: 'Sonstiges', value: '18%', amount: 'R$ 1.116' },
    ],
    sistemaKicker: 'Ideale Architektur für Privatpersonen',
    sistemaTitle: 'Einfach starten, stark skalieren.',
    sistemaSubtitle:
      'FinanceApp bleibt zugänglich und ist bereit für Automatisierung, Finanzintelligenz und Sicherheit.',
    sistemaBalanceTitle: 'Produktbalance',
    sistemaBalanceText:
      'Zu komplex → Nutzer springen ab; zu simpel → Problem bleibt. Wenige Klicks im Alltag, Tiefe bei Analysen.',
    sistemaTags: ['Einfachheit', 'Automatisierung', 'Intelligenz', 'Visuelle Klarheit'],
    profilesKicker: 'Für alle Profile',
    profilesTitle: 'Vom ersten Budget bis zur Advanced-Analyse',
    profilesSubtitle:
      'Das Erlebnis wächst mit dem Nutzer: einfacher Start, später mehr Tiefe.',
    modulesKicker: 'Kernmodule',
    modulesTitle: 'Komplette Struktur für Ihr Finanzpanel',
    modulesSubtitle:
      'Skalierbar aufgebaut: lokaler Start, bereit für echte Auth, Datenbank und Pläne.',
    modulesCta: 'Live-Dashboard ansehen',
    funcHeroTitle: 'Empfohlene Profi-Funktionen',
    funcHeroSubtitle:
      'Bausteine, die das Dashboard abonnementwürdig machen.',
    funcStat1: 'mehr Klarheit bei Ausgaben',
    funcStat2: 'bessere Monatsorganisation',
    stepsKicker: 'So funktioniert es',
    stepsTitle: 'Vom Eintrag zur Entscheidung in wenigen Schritten',
    stepsSubtitle: 'Für Menschen, die Kontrolle ohne Reibung wollen.',
    plansKicker: 'Abopläne',
    plansTitle: 'Wählen Sie den passenden Plan',
    plansSubtitle: 'Demo-Preise zur Illustration des Geschäftsmodells.',
    planRecommended: 'Empfohlen',
    planPerMonth: '/Monat',
    planBuy: 'Plan kaufen',
    planGenerating: 'Rechnung wird erstellt...',
    planHowHelps: 'Wie diese Funktionen helfen',
    planIncluded: 'Enthaltene Funktionen',
    comparisonTitle: 'Schneller Funktionsvergleich',
    comparisonSubtitle: 'So entwickeln sich Features über die Stufen.',
    comparisonFeature: 'Funktion',
    comparisonEssential: 'Essential',
    comparisonPro: 'Professional',
    comparisonEnterprise: 'Business',
    bottomCards: [
      {
        title: 'Responsiver Zugriff',
        description: 'Desktop, Tablet und Smartphone für den Finanzalltag.',
      },
      {
        title: 'Smarte Alerts',
        description: 'Für Fälligkeiten, Überfälligkeit, Budgetdeckel und stockende Ziele.',
      },
      {
        title: 'Exportierbare Reports',
        description: 'Grundlage für Dokumente und Freigabe an Steuerberater oder Familie.',
      },
    ],
    ctaTitle: 'Bereit für Ihr Dashboard?',
    ctaSubtitle: 'Jetzt einsteigen und die Demo erleben.',
    ctaButton: 'Zum Dashboard',
    features: [
      {
        title: 'Smartes Dashboard',
        description: 'Saldo, Einnahmen, Ausgaben und KPIs in einer klaren Ansicht.',
      },
      {
        title: 'Finanzziele',
        description: 'Ziele setzen, Fortschritt sehen und Restbetrag erkennen.',
      },
      {
        title: 'Organisierte Zahlungen',
        description: 'Bezahlt, offen und überfällig mit wenigen Klicks.',
      },
    ],
    panelScreens: [
      {
        title: 'Finanz-Dashboard',
        description:
          'Startansicht mit Saldo, Cashflow, Prognose für Fixkosten, Gehältern und Sparplan für Ziele.',
        metric: 'R$ 15.420,50',
        label: 'aktueller Saldo',
        bullets: ['Monatsüberblick', 'Ziele & Sparraten', 'Erwartete Rechnungen'],
      },
      {
        title: 'Belegscanner',
        description:
          'Upload, lokales OCR, Händler, Steuer-ID, Datum, Positionen und automatische Ausgabenbuchung.',
        metric: 'OCR',
        label: 'automatisches Lesen',
        bullets: ['Beleg', 'Positionen & Beträge', 'Auto-Ausgabe'],
      },
      {
        title: 'Ausgabenanalyse',
        description:
          'Engpässe, wenig hebelnde Ausgaben und Einsparpotenzial.',
        metric: '35%',
        label: 'Einsparpotenzial',
        bullets: ['Engpässe', 'Geringer Hebel', 'Umschichtung'],
      },
      {
        title: 'Investment-Assistent',
        description:
          'Verknüpft Einkommen, freien Cash, Ziele und Profil für Sparprioritäten.',
        metric: '20%',
        label: 'des Einkommens',
        bullets: ['Risikoprofil', 'Vorschlagsportfolio', 'Priorisierte Ziele'],
      },
    ],
    modules: [
      {
        title: 'Executive-Dashboard',
        description: 'Monatsüberblick, Saldo, Ein-/Ausgänge und letzte Bewegungen.',
      },
      {
        title: 'Transaktionsmanagement',
        description: 'Ein-/Ausgänge, Kategorien, Filter, Suche und Status.',
      },
      {
        title: 'Zahlungskontrolle',
        description: 'Bezahlt, offen, überfällig – Verpflichtungen schnell sehen.',
      },
      {
        title: 'Finanzziele',
        description: 'Ziele, Fortschritt, Fristen und Restbetrag.',
      },
      {
        title: 'Analysen & Reports',
        description: 'Charts Einnahmen vs Ausgaben und Mehmonats-Historie.',
      },
      {
        title: 'Kundenprofil',
        description: 'Avatar, Stammdaten und Settings bereit für spätere Auth.',
      },
    ],
    idealPillars: [
      {
        title: 'Einfache Basis',
        description: 'Einnahmen, Ausgaben und Konten in wenigen Klicks für Einsteiger.',
      },
      {
        title: 'Karten & Auszüge',
        description: 'Limits, offene/geschlossene Auszüge, Raten und kommende Buchungen.',
      },
      {
        title: 'Smartes Budget',
        description: 'Plan vs Ist je Kategorie mit Alerts bei Abweichungen.',
      },
      {
        title: 'Cashflow',
        description: 'Aktueller Saldo und Prognosen für Liquiditätslücken.',
      },
      {
        title: 'Automatisierung & Alerts',
        description: 'Wiederkehrende Zahlungen, Fälligkeiten und Ausreißer.',
      },
      {
        title: 'Sicherheit & Datenschutz',
        description: 'Sicheres Login, Backups, Verschlüsselung und Datenschutz.',
      },
    ],
    userProfiles: [
      {
        title: 'Einsteiger-Modus',
        description: 'Klares UI für Bewegungen und Monatssaldo.',
      },
      {
        title: 'Vollmodus',
        description: 'Budgets, Karten, Ziele, Auszüge und Reports ohne Überladung.',
      },
      {
        title: 'Advanced-Modus',
        description: 'Periodenanalysen, Exporte, Prognosen und strategische Alerts.',
      },
    ],
    plans: [
      {
        apiName: 'Essencial',
        displayName: 'Essential',
        price: 'R$ 19',
        description: 'Persönliche Finanzen einfach organisieren.',
        idealFor: 'Perfekt zum Start mit aktivem Geldmanagement.',
        details: [
          {
            title: 'Basis-Finanzkontrolle',
            description: 'Erfassen Sie Einnahmen, Ausgaben, Kategorien und Zahlungen ohne Aufwand.',
          },
          {
            title: 'Klare Monatsansicht',
            description: 'Saldo, Summen Zu-/Abflüsse und einfache Entwicklung.',
          },
          {
            title: 'Persönliche Ziele',
            description: 'Notfallfonds, Reise oder geplanter Kauf.',
          },
        ],
        features: [
          'Unbegrenzte Einnahmen- und Ausgabenbuchungen',
          'Basiskategorien',
          'Dashboard mit Saldo und Cashflows',
          'Persönliche Finanzziele',
          'Tracking bezahlt/offen',
          'Einfache Monatsreports',
          'Responsives Web',
        ],
      },
      {
        apiName: 'Profissional',
        displayName: 'Professional',
        price: 'R$ 39',
        description: 'Für Analysen, Alerts und mehr Automatisierung.',
        featured: true,
        idealFor: 'Wenn Planung datenbasiert sein soll.',
        details: [
          {
            title: 'Kategorieplanung',
            description: 'Monatliche Deckel für Essen, Wohnen, Freizeit, Mobilität.',
          },
          {
            title: 'Alerts & Automation',
            description: 'Hinweise bei Ausreißern, Fälligkeiten, Auszügen und Abos.',
          },
          {
            title: 'Strategische Reports',
            description: 'Charts, Exporte und Erkennung von Geldlecks.',
          },
        ],
        features: [
          'Alles aus Essential',
          'Monatsbudget je Kategorie',
          'Plan vs Ist',
          'Smarte Alerts',
          'Abos & wiederkehrende Zahlungen',
          'Ratenzahlungen & Auszugsprognose',
          'Erweiterte Charts',
          'PDF/CSV-Export',
          'Personalisierte Spar-Insights',
        ],
      },
      {
        apiName: 'Empresarial',
        displayName: 'Business',
        price: 'R$ 79',
        description: 'Für kleine Teams mit gemeinsamer Steuerung.',
        idealFor: 'Familien, Freelancer und kleine Betriebe.',
        details: [
          {
            title: 'Gemeinsame Verwaltung',
            description: 'Zugriffe für Partner, Familie oder Steuerberater mit Rollen.',
          },
          {
            title: 'Kostenstellen',
            description: 'Trennung privat, geschäftlich und nach Projekt.',
          },
          {
            title: 'Support & Rollout',
            description: 'Priorität und Begleitung beim Aufbau der Struktur.',
          },
        ],
        features: [
          'Alles aus Professional',
          'Mehrbenutzer mit Rechten',
          'Rollen für Steuerberater oder Partner',
          'Dashboards je Kostenstelle',
          'Trennung privat/geschäftlich',
          'Entscheidungsreports',
          'Cloud-Backup & Sync',
          'Priority-Support',
          'Begleitetes Onboarding',
        ],
      },
    ],
    planComparison: [
      { feature: 'Finanz-Dashboard', essencial: true, profissional: true, empresarial: true },
      { feature: 'Ziele & Zahlungen', essencial: true, profissional: true, empresarial: true },
      { feature: 'Budget je Kategorie', essencial: false, profissional: true, empresarial: true },
      { feature: 'Smarte Alerts', essencial: false, profissional: true, empresarial: true },
      { feature: 'PDF/CSV-Export', essencial: false, profissional: true, empresarial: true },
      { feature: 'Mehrbenutzer & Rechte', essencial: false, profissional: false, empresarial: true },
    ],
    steps: [
      {
        title: 'Bewegungen erfassen',
        description: 'Einnahmen, Ausgaben, Kategorien und Zahlungsstatus.',
      },
      {
        title: 'KPIs verfolgen',
        description: 'Saldo, Ersparnis, Ziele und kritische Ausgaben nahezu live.',
      },
      {
        title: 'Besser entscheiden',
        description: 'Nutzen Sie Reports und Alerts zum Sparen und Planen.',
      },
    ],
    professionalFunctions: [
      'Monatsbudget je Kategorie',
      'Alerts für Fälligkeiten und Überfälligkeit',
      'Monatsreport mit Saldoentwicklung',
      'PDF/CSV-Export von Transaktionen',
      'Profile Privat vs Kleinunternehmen',
      'Abos, wiederkehrende Zahlungen und Raten',
      'Cloud-Backup & Gerätesync',
      'Freigaben für Steuerberater oder Familie',
    ],
  },
  footer: {
    tagline: 'Intelligentes Finanzmanagement',
    description:
      'Plattform zur Vereinfachung des Alltags, Organisation von Ausgaben und Unterstützung bei klaren Entscheidungen.',
    securityNote: 'Lokale Daten in dieser Version – bereit für gehärtete Sicherheit.',
    companyTitle: 'Unternehmen',
    companyLines: [
      'FinanceApp Financial Technology Ltda.',
      'Steuernummer: 00.000.000/0001-00',
      'Support: Mo–Fr, 9–18 Uhr',
    ],
    contactTitle: 'Kontakt',
    copyright: '© 2026 FinanceApp. Alle Rechte vorbehalten.',
    links: [
      { label: 'Funktionen', href: '#recursos' },
      { label: 'Ideales System', href: '#sistema-ideal' },
      { label: 'Features', href: '#funcoes' },
      { label: 'Pläne', href: '#planos' },
    ],
  },
  chat: {
    welcome:
      'Hallo! Ich bin vom FinanceApp-Support. Fragen Sie zu Plänen, Features, Karten, Sicherheit oder Kauf.',
    online: 'Online-Support',
    closeAria: 'Chat schließen',
    typingPrefix: '',
    typingSuffix: ' schreibt',
    placeholder: 'Ihre Frage...',
    humanTitle: 'Möchten Sie mit einem Menschen sprechen?',
    humanSubtitle: 'Unten klicken für das Commercial-Team.',
    supportCta: 'Support kontaktieren',
    openAria: 'Fragen-Chat öffnen',
    fallback:
      'Keine exakte Antwort – ich helfe bei Plänen, Karten, Zielen, Reports, Budget, Alerts, Sicherheit oder Vertrieb.',
  },
  chatIntents: [
    {
      keywords: ['hallo', 'hi', 'guten tag', 'hilfe', 'hey'],
      answer:
        'Hallo! Ich kann über FinanceApp-Pläne, Funktionen, Karten, Ziele, Reports und Support informieren.',
    },
    {
      keywords: ['start', 'beginnen', 'funktioniert', 'schritt', 'ausgabe', 'einnahme', 'organisieren'],
      answer:
        'Starten Sie mit Einnahmen und fixen/variablen Ausgaben, Kategorien wie Wohnen und Essen – das Dashboard zeigt Saldo und Trends.',
    },
    {
      keywords: ['preis', 'kosten', 'plan', 'abo', 'zahlung'],
      answer:
        'Demo: Essential R$19/Monat, Professional R$39/Monat, Business R$79/Monat.',
    },
    {
      keywords: ['karte', 'kredit', 'auszug', 'limit', 'rate', 'fallig'],
      answer:
        'Kartenkontrolle, offene/geschlossene Auszüge, Limits und Fälligkeiten.',
    },
    {
      keywords: ['handy', 'mobil', 'tablet', 'computer'],
      answer:
        'Responsive UI für Mobil, Tablet und Desktop.',
    },
    {
      keywords: ['sicherheit', 'daten', 'verschlusselung'],
      answer:
        'Diese Version speichert lokal im Browser; Roadmap mit sicherem Login und MFA.',
    },
    {
      keywords: ['report', 'diagramm', 'analyse'],
      answer:
        'Charts für Einnahmen vs Ausgaben, Kategorien und Monatsverläufe.',
    },
    {
      keywords: ['ziel', 'sparen', 'notfall'],
      answer:
        'Ziele anlegen und Fortschritt mit Restbetrag verfolgen.',
    },
    {
      keywords: ['budget', 'geplant', 'ist'],
      answer:
        'Budget je Kategorie mit Alerts bei Grenzwerten.',
    },
    {
      keywords: ['warnung', 'benachrichtigung', 'uberfallig'],
      answer:
        'Alerts für Fälligkeiten, Überfälligkeit und Budgetgrenzen.',
    },
    {
      keywords: ['bank', 'import'],
      answer:
        'Roadmap: Kontoauszugsimport und wiederkehrende Buchungen.',
    },
    {
      keywords: ['kaufen', 'kontakt', 'vertrieb'],
      answer:
        'Demo über „Zum Dashboard“, Vertrieb über „Support kontaktieren“.',
    },
  ],
};
