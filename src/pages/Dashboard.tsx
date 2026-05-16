import { useMemo, useState } from 'react';
import SummaryCards from '@/components/SummaryCards';
import BudgetOverview from '@/components/BudgetOverview';
import { useFinance } from '@/contexts/FinanceContext';
import { useEffectivePermissions } from '@/lib/permissions';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { panelPortalDarkRootClass, usePanelTheme } from '@/contexts/PanelThemeContext';
import type { RecurringTransaction, Transaction } from '@/types/finance';
import { AlertCircle, ArrowDownRight, ArrowUpRight, CalendarClock, Lightbulb, PiggyBank, Target, TrendingUp, WalletCards } from 'lucide-react';

const monthsUntil = (date: string) => {
  const today = new Date();
  const deadline = new Date(`${date}T12:00:00`);
  const months = (deadline.getFullYear() - today.getFullYear()) * 12 + deadline.getMonth() - today.getMonth();
  return Math.max(months + 1, 1);
};

function isoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addCalendarDays(base: Date, delta: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + delta);
  return d;
}

function matchesRecurringTransaction(t: Transaction, r: RecurringTransaction): boolean {
  return r.active && t.description === r.description && t.amount === r.amount && t.type === r.type;
}

type ForecastRangeId =
  | 'current_month'
  | 'days_3'
  | 'days_9'
  | 'days_15'
  | 'days_30'
  | 'months_3'
  | 'months_6'
  | 'months_12';

const FORECAST_RANGE_OPTIONS: { id: ForecastRangeId; label: string }[] = [
  { id: 'current_month', label: 'Mês atual' },
  { id: 'days_3', label: 'Últimos 3 dias' },
  { id: 'days_9', label: 'Últimos 9 dias' },
  { id: 'days_15', label: 'Últimos 15 dias' },
  { id: 'days_30', label: 'Últimos 30 dias' },
  { id: 'months_3', label: 'Últimos 3 meses' },
  { id: 'months_6', label: 'Últimos 6 meses' },
  { id: 'months_12', label: 'Últimos 12 meses' },
];

function forecastRangeBounds(id: ForecastRangeId): { start: string; end: string } | null {
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  const endStr = isoDateLocal(end);

  switch (id) {
    case 'current_month':
      return null;
    case 'days_3':
    case 'days_9':
    case 'days_15':
    case 'days_30': {
      const n =
        id === 'days_3' ? 3 : id === 'days_9' ? 9 : id === 'days_15' ? 15 : 30;
      const start = addCalendarDays(end, -(n - 1));
      return { start: isoDateLocal(start), end: endStr };
    }
    case 'months_3':
    case 'months_6':
    case 'months_12': {
      const n = id === 'months_3' ? 3 : id === 'months_6' ? 6 : 12;
      const start = new Date(end);
      start.setMonth(start.getMonth() - n);
      return { start: isoDateLocal(start), end: endStr };
    }
    default:
      return null;
  }
}

type FixedForecastRow = RecurringTransaction & {
  dueDate: string;
  isPast: boolean;
  alreadyLaunched: boolean;
  historyTotal?: number;
  historyCount?: number;
};

