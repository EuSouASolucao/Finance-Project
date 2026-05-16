import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Activity,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Layers3,
  LineChart,
  LockKeyhole,
  Moon,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sun,
  Target,
  Trash2,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FloatingChat from '@/components/FloatingChat';
import SiteFooter from '@/components/SiteFooter';
import { SiteCurrencyTicker } from '@/components/CurrencyTicker';
import {
  SITE_LOCALE_OPTIONS,
  SITE_LOCALE_STORAGE_KEY,
  normalizeSiteLocale,
  type SiteLocale,
} from '@/i18n/siteLocale';
import { getSiteTranslations } from '@/i18n/translations';
import { financeApi } from '@/services/api';
import { toast } from 'sonner';

const FEATURE_ICONS = [BarChart3, Target, CreditCard] as const;
const PANEL_SCREEN_ICONS = [BarChart3, ReceiptText, Activity, LineChart] as const;
const PANEL_SCREEN_ACCENTS = [
  'from-blue-700 to-emerald-600',
  'from-emerald-600 to-teal-500',
  'from-red-600 to-slate-900',
  'from-slate-900 to-blue-700',
] as const;
const MODULE_ICONS = [Wallet, ReceiptText, CalendarClock, Target, BarChart3, Users] as const;
const PILLAR_ICONS = [ReceiptText, CreditCard, Layers3, LineChart, Bell, ShieldCheck] as const;

const PREMIUM_KPI_COLORS = ['from-blue-700 to-emerald-500', 'from-emerald-600 to-teal-400', 'from-slate-900 to-blue-700'] as const;

const BOTTOM_HIGHLIGHT_ICONS = [Smartphone, Bell, FileText] as const;

type CartItem = {
  invoiceId: string;
  planName: string;
  planPrice: number;
  createdAt: string;
};

