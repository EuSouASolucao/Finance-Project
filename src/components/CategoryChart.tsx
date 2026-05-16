import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

const COLORS = [
  'hsl(152, 58%, 38%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)',
  'hsl(210, 60%, 50%)', 'hsl(280, 50%, 50%)', 'hsl(180, 50%, 40%)',
  'hsl(330, 50%, 50%)', 'hsl(60, 60%, 45%)', 'hsl(120, 40%, 50%)',
  'hsl(200, 70%, 45%)', 'hsl(15, 80%, 50%)', 'hsl(260, 40%, 55%)',
];

export default function CategoryChart() {
  const formatCurrency = useFormatCurrency();
  const { transactions } = useFinance();

  const data = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="font-heading text-base">Gastos por Categoria</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
          Sem despesas registradas
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle className="font-heading text-base">Gastos por Categoria</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
