import type { SiteLocale } from '../siteLocale';
import { normalizeSiteLocale } from '../siteLocale';
import type { SiteTranslations } from './types';
import { pt } from './pt';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';

export type { SiteTranslations } from './types';

export const SITE_TRANSLATIONS: Record<SiteLocale, SiteTranslations> = {
  pt,
  en,
  es,
  fr,
  de,
};

export function getSiteTranslations(locale: SiteLocale): SiteTranslations {
  return SITE_TRANSLATIONS[normalizeSiteLocale(locale)];
}
