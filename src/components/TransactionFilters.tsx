import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance } from '@/contexts/FinanceContext';
import { panelPortalDarkRootClass, usePanelTheme } from '@/contexts/PanelThemeContext';
import { cn } from '@/lib/utils';
import type { Category, TransactionType } from '@/types/finance';
import { CATEGORIES } from '@/types/finance';
import { Search, X } from 'lucide-react';

export default function TransactionFilters() {
  const { filters, setFilters } = useFinance();
  const { isDarkMode } = usePanelTheme();

  const fieldBase = cn(
    'h-9 rounded-xl',
    isDarkMode ? 'border-slate-600 bg-slate-900/85 text-slate-100 placeholder:text-slate-500' : 'border-slate-200 bg-slate-50',
  );

  const labelClass = cn('text-xs', isDarkMode ? 'text-slate-400' : 'text-slate-500');

  const clearFilters = () => setFilters({});

  const hasFilters = filters.query || filters.type || filters.category || filters.dateFrom || filters.dateTo;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <span className={labelClass}>Buscar</span>
        <div className="relative">
          <Search className={cn('absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2', isDarkMode ? 'text-slate-500' : 'text-slate-400')} />
          <Input
            className={cn(fieldBase, 'w-[220px] pl-8')}
            placeholder="Descrição ou categoria"
            value={filters.query || ''}
            onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-1">
        <span className={labelClass}>Tipo</span>
        <Select value={filters.type || 'all'} onValueChange={v => setFilters(f => ({ ...f, type: v === 'all' ? '' : v as TransactionType }))}>
          <SelectTrigger className={cn(fieldBase, 'w-[130px]')}><SelectValue /></SelectTrigger>
          <SelectContent className={panelPortalDarkRootClass(isDarkMode)}>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Entradas</SelectItem>
            <SelectItem value="expense">Saídas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <span className={labelClass}>Categoria</span>
        <Select value={filters.category || 'all'} onValueChange={v => setFilters(f => ({ ...f, category: v === 'all' ? '' : v as Category }))}>
          <SelectTrigger className={cn(fieldBase, 'w-[150px]')}><SelectValue /></SelectTrigger>
          <SelectContent className={panelPortalDarkRootClass(isDarkMode)}>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <span className={labelClass}>De</span>
        <Input type="date" className={cn(fieldBase, 'w-[150px]')} value={filters.dateFrom || ''} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <span className={labelClass}>Até</span>
        <Input type="date" className={cn(fieldBase, 'w-[150px]')} value={filters.dateTo || ''} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
      </div>
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className={cn(
            'h-9 gap-1 rounded-xl',
            isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100',
          )}
        >
          <X className="h-3 w-3" /> Limpar
        </Button>
      )}
    </div>
  );
}
