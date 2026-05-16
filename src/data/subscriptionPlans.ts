/** Planos comercializados — valores devem coincidir com a landing e com o checkout na API. */
export type CheckoutPlan = {
  apiName: string;
  displayName: string;
  /** Valor mensal em BRL (número), igual ao parse da landing (ex.: "R$ 19" → 19). */
  monthlyPrice: number;
};

export const CHECKOUT_SUBSCRIPTION_PLANS: CheckoutPlan[] = [
  { apiName: 'Essencial', displayName: 'Essencial', monthlyPrice: 19 },
  { apiName: 'Profissional', displayName: 'Profissional', monthlyPrice: 39 },
  { apiName: 'Empresarial', displayName: 'Empresarial', monthlyPrice: 79 },
];

export function userHasNoSubscriptionPlan(plan: string | undefined | null): boolean {
  const normalized = (plan ?? '').trim().toLowerCase();
  return !normalized || normalized === 'sem plano';
}

/** Opções que o administrador pode atribuir ao cliente no painel ADM (valor = texto gravado em `users.plan`). */
export const ADMIN_ASSIGNABLE_PLANS: { value: string; label: string }[] = [
  { value: 'Sem Plano', label: 'Sem plano' },
  { value: 'Essencial', label: 'Essencial' },
  { value: 'Profissional', label: 'Profissional' },
  { value: 'Empresarial', label: 'Empresarial' },
];
