import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Home, Plane, Plus, Trash2, WalletCards } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { panelModalDarkSurfaceClass, usePanelTheme } from '@/contexts/PanelThemeContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const goalStyles = [
  { icon: Plane, color: 'bg-blue-500', text: 'text-blue-500' },
  { icon: WalletCards, color: 'bg-emerald-500', text: 'text-emerald-500' },
  { icon: Home, color: 'bg-amber-500', text: 'text-amber-500' },
];

const formatDate = (date: string) =>
  date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Sem prazo';

export default function GoalsSection() {
  const formatCurrency = useFormatCurrency();
  const { isDarkMode } = usePanelTheme();
  const { goals, addGoal, updateGoalProgress, deleteGoal } = useFinance();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('0');
  const [deadline, setDeadline] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseFloat(target);
    const c = parseFloat(current) || 0;
    if (!title.trim() || isNaN(t) || t <= 0) {
      toast.error('Preencha os campos corretamente.');
      return;
    }
    addGoal({ title: title.trim(), targetAmount: t, currentAmount: c, deadline });
    setTitle(''); setTarget(''); setCurrent('0'); setDeadline('');
    setOpen(false);
    toast.success('Meta criada!');
  };

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-2xl border shadow-xl',
        isDarkMode
          ? 'border-slate-800 bg-slate-950/50 shadow-none ring-1 ring-slate-800/90'
          : 'border-slate-100 bg-white shadow-slate-200/70',
      )}
    >
      <CardHeader className={cn('flex flex-row items-start justify-between gap-4 border-b p-6', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
        <div>
          <CardTitle className={cn('font-heading text-lg font-bold', isDarkMode ? 'text-slate-50' : 'text-slate-900')}>
            Metas Financeiras
          </CardTitle>
          <p className={cn('mt-1 text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Acompanhe o progresso dos seus objetivos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'gap-1 rounded-xl',
                isDarkMode
                  ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              )}
            >
              <Plus className="h-3 w-3" /> Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className={cn('sm:max-w-sm', panelModalDarkSurfaceClass(isDarkMode))}>
            <DialogHeader><DialogTitle className="font-heading">Nova Meta</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input placeholder="Ex: Reserva de emergência" value={title} onChange={e => setTitle(e.target.value)} maxLength={80} />
              </div>
              <div className="space-y-2">
                <Label>Valor alvo (R$)</Label>
                <Input type="number" step="0.01" min="0.01" value={target} onChange={e => setTarget(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Valor atual (R$)</Label>
                <Input type="number" step="0.01" min="0" value={current} onChange={e => setCurrent(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Criar Meta</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        {goals.length === 0 ? (
          <p className={cn('py-10 text-center text-sm', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Nenhuma meta definida ainda.</p>
        ) : (
          goals.map((g, index) => {
            const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            const remaining = Math.max(g.targetAmount - g.currentAmount, 0);
            const style = goalStyles[index % goalStyles.length];
            const Icon = style.icon;

            return (
              <div
                key={g.id}
                className={cn(
                  'group rounded-2xl border p-4 transition-all hover:shadow-lg',
                  isDarkMode
                    ? 'border-slate-700/90 bg-slate-900/55 hover:bg-slate-800/85 hover:shadow-black/30'
                    : 'border-slate-100 bg-slate-50/70 hover:bg-white',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${style.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className={cn('truncate text-sm font-bold', isDarkMode ? 'text-slate-100' : 'text-slate-900')}>{g.title}</p>
                      <p className={cn('mt-1 text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>Prazo: {formatDate(g.deadline)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-right">
                    <div>
                      <p className={cn('text-xl font-heading font-bold', style.text)}>{pct.toFixed(0)}%</p>
                      <p className={cn('text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>{formatCurrency(g.currentAmount)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100',
                        isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-red-400' : 'text-slate-400 hover:text-red-500',
                      )}
                      onClick={() => deleteGoal(g.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className={cn('mt-4 h-2 overflow-hidden rounded-full', isDarkMode ? 'bg-slate-800' : 'bg-slate-200')}>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      isDarkMode ? 'bg-gradient-to-r from-blue-500 to-emerald-400' : 'bg-slate-950',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className={cn('mt-3 flex flex-wrap items-center justify-between gap-3 text-xs', isDarkMode ? 'text-slate-300' : 'text-slate-600')}>
                  <span>Meta: {formatCurrency(g.targetAmount)}</span>
                  <span>Faltam: {formatCurrency(remaining)}</span>
                </div>

                <div className="mt-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className={cn(
                      'h-8 max-w-40 rounded-xl text-xs',
                      isDarkMode ? 'border-slate-600 bg-slate-950 text-slate-100 placeholder:text-slate-500' : 'border-slate-200 bg-white',
                    )}
                    placeholder="Atualizar valor"
                    onBlur={e => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 0) {
                        updateGoalProgress(g.id, v);
                        e.target.value = '';
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
