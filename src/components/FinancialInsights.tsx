import { useMemo } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, PiggyBank, Sparkles, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFinance } from '@/contexts/FinanceContext';
import { useEffectivePermissions } from '@/lib/permissions';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

const formatDate = (date: string) =>
  new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

export default function FinancialInsights() {
  const formatCurrency = useFormatCurrency();
  const { transactions, goals, monthlySummary } = useFinance();
  const { categoryBudget } = useEffectivePermissions();

  const insights = useMemo(() => {
    const savingsRate = monthlySummary.totalIncome > 0
      ? (monthlySummary.balance / monthlySummary.totalIncome) * 100
      : 0;

    const unpaid = transactions
      .filter(t => t.paymentStatus !== 'paid')
      .sort((a, b) => a.date.localeCompare(b.date));

    const upcomingPayments = unpaid.slice(0, 3);
    const pendingTotal = unpaid.reduce((sum, t) => sum + t.amount, 0);

    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const topBudgets = Object.entries(expensesByCategory)
      .map(([category, total]) => {
        const suggestedLimit = Math.max(total * 1.15, 250);
        return {
          category,
          total,
          suggestedLimit,
          percentage: Math.min((total / suggestedLimit) * 100, 100),
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    const goalProgress = goals.length
      ? goals.reduce((sum, goal) => sum + Math.min(goal.currentAmount / goal.targetAmount, 1), 0) / goals.length
      : 0;

    const healthScore = Math.round(Math.max(0, Math.min(100,
      45 +
      (savingsRate > 0 ? Math.min(savingsRate, 30) : savingsRate) +
      (pendingTotal === 0 ? 15 : -10) +
      goalProgress * 10
    )));

    return {
      savingsRate,
      upcomingPayments,
      pendingTotal,
      topBudgets,
      healthScore,
    };
  }, [goals, monthlySummary, transactions]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card className="xl:col-span-1 border-0 shadow-lg bg-gradient-to-br from-primary via-emerald-600 to-teal-700 text-primary-foreground overflow-hidden">
        <CardHeader className="relative">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Saúde financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-5">
          <div>
            <p className="text-5xl font-heading font-bold">{insights.healthScore}</p>
            <p className="text-sm text-primary-foreground/80">pontuação estimada de 0 a 100</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span>Taxa de economia</span>
              <strong>{insights.savingsRate.toFixed(0)}%</strong>
            </div>
            <Progress value={Math.max(0, Math.min(insights.savingsRate, 100))} className="mt-3 h-2 bg-white/20" />
          </div>
          <p className="text-sm text-primary-foreground/80">
            {insights.healthScore >= 75
              ? 'Ótimo ritmo. Continue mantendo despesas sob controle e alimentando suas metas.'
              : 'Acompanhe pendências e tente reservar uma parte das receitas do mês.'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-card/90">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-warning" /> Próximos pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-warning/10 p-3">
            <span className="text-sm text-muted-foreground">Total em aberto</span>
            <strong className="text-warning">{formatCurrency(insights.pendingTotal)}</strong>
          </div>
          {insights.upcomingPayments.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
              <CheckCircle2 className="h-4 w-4" /> Nenhuma pendência no momento.
            </div>
          ) : (
            insights.upcomingPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between rounded-xl border bg-background/60 p-3">
                <div>
                  <p className="text-sm font-medium">{payment.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(payment.date)} · {payment.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                  <Badge variant={payment.paymentStatus === 'overdue' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {payment.paymentStatus === 'overdue' ? 'Atrasado' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {categoryBudget ? (
      <Card className="border-0 shadow-sm bg-card/90">
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Orçamentos sugeridos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.topBudgets.length === 0 ? (
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              Cadastre despesas para receber limites sugeridos por categoria.
            </div>
          ) : (
            insights.topBudgets.map(item => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-muted-foreground">{formatCurrency(item.total)}</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.percentage > 85 ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  ) : (
                    <PiggyBank className="h-3.5 w-3.5 text-income" />
                  )}
                  Limite sugerido: {formatCurrency(item.suggestedLimit)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      ) : null}
    </div>
  );
}
