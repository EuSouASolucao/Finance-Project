import { useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { formatCurrencyAmount, normalizePanelCurrency } from '@/lib/currencyFormat';

/** Formata valores monetários conforme a moeda escolhida em Configurações. */
export function useFormatCurrency(): (amount: number) => string {
  const { user } = useUser();
  const code = normalizePanelCurrency(user.preferredCurrency);

  return useMemo(() => (amount: number) => formatCurrencyAmount(amount, code), [code]);
}
