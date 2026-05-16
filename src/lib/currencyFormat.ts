export const PANEL_CURRENCY_CODES = ['BRL', 'USD', 'EUR', 'GBP'] as const;

export type PanelCurrencyCode = (typeof PANEL_CURRENCY_CODES)[number];

export const PANEL_CURRENCY_OPTIONS: { value: PanelCurrencyCode; label: string }[] = [
  { value: 'BRL', label: 'Real brasileiro (BRL)' },
  { value: 'USD', label: 'Dólar americano (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'Libra esterlina (GBP)' },
];

export function normalizePanelCurrency(raw: unknown): PanelCurrencyCode {
  const upper = String(raw ?? 'BRL').toUpperCase();
  return (PANEL_CURRENCY_CODES as readonly string[]).includes(upper) ? (upper as PanelCurrencyCode) : 'BRL';
}

export function localeForPanelCurrency(code: PanelCurrencyCode): string {
  switch (code) {
    case 'BRL':
      return 'pt-BR';
    case 'USD':
      return 'en-US';
    case 'EUR':
      return 'de-DE';
    case 'GBP':
      return 'en-GB';
    default:
      return 'pt-BR';
  }
}

export function formatCurrencyAmount(amount: number, currency: PanelCurrencyCode): string {
  return new Intl.NumberFormat(localeForPanelCurrency(currency), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
