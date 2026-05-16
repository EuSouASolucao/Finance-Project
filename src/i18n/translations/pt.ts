import type { SiteTranslations } from './types';

export const pt: SiteTranslations = {
  landing: {
    brandTagline: 'Gestão financeira inteligente',
    nav: [
      { label: 'Recursos', sectionId: 'recursos' },
      { label: 'Telas', sectionId: 'telas-painel' },
      { label: 'Sistema ideal', sectionId: 'sistema-ideal' },
      { label: 'Módulos', sectionId: 'modulos' },
      { label: 'Funções', sectionId: 'funcoes' },
      { label: 'Planos', sectionId: 'planos' },
      { label: 'Benefícios', sectionId: 'beneficios' },
    ],
    themeLight: 'Claro',
    themeDark: 'Dark',
    enterPanel: 'Entrar no painel',
    cartFloating: 'Carrinho',
    cartTitle: 'Carrinho de compra',
    cartSubtitle: 'Cada item já gerou uma fatura pendente no ADM.',
    cartClose: 'Fechar',
    cartEmpty: 'Nenhum plano no carrinho ainda.',
    cartTotalPending: 'Total pendente',
    cartCheckout: 'Finalizar compra e pagar',
    cartInvoiceHash: 'Fatura #',
    cartRemove: 'Remover do carrinho',
    toastCartRemoved: 'Item removido do carrinho.',
    toastPlanAdded: 'Plano {{plan}} adicionado ao carrinho. Fatura criada no ADM.',
    toastInvoiceError: 'Não foi possível criar a fatura.',
    heroBadge: 'Controle financeiro para decisões melhores',
    heroTitle: 'Um sistema financeiro completo para controlar, analisar e planejar melhor.',
    heroSubtitle:
      'O FinanceApp reúne transações, metas, pagamentos, orçamentos, relatórios e perfil do cliente em uma experiência profissional para pessoas e pequenos negócios.',
    heroPrimary: 'Entrar no painel',
    heroSecondary: 'Conhecer recursos',
    benefits: ['Sem instalação complexa', 'Painel responsivo', 'Relatórios visuais', 'Controle por categorias'],
    stats: [
      { value: '+12', label: 'recursos financeiros' },
      { value: '24h', label: 'visão sempre disponível' },
      { value: '100%', label: 'painel responsivo' },
      { value: 'BRL', label: 'formato brasileiro' },
    ],
    demoMonthSavings: 'Economia do mês',
    mockBalance: 'Saldo atual',
    mockIncome: 'Receitas',
    mockVsTitle: 'Receitas vs Despesas',
    mockVsSubtitle: 'Últimos 6 meses',
    mockGoalsTitle: 'Metas',
    mockGoalsSubtitle: 'Progresso geral',
    mockGoalRow: 'Objetivo',
    resourcesKicker: 'Recursos do sistema',
    resourcesTitle: 'Tudo que você precisa para acompanhar seu dinheiro',
    resourcesSubtitle: 'Uma experiência pensada para controle, clareza, planejamento e tomada de decisão.',
    telasKicker: 'Imagens do painel',
    telasTitle: 'Veja como o sistema funciona por dentro',
    telasSubtitle:
      'Demonstrações visuais das principais telas para o cliente entender o fluxo antes de acessar: controle, leitura de cupons, análises e investimentos.',
    telasCta: 'Abrir painel completo',
    telasBrowser: 'financeapp.com.br/painel',
    telasMiniBalance: 'Saldo atual',
    telasMiniIncome: 'Receitas',
    telasMiniExpense: 'Despesas',
    telasForecastTitle: 'Previsão do mês',
    telasForecastRows: ['Salário', 'Contas fixas', 'Metas'],
    telasScreenBadge: 'Tela',
    animatedKicker: 'Demonstração animada',
    animatedTitle: 'Gráficos vivos para mostrar valor antes da compra.',
    animatedSubtitle:
      'Prévia animada do painel financeiro: barras, linha de previsão e distribuição por categoria em movimento, como um GIF demonstrativo do sistema.',
    animatedTicker: [
      'Saldo previsto para 30 dias',
      'Gastos fora do padrão',
      'Fatura próxima do limite',
      'Meta de emergência em evolução',
      'Orçamento por categoria',
      'Relatório mensal automático',
    ],
    analyticsBrand: 'FinanceApp Analytics',
    analyticsSubtitle: 'Prévia executiva com indicadores em tempo real',
    execVisionTag: 'Visão executiva',
    execVisionTitle: 'Painel financeiro premium',
    execVisionDesc: 'Uma prévia mais próxima de um dashboard real, com indicadores, alertas e análise de tendência.',
    premiumKpis: [
      { label: 'Saldo consolidado', value: 'R$ 24.860' },
      { label: 'Economia projetada', value: 'R$ 3.420' },
      { label: 'Risco de estouro', value: 'Baixo' },
    ],
    chartFlowTitle: 'Fluxo mensal inteligente',
    chartFlowSubtitle: 'Receitas, despesas e saldo livre no mesmo gráfico',
    liveBadge: 'Ao vivo',
    aiInsightTag: 'Insight da IA',
    aiInsightBody:
      'Sua moradia ocupa 38% das despesas. Renegociar contratos fixos pode liberar até R$ 620/mês.',
    emergencyTitle: 'Meta de emergência',
    emergencyProgress: '72% concluída',
    alertsCardTitle: 'Alertas ativos',
    alertsCardLines: ['Fatura próxima do limite', 'Assinatura duplicada detectada', 'Orçamento de lazer em 84%'],
    dualChartTitle: 'Receitas vs Despesas',
    dualChartSubtitle: 'Comparativo mensal com margem projetada',
    dualLegendIncome: 'Receita',
    dualLegendExpense: 'Despesa',
    dualLegendMeta: 'Meta',
    dualMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    balanceForecastBadge: 'Previsto',
    balanceForecastTitle: 'Previsão de saldo',
    balanceForecastSub: 'Projeção de fluxo de caixa',
    balance30Label: 'Saldo em 30 dias',
    trendLabel: 'Tendência',
    week1: 'Semana 1',
    week4: 'Semana 4',
    categorySpendTitle: 'Gastos por categoria',
    categorySpendSub: 'Mapa de concentração mensal',
    insightsBadge: 'Insights',
    totalMonthLabel: 'Total do mês',
    vsPreviousLabel: '-12% vs anterior',
    categoryInsightBanner: 'Insight: moradia concentra 38% dos gastos. A IA sugere revisar contratos fixos antes de cortar lazer.',
    categoryDemo: [
      { name: 'Moradia', value: '38%', amount: 'R$ 2.356' },
      { name: 'Alimentação', value: '26%', amount: 'R$ 1.612' },
      { name: 'Transporte', value: '18%', amount: 'R$ 1.116' },
      { name: 'Outros', value: '18%', amount: 'R$ 1.116' },
    ],
    sistemaKicker: 'Arquitetura ideal para pessoa física',
    sistemaTitle: 'Simples para começar, poderoso para evoluir.',
    sistemaSubtitle:
      'O FinanceApp foi pensado com uma base fácil de usar, mas com espaço para crescer em automação, inteligência financeira, segurança e relatórios profissionais.',
    sistemaBalanceTitle: 'Equilíbrio do produto',
    sistemaBalanceText:
      'Se for complexo demais, o usuário abandona. Se for simples demais, não resolve. A proposta é entregar poucos cliques na rotina e profundidade quando a pessoa precisar analisar melhor.',
    sistemaTags: ['Facilidade', 'Automação', 'Inteligência', 'Clareza visual'],
    profilesKicker: 'Acessível para todos os perfis',
    profilesTitle: 'Do primeiro controle financeiro à análise avançada',
    profilesSubtitle:
      'A experiência pode evoluir conforme o usuário amadurece: começa simples e libera camadas mais completas quando fizer sentido.',
    modulesKicker: 'Módulos principais',
    modulesTitle: 'Estrutura completa para o painel financeiro',
    modulesSubtitle:
      'O sistema foi organizado para crescer: começa com controle local e já está preparado para autenticação real, banco de dados, planos e automações.',
    modulesCta: 'Ver painel funcionando',
    funcHeroTitle: 'Funções profissionais recomendadas',
    funcHeroSubtitle:
      'Essas são funcionalidades importantes para transformar o painel em um produto mais robusto, com valor real para assinatura mensal.',
    funcStat1: 'mais clareza nos gastos',
    funcStat2: 'mais organização mensal',
    stepsKicker: 'Como funciona',
    stepsTitle: 'Do registro à decisão em poucos passos',
    stepsSubtitle: 'O fluxo foi pensado para pessoas que querem controle sem complicação.',
    plansKicker: 'Planos de assinatura',
    plansTitle: 'Escolha o plano ideal para o seu momento',
    plansSubtitle: 'Valores demonstrativos para apresentar o modelo comercial do sistema.',
    planRecommended: 'Mais indicado',
    planPerMonth: '/mês',
    planBuy: 'Comprar plano',
    planGenerating: 'Gerando fatura...',
    planHowHelps: 'Como essas funções ajudam',
    planIncluded: 'Funcionalidades inclusas',
    comparisonTitle: 'Comparativo rápido de funcionalidades',
    comparisonSubtitle: 'Veja a evolução dos recursos entre os planos.',
    comparisonFeature: 'Funcionalidade',
    comparisonEssential: 'Essencial',
    comparisonPro: 'Profissional',
    comparisonEnterprise: 'Empresarial',
    bottomCards: [
      {
        title: 'Acesso responsivo',
        description: 'Funciona bem em desktop, tablet e celular para acompanhar sua rotina financeira.',
      },
      {
        title: 'Alertas inteligentes',
        description: 'Planejado para avisar sobre atrasos, vencimentos, limite de orçamento e metas paradas.',
      },
      {
        title: 'Relatórios exportáveis',
        description: 'Base pronta para gerar documentos e compartilhar dados com contador ou família.',
      },
    ],
    ctaTitle: 'Pronto para acessar seu painel?',
    ctaSubtitle: 'Entre agora e veja a demonstração do sistema financeiro.',
    ctaButton: 'Entrar no painel',
    features: [
      {
        title: 'Painel inteligente',
        description: 'Acompanhe saldo, receitas, despesas e indicadores em uma visão clara.',
      },
      {
        title: 'Metas financeiras',
        description: 'Defina objetivos, veja o progresso e saiba quanto falta para chegar lá.',
      },
      {
        title: 'Pagamentos organizados',
        description: 'Controle pagamentos pagos, pendentes e atrasados com poucos cliques.',
      },
    ],
    panelScreens: [
      {
        title: 'Dashboard financeiro',
        description:
          'Visão inicial com saldo, receitas, despesas, previsão de contas fixas, salários e plano de aporte para metas.',
        metric: 'R$ 15.420,50',
        label: 'saldo atual',
        bullets: ['Resumo do mês', 'Metas e aportes', 'Contas previstas'],
      },
      {
        title: 'Leitura de comprovante',
        description:
          'Envio de cupom, OCR local, captura de empresa, CNPJ, data, itens, valores e inclusão automática como despesa.',
        metric: 'OCR',
        label: 'leitura automática',
        bullets: ['Cupom fiscal', 'Itens e valores', 'Despesa automática'],
      },
      {
        title: 'Análise de gastos',
        description:
          'Identificação de gargalos, despesas que não agregam na alavancagem financeira e potencial de corte.',
        metric: '35%',
        label: 'potencial de corte',
        bullets: ['Gargalos', 'Baixo retorno', 'Realocação'],
      },
      {
        title: 'IA de investimentos',
        description:
          'Assistente que cruza receita, saldo livre, metas cadastradas e perfil para sugerir aportes e prioridades.',
        metric: '20%',
        label: 'da receita',
        bullets: ['Perfil de risco', 'Carteira sugerida', 'Metas priorizadas'],
      },
    ],
    modules: [
      {
        title: 'Dashboard executivo',
        description:
          'Resumo do mês, saldo, receitas, despesas, economia, indicadores e últimos movimentos em uma única tela.',
      },
      {
        title: 'Gestão de transações',
        description: 'Cadastro de entradas e saídas, categorias, filtros por data, busca e atualização de status.',
      },
      {
        title: 'Controle de pagamentos',
        description: 'Organização por pago, pendente e atrasado para visualizar compromissos financeiros rapidamente.',
      },
      {
        title: 'Metas financeiras',
        description: 'Acompanhamento de objetivos, progresso, prazo, valor acumulado e quanto ainda falta.',
      },
      {
        title: 'Análises e relatórios',
        description: 'Gráficos de receitas vs despesas, despesas por categoria e análise histórica dos últimos meses.',
      },
      {
        title: 'Perfil do cliente',
        description: 'Avatar, dados cadastrais, sessão local e configurações preparadas para autenticação futura.',
      },
    ],
    idealPillars: [
      {
        title: 'Base simples',
        description:
          'Receitas, despesas, categorias e contas em poucos cliques para não afastar quem está começando.',
      },
      {
        title: 'Cartões e faturas',
        description: 'Controle de limite, faturas abertas e fechadas, parcelas e lançamentos futuros.',
      },
      {
        title: 'Orçamento inteligente',
        description: 'Planejado vs realizado por categoria, com alertas quando o gasto sai do esperado.',
      },
      {
        title: 'Fluxo de caixa',
        description: 'Saldo atual, entradas e saídas futuras e previsão para entender se o dinheiro vai faltar.',
      },
      {
        title: 'Automação e alertas',
        description: 'Recorrências, contas a vencer, faturas próximas e gastos fora do padrão.',
      },
      {
        title: 'Segurança e privacidade',
        description: 'Estrutura pensada para login seguro, backup, criptografia e proteção de dados.',
      },
    ],
    userProfiles: [
      {
        title: 'Modo iniciante',
        description: 'Tela limpa, linguagem simples e foco em registrar entradas, saídas e saldo do mês.',
      },
      {
        title: 'Modo completo',
        description: 'Orçamentos, cartões, metas, faturas, recorrências e relatórios sem deixar a experiência pesada.',
      },
      {
        title: 'Modo avançado',
        description: 'Análises por período, exportação, previsões, alertas inteligentes e visão estratégica.',
      },
    ],
    plans: [
      {
        apiName: 'Essencial',
        displayName: 'Essencial',
        price: 'R$ 19',
        description: 'Para organizar finanças pessoais com simplicidade.',
        idealFor: 'Ideal para quem está começando a controlar o dinheiro.',
        details: [
          {
            title: 'Controle financeiro básico',
            description: 'Registre receitas, despesas, categorias e pagamentos sem complicar a rotina.',
          },
          {
            title: 'Visão mensal clara',
            description: 'Veja saldo atual, total de entradas, total de saídas e evolução básica do mês.',
          },
          {
            title: 'Metas pessoais',
            description: 'Crie objetivos simples, como reserva de emergência, viagem ou compra planejada.',
          },
        ],
        features: [
          'Cadastro de receitas e despesas ilimitadas',
          'Categorias básicas de gastos',
          'Dashboard com saldo, entradas e saídas',
          'Metas financeiras pessoais',
          'Controle de pagamentos pagos e pendentes',
          'Relatórios básicos por mês',
          'Acesso responsivo no celular e computador',
        ],
      },
      {
        apiName: 'Profissional',
        displayName: 'Profissional',
        price: 'R$ 39',
        description: 'Para quem precisa de análise, alertas e mais automação.',
        featured: true,
        idealFor: 'Ideal para quem quer planejamento e decisões com dados.',
        details: [
          {
            title: 'Planejamento por categoria',
            description:
              'Defina limites mensais para alimentação, moradia, lazer, transporte e outras áreas.',
          },
          {
            title: 'Alertas e automações',
            description:
              'Receba avisos sobre gastos fora do padrão, vencimentos, faturas e recorrências.',
          },
          {
            title: 'Relatórios estratégicos',
            description: 'Analise gráficos, exporte dados e identifique onde está vazando dinheiro.',
          },
        ],
        features: [
          'Tudo do plano Essencial',
          'Orçamento mensal por categoria',
          'Comparativo planejado vs realizado',
          'Alertas inteligentes de gastos e vencimentos',
          'Controle de recorrências e assinaturas',
          'Parcelamentos e previsão de faturas',
          'Relatórios avançados com gráficos',
          'Exportação PDF/CSV',
          'Insights de economia personalizados',
        ],
      },
      {
        apiName: 'Empresarial',
        displayName: 'Empresarial',
        price: 'R$ 79',
        description: 'Para pequenos negócios e times com gestão compartilhada.',
        idealFor: 'Ideal para famílias, autônomos e pequenos negócios.',
        details: [
          {
            title: 'Gestão compartilhada',
            description:
              'Permita acesso para sócios, familiares ou contador com perfis e permissões diferentes.',
          },
          {
            title: 'Organização por centro de custo',
            description: 'Separe contas pessoais, profissionais, projetos ou áreas do negócio.',
          },
          {
            title: 'Suporte e implantação',
            description: 'Tenha suporte prioritário e ajuda inicial para configurar a estrutura financeira.',
          },
        ],
        features: [
          'Tudo do plano Profissional',
          'Multiusuários com permissões',
          'Perfil para contador, sócio ou familiar',
          'Painel por centro de custo',
          'Separação de contas pessoais e profissionais',
          'Relatórios para tomada de decisão',
          'Backup em nuvem e sincronização planejada',
          'Suporte prioritário',
          'Onboarding assistido para configuração inicial',
        ],
      },
    ],
    planComparison: [
      { feature: 'Dashboard financeiro', essencial: true, profissional: true, empresarial: true },
      { feature: 'Metas e pagamentos', essencial: true, profissional: true, empresarial: true },
      { feature: 'Orçamento por categoria', essencial: false, profissional: true, empresarial: true },
      { feature: 'Alertas inteligentes', essencial: false, profissional: true, empresarial: true },
      { feature: 'Exportação PDF/CSV', essencial: false, profissional: true, empresarial: true },
      { feature: 'Multiusuários e permissões', essencial: false, profissional: false, empresarial: true },
    ],
    steps: [
      {
        title: 'Cadastre suas movimentações',
        description: 'Registre receitas, despesas, categorias e status de pagamento.',
      },
      {
        title: 'Acompanhe indicadores',
        description: 'Veja saldo, economia, metas e gastos críticos em tempo real.',
      },
      {
        title: 'Tome decisões melhores',
        description: 'Use relatórios e alertas para reduzir gastos e planejar o mês.',
      },
    ],
    professionalFunctions: [
      'Cadastro de orçamento mensal por categoria',
      'Alertas de contas a vencer e pagamentos atrasados',
      'Relatório mensal com evolução de saldo e economia',
      'Exportação de transações em PDF/CSV',
      'Perfis separados para pessoa física e pequeno negócio',
      'Controle de recorrências, assinaturas e parcelas',
      'Backup em nuvem e sincronização entre dispositivos',
      'Permissões para contador, sócio ou familiar',
    ],
  },
  footer: {
    tagline: 'Gestão financeira inteligente',
    description:
      'Plataforma de controle financeiro pessoal criada para simplificar a rotina, organizar gastos, acompanhar metas e apoiar decisões com dados claros.',
    securityNote: 'Dados locais nesta versão, preparado para segurança avançada.',
    companyTitle: 'Empresa',
    companyLines: [
      'FinanceApp Tecnologia Financeira Ltda.',
      'CNPJ: 00.000.000/0001-00',
      'Atendimento: Segunda a sexta, 9h às 18h',
    ],
    contactTitle: 'Contato',
    copyright: '© 2026 FinanceApp. Todos os direitos reservados.',
    links: [
      { label: 'Recursos', href: '#recursos' },
      { label: 'Sistema ideal', href: '#sistema-ideal' },
      { label: 'Funções', href: '#funcoes' },
      { label: 'Planos', href: '#planos' },
    ],
  },
  chat: {
    welcome:
      'Olá! Sou do atendimento FinanceApp. Pode me mandar sua dúvida sobre planos, recursos, cartões, segurança ou contratação.',
    online: 'Atendimento online',
    closeAria: 'Fechar chat',
    typingPrefix: '',
    typingSuffix: ' está digitando',
    placeholder: 'Digite sua pergunta...',
    humanTitle: 'Precisa falar com uma pessoa?',
    humanSubtitle: 'Clique abaixo para direcionar ao atendimento comercial.',
    supportCta: 'Ir para atendimento',
    openAria: 'Abrir chat de dúvidas',
    fallback:
      'Ainda não tenho uma resposta exata para essa pergunta, mas posso ajudar com: planos, cartão de crédito, metas, relatórios, orçamento, alertas, segurança, uso no celular e atendimento comercial.',
  },
  chatIntents: [
    {
      keywords: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem', 'ajuda'],
      answer:
        'Olá! Posso te ajudar com dúvidas sobre o FinanceApp. Você pode perguntar sobre planos, como funciona, cartão de crédito, metas, relatórios, segurança, atendimento ou como começar.',
    },
    {
      keywords: ['comecar', 'inicio', 'usar', 'funciona', 'primeiro', 'passo', 'controlar gastos', 'organizar', 'despesa', 'receita'],
      answer:
        'Para começar, o ideal é cadastrar suas receitas, despesas fixas e despesas variáveis. Depois você separa por categorias como moradia, alimentação e lazer. O painel mostra saldo, gastos do mês e onde seu dinheiro está indo.',
    },
    {
      keywords: ['preco', 'valor', 'plano', 'assinatura', 'mensalidade', 'custa', 'custo', 'pagar', 'pagamento', 'cobranca'],
      answer:
        'Temos três planos demonstrativos: Essencial por R$ 19/mês, Profissional por R$ 39/mês e Empresarial por R$ 79/mês. O Profissional é o mais indicado para quem quer alertas, orçamento por categoria e exportações.',
    },
    {
      keywords: ['cartao', 'cartoes', 'credito', 'fatura', 'limite', 'parcela', 'parcelamento', 'fechamento', 'vencimento'],
      answer:
        'Sim. A proposta do FinanceApp inclui controle de cartões, faturas abertas e fechadas, limite disponível, vencimento e parcelamentos automáticos.',
    },
    {
      keywords: ['celular', 'mobile', 'app', 'telefone', 'responsivo', 'tablet', 'computador', 'notebook'],
      answer:
        'Sim. O layout é responsivo e foi pensado para uso no celular, tablet e computador, com poucos cliques para registrar movimentações e acompanhar o painel.',
    },
    {
      keywords: ['seguranca', 'privacidade', 'backup', 'dados', 'criptografia', 'login', 'senha', '2fa', 'protecao'],
      answer:
        'A versão atual usa dados locais no navegador. A arquitetura está preparada para evoluir com login seguro, criptografia, backup automático, autenticação em duas etapas e proteção de dados.',
    },
    {
      keywords: ['relatorio', 'relatorios', 'grafico', 'graficos', 'analise', 'dashboard', 'indicador', 'categoria', 'evolucao'],
      answer:
        'O sistema oferece gráficos de receitas vs despesas, gastos por categoria, evolução mensal, metas e insights para identificar onde o dinheiro está sendo gasto.',
    },
    {
      keywords: ['meta', 'metas', 'objetivo', 'objetivos', 'emergencia', 'viagem', 'carro', 'reserva', 'guardar', 'economizar'],
      answer:
        'Você pode criar metas como viagem, carro ou reserva de emergência, acompanhar o progresso e visualizar quanto falta para atingir o objetivo.',
    },
    {
      keywords: ['orcamento', 'planejamento', 'planejar', 'limite por categoria', 'planejado', 'realizado', 'gastar demais', 'gasto demais'],
      answer:
        'O módulo de orçamento permite definir limites mensais por categoria e comparar planejado vs realizado. Assim o sistema consegue alertar quando uma categoria está perto de estourar.',
    },
    {
      keywords: ['alerta', 'alertas', 'notificacao', 'notificacoes', 'avisar', 'vencer', 'atrasado', 'atraso', 'fora do padrao'],
      answer:
        'Sim. A proposta inclui alertas para contas a vencer, fatura próxima do vencimento, pagamentos atrasados, limite de orçamento e gastos fora do padrão.',
    },
    {
      keywords: ['extrato', 'importar', 'importacao', 'banco', 'automatico', 'automacao', 'recorrente', 'recorrencia'],
      answer:
        'A automação planejada inclui importação de extratos, lançamentos recorrentes e sugestão inteligente de categorias.',
    },
    {
      keywords: ['comprar', 'contratar', 'vender', 'venda', 'demonstracao', 'teste', 'testar', 'atendimento', 'humano', 'contato', 'suporte'],
      answer:
        'Você pode testar o painel pelo botão “Entrar no painel”. Para contratar ou tirar dúvidas comerciais, clique em “Ir para atendimento”.',
    },
  ],
};
