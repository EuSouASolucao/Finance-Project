import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy, CreditCard, ExternalLink, Loader2, ReceiptText, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePanelTheme } from '@/contexts/PanelThemeContext';
import { useUser } from '@/contexts/UserContext';
import {
  PAYMENT_GATEWAY_IDS,
  PAYMENT_GATEWAY_UI,
  expandGatewayCheckoutUrl,
  mergeGatewaysFromApi,
} from '@/data/paymentGateways';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { cn } from '@/lib/utils';
import type { PaymentSettingsPublic, PurchaseInvoice } from '@/services/api';
import { financeApi } from '@/services/api';

export default function InvoicePayment() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const formatCurrency = useFormatCurrency();
  const { isDarkMode } = usePanelTheme();
  const { refreshProfile } = useUser();

  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null);
  const [paymentPublic, setPaymentPublic] = useState<PaymentSettingsPublic | null>(null);
  const [loading, setLoading] = useState(true);

  const gateways = useMemo(() => mergeGatewaysFromApi(paymentPublic?.gateways), [paymentPublic?.gateways]);

  useEffect(() => {
    if (!invoiceId) return;

    let cancelled = false;

    void (async () => {
      try {
        setLoading(true);
        const [invRes, pubRes] = await Promise.all([
          financeApi.billing.invoice(invoiceId),
          financeApi.paymentSettings.public(),
        ]);
        if (cancelled) return;
        setInvoice(invRes.invoice);
        setPaymentPublic(pubRes.settings);
        if (invRes.invoice.status === 'paid') {
          await refreshProfile();
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          toast.error(error instanceof Error ? error.message.split('\n')[0] : 'Não foi possível carregar a fatura.');
          navigate('/painel');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [invoiceId, navigate, refreshProfile]);

  useEffect(() => {
    if (!invoiceId || !invoice || invoice.status !== 'pending') return;

    const poll = window.setInterval(() => {
      void financeApi.billing
        .invoice(invoiceId)
        .then(res => {
          setInvoice(res.invoice);
          if (res.invoice.status === 'paid') {
            toast.success('Pagamento confirmado. Seu plano foi atualizado.');
            void refreshProfile();
          }
        })
        .catch(() => {});
    }, 10000);

    return () => window.clearInterval(poll);
  }, [invoice?.status, invoiceId, refreshProfile]);

  const copyPix = async () => {
    const raw = paymentPublic?.pixCopyPaste?.trim();
    if (!raw) {
      toast.message('PIX ainda não configurado pelo administrador.');
      return;
    }
    try {
      await navigator.clipboard.writeText(raw);
      toast.success('Código PIX copiado.');
    } catch {
      toast.error('Não foi possível copiar. Selecione e copie manualmente.');
    }
  };

  const openGatewayCheckout = (invoiceRow: PurchaseInvoice, gatewayId: (typeof PAYMENT_GATEWAY_IDS)[number]) => {
    const cfg = gateways[gatewayId];
    const tpl = cfg.checkoutUrl.trim();
    if (!cfg.enabled || !tpl) {
      toast.message('Este meio de pagamento não está disponível. Peça ao administrador para ativar e informar a URL de checkout.');
      return;
    }
    const expanded = expandGatewayCheckoutUrl(tpl, invoiceRow);
    try {
      const normalized = /^https?:\/\//i.test(expanded) ? expanded : `https://${expanded}`;
      const u = new URL(normalized);
      window.open(u.toString(), '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('URL de checkout inválida após substituir os dados da fatura. Revise o modelo no painel administrativo.');
    }
  };

  const cardSurface = cn(
    'rounded-2xl border p-6 shadow-xl',
    isDarkMode ? 'border-slate-700 bg-slate-950/70 shadow-black/30 ring-1 ring-slate-800/80' : 'border-slate-100 bg-white shadow-slate-200/70',
  );

  const tabSurface = cn(
    'rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
    isDarkMode ? 'border-slate-700 data-[state=active]:bg-slate-800 data-[state=active]:text-white' : 'data-[state=active]:bg-white data-[state=active]:shadow-sm',
  );

  if (loading || !invoice) {
    return (
      <div className={cn('flex min-h-[40vh] flex-col items-center justify-center gap-3', isDarkMode ? 'text-slate-300' : 'text-slate-600')}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm">Carregando página de pagamento…</p>
      </div>
    );
  }

  const paid = invoice.status === 'paid';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button
        type="button"
        variant="ghost"
        className={cn('-ml-2 gap-2 rounded-xl', isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700')}
        onClick={() => navigate('/painel')}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao painel
      </Button>

      <header className={cn(cardSurface)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                paid ? 'bg-emerald-500/15 text-emerald-600' : 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
              )}
            >
              {paid ? <CheckCircle2 className="h-6 w-6" /> : <ReceiptText className="h-6 w-6" />}
            </div>
            <div>
              <h1 className={cn('font-heading text-xl font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-950')}>
                {paid ? 'Pagamento confirmado' : 'Pagamento da assinatura'}
              </h1>
              <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-600')}>
                Plano <span className="font-semibold">{invoice.planName}</span> · Fatura #{invoice.id.slice(0, 8)}
              </p>
              <p className={cn('mt-2 font-heading text-2xl font-bold tabular-nums text-blue-800 dark:text-blue-300')}>
                {formatCurrency(invoice.planPrice)}
              </p>
            </div>
          </div>
          {!paid && (
            <Button type="button" variant="outline" className="rounded-xl shrink-0" onClick={() => void refreshProfile()}>
              Atualizar status
            </Button>
          )}
        </div>
      </header>

      {paid ? (
        <section className={cn(cardSurface, 'border-emerald-700/25 bg-emerald-950/20 dark:bg-emerald-950/30')}>
          <p className={cn('text-sm leading-relaxed', isDarkMode ? 'text-emerald-100/90' : 'text-emerald-900')}>
            Esta fatura está paga. O plano já deve aparecer no seu perfil; atualize a página ou entre novamente se o valor não sincronizar.
          </p>
          <Button className="mt-4 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700" onClick={() => navigate('/painel')}>
            Ir ao dashboard
          </Button>
        </section>
      ) : (
        <Tabs defaultValue="pix" className="w-full">
          <TabsList
            className={cn(
              'grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1',
              isDarkMode ? 'bg-slate-900 ring-1 ring-slate-700' : 'bg-slate-100',
            )}
          >
            <TabsTrigger value="pix" className={tabSurface}>
              <Wallet className="mr-2 h-4 w-4 shrink-0" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="online" className={cn(tabSurface, 'text-left leading-tight')}>
              <CreditCard className="mr-2 h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Mercado Pago · PayPal · PagSeguro · Infiniti Pay</span>
              <span className="sm:hidden">Online</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="mt-4 outline-none focus-visible:outline-none">
            <section className={cardSurface}>
              <h2 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>PIX</h2>
              <p className={cn('mt-2 text-sm leading-relaxed', isDarkMode ? 'text-slate-400' : 'text-slate-600')}>
                Pagamento instantâneo via copia e cola. Também pode ser combinado com confirmação automática por webhook configurado no administrador.
              </p>

              {paymentPublic?.instructionsPublic ? (
                <p className={cn('mt-4 whitespace-pre-wrap text-sm', isDarkMode ? 'text-slate-300' : 'text-slate-700')}>{paymentPublic.instructionsPublic}</p>
              ) : null}

              <div className={cn('mt-5 rounded-xl border p-4', isDarkMode ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-slate-50')}>
                <p className={cn('text-xs font-semibold uppercase tracking-wide', isDarkMode ? 'text-slate-500' : 'text-slate-500')}>Copia e cola</p>
                <p className={cn('mt-2 break-all font-mono text-xs leading-relaxed', isDarkMode ? 'text-slate-200' : 'text-slate-800')}>
                  {paymentPublic?.pixCopyPaste?.trim() ? paymentPublic.pixCopyPaste : '— Configure o PIX no painel do administrador —'}
                </p>
                <Button type="button" className="mt-4 gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700" onClick={() => void copyPix()}>
                  <Copy className="h-4 w-4" />
                  Copiar código PIX
                </Button>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="online" className="mt-4 outline-none focus-visible:outline-none">
            <section className={cardSurface}>
              <h2 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>Pagamento online</h2>
              <p className={cn('mt-2 text-sm leading-relaxed', isDarkMode ? 'text-slate-400' : 'text-slate-600')}>
                Estrutura pronta para <strong className="font-semibold text-slate-700 dark:text-slate-200">Mercado Pago</strong>,{' '}
                <strong className="font-semibold text-slate-700 dark:text-slate-200">PayPal</strong>,{' '}
                <strong className="font-semibold text-slate-700 dark:text-slate-200">PagSeguro</strong> e{' '}
                <strong className="font-semibold text-slate-700 dark:text-slate-200">Infiniti Pay</strong>. O administrador informa a URL de redirecionamento (por exemplo link de preferência ou checkout gerado pela API). Variáveis:{' '}
                <code className="rounded bg-slate-200 px-1 text-xs dark:bg-slate-800">{'{{invoiceId}}'}</code>,{' '}
                <code className="rounded bg-slate-200 px-1 text-xs dark:bg-slate-800">{'{{invoiceIdRaw}}'}</code>,{' '}
                <code className="rounded bg-slate-200 px-1 text-xs dark:bg-slate-800">{'{{planPrice}}'}</code>,{' '}
                <code className="rounded bg-slate-200 px-1 text-xs dark:bg-slate-800">{'{{planName}}'}</code>.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {PAYMENT_GATEWAY_IDS.map(id => {
                  const ui = PAYMENT_GATEWAY_UI[id];
                  const cfg = gateways[id];
                  const ready = cfg.enabled && cfg.checkoutUrl.trim().length > 0;

                  return (
                    <div
                      key={id}
                      className={cn(
                        'flex flex-col rounded-2xl border p-4 ring-1 transition-colors',
                        isDarkMode ? 'border-slate-700 bg-slate-900/50 ring-slate-800' : 'border-slate-200 bg-slate-50/80 ring-slate-100',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1', ui.badgeClass)}>
                            {ui.title}
                          </span>
                          <p className={cn('mt-3 text-xs leading-snug', isDarkMode ? 'text-slate-400' : 'text-slate-600')}>{ui.subtitle}</p>
                        </div>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-4 dark:border-slate-700/80">
                        <span
                          className={cn(
                            'text-[11px] font-semibold uppercase tracking-wide',
                            ready ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400',
                          )}
                        >
                          {ready ? 'Disponível' : 'Indisponível'}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!ready}
                          className="ml-auto rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700 disabled:opacity-50"
                          onClick={() => openGatewayCheckout(invoice, id)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Abrir checkout
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className={cn('mt-6 text-xs leading-relaxed', isDarkMode ? 'text-slate-500' : 'text-slate-500')}>
                Após pagar em um gateway externo, o status da fatura pode ser atualizado pelo webhook do gateway ou pela confirmação manual no ADM. Esta página continua verificando automaticamente enquanto a fatura estiver pendente.
              </p>
            </section>
          </TabsContent>
        </Tabs>
      )}

      {!paid ? (
        <p className={cn('text-center text-xs', isDarkMode ? 'text-slate-500' : 'text-slate-500')}>
          Consulta automática do status da fatura a cada poucos segundos enquanto estiver pendente.
        </p>
      ) : null}
    </div>
  );
}
