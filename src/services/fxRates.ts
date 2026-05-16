/** Moedas fiat principais cotadas contra USD (taxas para conversão cross). */
export const FX_MAJOR_CODES = ['BRL', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY'] as const;

export type FxMajorCode = (typeof FX_MAJOR_CODES)[number];

export type FxRatesResult = {
  /** Quantidade da moeda por 1 USD (ex.: EUR 0,92 ⇒ 1 USD = 0,92 EUR). Chaves em maiúsculas; USD = 1. */
  ratesUsd: Record<string, number>;
  date: string;
  sourceLabel: string;
};

export async function fetchUsdFiatRates(): Promise<FxRatesResult> {
  const symbols = FX_MAJOR_CODES.join(',');
  const fetchOpts: RequestInit = {};
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    fetchOpts.signal = AbortSignal.timeout(14000);
  }

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${symbols}`, fetchOpts);
    if (!res.ok) throw new Error('Frankfurter HTTP');
    const data = (await res.json()) as { date: string; rates: Record<string, number> };
    const ratesUsd: Record<string, number> = { USD: 1 };
    for (const [k, v] of Object.entries(data.rates)) {
      const n = Number(v);
      if (!Number.isNaN(n) && n > 0) ratesUsd[k.toUpperCase()] = n;
    }
    return { ratesUsd, date: data.date, sourceLabel: 'Frankfurter (ECB)' };
  } catch {
    /* tenta fallback */
  }

  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
      fetchOpts,
    );
    if (!res.ok) throw new Error('CDN FX');
    const data = (await res.json()) as { date?: string; usd: Record<string, number> };
    const ratesUsd: Record<string, number> = { USD: 1 };
    for (const code of FX_MAJOR_CODES) {
      const v = data.usd[code.toLowerCase()];
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isNaN(n) && n > 0) ratesUsd[code] = n;
    }
    const date =
      typeof data.date === 'string' ? data.date : new Date().toISOString().slice(0, 10);
    return { ratesUsd, date, sourceLabel: 'Currency API (CDN)' };
  } catch {
    throw new Error('FX_UNAVAILABLE');
  }
}

/** Valor de 1 unidade de `foreignCode` expresso na moeda `preferredCode`. Ambas cotadas vs USD. */
export function convertViaUsd(
  ratesUsd: Record<string, number>,
  preferredCode: string,
  foreignCode: string,
): number | null {
  const pref = preferredCode.toUpperCase();
  const fore = foreignCode.toUpperCase();
  const rPref = pref === 'USD' ? 1 : ratesUsd[pref];
  const rFore = fore === 'USD' ? 1 : ratesUsd[fore];
  if (typeof rPref !== 'number' || typeof rFore !== 'number' || rPref <= 0 || rFore <= 0) return null;
  return rPref / rFore;
}
