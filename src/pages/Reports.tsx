import { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { usePanelTheme } from '@/contexts/PanelThemeContext';
import SummaryCards from '@/components/SummaryCards';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BrainCircuit, Scissors, Target, TrendingDown } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const CATEGORY_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];
const LOW_LEVERAGE_CATEGORIES = ['Lazer', 'Vestuário', 'Outros'];
const ESSENTIAL_CATEGORIES = ['Moradia', 'Saúde', 'Educação', 'Contas', 'Alimentação', 'Transporte'];

function pieOutsideLabel(isDarkMode: boolean) {
  return (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    outerRadius?: number;
    name?: string;
    percent?: number;
  }) => {
    const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name = '', percent = 0 } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 22;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={isDarkMode ? '#e2e8f0' : '#334155'}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
}

export default function Reports() {
  const formatCurrency = useFormatCurrency();
  const { isDarkMode } = usePanelTheme();
  const { transactions } = useFinance();

  const monthlyData = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 6 }, (_, offset) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - offset), 1);
      const month = MONTHS[date.getMonth()];
      const txs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
      });
      const receitas = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const despesas = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month, receitas, despesas };
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    const now = new Date();
    const map: Record<string, number> = {};

    transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  const spendingAnalysis = useMemo(() => {
    const now = new Date();
    const monthExpenses = transactions.filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const totalExpense = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = monthExpenses.reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

    const categories = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        incomePercentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const lowLeverageTotal = monthExpenses
      .filter(t => LOW_LEVERAGE_CATEGORIES.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    const essentialTotal = monthExpenses
      .filter(t => ESSENTIAL_CATEGORIES.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    const investmentTotal = monthExpenses
      .filter(t => t.category === 'Investimentos')
      .reduce((sum, t) => sum + t.amount, 0);

    const bottlenecks = categories
      .filter(item => item.percentage >= 25 || item.incomePercentage >= 20 || LOW_LEVERAGE_CATEGORIES.includes(item.category))
      .slice(0, 4);

    const lowLeverageTransactions = monthExpenses
      .filter(t => LOW_LEVERAGE_CATEGORIES.includes(t.category))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const cutPotential = Math.min(lowLeverageTotal * 0.35, Math.max(totalExpense - essentialTotal - investmentTotal, 0));
    const leverageRate = totalExpense > 0 ? (investmentTotal / totalExpense) * 100 : 0;

    return {
      totalExpense,
      totalIncome,
      categories,
      bottlenecks,
      lowLeverageTotal,
      lowLeverageTransactions,
      cutPotential,
      leverageRate,
      investmentTotal,
    };
  }, [transactions]);

  const recent = transactions.slice(0, 6);

  const chartTooltipProps = isDarkMode
    ? {
        contentStyle: {
          backgroundColor: 'rgb(15 23 42)',
          border: '1px solid rgb(51 65 85)',
          borderRadius: 12,
          color: 'rgb(241 245 249)',
        },
        labelStyle: { color: 'rgb(203 213 225)' },
        itemStyle: { color: 'rgb(226 232 240)' },
      }
    : {
        contentStyle: {
          backgroundColor: '#fff',
          border: '1px solid rgb(226 232 240)',
          borderRadius: 12,
          color: 'rgb(15 23 42)',
        },
      };

  const axisTick = { fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b' };
  const gridStroke = isDarkMode ? '#334155' : '#e5e7eb';
  const cursorFill = isDarkMode ? 'rgba(148, 163, 184, 0.14)' : '#f8fafc';

  return (
    <div className="space-y-6">
      <SummaryCards />

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70">
        <div className="bg-gradient-to-br from-slate-950 via-blue-900 to-emerald-700 p-6 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge className="mb-4 w-fit bg-white/15 text-white hover:bg-white/15">
                <BrainCircuit className="mr-1 h-3.5 w-3.5" /> Análise inteligente de gastos
              </Badge>
              <h1 className="font-heading text-2xl font-bold">Gargalos e gastos que travam sua evolução</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50">
                A leitura abaixo aponta onde o dinheiro está saindo com menor retorno financeiro e quais cortes podem acelerar investimentos, metas e reserva.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-blue-50">Potencial de realocação</p>
              <p className="mt-2 font-heading text-3xl font-bold">{formatCurrency(spendingAnalysis.cutPotential)}</p>
              <p className="mt-1 text-xs text-blue-100">Estimativa de corte em gastos de baixo retorno.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Gargalo principal</p>
                <p className="font-heading text-lg font-bold text-red-950">
                  {spendingAnalysis.bottlenecks[0]?.category || 'Sem dados'}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-red-700">
              {spendingAnalysis.bottlenecks[0]
                ? `${spendingAnalysis.bottlenecks[0].percentage.toFixed(0)}% das despesas do mês estão nessa categoria.`
                : 'Cadastre despesas para identificar os principais gargalos.'}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Baixo retorno</p>
                <p className="font-heading text-lg font-bold text-amber-950">{formatCurrency(spendingAnalysis.lowLeverageTotal)}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-amber-800">
              Soma de lazer, vestuário e outros gastos que normalmente não aumentam patrimônio.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Alavancagem</p>
                <p className="font-heading text-lg font-bold text-emerald-950">{spendingAnalysis.leverageRate.toFixed(1)}%</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-emerald-800">
              Percentual das despesas direcionado para investimentos no mês.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Scissors className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Ação sugerida</p>
                <p className="font-heading text-lg font-bold text-blue-950">Cortar 35%</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-blue-800">
              Reduza primeiro os gastos de baixo retorno e realoque para reserva, metas ou investimentos.
            </p>
          </div>
        </div>

        <div className="grid gap-6 px-6 pb-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
            <h2 className="font-heading text-lg font-bold text-slate-900">Categorias que merecem atenção</h2>
            <p className="mt-1 text-sm text-slate-500">A IA sinaliza categorias com peso alto na despesa ou baixo impacto na evolução financeira.</p>

            <div className="mt-5 space-y-3">
              {spendingAnalysis.bottlenecks.length === 0 ? (
                <p className="rounded-2xl bg-white p-5 text-sm text-slate-500">Ainda não há gastos suficientes para identificar gargalos.</p>
              ) : (
                spendingAnalysis.bottlenecks.map(item => (
                  <div key={item.category} className="rounded-2xl bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.category}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {LOW_LEVERAGE_CATEGORIES.includes(item.category)
                            ? 'Gasto de baixo retorno: revise se realmente está agregando para sua renda, patrimônio ou qualificação.'
                            : 'Categoria com peso alto: negocie, limite ou acompanhe semanalmente para evitar vazamento de dinheiro.'}
                        </p>
                      </div>
                      <Badge className="bg-red-50 text-red-700 hover:bg-red-50">{formatCurrency(item.amount)}</Badge>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-slate-800" style={{ width: `${Math.min(item.percentage, 100)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{item.percentage.toFixed(1)}% das despesas do mês</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
            <h2 className="font-heading text-lg font-bold text-slate-900">Gastos que não agregam</h2>
            <p className="mt-1 text-sm text-slate-500">Maiores lançamentos em lazer, vestuário e outros.</p>

            <div className="mt-5 space-y-3">
              {spendingAnalysis.lowLeverageTransactions.length === 0 ? (
                <p className="rounded-2xl bg-white p-5 text-sm text-slate-500">Nenhum gasto de baixo retorno encontrado neste mês.</p>
              ) : (
                spendingAnalysis.lowLeverageTransactions.map(transaction => (
                  <div key={transaction.id} className="rounded-2xl bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{transaction.description}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {transaction.category} • {new Date(transaction.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className="font-bold text-red-600">{formatCurrency(transaction.amount)}</span>
                    </div>
                    <p className="mt-3 text-sm leading-5 text-slate-500">
                      Pergunta prática: esse gasto ajudou a ganhar mais, investir melhor, reduzir dívida ou proteger sua família?
                    </p>
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
            <h2 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>Receitas vs Despesas</h2>
            <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Últimos 6 meses</p>
          </div>

          <div className={cn('p-6', isDarkMode && 'bg-slate-950/30')}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip
                  {...chartTooltipProps}
                  formatter={(v: number) => formatCurrency(v)}
                  cursor={{ fill: cursorFill }}
                />
                <Legend
                  iconType="square"
                  wrapperStyle={{
                    fontSize: 12,
                    color: isDarkMode ? 'rgb(203 213 225)' : 'rgb(71 85 105)',
                  }}
                />
                <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={34} />
                <Bar dataKey="despesas" name="Despesas" fill="#f43f5e" radius={[8, 8, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section
          className={cn(
            'rounded-2xl border shadow-xl',
            isDarkMode
              ? 'border-slate-800 bg-slate-950/50 shadow-none ring-1 ring-slate-800/90'
              : 'border-slate-100 bg-white shadow-slate-200/70',
          )}
        >
          <div className={cn('border-b p-6', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
            <h2 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>Despesas por Categoria</h2>
            <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Distribuição do mês atual</p>
          </div>

          <div className={cn('p-6', isDarkMode && 'bg-slate-950/30')}>
            {categoryData.length === 0 ? (
              <div className={cn('flex h-[300px] items-center justify-center text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                Sem despesas neste mês.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={pieOutsideLabel(isDarkMode)}
                    labelLine={{ stroke: isDarkMode ? '#64748b' : '#cbd5e1' }}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipProps} formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
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
          <h2 className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>Transações Recentes</h2>
          <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Últimas movimentações da sua conta</p>
        </div>

        <div className="space-y-3 p-6">
          {recent.length === 0 ? (
            <p className={cn('py-10 text-center text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Nenhuma transação ainda.</p>
          ) : (
            recent.map(transaction => (
              <div
                key={transaction.id}
                className={cn(
                  'flex items-center justify-between rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg',
                  isDarkMode
                    ? 'border-slate-700/85 bg-slate-900/65 hover:bg-slate-800/95 hover:shadow-black/35'
                    : 'border-slate-100 bg-slate-50/80 hover:bg-white hover:shadow-lg',
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className={cn('text-sm font-bold', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>{transaction.description}</p>
                    <div className={cn('mt-1 flex flex-wrap items-center gap-2 text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                      <Badge
                        variant="outline"
                        className={cn(
                          'px-2 py-0 text-[10px]',
                          isDarkMode ? 'border-slate-600 bg-slate-800/90 text-slate-300' : 'border-slate-200 bg-white text-slate-600',
                        )}
                      >
                        {transaction.category}
                      </Badge>
                      <span>{new Date(transaction.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-sm font-bold',
                    transaction.type === 'income'
                      ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      : isDarkMode ? 'text-red-400' : 'text-red-600',
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
