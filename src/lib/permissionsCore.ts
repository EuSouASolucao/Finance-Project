/** Chaves persistidas na API — devem coincidir com `permission_schema_defaults` no PHP. */
export type PermissionKey =
  | 'panelDashboard'
  | 'panelTransactions'
  | 'panelReports'
  | 'panelGoals'
  | 'panelPayments'
  | 'panelReceipts'
  | 'panelInvestmentAi'
  | 'panelProfessional'
  | 'panelSettings'
  | 'categoryBudget'
  | 'smartAlerts'
  | 'exportData'
  | 'professionalAutomation'
  | 'multiUser';

export type PanelPermissions = Record<PermissionKey, boolean>;

export const PERMISSION_KEYS = Object.freeze([
  'panelDashboard',
  'panelTransactions',
  'panelReports',
  'panelGoals',
  'panelPayments',
  'panelReceipts',
  'panelInvestmentAi',
  'panelProfessional',
  'panelSettings',
  'categoryBudget',
  'smartAlerts',
  'exportData',
  'professionalAutomation',
  'multiUser',
] as const satisfies readonly PermissionKey[]);

/** Catálogo para UI (painel ADM e documentação). */
export const PERMISSION_CATALOG: { key: PermissionKey; label: string; group: string }[] = [
  { key: 'panelDashboard', label: 'Dashboard', group: 'Módulos do painel' },
  { key: 'panelTransactions', label: 'Transações', group: 'Módulos do painel' },
  { key: 'panelReports', label: 'Análise / relatórios', group: 'Módulos do painel' },
  { key: 'panelGoals', label: 'Metas', group: 'Módulos do painel' },
  { key: 'panelPayments', label: 'Pagamentos', group: 'Módulos do painel' },
  { key: 'panelReceipts', label: 'Comprovantes', group: 'Módulos do painel' },
  { key: 'panelInvestmentAi', label: 'IA investimentos', group: 'Módulos do painel' },
  { key: 'panelProfessional', label: 'Centro profissional', group: 'Módulos do painel' },
  { key: 'panelSettings', label: 'Configurações', group: 'Módulos do painel' },
  { key: 'categoryBudget', label: 'Orçamento por categoria', group: 'Recursos avançados (por plano)' },
  { key: 'smartAlerts', label: 'Alertas inteligentes', group: 'Recursos avançados (por plano)' },
  { key: 'exportData', label: 'Exportação CSV / backup JSON', group: 'Recursos avançados (por plano)' },
  { key: 'professionalAutomation', label: 'Recorrências e cartões', group: 'Recursos avançados (por plano)' },
  { key: 'multiUser', label: 'Multiusuários / acessos compartilhados', group: 'Recursos avançados (por plano)' },
];

export type PlanTier = 'essencial' | 'profissional' | 'empresarial';

export function planTierFromLabel(plan: string | undefined | null): PlanTier {
  const p = (plan ?? '').trim();
  if (p === 'Profissional') return 'profissional';
  if (p === 'Empresarial') return 'empresarial';
  return 'essencial';
}

/** Valores iniciais quando não há registro na base (espelha comparativo Essencial / Profissional / Empresarial). */
export function fallbackPermissionsFromPlan(plan: string | undefined | null): PanelPermissions {
  const tier = planTierFromLabel(plan);
  const proPlus = tier === 'profissional' || tier === 'empresarial';

  return {
    panelDashboard: true,
    panelTransactions: true,
    panelReports: true,
    panelGoals: true,
    panelPayments: true,
    panelReceipts: true,
    panelInvestmentAi: true,
    panelProfessional: true,
    panelSettings: true,
    categoryBudget: proPlus,
    smartAlerts: proPlus,
    exportData: proPlus,
    professionalAutomation: proPlus,
    multiUser: tier === 'empresarial',
  };
}

/** Combina overrides da API/adm com o fallback por nome do plano. Ignora valores não booleanos ou objeto inválido. */
export function mergePermissionsWithFallback(plan: string, partial?: Partial<PanelPermissions> | null): PanelPermissions {
  const base = fallbackPermissionsFromPlan(plan);
  if (!partial || typeof partial !== 'object' || Array.isArray(partial)) return base;
  for (const key of PERMISSION_KEYS) {
    const v = partial[key];
    if (typeof v === 'boolean') base[key] = v;
  }
  return base;
}
