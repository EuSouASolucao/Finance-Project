import { useMemo, useState } from 'react';
import { Bell, CreditCard, Download, FileJson, Repeat2, ShieldCheck, Trash2, Users, WalletCards } from 'lucide-react';
import SummaryCards from '@/components/SummaryCards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlanFeatureLock from '@/components/PlanFeatureLock';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useEffectivePermissions } from '@/lib/permissions';
import { AccessPermission, Category, CATEGORIES, PaymentStatus, TransactionType } from '@/types/finance';
import { toast } from 'sonner';

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ProfessionalCenter() {
  const formatCurrency = useFormatCurrency();
  const caps = useEffectivePermissions();
  const {
    transactions,
    goals,
    budgets,
    recurringTransactions,
    creditCards,
    sharedAccesses,
    addTransaction,
    addBudget,
    deleteBudget,
    addRecurringTransaction,
    deleteRecurringTransaction,
    addCreditCard,
    deleteCreditCard,
    addSharedAccess,
    deleteSharedAccess,
  } = useFinance();

  const [budgetCategory, setBudgetCategory] = useState<Category>('Alimentação');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetAlert, setBudgetAlert] = useState('80');

  const [recType, setRecType] = useState<TransactionType>('expense');
  const [recDescription, setRecDescription] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recCategory, setRecCategory] = useState<Category>('Contas');
  const [recDay, setRecDay] = useState('5');
  const [recStatus, setRecStatus] = useState<PaymentStatus>('pending');

  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardInvoice, setCardInvoice] = useState('');
  const [cardClosingDay, setCardClosingDay] = useState('25');
  const [cardDueDay, setCardDueDay] = useState('10');

  const [accessName, setAccessName] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [accessRole, setAccessRole] = useState('Contador');
  const [accessPermission, setAccessPermission] = useState<AccessPermission>('Visualização');

  const currentMonthExpensesByCategory = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(transaction => {
        const date = new Date(transaction.date);
        return transaction.type === 'expense' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce<Record<string, number>>((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {});
  }, [transactions]);

  const budgetAlerts = useMemo(() => {
    return budgets
      .map(budget => {
        const spent = currentMonthExpensesByCategory[budget.category] || 0;
        const used = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
        return { budget, spent, used, shouldAlert: used >= budget.alertPercentage };
      })
      .filter(item => item.shouldAlert)
      .sort((a, b) => b.used - a.used);
  }, [budgets, currentMonthExpensesByCategory]);

  const addBudgetForm = () => {
    const monthlyLimit = Number(budgetLimit);
    const alertPercentage = Number(budgetAlert);

    if (Number.isNaN(monthlyLimit) || monthlyLimit <= 0 || Number.isNaN(alertPercentage) || alertPercentage <= 0) {
      toast.error('Informe limite mensal e percentual de alerta válidos.');
      return;
    }

    addBudget({ category: budgetCategory, monthlyLimit, alertPercentage });
    setBudgetLimit('');
    toast.success('Orçamento por categoria salvo.');
  };

  const addRecurringForm = () => {
    const amount = Number(recAmount);
    const dayOfMonth = Number(recDay);

    if (!recDescription.trim() || Number.isNaN(amount) || amount <= 0 || dayOfMonth < 1 || dayOfMonth > 31) {
      toast.error('Preencha os dados da recorrência corretamente.');
      return;
    }

    addRecurringTransaction({
      description: recDescription.trim(),
      type: recType,
      amount,
      category: recCategory,
      dayOfMonth,
      paymentStatus: recStatus,
      active: true,
    });
    setRecDescription('');
    setRecAmount('');
    toast.success('Recorrência cadastrada.');
  };

  const generateRecurringForMonth = () => {
    if (recurringTransactions.length === 0) {
      toast.error('Cadastre uma recorrência primeiro.');
      return;
    }

    const now = new Date();
    let created = 0;

    recurringTransactions.filter(item => item.active).forEach(item => {
      const date = new Date(now.getFullYear(), now.getMonth(), Math.min(item.dayOfMonth, 28));
      const isoDate = date.toISOString().split('T')[0];
      const alreadyExists = transactions.some(transaction =>
        transaction.description === item.description &&
        transaction.amount === item.amount &&
        transaction.date === isoDate
      );

      if (!alreadyExists) {
        addTransaction({
          description: item.description,
          type: item.type,
          amount: item.amount,
          category: item.category,
          date: isoDate,
          paymentStatus: item.paymentStatus,
        });
        created += 1;
      }
    });

    toast.success(created > 0 ? `${created} lançamento(s) recorrente(s) gerado(s).` : 'As recorrências deste mês já foram geradas.');
  };

  const addCardForm = () => {
    const limit = Number(cardLimit);
    const currentInvoice = Number(cardInvoice) || 0;
    const closingDay = Number(cardClosingDay);
    const dueDay = Number(cardDueDay);

    if (!cardName.trim() || Number.isNaN(limit) || limit <= 0 || closingDay < 1 || closingDay > 31 || dueDay < 1 || dueDay > 31) {
      toast.error('Preencha os dados do cartão corretamente.');
      return;
    }

    addCreditCard({ name: cardName.trim(), limit, currentInvoice, closingDay, dueDay });
    setCardName('');
    setCardLimit('');
    setCardInvoice('');
    toast.success('Cartão cadastrado.');
  };

  const addAccessForm = () => {
    if (!accessName.trim() || !accessEmail.trim()) {
      toast.error('Informe nome e e-mail do acesso.');
      return;
    }

    addSharedAccess({
      name: accessName.trim(),
      email: accessEmail.trim(),
      role: accessRole.trim() || 'Colaborador',
      permission: accessPermission,
    });
    setAccessName('');
    setAccessEmail('');
    toast.success('Acesso compartilhado cadastrado.');
  };

  const exportCsv = () => {
    if (!caps.exportData) {
      toast.error('Exportação CSV está disponível a partir do plano Profissional.');
      return;
    }

    const header = 'Data,Tipo,Descricao,Categoria,Status,Valor';
    const rows = transactions.map(transaction => [
      transaction.date,
      transaction.type === 'income' ? 'Receita' : 'Despesa',
      `"${transaction.description.replace(/"/g, '""')}"`,
      transaction.category,
      transaction.paymentStatus,
      transaction.amount.toFixed(2).replace('.', ','),
    ].join(','));

    downloadFile('financeapp-transacoes.csv', [header, ...rows].join('\n'), 'text/csv;charset=utf-8');
    toast.success('Arquivo CSV gerado.');
  };

  const exportBackup = () => {
    if (!caps.exportData) {
      toast.error('Backup/exportação está disponível a partir do plano Profissional.');
      return;
    }

    const backup = {
      exportedAt: new Date().toISOString(),
      transactions,
      goals,
      budgets,
      recurringTransactions,
      creditCards,
      sharedAccesses,
    };

    downloadFile('financeapp-backup.json', JSON.stringify(backup, null, 2), 'application/json');
    toast.success('Backup JSON gerado.');
  };

  return (
    <div className="space-y-6">
      <SummaryCards />

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-950">Centro Profissional</h1>
            <p className="mt-1 text-sm text-slate-500">
              Recursos conforme o comparativo do site: Essencial (painel + metas/pagamentos); Profissional (+ orçamento, alertas,
              exportações, recorrências e cartões); Empresarial (+ multiusuários).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {caps.exportData ? (
              <>
                <Button variant="outline" className="rounded-xl" onClick={exportCsv}>
                  <Download className="h-4 w-4" /> Exportar CSV
                </Button>
                <Button className="rounded-xl bg-slate-950 hover:bg-slate-800" onClick={exportBackup}>
                  <FileJson className="h-4 w-4" /> Backup JSON
                </Button>
              </>
            ) : (
              <p className="max-w-xs text-xs text-slate-500">
                Exportação CSV e backup fazem parte do plano Profissional ou Empresarial.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
          {caps.categoryBudget ? (
            <>
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
            <WalletCards className="h-5 w-5 text-blue-700" /> Orçamento por categoria
          </h2>
          <p className="mt-1 text-sm text-slate-500">Defina limite mensal e receba alertas quando passar do percentual configurado.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={budgetCategory} onValueChange={value => setBudgetCategory(value as Category)}>
                <SelectTrigger className="rounded-xl bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Limite mensal</Label>
              <Input className="rounded-xl" type="number" value={budgetLimit} onChange={event => setBudgetLimit(event.target.value)} placeholder="1500" />
            </div>
            <div className="space-y-2">
              <Label>Alerta em %</Label>
              <Input className="rounded-xl" type="number" value={budgetAlert} onChange={event => setBudgetAlert(event.target.value)} />
            </div>
          </div>
          <Button className="mt-4 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700" onClick={addBudgetForm}>Salvar orçamento</Button>

          <div className="mt-5 space-y-3">
            {budgets.length === 0 ? <p className="text-sm text-slate-500">Nenhum orçamento cadastrado.</p> : budgets.map(budget => {
              const spent = currentMonthExpensesByCategory[budget.category] || 0;
              const used = budget.monthlyLimit ? Math.min((spent / budget.monthlyLimit) * 100, 100) : 0;
              return (
                <div key={budget.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{budget.category}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(spent)} de {formatCurrency(budget.monthlyLimit)} · alerta em {budget.alertPercentage}%</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => deleteBudget(budget.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-slate-950" style={{ width: `${used}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
            </>
          ) : (
            <PlanFeatureLock
              title="Orçamento por categoria"
              description="Defina limites mensais por categoria e acompanhe o uso em tempo real."
              upgradeHint="No comparativo do site, este recurso começa no plano Profissional."
            />
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
          {caps.smartAlerts ? (
            <>
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
            <Bell className="h-5 w-5 text-blue-700" /> Alertas inteligentes
          </h2>
          <p className="mt-1 text-sm text-slate-500">Alertas calculados com base no orçamento e nas pendências do mês.</p>

          <div className="mt-5 space-y-3">
            {budgetAlerts.map(item => (
              <div key={item.budget.id} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="font-semibold text-amber-800">{item.budget.category} perto do limite</p>
                <p className="mt-1 text-sm text-amber-700">
                  Você já usou {item.used.toFixed(0)}% do orçamento ({formatCurrency(item.spent)}).
                </p>
              </div>
            ))}
            {transactions.filter(transaction => transaction.paymentStatus !== 'paid').slice(0, 3).map(transaction => (
              <div key={transaction.id} className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="font-semibold text-blue-800">Pagamento em aberto</p>
                <p className="mt-1 text-sm text-blue-700">{transaction.description} · {formatCurrency(transaction.amount)} · {transaction.date}</p>
              </div>
            ))}
            {budgetAlerts.length === 0 && transactions.filter(transaction => transaction.paymentStatus !== 'paid').length === 0 && (
              <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">Nenhum alerta crítico no momento.</p>
            )}
          </div>
            </>
          ) : (
            <PlanFeatureLock
              title="Alertas inteligentes"
              description="Alertas de orçamento e pendências prioritárias do mês."
              upgradeHint="No comparativo do site, alertas inteligentes começam no plano Profissional."
            />
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
          {caps.professionalAutomation ? (
            <>
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
            <Repeat2 className="h-5 w-5 text-blue-700" /> Recorrências e assinaturas
          </h2>
          <p className="mt-1 text-sm text-slate-500">Cadastre aluguel, internet, academia, streaming e gere os lançamentos do mês.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input className="rounded-xl" value={recDescription} onChange={event => setRecDescription(event.target.value)} placeholder="Internet mensal" />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input className="rounded-xl" type="number" value={recAmount} onChange={event => setRecAmount(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={recType} onValueChange={value => setRecType(value as TransactionType)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="expense">Despesa</SelectItem><SelectItem value="income">Receita</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={recCategory} onValueChange={value => setRecCategory(value as Category)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dia do mês</Label>
              <Input className="rounded-xl" type="number" min="1" max="31" value={recDay} onChange={event => setRecDay(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status inicial</Label>
              <Select value={recStatus} onValueChange={value => setRecStatus(value as PaymentStatus)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="paid">Pago</SelectItem><SelectItem value="pending">Pendente</SelectItem><SelectItem value="overdue">Atrasado</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700" onClick={addRecurringForm}>Salvar recorrência</Button>
            <Button variant="outline" className="rounded-xl" onClick={generateRecurringForMonth}>Gerar lançamentos do mês</Button>
          </div>

          <div className="mt-5 space-y-3">
            {recurringTransactions.map(item => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{item.description}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(item.amount)} · dia {item.dayOfMonth} · {item.category}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => deleteRecurringTransaction(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
            </>
          ) : (
            <PlanFeatureLock
              title="Recorrências e assinaturas"
              description="Automatize lançamentos fixos e gere os valores do mês com um clique."
              upgradeHint="Este tipo de automação acompanha o plano Profissional ou Empresarial."
            />
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
          {caps.professionalAutomation ? (
            <>
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
            <CreditCard className="h-5 w-5 text-blue-700" /> Cartões e faturas
          </h2>
          <p className="mt-1 text-sm text-slate-500">Controle limite, fatura atual, fechamento e vencimento.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome do cartão</Label>
              <Input className="rounded-xl" value={cardName} onChange={event => setCardName(event.target.value)} placeholder="Nubank, Itaú..." />
            </div>
            <div className="space-y-2">
              <Label>Limite</Label>
              <Input className="rounded-xl" type="number" value={cardLimit} onChange={event => setCardLimit(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fatura atual</Label>
              <Input className="rounded-xl" type="number" value={cardInvoice} onChange={event => setCardInvoice(event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fechamento</Label>
                <Input className="rounded-xl" type="number" value={cardClosingDay} onChange={event => setCardClosingDay(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input className="rounded-xl" type="number" value={cardDueDay} onChange={event => setCardDueDay(event.target.value)} />
              </div>
            </div>
          </div>
          <Button className="mt-4 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700" onClick={addCardForm}>Salvar cartão</Button>

          <div className="mt-5 space-y-3">
            {creditCards.map(card => {
              const used = card.limit > 0 ? Math.min((card.currentInvoice / card.limit) * 100, 100) : 0;
              return (
                <div key={card.id} className="rounded-2xl bg-slate-950 p-4 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-heading text-lg font-bold">{card.name}</p>
                      <p className="text-xs text-white/55">Fecha dia {card.closingDay} · vence dia {card.dueDay}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:bg-white/10 hover:text-white" onClick={() => deleteCreditCard(card.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-4 text-sm text-white/70">Fatura: {formatCurrency(card.currentInvoice)} de {formatCurrency(card.limit)}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${used}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
            </>
          ) : (
            <PlanFeatureLock
              title="Cartões e faturas"
              description="Limite, fatura atual, dias de fechamento e vencimento."
              upgradeHint="Gestão avançada de cartões está nos planos Profissional ou Empresarial."
            />
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70 xl:col-span-2">
          {caps.multiUser ? (
            <>
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
            <Users className="h-5 w-5 text-blue-700" /> Acessos compartilhados e permissões
          </h2>
          <p className="mt-1 text-sm text-slate-500">Cadastre contador, familiar ou sócio com nível de permissão.</p>

          <div className="mt-5 grid gap-4 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-1">
              <Label>Nome</Label>
              <Input className="rounded-xl" value={accessName} onChange={event => setAccessName(event.target.value)} />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <Label>E-mail</Label>
              <Input className="rounded-xl" type="email" value={accessEmail} onChange={event => setAccessEmail(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
              <Input className="rounded-xl" value={accessRole} onChange={event => setAccessRole(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Permissão</Label>
              <Select value={accessPermission} onValueChange={value => setAccessPermission(value as AccessPermission)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Visualização">Visualização</SelectItem>
                  <SelectItem value="Edição">Edição</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700" onClick={addAccessForm}>Adicionar</Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {sharedAccesses.map(access => (
              <div key={access.id} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{access.name}</p>
                  <p className="text-xs text-slate-500">{access.email} · {access.role}</p>
                  <Badge variant="outline" className="mt-2 bg-white">{access.permission}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => deleteSharedAccess(access.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
            </>
          ) : (
            <PlanFeatureLock
              title="Multiusuários e permissões"
              description="Cadastre contador, familiar ou sócio com nível de permissão."
              upgradeHint="No comparativo do site, acessos compartilhados estão apenas no plano Empresarial."
            />
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-emerald-900">
          <ShieldCheck className="h-5 w-5" /> Backup e sincronização
        </h2>
        <p className="mt-2 text-sm leading-6 text-emerald-700">
          {caps.exportData
            ? 'Nesta versão, o backup é gerado em JSON na área superior desta página. A sincronização em nuvem pode ser ampliada em etapas futuras.'
            : 'O backup em JSON faz parte do plano Profissional ou Empresarial (exportações). Após contratar, use os botões no topo desta página.'}
        </p>
      </section>
    </div>
  );
}
