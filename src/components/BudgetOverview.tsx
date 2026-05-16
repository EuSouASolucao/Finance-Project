import { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { usePanelTheme } from '@/contexts/PanelThemeContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { cn } from '@/lib/utils';

export default function BudgetOverview() {
  const formatCurrency = useFormatCurrency();
  const { isDarkMode } = usePanelTheme();
  const { transactions } = useFinance();

  const budgets = useMemo(() => {
    const expensesByCategory = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce<Record<string, number>>((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {});

    return Object.entries(expensesByCategory)
      .map(([category, spent]) => {
        const limit = Math.ceil(Math.max(spent * 1.08, 500) / 50) * 50;
        return {
          category,
          spent,
          limit,
          percentage: Math.min((spent / limit) * 100, 100),
          available: Math.max(limit - spent, 0),
        };
      })
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [transactions]);

  if (budgets.length === 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border p-6 shadow-xl',
          isDarkMode
            ? 'border-slate-800 bg-slate-950/50 shadow-none ring-1 ring-slate-800/90'
            : 'border-slate-100 bg-white shadow-slate-200/70',
        )}
      >
        <h2 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>Orçamento por Categoria</h2>
        <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
          Cadastre despesas para acompanhar seus limites mensais.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border shadow-xl',
        isDarkMode
          ? 'border-slate-800 bg-slate-950/50 shadow-none ring-1 ring-slate-800/90'
          : 'border-slate-100 bg-white shadow-slate-200/70',
      )}
    >
      <div className={cn('border-b p-6', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
        <h2 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>Orçamento por Categoria</h2>
        <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Acompanhamento dos limites mensais</p>
      </div>

      <div className="space-y-5 p-6">
        {budgets.map(budget => (
          <div
            key={budget.category}
            className={cn(
              'rounded-2xl border p-4 transition-colors',
              isDarkMode
                ? 'border-slate-700/90 bg-slate-950/70 hover:bg-slate-900/85'
                : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={cn('font-semibold', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>{budget.category}</p>
                <p className={cn('mt-1 text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                  {budget.percentage.toFixed(1)}% utilizado
                </p>
              </div>
              <div className={cn('text-right text-xs font-medium', isDarkMode ? 'text-slate-200' : 'text-slate-500')}>
                <p>{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}</p>
                <p className="mt-1">Disponível: {formatCurrency(budget.available)}</p>
              </div>
            </div>
            <div className={cn('mt-3 h-2 overflow-hidden rounded-full', isDarkMode ? 'bg-slate-800' : 'bg-slate-200')}>
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  isDarkMode ? 'bg-gradient-to-r from-blue-500 to-emerald-400' : 'bg-slate-950',
                )}
                style={{ width: `${budget.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
