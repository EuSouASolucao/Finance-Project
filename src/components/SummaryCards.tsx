import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { usePanelTheme } from '@/contexts/PanelThemeContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { cn } from '@/lib/utils';

export default function SummaryCards() {
  const formatCurrency = useFormatCurrency();
  const { isDarkMode } = usePanelTheme();
  const { currentBalance, monthlySummary } = useFinance();

  const cards = [
    {
      label: 'Saldo Atual',
      value: currentBalance,
      icon: Wallet,
      gradient: 'from-slate-900 via-blue-900 to-blue-700',
      helper: 'Atualizado agora',
    },
    {
      label: 'Receitas do Mês',
      value: monthlySummary.totalIncome,
      icon: TrendingUp,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      helper: 'Entradas registradas',
    },
    {
      label: 'Despesas do Mês',
      value: monthlySummary.totalExpense,
      icon: TrendingDown,
      gradient: 'from-red-700 via-red-600 to-slate-800',
      helper: 'Saídas registradas',
    },
    {
      label: 'Economia/Meta',
      value: monthlySummary.balance,
      icon: Target,
      gradient: 'from-blue-600 via-cyan-600 to-emerald-600',
      helper: monthlySummary.balance >= 0 ? 'Mês positivo' : 'Atenção ao mês',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card
          key={c.label}
          className={cn(
            'animate-fade-in group overflow-hidden border-0 bg-gradient-to-br text-white transition-all hover:-translate-y-1',
            c.gradient,
            isDarkMode
              ? 'shadow-none ring-1 ring-white/[0.08] hover:ring-white/[0.12]'
              : 'shadow-xl shadow-slate-300/60 hover:shadow-2xl',
          )}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <CardContent className="relative min-h-36 p-5">
            <div
              className={cn(
                'absolute -right-8 -top-8 h-24 w-24 rounded-full transition-transform group-hover:scale-125',
                isDarkMode ? 'bg-white/[0.06]' : 'bg-white/15',
              )}
            />
            <div
              className={cn(
                'absolute -bottom-10 left-8 h-24 w-24 rounded-full blur-2xl',
                isDarkMode ? 'bg-black/35' : 'bg-white/10',
              )}
            />
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white/90">{c.label}</span>
              <div className="rounded-xl bg-white/18 p-2 backdrop-blur">
                <c.icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="mt-8 text-3xl font-heading font-bold tracking-tight">
              {formatCurrency(c.value)}
            </p>
            <p className="mt-1 text-xs font-medium text-white/75">{c.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