export default function Dashboard() {
  const formatCurrency = useFormatCurrency();
  const { transactions, monthlySummary, goals, recurringTransactions } = useFinance();
  const { isDarkMode } = usePanelTheme();
  const caps = useEffectivePermissions();
  const [forecastRangeId, setForecastRangeId] = useState<ForecastRangeId>('current_month');
  const recent = transactions.slice(0, 8);

  const highlights = useMemo(() => {
    const expenseMap = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce<Record<string, number>>((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {});

    const topExpense = Object.entries(expenseMap).sort((a, b) => b[1] - a[1])[0];
    const savingsRate = monthlySummary.totalIncome > 0
      ? (monthlySummary.balance / monthlySummary.totalIncome) * 100
      : 0;

    return {
      topExpenseCategory: topExpense?.[0] || 'Alimentação',
      topExpensePercentage: topExpense && monthlySummary.totalExpense > 0
        ? (topExpense[1] / monthlySummary.totalExpense) * 100
        : 0,
      savingsRate,
    };
  }, [monthlySummary, transactions]);

  const investmentPlan = useMemo(() => {
    const openGoals = goals
      .map(goal => {
        const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
        const monthsLeft = monthsUntil(goal.deadline);
        const monthlyNeed = remaining / monthsLeft;

        return {
          ...goal,
          remaining,
          monthsLeft,
          monthlyNeed,
          progress: goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0,
        };
      })
      .filter(goal => goal.remaining > 0)
      .sort((a, b) => a.monthsLeft - b.monthsLeft || b.monthlyNeed - a.monthlyNeed);

    const incomeBasedTarget = monthlySummary.totalIncome * 0.2;
    const safeMonthlyCapacity = Math.max(monthlySummary.balance * 0.6, 0);
    const recommendedAmount = monthlySummary.balance > 0
      ? Math.min(incomeBasedTarget, safeMonthlyCapacity || incomeBasedTarget)
      : 0;

    const totalMonthlyNeed = openGoals.reduce((sum, goal) => sum + goal.monthlyNeed, 0);
    const allocations = openGoals.slice(0, 4).map(goal => {
      const suggested = totalMonthlyNeed > 0
        ? (goal.monthlyNeed / totalMonthlyNeed) * recommendedAmount
        : recommendedAmount / Math.max(openGoals.length, 1);

      return {
        ...goal,
        suggested: Math.min(suggested, goal.remaining),
      };
    });

    return {
      recommendedAmount,
      incomePercentage: monthlySummary.totalIncome > 0 ? (recommendedAmount / monthlySummary.totalIncome) * 100 : 0,
      allocations,
      openGoalsCount: openGoals.length,
      totalMonthlyNeed,
    };
  }, [goals, monthlySummary.balance, monthlySummary.totalIncome]);

  const fixedForecast = useMemo(() => {
    const activeRecurring = recurringTransactions.filter(item => item.active);

    if (forecastRangeId === 'current_month') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthTransactions = transactions.filter(transaction => {
        const date = new Date(`${transaction.date}T12:00:00`);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const fixedItems: FixedForecastRow[] = activeRecurring
        .map(item => {
          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
          const safeDay = Math.min(item.dayOfMonth, daysInMonth);
          const dueDate = new Date(currentYear, currentMonth, safeDay);
          const isoDate = isoDateLocal(dueDate);
          const alreadyLaunched = monthTransactions.some(transaction =>
            transaction.description === item.description &&
            transaction.amount === item.amount &&
            transaction.type === item.type
          );

          return {
            ...item,
            dueDate: isoDate,
            isPast: safeDay < now.getDate(),
            alreadyLaunched,
          };
        })
        .sort((a, b) => a.dayOfMonth - b.dayOfMonth);

      const salaries = fixedItems.filter(item => item.type === 'income');
      const bills = fixedItems.filter(item => item.type === 'expense');
      const expectedIncome = salaries.reduce((sum, item) => sum + item.amount, 0);
      const expectedBills = bills.reduce((sum, item) => sum + item.amount, 0);
      const pendingIncome = salaries.filter(item => !item.alreadyLaunched).reduce((sum, item) => sum + item.amount, 0);
      const pendingBills = bills.filter(item => !item.alreadyLaunched).reduce((sum, item) => sum + item.amount, 0);
      const projectedBalance = monthlySummary.balance + pendingIncome - pendingBills;

      return {
        mode: 'forecast' as const,
        salaries,
        bills,
        expectedIncome,
        expectedBills,
        pendingIncome,
        pendingBills,
        projectedBalance,
        incomeLaunchCount: 0,
        expenseLaunchCount: 0,
      };
    }

    const bounds = forecastRangeBounds(forecastRangeId)!;
    const txsInRange = transactions.filter(t => t.date >= bounds.start && t.date <= bounds.end);
    const matched = txsInRange.filter(t =>
      activeRecurring.some(r => matchesRecurringTransaction(t, r)),
    );

    const incomeTx = matched.filter(t => t.type === 'income');
    const expenseTx = matched.filter(t => t.type === 'expense');
    const expectedIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
    const expectedBills = expenseTx.reduce((sum, t) => sum + t.amount, 0);

    const buildHistoryRows = (type: Transaction['type']): FixedForecastRow[] =>
      activeRecurring
        .filter(r => r.type === type)
        .map(r => {
          const rt = matched.filter(t => matchesRecurringTransaction(t, r));
          const historyTotal = rt.reduce((s, t) => s + t.amount, 0);
          const historyCount = rt.length;
          return {
            ...r,
            dueDate: bounds.end,
            isPast: false,
            alreadyLaunched: historyCount > 0,
            historyTotal,
            historyCount,
          };
        })
        .filter(row => row.historyCount > 0)
        .sort((a, b) => (b.historyTotal ?? 0) - (a.historyTotal ?? 0));

    const salaries = buildHistoryRows('income');
    const bills = buildHistoryRows('expense');

    return {
      mode: 'history' as const,
      salaries,
      bills,
      expectedIncome,
      expectedBills,
      pendingIncome: 0,
      pendingBills: 0,
      projectedBalance: expectedIncome - expectedBills,
      incomeLaunchCount: incomeTx.length,
      expenseLaunchCount: expenseTx.length,
    };
  }, [forecastRangeId, monthlySummary.balance, recurringTransactions, transactions]);

  return (
    <div className="space-y-6">
      <SummaryCards />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-lg shadow-red-100/60">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm font-bold text-red-700">Atenção ao Orçamento</p>
              <p className="mt-1 text-xs leading-relaxed text-red-600">
                Você já gastou {highlights.topExpensePercentage.toFixed(0)}% das despesas em {highlights.topExpenseCategory}. Considere revisar essa categoria.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-lg shadow-emerald-100/60">
          <div className="flex gap-3">
            <TrendingUp className="mt-0.5 h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-700">Economia no Mês</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-600">
                Sua taxa de economia está em {highlights.savingsRate.toFixed(0)}%. Continue acompanhando as movimentações.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 shadow-lg shadow-indigo-100/60">
          <div className="flex gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 text-indigo-600" />
            <div>
              <p className="text-sm font-bold text-indigo-700">Dica Inteligente</p>
              <p className="mt-1 text-xs leading-relaxed text-indigo-600">
                Com base no histórico, pequenos cortes nas maiores categorias podem acelerar suas metas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70">
        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">Previsão de Contas Fixas e Salários</h2>
              <p className="mt-1 text-sm text-slate-500">
                {fixedForecast.mode === 'forecast'
                  ? 'Projeção baseada nas recorrências cadastradas no Centro Profissional.'
                  : 'Totais das movimentações que coincidem com suas recorrências ativas no intervalo escolhido.'}
              </p>
            </div>
            <Select
              value={forecastRangeId}
              onValueChange={value => setForecastRangeId(value as ForecastRangeId)}
            >
              <SelectTrigger className="w-full min-w-[220px] border-blue-100 bg-blue-50 text-blue-900 hover:bg-blue-50 focus:ring-blue-200 lg:w-[260px]">
                <CalendarClock className="mr-2 h-4 w-4 shrink-0 text-blue-700" aria-hidden />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={panelPortalDarkRootClass(isDarkMode)}>
                {FORECAST_RANGE_OPTIONS.map(opt => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {fixedForecast.mode === 'forecast' ? 'Salários previstos' : 'Salários no período'}
            </p>
            <p className="mt-2 font-heading text-2xl font-bold text-emerald-900">{formatCurrency(fixedForecast.expectedIncome)}</p>
            <p className="mt-1 text-xs text-emerald-700">
              {fixedForecast.mode === 'forecast'
                ? <>Ainda a receber: {formatCurrency(fixedForecast.pendingIncome)}</>
                : <>{fixedForecast.incomeLaunchCount} lançamento(s) no período</>}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              {fixedForecast.mode === 'forecast' ? 'Contas fixas previstas' : 'Contas fixas no período'}
            </p>
            <p className="mt-2 font-heading text-2xl font-bold text-red-900">{formatCurrency(fixedForecast.expectedBills)}</p>
            <p className="mt-1 text-xs text-red-700">
              {fixedForecast.mode === 'forecast'
                ? <>Ainda a pagar: {formatCurrency(fixedForecast.pendingBills)}</>
                : <>{fixedForecast.expenseLaunchCount} lançamento(s) no período</>}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              {fixedForecast.mode === 'forecast' ? 'Saldo projetado' : 'Fluxo líquido (recorrências)'}
            </p>
            <p className={`mt-2 font-heading text-2xl font-bold ${fixedForecast.projectedBalance >= 0 ? 'text-blue-950' : 'text-red-700'}`}>
              {formatCurrency(fixedForecast.projectedBalance)}
            </p>
            <p className="mt-1 text-xs text-blue-700">
              {fixedForecast.mode === 'forecast'
                ? 'Saldo atual do mês + previsões pendentes.'
                : 'Receitas menos despesas fixas registradas no intervalo.'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {fixedForecast.mode === 'forecast' ? 'Recorrências ativas' : 'Recorrências com lançamento'}
            </p>
            <p className="mt-2 font-heading text-2xl font-bold text-slate-900">
              {fixedForecast.salaries.length + fixedForecast.bills.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {fixedForecast.mode === 'forecast'
                ? 'Salários, assinaturas e contas fixas.'
                : 'Itens distintos que apareceram nas movimentações.'}
            </p>
          </div>
        </div>

        <div className="grid gap-6 px-6 pb-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Salários e entradas fixas</h3>
                <p className="text-sm text-slate-500">
                  {fixedForecast.mode === 'forecast'
                    ? 'Receitas recorrentes cadastradas.'
                    : 'Receitas recorrentes registradas no intervalo.'}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {fixedForecast.salaries.length === 0 ? (
                <p className="rounded-2xl bg-white p-5 text-sm text-slate-500">
                  {fixedForecast.mode === 'forecast'
                    ? 'Cadastre o salário como recorrência de receita para aparecer na previsão.'
                    : 'Nenhuma receita recorrente foi registrada neste intervalo.'}
                </p>
              ) : (
                fixedForecast.salaries.map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.description}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {fixedForecast.mode === 'history' && item.historyCount != null
                          ? `${item.historyCount} lançamento(s) • consolidado no período`
                          : <>Dia {item.dayOfMonth} • {item.alreadyLaunched ? 'já lançado' : 'previsto'}</>}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-700">
                      + {formatCurrency(item.historyTotal ?? item.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Próximas contas fixas</h3>
                <p className="text-sm text-slate-500">
                  {fixedForecast.mode === 'forecast'
                    ? 'Despesas recorrentes que ainda precisam de atenção.'
                    : 'Despesas fixas registradas no intervalo.'}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {fixedForecast.bills.length === 0 ? (
                <p className="rounded-2xl bg-white p-5 text-sm text-slate-500">
                  {fixedForecast.mode === 'forecast'
                    ? 'Cadastre contas fixas como recorrência de despesa para acompanhar vencimentos.'
                    : 'Nenhuma despesa fixa recorrente foi registrada neste intervalo.'}
                </p>
              ) : (
                fixedForecast.bills.map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.description}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {fixedForecast.mode === 'history' && item.historyCount != null
                          ? `${item.historyCount} lançamento(s) • consolidado no período`
                          : <>Dia {item.dayOfMonth} • {item.alreadyLaunched ? 'já lançada' : item.isPast ? 'vencimento passou' : 'prevista'}</>}
                      </p>
                    </div>
                    <span className="font-bold text-red-600">
                      - {formatCurrency(item.historyTotal ?? item.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70">
        <div className="bg-gradient-to-br from-slate-950 via-blue-900 to-emerald-700 p-6 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge className="mb-4 w-fit bg-white/15 text-white hover:bg-white/15">
                <PiggyBank className="mr-1 h-3.5 w-3.5" /> Investimento recomendado
              </Badge>
              <h2 className="font-heading text-2xl font-bold">Plano de aporte baseado na sua receita</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50">
                O painel calcula quanto investir no mês e como distribuir entre as metas cadastradas, respeitando seu saldo livre.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-blue-50">Aporte sugerido neste mês</p>
              <p className="mt-2 font-heading text-3xl font-bold">{formatCurrency(investmentPlan.recommendedAmount)}</p>
              <p className="mt-1 text-xs text-blue-100">
                {investmentPlan.incomePercentage.toFixed(1)}% da receita mensal.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Critério do cálculo</h3>
                <p className="text-sm text-slate-500">Baseado em receita, saldo livre e metas abertas.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <div className="rounded-2xl bg-white p-4">
                Receita do mês: <strong className="text-slate-900">{formatCurrency(monthlySummary.totalIncome)}</strong>
              </div>
              <div className="rounded-2xl bg-white p-4">
                Saldo livre do mês: <strong className={monthlySummary.balance >= 0 ? 'text-emerald-700' : 'text-red-600'}>{formatCurrency(monthlySummary.balance)}</strong>
              </div>
              <div className="rounded-2xl bg-white p-4">
                Metas abertas: <strong className="text-slate-900">{investmentPlan.openGoalsCount}</strong>
              </div>
              <p className="text-xs text-slate-500">
                Regra usada: sugerir até 20% da receita, limitado a uma parte segura do saldo positivo do mês.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Distribuição por meta</h3>
                <p className="text-sm text-slate-500">Prioriza metas com menor prazo e maior necessidade mensal.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {investmentPlan.allocations.length === 0 ? (
                <p className="rounded-2xl bg-white p-5 text-sm text-slate-500">
                  Cadastre metas financeiras para o painel sugerir quanto investir em cada uma.
                </p>
              ) : investmentPlan.recommendedAmount <= 0 ? (
                <p className="rounded-2xl bg-white p-5 text-sm text-slate-500">
                  No momento não há saldo livre positivo para sugerir aporte. Revise despesas antes de investir nas metas.
                </p>
              ) : (
                investmentPlan.allocations.map(goal => (
                  <div key={goal.id} className="rounded-2xl bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{goal.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Faltam {formatCurrency(goal.remaining)} em aproximadamente {goal.monthsLeft} mês(es).
                        </p>
                      </div>
                      <Badge className="w-fit bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        Investir {formatCurrency(goal.suggested)}
                      </Badge>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-emerald-600" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{goal.progress.toFixed(0)}% concluída</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section
          className={cn(
            'rounded-2xl border shadow-xl',
            isDarkMode
              ? 'border-slate-800 bg-slate-950/50 shadow-none ring-1 ring-slate-800/90'
              : 'border-slate-100 bg-white shadow-slate-200/70',
          )}
        >
          <div className={cn('border-b p-6', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
            <h2 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>Transações Recentes</h2>
            <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Últimas movimentações da sua conta</p>
          </div>

          <div className="space-y-3 p-6">
          {recent.length === 0 ? (
            <p className={cn('py-10 text-center text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Nenhuma transação ainda.</p>
          ) : (
            recent.map(t => (
              <div
                key={t.id}
                className={cn(
                  'flex items-center justify-between rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg',
                  isDarkMode
                    ? 'border-slate-700/85 bg-slate-900/65 hover:bg-slate-800/95 hover:shadow-black/35'
                    : 'border-slate-100 bg-slate-50/80 hover:bg-white hover:shadow-lg',
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {t.type === 'income' ? (
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className={cn('text-sm font-bold', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>{t.description}</p>
                    <div className={cn('mt-1 flex flex-wrap items-center gap-2 text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                      <Badge
                        variant="outline"
                        className={cn(
                          'px-2 py-0 text-[10px]',
                          isDarkMode ? 'border-slate-600 bg-slate-800/90 text-slate-300' : 'border-slate-200 bg-white text-slate-600',
                        )}
                      >
                        {t.category}
                      </Badge>
                      <span>{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-sm font-bold',
                    t.type === 'income'
                      ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      : isDarkMode ? 'text-red-400' : 'text-red-600',
                  )}
                >
                  {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                </span>
              </div>
            ))
          )}
          </div>
        </section>

        {caps.categoryBudget ? <BudgetOverview /> : null}
      </div>
    </div>
  );
}