const parsePlanPrice = (price: string) => Number(price.replace(/\D/g, '')) || 0;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function Landing() {
  const [locale, setLocale] = useState<SiteLocale>(() =>
    normalizeSiteLocale(localStorage.getItem(SITE_LOCALE_STORAGE_KEY)),
  );
  const tr = useMemo(() => getSiteTranslations(locale), [locale]);
  const L = tr.landing;

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('financeapp_site_theme') !== 'light');
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('financeapp_cart_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(SITE_LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('financeapp_site_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('financeapp_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const addPlanToCart = async (plan: (typeof L.plans)[number]) => {
    try {
      setIsCreatingInvoice(plan.apiName);
      const planPrice = parsePlanPrice(plan.price);
      const response = await financeApi.checkout.createInvoice({
        planName: plan.apiName,
        planPrice,
        customerName: 'Visitante do site',
      });

      setCartItems(current => [
        {
          invoiceId: response.invoice.id,
          planName: response.invoice.planName,
          planPrice: response.invoice.planPrice,
          createdAt: response.invoice.createdAt,
        },
        ...current,
      ]);
      setIsCartOpen(true);
      toast.success(L.toastPlanAdded.replace(/\{\{plan\}\}/g, plan.displayName));
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      toast.error(error instanceof Error ? error.message.split('\n')[0] : L.toastInvoiceError);
    } finally {
      setIsCreatingInvoice(null);
    }
  };

  const removeFromCart = (invoiceId: string) => {
    setCartItems(current => current.filter(item => item.invoiceId !== invoiceId));
    toast.success(L.toastCartRemoved);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.planPrice, 0);

  return (
    <div className={isDarkMode ? 'min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-800 text-white' : 'min-h-screen overflow-x-hidden bg-white text-slate-950'}>
      <button
        type="button"
        className="fixed bottom-28 right-5 z-[70] flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-700 to-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-blue-950/30 transition hover:-translate-y-0.5"
        onClick={() => setIsCartOpen(current => !current)}
      >
        <ShoppingCart className="h-4 w-4" />
        {L.cartFloating} ({cartItems.length})
      </button>

      {isCartOpen && (
        <div className="fixed bottom-44 right-5 z-[80] w-[min(24rem,calc(100vw-2rem))] rounded-[2rem] border border-slate-100 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading text-lg font-bold">{L.cartTitle}</p>
              <p className="text-xs text-slate-500">{L.cartSubtitle}</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setIsCartOpen(false)}>
              {L.cartClose}
            </Button>
          </div>

          <div className="mt-4 max-h-72 space-y-3 overflow-auto">
            {cartItems.map(item => (
              <div key={item.invoiceId} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{item.planName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {L.cartInvoiceHash}
                      {item.invoiceId.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <p className="font-heading font-bold tabular-nums text-blue-800">{formatCurrency(item.planPrice)}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                      aria-label={L.cartRemove}
                      title={L.cartRemove}
                      onClick={() => removeFromCart(item.invoiceId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {cartItems.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
                {L.cartEmpty}
              </p>
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">{L.cartTotalPending}</span>
              <strong className="font-heading text-xl">{formatCurrency(cartTotal)}</strong>
            </div>
          </div>

          {cartItems.length > 0 ? (
            <Button asChild className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 py-6 text-base font-bold text-white shadow-lg shadow-blue-900/20 hover:from-blue-700 hover:to-emerald-700">
              <Link to="/painel/pagamentos" onClick={() => setIsCartOpen(false)}>
                <CreditCard className="mr-2 h-4 w-4" />
                {L.cartCheckout}
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              disabled
              className="mt-4 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-6 text-base font-semibold text-slate-400"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {L.cartCheckout}
            </Button>
          )}
        </div>
      )}

      <header className={isDarkMode ? 'sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-xl' : 'sticky top-0 z-40 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl'}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className={isDarkMode ? 'flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-800 shadow-xl' : 'flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-emerald-600 text-white shadow-xl shadow-blue-100'}>
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold leading-none">FinanceApp</p>
              <p className={isDarkMode ? 'mt-1 text-xs text-white/65' : 'mt-1 text-xs text-slate-500'}>{L.brandTagline}</p>
            </div>
          </Link>

          <nav className={isDarkMode ? 'hidden items-center gap-6 text-sm text-white/75 md:flex' : 'hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex'}>
            {L.nav.map(item => (
              <a
                key={item.sectionId}
                href={`#${item.sectionId}`}
                className={isDarkMode ? 'transition-colors hover:text-white' : 'transition-colors hover:text-blue-700'}
                onClick={event => {
                  event.preventDefault();
                  scrollToSection(item.sectionId);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Select value={locale} onValueChange={value => setLocale(normalizeSiteLocale(value))}>
              <SelectTrigger
                className={
                  isDarkMode
                    ? 'h-10 w-[82px] shrink-0 rounded-xl border-white/15 bg-white/10 text-white hover:bg-white/15 [&_svg]:text-white'
                    : 'h-10 w-[82px] shrink-0 rounded-xl border-slate-200 bg-white text-slate-800'
                }
                aria-label="Idioma"
              >
                <SelectValue placeholder={locale.toUpperCase()} />
              </SelectTrigger>
              <SelectContent>
                {SITE_LOCALE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              className={isDarkMode ? 'rounded-xl border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white' : 'rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}
              onClick={() => setIsDarkMode(current => !current)}
            >
              {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {isDarkMode ? L.themeLight : L.themeDark}
            </Button>

            <Button asChild className={isDarkMode ? 'rounded-xl bg-white text-blue-900 shadow-lg shadow-black/10 hover:bg-blue-50' : 'rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-300 hover:bg-slate-800'}>
              <Link to="/painel">
                {L.enterPanel} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div
        className={
          isDarkMode
            ? 'sticky top-20 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl'
            : 'sticky top-20 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-200/40'
        }
      >
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
          <SiteCurrencyTicker isDarkMode={isDarkMode} />
        </div>
      </div>

      <main>
        <section className={isDarkMode ? 'relative' : 'relative bg-gradient-to-br from-white via-blue-50 to-emerald-50'}>
          <div className={isDarkMode ? 'animate-glow-pulse absolute left-[-12rem] top-10 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl' : 'animate-glow-pulse absolute left-[-12rem] top-10 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl'} />
          <div className={isDarkMode ? 'animate-glow-pulse absolute bottom-0 right-[-12rem] h-[30rem] w-[30rem] rounded-full bg-emerald-300/20 blur-3xl' : 'animate-glow-pulse absolute bottom-0 right-[-12rem] h-[30rem] w-[30rem] rounded-full bg-emerald-300/30 blur-3xl'} />

          <div className="relative mx-auto grid min-h-[calc(100vh-11rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <p className={isDarkMode ? 'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100' : 'inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm'}>
                <LockKeyhole className="h-4 w-4" /> {L.heroBadge}
              </p>
              <h1 className="mt-6 max-w-3xl font-heading text-5xl font-bold leading-tight tracking-tight sm:text-6xl">{L.heroTitle}</h1>
              <p className={isDarkMode ? 'mt-6 max-w-2xl text-lg leading-8 text-white/72' : 'mt-6 max-w-2xl text-lg leading-8 text-slate-600'}>
                {L.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-6 shadow-xl shadow-blue-950/30 hover:from-blue-700 hover:to-emerald-700">
                  <Link to="/painel">
                    {L.heroPrimary} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className={isDarkMode ? 'h-12 rounded-xl border-white/20 bg-white/10 px-6 text-white hover:bg-white/15 hover:text-white' : 'h-12 rounded-xl border-slate-200 bg-white px-6 text-slate-800 shadow-sm hover:bg-slate-50'}>
                  <a
                    href="#recursos"
                    onClick={event => {
                      event.preventDefault();
                      scrollToSection('recursos');
                    }}
                  >
                    {L.heroSecondary}
                  </a>
                </Button>
              </div>

              <div id="beneficios" className="mt-8 grid gap-3 sm:grid-cols-2">
                {L.benefits.map(benefit => (
                  <div key={benefit} className={isDarkMode ? 'flex items-center gap-2 text-sm text-white/75' : 'flex items-center gap-2 text-sm font-medium text-slate-600'}>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {benefit}
                  </div>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {L.stats.map(stat => (
                  <div key={stat.label} className={isDarkMode ? 'rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur' : 'rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-200/70'}>
                    <p className="font-heading text-2xl font-bold">{stat.value}</p>
                    <p className={isDarkMode ? 'mt-1 text-xs text-white/65' : 'mt-1 text-xs text-slate-500'}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="demonstracao" className="relative mx-auto w-full max-w-[620px] lg:max-w-none">
              <div className="animate-float-delay absolute right-4 top-4 z-20 hidden rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur xl:block">
                <p className="text-xs text-white/65">{L.demoMonthSavings}</p>
                <p className="mt-1 font-heading text-2xl font-bold">R$ 2.265,20</p>
              </div>

              <div className="animate-float-slow rounded-[2rem] border border-white/15 bg-white/95 p-3 text-slate-950 shadow-2xl shadow-slate-950/40 sm:p-4">
                <div className="rounded-3xl bg-gradient-to-br from-slate-100 to-blue-50 p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 p-4 text-white shadow-xl sm:p-5">
                      <p className="text-sm text-white/75">{L.mockBalance}</p>
                      <p className="mt-6 font-heading text-2xl font-bold sm:mt-8 sm:text-3xl">R$ 15.420,50</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-4 text-white shadow-xl sm:p-5">
                      <p className="text-sm text-white/75">{L.mockIncome}</p>
                      <p className="mt-6 font-heading text-2xl font-bold sm:mt-8 sm:text-3xl">R$ 8.500,00</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl bg-white p-4 shadow-lg sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-heading font-bold">{L.mockVsTitle}</p>
                          <p className="text-xs text-slate-500">{L.mockVsSubtitle}</p>
                        </div>
                        <LineChart className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="mt-6 flex h-36 items-end gap-3 rounded-2xl bg-gradient-to-b from-slate-50 to-white px-2 pb-2 sm:h-44 sm:gap-4">
                        {[72, 88, 64, 76, 82, 79].map((height, index) => (
                          <div key={index} className="flex flex-1 flex-col items-center gap-2">
                            <div
                              className="animated-chart-bar min-h-8 w-full rounded-t-xl bg-gradient-to-t from-blue-700 to-emerald-500 shadow-md shadow-blue-100"
                              style={{ height: `${height}%`, animationDelay: `${index * 180}ms` }}
                            />
                            <span className="text-[10px] text-slate-400">M{index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-lg sm:p-5">
                      <p className="font-heading font-bold">{L.mockGoalsTitle}</p>
                      <p className="text-xs text-slate-500">{L.mockGoalsSubtitle}</p>
                      <div className="mt-6 space-y-5">
                        {[57, 51, 28].map(value => (
                          <div key={value}>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>{L.mockGoalRow}</span>
                              <strong className="text-slate-900">{value}%</strong>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-slate-200">
                              <div className="h-full rounded-full bg-slate-950" style={{ width: `${value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="bg-white py-20 text-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-semibold text-blue-700">{L.resourcesKicker}</p>
              <h2 className="mt-3 font-heading text-3xl font-bold">{L.resourcesTitle}</h2>
              <p className="mt-4 text-slate-500">{L.resourcesSubtitle}</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {L.features.map((feature, index) => {
                const Icon = FEATURE_ICONS[index];
                return (
                <div key={feature.title} className="group rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-xl shadow-slate-200/60 transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-2xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-emerald-600 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-bold transition-colors group-hover:text-blue-800">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{feature.description}</p>
                </div>
              );})}
            </div>
          </div>
        </section>

        <section id="telas-painel" className="bg-slate-50 py-20 text-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="font-semibold text-blue-700">{L.telasKicker}</p>
                <h2 className="mt-3 font-heading text-3xl font-bold">{L.telasTitle}</h2>
                <p className="mt-4 text-slate-500">{L.telasSubtitle}</p>
                <Button asChild className="mt-6 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700">
                  <Link to="/painel">
                    {L.telasCta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-800 p-4 shadow-2xl shadow-slate-300/80">
                <div className="rounded-[1.5rem] bg-white/10 p-3">
                  <div className="flex items-center gap-2 rounded-t-2xl bg-slate-950 px-4 py-3">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-xs text-white/55">{L.telasBrowser}</span>
                  </div>
                  <div className="grid gap-3 rounded-b-2xl bg-slate-100 p-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow-lg">
                      <p className="text-xs text-slate-500">{L.telasMiniBalance}</p>
                      <p className="mt-2 font-heading text-2xl font-bold text-blue-900">R$ 15.420</p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                          {L.telasMiniIncome} +R$ 8.500
                        </div>
                        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">
                          {L.telasMiniExpense} -R$ 4.230
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-lg">
                      <p className="font-heading font-bold text-slate-900">{L.telasForecastTitle}</p>
                      <div className="mt-4 space-y-2">
                        {[72, 54, 88].map((value, index) => (
                          <div key={value}>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>{L.telasForecastRows[index]}</span>
                              <strong>{value}%</strong>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-emerald-600" style={{ width: `${value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-4">
              {L.panelScreens.map((screen, index) => {
                const Icon = PANEL_SCREEN_ICONS[index];
                const accent = PANEL_SCREEN_ACCENTS[index];
                return (
                <div key={screen.title} className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <div className={`bg-gradient-to-br ${accent} p-5 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        {L.telasScreenBadge} {index + 1}
                      </span>
                    </div>
                    <p className="mt-6 text-sm text-white/70">{screen.label}</p>
                    <p className="mt-1 font-heading text-3xl font-bold">{screen.metric}</p>
                  </div>

                  <div className="p-5">
                    <h3 className="font-heading text-lg font-bold text-slate-900">{screen.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{screen.description}</p>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-3">
                      <div className="mb-3 flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                      </div>
                      <div className="space-y-2">
                        {screen.bullets.map((item, itemIndex) => (
                          <div key={item} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                            <span>{item}</span>
                            <span className={`h-2 rounded-full bg-gradient-to-r ${accent}`} style={{ width: `${36 + itemIndex * 18}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-900 py-24 text-white">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-300/15 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                <Activity className="h-4 w-4" /> {L.animatedKicker}
              </p>
              <h2 className="mt-6 font-heading text-4xl font-bold leading-tight">{L.animatedTitle}</h2>
              <p className="mt-4 leading-7 text-white/70">{L.animatedSubtitle}</p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/10 py-3">
              <div className="ticker-track flex w-max gap-3 px-3">
                {[...L.animatedTicker, ...L.animatedTicker].map((metric, index) => (
                  <span key={`${metric}-${index}`} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/78">
                    {metric}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-[2.5rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-slate-950/50 backdrop-blur">
              <div className="mb-3 flex items-center justify-between rounded-[1.75rem] border border-white/10 bg-slate-950/60 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">{L.analyticsBrand}</p>
                  <p className="mt-1 text-sm text-white/55">{L.analyticsSubtitle}</p>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </div>
              </div>

              <div className="mb-5 grid gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white via-blue-50 to-emerald-50 p-5 text-slate-950 shadow-2xl shadow-emerald-950/20 lg:grid-cols-[0.75fr_1.45fr_0.8fr]">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">{L.execVisionTag}</p>
                    <h3 className="mt-2 font-heading text-2xl font-bold">{L.execVisionTitle}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{L.execVisionDesc}</p>
                  </div>
                  {L.premiumKpis.map((item, kpiIndex) => (
                    <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <strong className="font-heading text-xl">{item.value}</strong>
                        <span className={`h-9 w-9 rounded-2xl bg-gradient-to-br ${PREMIUM_KPI_COLORS[kpiIndex]} shadow-lg`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.75rem] border border-slate-100 bg-slate-950 p-5 text-white shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading text-lg font-bold">{L.chartFlowTitle}</p>
                      <p className="text-sm text-white/50">{L.chartFlowSubtitle}</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">{L.liveBadge}</span>
                  </div>
                  <svg viewBox="0 0 620 280" className="mt-5 h-72 w-full rounded-3xl bg-white/[0.03]">
                    <defs>
                      <linearGradient id="premiumArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="premiumStroke" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                    {[48, 94, 140, 186, 232].map(y => (
                      <path key={y} d={`M38 ${y} H586`} stroke="#334155" strokeDasharray="6 10" strokeWidth="1" />
                    ))}
                    {[70, 150, 230, 310, 390, 470, 550].map((x, index) => (
                      <g key={x}>
                        <rect x={x - 18} y={118 - index * 7} width="16" height={118 + index * 7} rx="8" fill="#10b981" opacity="0.85" />
                        <rect x={x + 4} y={160 - index * 4} width="16" height={76 + index * 4} rx="8" fill="#f43f5e" opacity="0.78" />
                      </g>
                    ))}
                    <path d="M50 220 C102 150, 146 178, 198 132 S294 96, 344 124 S432 158, 486 82 S548 88, 586 48 L586 248 L50 248 Z" fill="url(#premiumArea)" />
                    <path className="animated-chart-line" d="M50 220 C102 150, 146 178, 198 132 S294 96, 344 124 S432 158, 486 82 S548 88, 586 48" fill="none" stroke="url(#premiumStroke)" strokeLinecap="round" strokeWidth="6" />
                    {[50, 198, 344, 486, 586].map((x, index) => {
                      const y = [220, 132, 124, 82, 48][index];
                      return <circle key={x} cx={x} cy={y} r="7" fill="#020617" stroke="#67e8f9" strokeWidth="4" />;
                    })}
                    <text x="38" y="268" fill="#94a3b8" fontSize="12">{L.dualMonths[0]}</text>
                    <text x="552" y="268" fill="#94a3b8" fontSize="12">{L.dualMonths[5]}</text>
                  </svg>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{L.aiInsightTag}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{L.aiInsightBody}</p>
                  </div>
                  <div className="rounded-[1.75rem] border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm font-bold text-blue-900">{L.emergencyTitle}</p>
                    <div className="mt-3 h-2 rounded-full bg-white">
                      <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-700 to-emerald-500" />
                    </div>
                    <p className="mt-2 text-xs text-blue-700">{L.emergencyProgress}</p>
                  </div>
                  <div className="rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-bold text-slate-900">{L.alertsCardTitle}</p>
                    <div className="mt-3 space-y-2 text-xs text-slate-500">
                      {L.alertsCardLines.map(line => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <div className="group overflow-hidden rounded-[2rem] border border-white/20 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-heading text-lg font-bold">{L.dualChartTitle}</p>
                      <p className="text-sm text-slate-500">{L.dualChartSubtitle}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">+18,4%</span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      { label: L.dualLegendIncome, value: 'R$ 8,5k', color: 'text-emerald-700', bg: 'bg-emerald-50' },
                      { label: L.dualLegendExpense, value: 'R$ 4,2k', color: 'text-red-700', bg: 'bg-red-50' },
                      { label: L.dualLegendMeta, value: '51%', color: 'text-blue-700', bg: 'bg-blue-50' },
                    ].map(metric => (
                      <div key={metric.label} className={`rounded-2xl ${metric.bg} p-3`}>
                        <p className="text-[11px] font-medium text-slate-500">{metric.label}</p>
                        <p className={`mt-1 font-heading text-base font-bold ${metric.color}`}>{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-3xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4">
                    <svg viewBox="0 0 360 250" className="h-64 w-full">
                      <defs>
                        <linearGradient id="incomeBar" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id="expenseBar" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#fb7185" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                      {[40, 82, 124, 166, 208].map(y => (
                        <path key={y} d={`M34 ${y} H340`} stroke="#e2e8f0" strokeDasharray="5 8" strokeWidth="1.2" />
                      ))}
                      <path d="M34 92 H340" stroke="#2563eb" strokeDasharray="6 8" strokeWidth="2" opacity="0.5" />
                      {[
                        { income: 108, expense: 62, x: 48 },
                        { income: 126, expense: 74, x: 100 },
                        { income: 94, expense: 66, x: 152 },
                        { income: 120, expense: 78, x: 204 },
                        { income: 102, expense: 56, x: 256 },
                        { income: 132, expense: 68, x: 308 },
                      ].map((item, index) => (
                        <g key={L.dualMonths[index]}>
                          <rect className="animated-chart-bar" x={item.x} y={214 - item.income} width="14" height={item.income} rx="7" fill="url(#incomeBar)" style={{ animationDelay: `${index * 120}ms` }} />
                          <rect className="animated-chart-bar" x={item.x + 18} y={214 - item.expense} width="14" height={item.expense} rx="7" fill="url(#expenseBar)" style={{ animationDelay: `${index * 150}ms` }} />
                          <text x={item.x + 8} y="238" fill="#94a3b8" fontSize="11" textAnchor="middle">{L.dualMonths[index]}</text>
                        </g>
                      ))}
                    </svg>
                    <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                      <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {L.dualLegendIncome}</span>
                      <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-red-500" /> {L.dualLegendExpense}</span>
                      <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-600" /> {L.dualLegendMeta}</span>
                    </div>
                  </div>
                </div>

                <div className="group overflow-hidden rounded-[2rem] border border-emerald-300/10 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/40 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-heading text-lg font-bold">{L.balanceForecastTitle}</p>
                      <p className="text-sm text-white/55">{L.balanceForecastSub}</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">{L.balanceForecastBadge}</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs text-white/45">{L.balance30Label}</p>
                      <p className="mt-1 font-heading text-3xl font-bold">R$ 18.920</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4">
                      <p className="text-xs text-emerald-100/70">{L.trendLabel}</p>
                      <p className="mt-1 font-heading text-2xl font-bold text-emerald-300">+24%</p>
                    </div>
                  </div>

                  <svg viewBox="0 0 360 270" className="mt-5 h-72 w-full rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_50%_10%,rgba(16,185,129,0.2),rgba(2,6,23,0.18)_45%,rgba(2,6,23,0.55))] p-4">
                    <defs>
                      <linearGradient id="balanceArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.42" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                      </linearGradient>
                      <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {[42, 84, 126, 168, 210].map(y => (
                      <path key={y} d={`M24 ${y} H340`} stroke="#334155" strokeWidth="1.2" opacity="0.75" />
                    ))}
                    <path d="M24 210 C62 142, 92 156, 122 132 S170 92, 206 108 S250 140, 282 74 S322 74, 340 44 L340 232 L24 232 Z" fill="url(#balanceArea)" />
                    <path className="animated-chart-line" d="M24 210 C62 142, 92 156, 122 132 S170 92, 206 108 S250 140, 282 74 S322 74, 340 44" fill="none" filter="url(#lineGlow)" stroke="#34d399" strokeLinecap="round" strokeWidth="6" />
                    {[
                      { x: 24, y: 210, label: 'R$ 9,1k' },
                      { x: 122, y: 132, label: 'R$ 12,8k' },
                      { x: 206, y: 108, label: 'R$ 14,2k' },
                      { x: 282, y: 74, label: 'R$ 17,4k' },
                      { x: 340, y: 44, label: 'R$ 18,9k' },
                    ].map(point => (
                      <g key={point.x}>
                        <circle cx={point.x} cy={point.y} r="8" fill="#020617" stroke="#34d399" strokeWidth="4" />
                        <text x={point.x} y={point.y - 14} fill="#a7f3d0" fontSize="10" textAnchor="middle">{point.label}</text>
                      </g>
                    ))}
                    <text x="24" y="252" fill="#94a3b8" fontSize="11">{L.week1}</text>
                    <text x="268" y="252" fill="#94a3b8" fontSize="11">{L.week4}</text>
                  </svg>
                </div>

                <div className="group overflow-hidden rounded-[2rem] border border-white/20 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-heading text-lg font-bold">{L.categorySpendTitle}</p>
                      <p className="text-sm text-slate-500">{L.categorySpendSub}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{L.insightsBadge}</span>
                  </div>

                  <div className="mt-5 rounded-3xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4">
                    <div className="grid gap-5 sm:grid-cols-[0.95fr_1.05fr] sm:items-center">
                      <div className="mx-auto">
                        <div className="relative h-48 w-48 rounded-full bg-[conic-gradient(#2563eb_0_38%,#10b981_38%_64%,#06b6d4_64%_82%,#0f172a_82%_100%)] shadow-2xl shadow-blue-100">
                          <div className="absolute inset-3 rounded-full bg-white/40 blur-sm" />
                          <div className="absolute inset-7 rounded-full bg-white shadow-inner" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-xs font-semibold text-slate-400">{L.totalMonthLabel}</p>
                              <p className="font-heading text-3xl font-bold">R$ 6,2k</p>
                              <p className="text-xs font-semibold text-emerald-600">{L.vsPreviousLabel}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {L.categoryDemo.map((item, demoIndex) => {
                          const color = ['bg-blue-700', 'bg-emerald-500', 'bg-cyan-500', 'bg-slate-900'][demoIndex];
                          return (
                          <div key={item.name} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                            <div className="flex items-center justify-between text-xs">
                              <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                                <i className={`h-2.5 w-2.5 rounded-full ${color}`} />
                                {item.name}
                              </span>
                              <strong>{item.value}</strong>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                                <div className={`${color} h-full rounded-full`} style={{ width: item.value }} />
                              </div>
                              <span className="text-[10px] font-semibold text-slate-400">{item.amount}</span>
                            </div>
                          </div>
                        );})}
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">{L.categoryInsightBanner}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sistema-ideal" className="bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                  <Building2 className="h-4 w-4" /> {L.sistemaKicker}
                </p>
                <h2 className="mt-6 font-heading text-4xl font-bold leading-tight">{L.sistemaTitle}</h2>
                <p className="mt-4 leading-7 text-white/68">{L.sistemaSubtitle}</p>

                <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
                  <p className="font-heading text-xl font-bold">{L.sistemaBalanceTitle}</p>
                  <p className="mt-3 text-sm leading-6 text-white/65">{L.sistemaBalanceText}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {L.sistemaTags.map(item => (
                      <div key={item} className="flex items-center gap-2 text-sm text-white/78">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {L.idealPillars.map((pillar, pindex) => {
                  const PIcon = PILLAR_ICONS[pindex];
                  return (
                  <div key={pillar.title} className="group rounded-3xl border border-white/10 bg-white/95 p-6 text-slate-950 shadow-2xl shadow-slate-950/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-blue-950/30">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-emerald-600 text-white">
                      <PIcon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-heading text-lg font-bold">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{pillar.description}</p>
                  </div>
                );})}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 text-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-semibold text-blue-700">{L.profilesKicker}</p>
              <h2 className="mt-3 font-heading text-3xl font-bold">{L.profilesTitle}</h2>
              <p className="mt-4 text-slate-500">{L.profilesSubtitle}</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {L.userProfiles.map((profile, index) => (
                  <div key={profile.title} className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 shadow-xl shadow-slate-200/70 transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-2xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-heading text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-6 font-heading text-xl font-bold">{profile.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{profile.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="modulos" className="bg-slate-50 py-20 text-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="font-semibold text-blue-700">{L.modulesKicker}</p>
                <h2 className="mt-3 font-heading text-3xl font-bold">{L.modulesTitle}</h2>
                <p className="mt-4 text-slate-500">{L.modulesSubtitle}</p>
                <Button asChild className="mt-6 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700">
                  <Link to="/painel">
                    {L.modulesCta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {L.modules.map((module, mindex) => {
                  const MIcon = MODULE_ICONS[mindex];
                  return (
                  <div key={module.title} className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <MIcon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-heading text-lg font-bold transition-colors group-hover:text-blue-800">{module.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{module.description}</p>
                  </div>
                );})}
              </div>
            </div>
          </div>
        </section>

        <section id="funcoes" className="bg-white py-20 text-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-800 p-8 text-white shadow-2xl shadow-slate-300/80">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Zap className="h-6 w-6 text-emerald-200" />
                </div>
                <h2 className="mt-6 font-heading text-3xl font-bold">{L.funcHeroTitle}</h2>
                <p className="mt-4 leading-7 text-white/70">{L.funcHeroSubtitle}</p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="font-heading text-2xl font-bold">+40%</p>
                    <p className="mt-1 text-xs text-white/60">{L.funcStat1}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="font-heading text-2xl font-bold">3x</p>
                    <p className="mt-1 text-xs text-white/60">{L.funcStat2}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {L.professionalFunctions.map(item => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="text-sm font-medium leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 text-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-semibold text-blue-700">{L.stepsKicker}</p>
              <h2 className="mt-3 font-heading text-3xl font-bold">{L.stepsTitle}</h2>
              <p className="mt-4 text-slate-500">{L.stepsSubtitle}</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {L.steps.map((step, index) => (
                <div key={step.title} className="relative rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-heading text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-6 font-heading text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="bg-white py-20 text-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-semibold text-blue-700">{L.plansKicker}</p>
              <h2 className="mt-3 font-heading text-3xl font-bold">{L.plansTitle}</h2>
              <p className="mt-4 text-slate-500">{L.plansSubtitle}</p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {L.plans.map(plan => (
                <div
                  key={plan.apiName}
                  className={`relative rounded-[2rem] border p-6 shadow-xl ${
                    plan.featured
                      ? 'border-blue-700 bg-slate-950 text-white shadow-blue-950/30'
                      : 'border-slate-100 bg-slate-50 text-slate-950 shadow-slate-200/70'
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute right-6 top-6 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                      {L.planRecommended}
                    </span>
                  )}
                  <h3 className="font-heading text-2xl font-bold">{plan.displayName}</h3>
                  <p className={`mt-3 text-sm leading-6 ${plan.featured ? 'text-white/65' : 'text-slate-500'}`}>{plan.description}</p>
                  <p className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${plan.featured ? 'bg-white/10 text-emerald-100' : 'bg-white text-blue-800'}`}>
                    {plan.idealFor}
                  </p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="font-heading text-4xl font-bold">{plan.price}</span>
                    <span className={plan.featured ? 'mb-1 text-white/60' : 'mb-1 text-slate-500'}>{L.planPerMonth}</span>
                  </div>
                  <Button
                    type="button"
                    className={`mt-6 w-full rounded-xl ${
                      plan.featured
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700'
                        : 'bg-slate-950 text-white hover:bg-slate-800'
                    }`}
                    disabled={isCreatingInvoice === plan.apiName}
                    onClick={() => addPlanToCart(plan)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isCreatingInvoice === plan.apiName ? L.planGenerating : L.planBuy}
                  </Button>
                  <div className="mt-6 space-y-3">
                    <p className={`text-xs font-bold uppercase tracking-wide ${plan.featured ? 'text-white/45' : 'text-slate-400'}`}>
                      {L.planHowHelps}
                    </p>
                    {plan.details.map(detail => (
                      <div
                        key={detail.title}
                        className={`rounded-2xl p-4 ${
                          plan.featured
                            ? 'bg-white/10'
                            : 'bg-white shadow-sm'
                        }`}
                      >
                        <p className={`text-sm font-bold ${plan.featured ? 'text-white' : 'text-slate-900'}`}>{detail.title}</p>
                        <p className={`mt-1 text-xs leading-5 ${plan.featured ? 'text-white/62' : 'text-slate-500'}`}>
                          {detail.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 space-y-3">
                    <p className={`text-xs font-bold uppercase tracking-wide ${plan.featured ? 'text-white/45' : 'text-slate-400'}`}>
                      {L.planIncluded}
                    </p>
                    {plan.features.map(feature => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? 'text-emerald-300' : 'text-emerald-600'}`} />
                        <span className={plan.featured ? 'text-white/78' : 'text-slate-600'}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50 shadow-xl shadow-slate-200/70">
              <div className="border-b border-slate-200 bg-white p-6">
                <h3 className="font-heading text-xl font-bold">{L.comparisonTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">{L.comparisonSubtitle}</p>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-100 text-sm font-bold text-slate-700">
                    <div className="p-4">{L.comparisonFeature}</div>
                    <div className="p-4 text-center">{L.comparisonEssential}</div>
                    <div className="p-4 text-center">{L.comparisonPro}</div>
                    <div className="p-4 text-center">{L.comparisonEnterprise}</div>
                  </div>
                  {L.planComparison.map(item => (
                    <div key={item.feature} className="grid grid-cols-4 border-b border-slate-200 bg-white text-sm last:border-b-0">
                      <div className="p-4 font-medium text-slate-700">{item.feature}</div>
                      {[item.essencial, item.profissional, item.empresarial].map((available, index) => (
                        <div key={index} className="flex items-center justify-center p-4">
                          {available ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 text-slate-950">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3">
            {L.bottomCards.map((card, bindex) => {
              const HIcon = BOTTOM_HIGHLIGHT_ICONS[bindex];
              return (
              <div key={card.title} className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <HIcon className="h-8 w-8 text-blue-700" />
                <h3 className="mt-5 font-heading text-xl font-bold">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{card.description}</p>
              </div>
            );})}
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center sm:px-6 lg:flex-row lg:text-left">
            <div>
              <h2 className="font-heading text-3xl font-bold">{L.ctaTitle}</h2>
              <p className="mt-2 text-white/65">{L.ctaSubtitle}</p>
            </div>
            <Button asChild size="lg" className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-6 hover:from-blue-700 hover:to-emerald-700">
              <Link to="/painel">
                {L.ctaButton} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter footer={tr.footer} />
      <FloatingChat chat={tr.chat} intents={tr.chatIntents} />
    </div>
  );
}
