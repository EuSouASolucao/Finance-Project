import { useFinance } from '@/contexts/FinanceContext';
import { panelPortalDarkRootClass, usePanelTheme } from '@/contexts/PanelThemeContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react';
import { PaymentStatus } from '@/types/finance';

const statusLabels: Record<PaymentStatus, string> = { paid: 'Pago', pending: 'Pendente', overdue: 'Atrasado' };
const statusVariant: Record<PaymentStatus, 'default' | 'secondary' | 'destructive'> = {
  paid: 'default', pending: 'secondary', overdue: 'destructive',
};

export default function TransactionList() {
  const formatCurrency = useFormatCurrency();
  const { isDarkMode } = usePanelTheme();
  const { filteredTransactions, deleteTransaction, updateTransactionStatus } = useFinance();

  if (filteredTransactions.length === 0) {
    return (
      <div className={cn('py-12 text-center', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
        <p className="font-heading text-lg">Nenhuma transação encontrada</p>
        <p className="mt-1 text-sm">Adicione sua primeira transação clicando no botão acima.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTransactions.map(t => (
        <div
          key={t.id}
          className={cn(
            'group flex flex-col gap-4 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between',
            isDarkMode
              ? 'border-slate-700/85 bg-slate-900/65 hover:bg-slate-800/95 hover:shadow-lg hover:shadow-black/35'
              : 'border-slate-100 bg-slate-50/80 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg',
          )}
        >
          <div className="flex items-center gap-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}>
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

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <Select value={t.paymentStatus} onValueChange={(v) => updateTransactionStatus(t.id, v as PaymentStatus)}>
              <SelectTrigger
                className={cn(
                  'h-8 w-[120px] rounded-xl text-xs',
                  isDarkMode ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white',
                )}
              >
                <Badge variant={statusVariant[t.paymentStatus]} className="text-xs">
                  {statusLabels[t.paymentStatus]}
                </Badge>
              </SelectTrigger>
              <SelectContent className={panelPortalDarkRootClass(isDarkMode)}>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
            <span
              className={cn(
                'min-w-28 text-right text-sm font-bold',
                t.type === 'income'
                  ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                  : isDarkMode ? 'text-red-400' : 'text-red-600',
              )}
            >
              {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 opacity-100 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100',
                isDarkMode ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400',
              )}
              onClick={() => deleteTransaction(t.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
