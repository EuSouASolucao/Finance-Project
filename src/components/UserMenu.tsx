import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Crown, Loader2, LogOut, ReceiptText, Settings, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserProfileForm from '@/components/UserProfileForm';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { panelModalDarkSurfaceClass, panelPortalDarkRootClass, usePanelTheme } from '@/contexts/PanelThemeContext';
import { useUser } from '@/contexts/UserContext';
import { CHECKOUT_SUBSCRIPTION_PLANS, userHasNoSubscriptionPlan } from '@/data/subscriptionPlans';
import { useEffectivePermissions } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { PurchaseInvoice, financeApi } from '@/services/api';

function SubscriptionInvoiceStatusBadge({ status, isDarkMode }: { status: PurchaseInvoice['status']; isDarkMode: boolean }) {
  const map = {
    pending: {
      label: 'Pagamento pendente',
      className: isDarkMode ? 'border-amber-500/40 bg-amber-950/55 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-900',
    },
    paid: {
      label: 'Pago',
      className: isDarkMode ? 'border-emerald-500/35 bg-emerald-950/50 text-emerald-100' : 'border-emerald-200 bg-emerald-50 text-emerald-900',
    },
    cancelled: {
      label: 'Cancelado',
      className: isDarkMode ? 'border-slate-600 bg-slate-900 text-slate-400' : 'border-red-200 bg-red-50 text-red-900',
    },
  };
  const cfg = map[status];
  return (
    <Badge variant="outline" className={cn('shrink-0 text-[10px] font-semibold uppercase tracking-wide', cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

export default function UserMenu() {
  const navigate = useNavigate();
  const formatCurrency = useFormatCurrency();
  const { isDarkMode } = usePanelTheme();
  const { user, initials, logout } = useUser();
  const perms = useEffectivePermissions();
  const [profileOpen, setProfileOpen] = useState(false);
  const [subscriptionsOpen, setSubscriptionsOpen] = useState(false);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [creatingInvoiceFor, setCreatingInvoiceFor] = useState<string | null>(null);

  useEffect(() => {
    if (!subscriptionsOpen) return;

    void (async () => {
      try {
        setIsLoadingInvoices(true);
        const response = await financeApi.billing.invoices();
        setInvoices(response.invoices);
      } catch (error) {
        console.error('Erro ao carregar faturas do usuário:', error);
        toast.error(error instanceof Error ? error.message.split('\n')[0] : 'Não foi possível carregar suas faturas.');
      } finally {
        setIsLoadingInvoices(false);
      }
    })();
  }, [subscriptionsOpen]);

  const refreshInvoices = async () => {
    const response = await financeApi.billing.invoices();
    setInvoices(response.invoices);
  };

  const createCheckoutInvoice = async (plan: (typeof CHECKOUT_SUBSCRIPTION_PLANS)[number]) => {
    try {
      setCreatingInvoiceFor(plan.apiName);
      await financeApi.billing.createInvoice({
        planName: plan.apiName,
        planPrice: plan.monthlyPrice,
        customerName: user.name.trim() || user.email,
        customerEmail: user.email.trim(),
        customerPhone: user.phone?.trim() || undefined,
      });
      await refreshInvoices();
      toast.success(`Fatura do plano ${plan.displayName} gerada. Use o botão abaixo para regularizar o pagamento.`);
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      toast.error(error instanceof Error ? error.message.split('\n')[0] : 'Não foi possível gerar a fatura.');
    } finally {
      setCreatingInvoiceFor(null);
    }
  };

  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
  const pendingTotal = pendingInvoices.reduce((sum, invoice) => sum + invoice.planPrice, 0);

  const regularizeInvoice = (invoice: PurchaseInvoice) => {
    setSubscriptionsOpen(false);
    navigate(`/painel/pagar/${invoice.id}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'h-10 gap-2 rounded-full px-2',
              isDarkMode ? 'text-slate-100 hover:bg-slate-800 hover:text-white' : 'hover:bg-blue-50',
            )}
          >
            <Avatar className="h-9 w-9 border-2 border-white shadow-md shadow-blue-700/20">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-700 to-emerald-600 text-xs font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-left text-xs md:block">
              <strong className={cn('block', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>{user.name}</strong>
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{user.plan}</span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(
            'w-64 rounded-2xl p-2',
            panelPortalDarkRootClass(isDarkMode),
            isDarkMode
              ? 'border-slate-700 shadow-[0_16px_44px_-14px_rgb(0_0_0_/_0.52),0_8px_22px_-10px_rgb(29_78_216_/_0.13)]'
              : 'border-slate-100 shadow-xl',
          )}
        >
          <DropdownMenuLabel>
            <span className={cn('block text-sm', isDarkMode ? 'text-popover-foreground' : 'text-slate-900')}>{user.name}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer rounded-xl" onSelect={() => setProfileOpen(true)}>
            <UserRound className="mr-2 h-4 w-4" /> Meu perfil
          </DropdownMenuItem>
          {perms.panelSettings ? (
          <DropdownMenuItem className="cursor-pointer rounded-xl" onSelect={() => navigate('/painel/configuracoes')}>
            <Settings className="mr-2 h-4 w-4" /> Configurações
          </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem className="cursor-pointer rounded-xl" onSelect={() => setSubscriptionsOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" /> Assinaturas e faturas
          </DropdownMenuItem>
          {user.role === 'admin' && (
            <DropdownMenuItem className="cursor-pointer rounded-xl" onSelect={() => navigate('/admin')}>
              <Crown className="mr-2 h-4 w-4" /> Painel ADM
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={cn(
              'cursor-pointer rounded-xl text-red-600 focus:text-red-600',
              isDarkMode && 'text-red-400 focus:text-red-400',
            )}
            onSelect={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className={cn('sm:max-w-2xl', panelModalDarkSurfaceClass(isDarkMode))}>
          <DialogHeader>
            <DialogTitle className={cn('font-heading', !isDarkMode && 'text-slate-950')}>Dados do cliente</DialogTitle>
          </DialogHeader>
          <UserProfileForm onSaved={() => setProfileOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={subscriptionsOpen} onOpenChange={setSubscriptionsOpen}>
        <DialogContent className={cn('sm:max-w-3xl', panelModalDarkSurfaceClass(isDarkMode))}>
          <DialogHeader>
            <DialogTitle className="font-heading">Gerenciamento de assinaturas</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/45 dark:ring-1 dark:ring-blue-900/50">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Plano atual</p>
                <p className="mt-1 font-heading text-xl font-bold text-blue-950 dark:text-blue-100">{user.plan}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/40 dark:ring-1 dark:ring-amber-900/45">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Faturas em aberto</p>
                <p className="mt-1 font-heading text-xl font-bold text-amber-950 dark:text-amber-100">{pendingInvoices.length}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/40 dark:ring-1 dark:ring-emerald-900/45">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Total para regularizar</p>
                <p className="mt-1 font-heading text-xl font-bold text-emerald-950 dark:text-emerald-100">{formatCurrency(pendingTotal)}</p>
              </div>
            </div>

            {userHasNoSubscriptionPlan(user.plan) ? (
              <div
                className={cn(
                  'rounded-3xl border p-5',
                  isDarkMode ? 'border-slate-600 bg-slate-900/80 ring-1 ring-blue-900/25' : 'border-blue-100 bg-gradient-to-br from-blue-50/90 to-emerald-50/60',
                )}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className={cn('font-heading text-base font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>
                      Você está sem plano ativo
                    </p>
                    <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-600')}>
                      Escolha um plano para gerar uma fatura em nome de{' '}
                      <span className="font-semibold">{user.email}</span> e concluir o pagamento com nosso financeiro.
                    </p>
                  </div>
                </div>
                {pendingInvoices.length > 0 ? (
                  <p className={cn('mt-3 rounded-xl px-3 py-2 text-xs', isDarkMode ? 'bg-amber-950/35 text-amber-200' : 'bg-amber-100 text-amber-900')}>
                    Você já tem fatura(s) pendente(s) — pode gerar outra apenas se precisar alterar o plano ou conforme orientação do suporte.
                  </p>
                ) : null}
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {CHECKOUT_SUBSCRIPTION_PLANS.map(plan => {
                    const loading = creatingInvoiceFor === plan.apiName;
                    const isFeatured = plan.apiName === 'Profissional';
                    return (
                      <div
                        key={plan.apiName}
                        className={cn(
                          'flex flex-col rounded-2xl border p-4 shadow-sm',
                          isDarkMode ? 'border-slate-700 bg-slate-950/90' : 'border-slate-200 bg-white',
                          isFeatured &&
                            (isDarkMode ? 'ring-2 ring-emerald-600/50 ring-offset-2 ring-offset-slate-950' : 'ring-2 ring-emerald-500/35 ring-offset-2 ring-offset-white'),
                        )}
                      >
                        <p className={cn('font-heading font-bold', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>{plan.displayName}</p>
                        <p className={cn('mt-1 text-2xl font-bold tabular-nums', isDarkMode ? 'text-emerald-400' : 'text-emerald-700')}>
                          {formatCurrency(plan.monthlyPrice)}
                          <span className={cn('ml-1 text-xs font-normal', isDarkMode ? 'text-slate-500' : 'text-slate-500')}>/mês</span>
                        </p>
                        {isFeatured ? (
                          <Badge className="mt-2 w-fit border-0 bg-gradient-to-r from-blue-700 to-emerald-600 text-[10px] text-white">Mais popular</Badge>
                        ) : (
                          <span className="mt-2 block h-5" aria-hidden />
                        )}
                        <Button
                          type="button"
                          disabled={creatingInvoiceFor !== null}
                          className={cn(
                            'mt-4 w-full rounded-xl',
                            isFeatured
                              ? 'bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700'
                              : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700',
                          )}
                          onClick={() => void createCheckoutInvoice(plan)}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Gerando…
                            </>
                          ) : (
                            <>Gerar fatura · {plan.displayName}</>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/75">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-heading font-bold text-slate-950 dark:text-slate-50">Suas faturas</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Situação do pagamento em cada pedido. Apenas faturas <span className="font-semibold text-slate-700 dark:text-slate-300">pendentes</span>{' '}
                    podem ser regularizadas pelo botão abaixo.
                  </p>
                </div>
                {isLoadingInvoices && <Badge variant="outline">Carregando...</Badge>}
              </div>

              <div className="mt-4 space-y-3">
                {invoices.map(invoice => (
                  <div
                    key={invoice.id}
                    className={cn(
                      'flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950 dark:shadow-[0_12px_28px_-10px_rgb(0_0_0_/_0.42),0_6px_16px_-8px_rgb(29_78_216_/_0.08)] dark:ring-1 dark:ring-slate-800 sm:flex-row sm:items-center sm:justify-between',
                      invoice.status === 'paid' && 'ring-1 ring-emerald-500/15 dark:ring-emerald-500/20',
                      invoice.status === 'cancelled' && 'opacity-90 ring-1 ring-slate-200/80 dark:ring-slate-700',
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                          invoice.status === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : invoice.status === 'cancelled'
                              ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
                        )}
                      >
                        <ReceiptText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">Plano {invoice.planName}</p>
                          <SubscriptionInvoiceStatusBadge status={invoice.status} isDarkMode={isDarkMode} />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Fatura #{invoice.id.slice(0, 8)} · Emitida em {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        {invoice.status === 'paid' && invoice.paidAt ? (
                          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            Pagamento confirmado em {new Date(invoice.paidAt).toLocaleString('pt-BR')}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                      <p className="font-heading text-lg font-bold text-blue-800 dark:text-blue-300">{formatCurrency(invoice.planPrice)}</p>
                      {invoice.status === 'pending' ? (
                        <Button
                          className="rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700"
                          onClick={() => regularizeInvoice(invoice)}
                        >
                          Regularizar pagamento
                        </Button>
                      ) : invoice.status === 'paid' ? (
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Nenhuma ação necessária</span>
                      ) : (
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Fatura cancelada</span>
                      )}
                    </div>
                  </div>
                ))}

                {!isLoadingInvoices && invoices.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
                    Nenhuma fatura vinculada ao e-mail {user.email}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
