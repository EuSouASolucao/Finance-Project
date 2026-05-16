export const PAYMENT_GATEWAY_IDS = ['mercadoPago', 'paypal', 'pagseguro', 'infinitiPay'] as const;

export type PaymentGatewayId = (typeof PAYMENT_GATEWAY_IDS)[number];

export interface GatewayConfig {
  enabled: boolean;
  checkoutUrl: string;
}

export type PaymentGatewaysMap = Record<PaymentGatewayId, GatewayConfig>;

export function createDefaultGateways(): PaymentGatewaysMap {
  return {
    mercadoPago: { enabled: false, checkoutUrl: '' },
    paypal: { enabled: false, checkoutUrl: '' },
    pagseguro: { enabled: false, checkoutUrl: '' },
    infinitiPay: { enabled: false, checkoutUrl: '' },
  };
}

export function mergeGatewaysFromApi(raw: Partial<PaymentGatewaysMap> | undefined | null): PaymentGatewaysMap {
  const base = createDefaultGateways();
  if (!raw || typeof raw !== 'object') return base;
  for (const id of PAYMENT_GATEWAY_IDS) {
    const g = raw[id];
    if (g && typeof g === 'object') {
      base[id] = {
        enabled: Boolean(g.enabled),
        checkoutUrl: typeof g.checkoutUrl === 'string' ? g.checkoutUrl : '',
      };
    }
  }
  return base;
}

/** Substitui placeholders na URL gerada pelo gateway (preference, smart button redirect, etc.). */
export function expandGatewayCheckoutUrl(
  template: string,
  invoice: { id: string; planName: string; planPrice: number },
): string {
  const priceStr = String(invoice.planPrice);
  return template
    .replace(/\{\{invoiceId\}\}/g, encodeURIComponent(invoice.id))
    .replace(/\{\{invoiceIdRaw\}\}/g, invoice.id)
    .replace(/\{\{planPrice\}\}/g, encodeURIComponent(priceStr))
    .replace(/\{\{planPriceRaw\}\}/g, priceStr)
    .replace(/\{\{planName\}\}/g, encodeURIComponent(invoice.planName))
    .replace(/\{\{planNameRaw\}\}/g, invoice.planName);
}

export const PAYMENT_GATEWAY_UI: Record<
  PaymentGatewayId,
  { title: string; subtitle: string; badgeClass: string }
> = {
  mercadoPago: {
    title: 'Mercado Pago',
    subtitle: 'Checkout Pro / Preferência — URL com placeholders {{invoiceId}}, {{planPrice}}, {{planName}}.',
    badgeClass: 'bg-[#009EE3]/15 text-[#009EE3] ring-[#009EE3]/25',
  },
  paypal: {
    title: 'PayPal',
    subtitle: 'Smart Buttons ou URL de aprovação gerada no seu backend.',
    badgeClass: 'bg-[#003087]/15 text-[#003087] ring-[#003087]/20',
  },
  pagseguro: {
    title: 'PagSeguro',
    subtitle: 'Checkout transparente ou link de pagamento (PagBank).',
    badgeClass: 'bg-[#FFC801]/20 text-yellow-950 ring-yellow-600/25 dark:text-yellow-100',
  },
  infinitiPay: {
    title: 'Infiniti Pay',
    subtitle: 'Link ou endpoint de checkout configurado pela Infiniti Pay.',
    badgeClass: 'bg-violet-500/15 text-violet-700 ring-violet-500/25 dark:text-violet-200',
  },
};
