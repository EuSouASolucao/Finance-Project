import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

export default function BalanceChart() {
  const formatCurrency = useFormatCurrency();
  const { transactions } = useFinance();

  const data = useMemo(() => {
    if (transactions.length === 0) return [];
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    let balance = 0;
    const map = new Map<string, number>();
    sorted.forEach(t => {
      balance += t.type === 'income' ? t.amount : -t.amount;
      map.set(t.date, balance);
    });
    return Array.from(map.entries()).map(([date, saldo]) => ({
      date: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      saldo,
    }));
  }, [transactions]);

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="font-heading text-base">Evolução do Saldo</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
          Sem dados para exibir
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle className="font-heading text-base">Evolução do Saldo</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 58%, 38%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(152, 58%, 38%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={(l) => `Data: ${l}`} />
            <Area type="monotone" dataKey="saldo" stroke="hsl(152, 58%, 38%)" fill="url(#gradSaldo)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
