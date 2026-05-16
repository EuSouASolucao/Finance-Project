export type SiteLocale = 'pt' | 'en' | 'es' | 'fr' | 'de';

export const SITE_LOCALE_STORAGE_KEY = 'financeapp_site_locale';

export const SITE_LOCALE_OPTIONS: { value: SiteLocale; label: string }[] = [
  { value: 'pt', label: 'PT' },
  { value: 'en', label: 'EN' },
  { value: 'es', label: 'ES' },
  { value: 'fr', label: 'FR' },
  { value: 'de', label: 'DE' },
];

export const DEFAULT_SITE_LOCALE: SiteLocale = 'pt';

export function normalizeSiteLocale(value: string | null | undefined): SiteLocale {
  if (value === 'en' || value === 'es' || value === 'fr' || value === 'de' || value === 'pt') {
    return value;
  }
  return DEFAULT_SITE_LOCALE;
}
