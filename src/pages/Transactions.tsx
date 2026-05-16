import SummaryCards from '@/components/SummaryCards';
import TransactionFilters from '@/components/TransactionFilters';
import TransactionList from '@/components/TransactionList';
import { usePanelTheme } from '@/contexts/PanelThemeContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Repeat2 } from 'lucide-react';

const statusLabels = {
  paid: 'Pago',
  pending: 'Pendente',
  overdue: 'Atrasado',
};

export default function Transactions() {
  const formatCurrency = useFormatCurrency();
  const { isDarkMode } = usePanelTheme();
  const { recurringTransactions } = useFinance();

  const panelSection = cn(
    'rounded-2xl border',
    isDarkMode
      ? 'border-slate-800 bg-slate-950/50 shadow-none ring-1 ring-slate-800/90'
      : 'border-slate-100 bg-white shadow-xl shadow-slate-200/70',
  );

  const panelSectionHeaderDivider = cn(
    'flex flex-col gap-4 border-b p-6 xl:flex-row xl:items-end xl:justify-between',
    isDarkMode ? 'border-slate-800' : 'border-slate-100',
  );

  return (
    <div className="space-y-6">
      <SummaryCards />

      <section className={panelSection}>
        <div className={panelSectionHeaderDivider}>
          <div>
            <h1 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>Histórico de Transações</h1>
            <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Gerencie todas as suas entradas e saídas</p>
          </div>
          <TransactionFilters />
        </div>

        <div className="p-6">
          <TransactionList />
        </div>
      </section>

      <section className={cn(panelSection, 'p-6')}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={cn('flex items-center gap-2 font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>
              <Repeat2 className={cn('h-5 w-5', isDarkMode ? 'text-blue-400' : 'text-blue-700')} />
              Recorrências e assinaturas
            </h2>
            <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
              Contas fixas, assinaturas e lançamentos mensais cadastrados no sistema.
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'w-fit rounded-full px-3 py-1',
              isDarkMode ? 'border-blue-800/80 bg-blue-950/45 text-blue-200' : 'border-blue-100 bg-blue-50 text-blue-700',
            )}
          >
            {recurringTransactions.length} cadastrada{recurringTransactions.length === 1 ? '' : 's'}
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {recurringTransactions.map(item => (
            <div
              key={item.id}
              className={cn(
                'rounded-2xl border p-4 transition-all',
                isDarkMode
                  ? 'border-slate-700/90 bg-slate-900/55 hover:bg-slate-800/85 hover:shadow-lg hover:shadow-black/30'
                  : 'border-slate-100 bg-slate-50/80 hover:bg-white hover:shadow-lg',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn('font-semibold', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>{item.description}</p>
                  <div className={cn('mt-2 flex flex-wrap items-center gap-2 text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                    <Badge
                      variant="outline"
                      className={cn(
                        'px-2 py-0 text-[10px]',
                        isDarkMode ? 'border-slate-600 bg-slate-800/90 text-slate-300' : 'border-slate-200 bg-white text-slate-600',
                      )}
                    >
                      {item.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Dia {item.dayOfMonth}
                    </span>
                    <span>{statusLabels[item.paymentStatus]}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'text-sm font-bold',
                      item.type === 'income'
                        ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        : isDarkMode ? 'text-red-400' : 'text-red-600',
                    )}
                  >
                    {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                  </p>
                  <p className={cn('mt-1 text-[11px]', isDarkMode ? 'text-slate-500' : 'text-slate-400')}>{item.active ? 'Ativa' : 'Inativa'}</p>
                </div>
              </div>
            </div>
          ))}

          {recurringTransactions.length === 0 && (
            <div
              className={cn(
                'rounded-2xl border border-dashed p-6 text-center text-sm lg:col-span-2',
                isDarkMode ? 'border-slate-600 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500',
              )}
            >
              Nenhuma recorrência ou assinatura cadastrada ainda.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
