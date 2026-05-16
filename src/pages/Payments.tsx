import { useFinance } from '@/contexts/FinanceContext';
import { panelPortalDarkRootClass, usePanelTheme } from '@/contexts/PanelThemeContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { cn } from '@/lib/utils';
import SummaryCards from '@/components/SummaryCards';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { PaymentStatus } from '@/types/finance';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const statusConfig: Record<
  PaymentStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive';
    icon: typeof CheckCircle2;
    colorClass: string;
    colorClassDark: string;
    cardClass: string;
    iconClass: string;
    columnAccentDark: string;
  }
> = {
  overdue: {
    label: 'Atrasado',
    variant: 'destructive',
    icon: AlertTriangle,
    colorClass: 'text-red-600',
    colorClassDark: 'text-red-400',
    cardClass: 'from-red-700 via-red-600 to-slate-800',
    iconClass: 'bg-white/18 text-white',
    columnAccentDark: 'border-red-900/40 bg-red-950/25 ring-1 ring-red-900/30',
  },
  pending: {
    label: 'Pendente',
    variant: 'secondary',
    icon: Clock,
    colorClass: 'text-amber-600',
    colorClassDark: 'text-amber-400',
    cardClass: 'from-blue-700 via-cyan-700 to-emerald-600',
    iconClass: 'bg-white/18 text-white',
    columnAccentDark: 'border-amber-900/35 bg-amber-950/20 ring-1 ring-amber-900/25',
  },
  paid: {
    label: 'Pago',
    variant: 'default',
    icon: CheckCircle2,
    colorClass: 'text-emerald-600',
    colorClassDark: 'text-emerald-400',
    cardClass: 'from-emerald-500 via-teal-500 to-cyan-600',
    iconClass: 'bg-white/18 text-white',
    columnAccentDark: 'border-emerald-900/35 bg-emerald-950/20 ring-1 ring-emerald-900/25',
  },
};

export default function Payments() {
  const formatCurrency = useFormatCurrency();
  const { isDarkMode } = usePanelTheme();
  const { transactions, updateTransactionStatus } = useFinance();

  const grouped: Record<PaymentStatus, typeof transactions> = {
    overdue: transactions.filter(t => t.paymentStatus === 'overdue'),
    pending: transactions.filter(t => t.paymentStatus === 'pending'),
    paid: transactions.filter(t => t.paymentStatus === 'paid'),
  };

  const totals = {
    overdue: grouped.overdue.reduce((s, t) => s + t.amount, 0),
    pending: grouped.pending.reduce((s, t) => s + t.amount, 0),
    paid: grouped.paid.reduce((s, t) => s + t.amount, 0),
  };

  return (
    <div className="space-y-6">
      <SummaryCards />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['overdue', 'pending', 'paid'] as PaymentStatus[]).map(status => {
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <div
              key={status}
              className={cn(
                'group overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl',
                cfg.cardClass,
                isDarkMode ? 'shadow-black/40 ring-1 ring-white/10' : 'shadow-slate-300/60',
              )}
            >
              <div className="relative min-h-28">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 transition-transform group-hover:scale-125" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/90">{cfg.label}</span>
                  <div className={`rounded-xl p-2 backdrop-blur ${cfg.iconClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-8 font-heading text-3xl font-bold tracking-tight">
                  {formatCurrency(totals[status])}
                </p>
                <p className="mt-1 text-xs font-medium text-white/75">{grouped[status].length} transações</p>
              </div>
            </div>
          );
        })}
      </div>

      <section
        className={cn(
          'rounded-2xl border shadow-xl',
          isDarkMode
            ? 'border-slate-800 bg-slate-950/50 shadow-none ring-1 ring-slate-800/90'
            : 'border-slate-100 bg-white shadow-slate-200/70',
        )}
      >
        <div className={cn('border-b p-6', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
          <h1 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>
            Controle de Pagamentos
          </h1>
          <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
            Acompanhe pendências, atrasos e pagamentos concluídos
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-3">
          {(['overdue', 'pending', 'paid'] as PaymentStatus[]).map(status => {
            const cfg = statusConfig[status];
            const items = grouped[status];
            const Icon = cfg.icon;

            return (
              <div
                key={status}
                className={cn(
                  'rounded-2xl border p-4',
                  isDarkMode ? cn('border-slate-700/90 bg-slate-900/55', cfg.columnAccentDark) : 'border-slate-100 bg-slate-50/70',
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className={cn('flex items-center gap-2 font-heading text-base font-bold', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>
                    <Icon className={cn('h-4 w-4', isDarkMode ? cfg.colorClassDark : cfg.colorClass)} />
                    {cfg.label}
                  </h2>
                  <Badge
                    variant="outline"
                    className={
                      isDarkMode
                        ? 'border-slate-600 bg-slate-800/90 text-slate-300'
                        : 'border-slate-200 bg-white text-slate-600'
                    }
                  >
                    {items.length}
                  </Badge>
                </div>

                {items.length === 0 ? (
                  <div
                    className={cn(
                      'rounded-2xl p-5 text-center text-sm',
                      isDarkMode ? 'border border-slate-700/80 bg-slate-950/60 text-slate-400' : 'bg-white text-slate-500',
                    )}
                  >
                    Nenhuma transação nesta coluna.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map(t => (
                      <div
                        key={t.id}
                        className={cn(
                          'rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg',
                          isDarkMode
                            ? 'border-slate-700/85 bg-slate-950/70 hover:bg-slate-900/90 hover:shadow-black/35'
                            : 'border-slate-100 bg-white hover:shadow-lg',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={cn('text-sm font-bold', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>{t.description}</p>
                            <p className={cn('mt-1 text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                              {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')} · {t.category}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'text-right text-sm font-bold',
                              t.type === 'income'
                                ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                                : isDarkMode ? 'text-red-400' : 'text-red-600',
                            )}
                          >
                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                          </span>
                        </div>

                        <Select value={t.paymentStatus} onValueChange={(v) => updateTransactionStatus(t.id, v as PaymentStatus)}>
                          <SelectTrigger
                            className={cn(
                              'mt-3 h-8 w-full rounded-xl text-xs',
                              isDarkMode ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-200 bg-slate-50',
                            )}
                          >
                            <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                          </SelectTrigger>
                          <SelectContent className={panelPortalDarkRootClass(isDarkMode)}>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="overdue">Atrasado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {transactions.length === 0 && (
        <section
          className={cn(
            'rounded-2xl border py-12 text-center shadow-xl',
            isDarkMode
              ? 'border-slate-800 bg-slate-950/50 text-slate-400 shadow-none ring-1 ring-slate-800/90'
              : 'border-slate-100 bg-white text-slate-500 shadow-slate-200/70',
          )}
        >
          <p className={cn('font-heading text-lg', isDarkMode ? 'text-slate-200' : undefined)}>Nenhum pagamento registrado</p>
          <p className="mt-1 text-sm">Adicione transações para acompanhar seus pagamentos.</p>
        </section>
      )}
    </div>
  );
}
