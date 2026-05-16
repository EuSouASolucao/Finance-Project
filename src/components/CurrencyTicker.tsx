import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizePanelCurrency, formatCurrencyAmount } from '@/lib/currencyFormat';
import { cn } from '@/lib/utils';
import { convertViaUsd, fetchUsdFiatRates } from '@/services/fxRates';
import { Loader2, Pin, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_PINNED = 'financeapp_fx_ticker_pinned';

/** Ordem de exibição das moedas de referência (a moeda preferida do usuário é omitida). */
const DISPLAY_ORDER = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'BRL'] as const;

export type FxTickerVariant = 'panel' | 'site';

type FxTickerInnerProps = {
  variant: FxTickerVariant;
  isDarkMode: boolean;
  preferred: string;
};

function FxTickerInner({ variant, isDarkMode, preferred }: FxTickerInnerProps) {
  const isSite = variant === 'site';

  const [pinned, setPinned] = useState(() => {
    if (isSite) return false;
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_PINNED) === '1';
    } catch {
      return false;
    }
  });
  const [expanded, setExpanded] = useState(() => {
    if (isSite) return true;
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_PINNED) === '1';
    } catch {
      return false;
    }
  });

  const panelVisible = isSite || expanded || pinned;

  useEffect(() => {
    if (isSite) return;
    try {
      localStorage.setItem(STORAGE_PINNED, pinned ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [pinned, isSite]);

  useEffect(() => {
    if (isSite || !pinned) return;
    setExpanded(true);
  }, [pinned, isSite]);

  const [ratesUsd, setRatesUsd] = useState<Record<string, number> | null>(null);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchUsdFiatRates();
      setRatesUsd(result.ratesUsd);
      setRateDate(result.date);
      setSourceLabel(result.sourceLabel);
    } catch {
      setError('Indisponível');
      setRatesUsd(null);
      setRateDate(null);
      setSourceLabel(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!panelVisible) return undefined;
    void loadRates();
    const id = window.setInterval(() => void loadRates(), 2 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [panelVisible, loadRates]);

  const togglePin = useCallback(() => {
    setPinned(p => !p);
  }, []);

  const hidePanel = useCallback(() => {
    if (pinned) return;
    setExpanded(false);
  }, [pinned]);

  const pairs = useMemo(() => {
    if (!ratesUsd) return [];

    const out: { code: string; label: string; value: string }[] = [];

    for (const code of DISPLAY_ORDER) {
      if (code === preferred) continue;
      const amount = convertViaUsd(ratesUsd, preferred, code);
      if (amount == null) continue;
      out.push({
        code,
        label: `1 ${code}`,
        value: formatCurrencyAmount(amount, preferred),
      });
    }

    return out;
  }, [ratesUsd, preferred]);

  const chips =
    pairs?.map(p => (
      <span
        key={p.code}
        className={cn(
          'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tabular-nums',
          isDarkMode ? 'bg-white/10 text-white/85 ring-1 ring-white/15' : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200/80',
        )}
      >
        <span className={isDarkMode ? 'text-sky-300/95' : 'text-blue-700'}>{p.label}</span>
        <span className={isDarkMode ? 'text-white' : 'text-slate-950'}>{p.value}</span>
      </span>
    )) ?? [];

  const dated =
    rateDate &&
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(rateDate));

  const prefLabel =
    preferred === 'BRL'
      ? 'Real (BRL)'
      : preferred === 'USD'
        ? 'Dólar (USD)'
        : preferred === 'EUR'
          ? 'Euro (EUR)'
          : 'Libra (GBP)';

  const shellClasses = cn(
    isSite
      ? 'overflow-hidden rounded-xl border shadow-md backdrop-blur-md'
      : 'mx-auto mb-6 max-w-6xl overflow-hidden rounded-xl border shadow-sm backdrop-blur-sm',
    isDarkMode ? 'border-slate-700/90 bg-slate-950/85 shadow-black/35' : 'border-slate-200/90 bg-white/92 shadow-slate-300/40',
  );

  if (!isSite && !panelVisible) {
    return (
      <div className={cn(shellClasses, 'mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 px-4 py-3')}>
        <p className={cn('max-w-md text-xs leading-snug', isDarkMode ? 'text-slate-400' : 'text-slate-600')}>
          As taxas de câmbio ficam ocultas por omissão para não ocupar espaço.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-8 gap-1.5 text-xs',
              isDarkMode ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800' : '',
            )}
            onClick={() => setExpanded(true)}
          >
            Mostrar câmbio
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-8 gap-1.5 text-xs',
              isDarkMode ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800' : '',
            )}
            onClick={() => setPinned(true)}
            title="Manter o bloco de câmbio sempre visível ao entrar no painel"
          >
            <Pin className="h-3.5 w-3.5" aria-hidden />
            Fixar no painel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClasses}>
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-2 sm:flex-nowrap sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Sparkles className={cn('h-3.5 w-3.5 shrink-0', isDarkMode ? 'text-sky-400/90' : 'text-blue-600')} aria-hidden />
          <span className={cn('text-[11px] font-bold uppercase tracking-wider', isDarkMode ? 'text-sky-400/90' : 'text-blue-700')}>
            Câmbio inteligente
          </span>
          <span className={cn('hidden text-[11px] sm:inline', isDarkMode ? 'text-slate-500' : 'text-slate-500')}>
            Multi-fonte · valores em {prefLabel}
          </span>
          {!isSite && pinned ? (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                isDarkMode ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
              )}
            >
              Fixado
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {loading && !ratesUsd ? (
            <Loader2 className={cn('h-3.5 w-3.5 animate-spin', isDarkMode ? 'text-slate-400' : 'text-slate-500')} aria-hidden />
          ) : null}
          {dated ? (
            <span className={isDarkMode ? 'text-slate-500' : 'text-slate-500'}>
              Ref. {dated}
              {sourceLabel ? ` · ${sourceLabel}` : ''}
            </span>
          ) : null}
          {error ? (
            <span className={isDarkMode ? 'text-amber-400/90' : 'text-amber-600'}>{error}</span>
          ) : null}
          {!isSite && !pinned ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 px-2 text-[11px]',
                isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100',
              )}
              onClick={hidePanel}
            >
              Ocultar
            </Button>
          ) : null}
          {!isSite ? (
            <Button
              type="button"
              variant={pinned ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'h-7 gap-1 px-2 text-[11px]',
                pinned
                  ? isDarkMode
                    ? 'bg-emerald-950/50 text-emerald-300 hover:bg-emerald-950/70 hover:text-emerald-200'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : isDarkMode
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    : 'text-slate-600 hover:bg-slate-100',
              )}
              onClick={togglePin}
              title={pinned ? 'Desafixar: volta a ocultar o bloco ao recarregar, salvo que abra manualmente' : 'Fixar: mantém este bloco visível sempre'}
            >
              <Pin className={cn('h-3 w-3', pinned && 'fill-current')} aria-hidden />
              {pinned ? 'Desafixar' : 'Fixar'}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 gap-1 px-2 text-[11px]',
              isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100',
            )}
            onClick={() => void loadRates()}
            disabled={loading}
            title="Atualizar cotações"
          >
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="relative py-2.5">
        {chips.length > 0 ? (
          <div className="flex overflow-hidden">
            <div className={cn('panel-currency-ticker-track flex w-max gap-3 px-4')}>
              {[...chips, ...chips]}
            </div>
          </div>
        ) : (
          <p className={cn('px-4 py-3 text-center text-xs', isDarkMode ? 'text-slate-500' : 'text-slate-500')}>
            {loading ? 'Carregando cotações…' : 'Não foi possível obter as cotações agora.'}
          </p>
        )}
      </div>

      <p className={cn('border-t px-4 py-1.5 text-[10px]', isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400')}>
        {isSite
          ? 'Cotações para referência em tempo real (multi-fonte). Valores em Real (BRL); não constituem cotação comercial nem recomendação de investimento.'
          : 'A moeda exibida segue a opção "Moeda padrão" em Configurações. Atualização automática a cada 2 minutos; apenas referência (não é cotação comercial).'}
      </p>
    </div>
  );
}

/** Faixa de câmbio fixada na página pública (sem dependência do painel). */
export function SiteCurrencyTicker({ isDarkMode }: { isDarkMode: boolean }) {
  const preferred = normalizePanelCurrency('BRL');
  return <FxTickerInner variant="site" isDarkMode={isDarkMode} preferred={preferred} />;
}
