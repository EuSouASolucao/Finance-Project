import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { panelModalDarkSurfaceClass, panelPortalDarkRootClass, usePanelTheme } from '@/contexts/PanelThemeContext';
import { useFinance } from '@/contexts/FinanceContext';
import { cn } from '@/lib/utils';
import { CATEGORIES, TransactionType, PaymentStatus, Category } from '@/types/finance';
import { toast } from 'sonner';

export default function TransactionForm() {
  const { addTransaction } = useFinance();
  const { isDarkMode } = usePanelTheme();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Outros');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<PaymentStatus>('paid');
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setType('expense');
    setDescription('');
    setAmount('');
    setCategory('Outros');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('paid');
  };

  const parseAmount = (value: string) => {
    const normalized = value.trim().replace(/\./g, '').replace(',', '.');
    return Number(normalized);
  };

  const formatAmount = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';

    const numericValue = Number(digits) / 100;
    return numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAmountChange = (value: string) => {
    setAmount(formatAmount(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseAmount(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Informe um valor válido para salvar a transação.');
      return;
    }

    try {
      setIsSaving(true);
      await addTransaction({
        type,
        description: description.trim() || (type === 'income' ? 'Entrada' : 'Despesa'),
        amount: parsedAmount,
        category,
        date,
        paymentStatus: status,
      });
      toast.success('Transação adicionada!');
      reset();
      setOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      toast.error(error instanceof Error ? error.message.split('\n').slice(0, 4).join('\n') : 'Não foi possível salvar a transação.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 px-4 shadow-lg shadow-blue-700/25 hover:from-blue-800 hover:to-emerald-700">
          <Plus className="h-4 w-4" /> Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className={cn('sm:max-w-md', panelModalDarkSurfaceClass(isDarkMode))}>
        <DialogHeader>
          <DialogTitle className="font-heading">Adicionar Transação - versão corrigida</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex gap-2">
            <Button type="button" variant={type === 'income' ? 'default' : 'outline'} className="flex-1" onClick={() => setType('income')}>
              Entrada
            </Button>
            <Button type="button" variant={type === 'expense' ? 'destructive' : 'outline'} className="flex-1" onClick={() => setType('expense')}>
              Saída
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input placeholder="Ex: Salário, Mercado..." value={description} onChange={e => setDescription(e.target.value)} maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              inputMode="numeric"
              placeholder="0,00"
              value={amount}
              onChange={e => handleAmountChange(e.target.value)}
              className="text-lg font-semibold tracking-wide"
            />
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Formatação automática ativa: 10000000 vira 100.000,00.</p>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className={panelPortalDarkRootClass(isDarkMode)}>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className={panelPortalDarkRootClass(isDarkMode)}>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
