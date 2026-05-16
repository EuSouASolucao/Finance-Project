import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { financeApi, getApiToken, isApiConfigured } from '@/services/api';
import { useUser } from '@/contexts/UserContext';
import { mergePermissionsWithFallback } from '@/lib/permissionsCore';
import { toast } from 'sonner';
import {
  Category,
  CategoryBudget,
  CreditCardAccount,
  FinancialGoal,
  MonthlySummary,
  PaymentStatus,
  RecurringTransaction,
  SharedAccess,
  Transaction,
  TransactionType,
} from '@/types/finance';

interface Filters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: Category | '';
  type?: TransactionType | '';
}

interface FinanceContextType {
  transactions: Transaction[];
  goals: FinancialGoal[];
  budgets: CategoryBudget[];
  recurringTransactions: RecurringTransaction[];
  creditCards: CreditCardAccount[];
  sharedAccesses: SharedAccess[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  deleteTransaction: (id: string) => void;
  updateTransactionStatus: (id: string, status: PaymentStatus) => void;
  addGoal: (g: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  addBudget: (budget: Omit<CategoryBudget, 'id' | 'createdAt'>) => void;
  deleteBudget: (id: string) => void;
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void;
  deleteRecurringTransaction: (id: string) => void;
  addCreditCard: (card: Omit<CreditCardAccount, 'id' | 'createdAt'>) => void;
  deleteCreditCard: (id: string) => void;
  addSharedAccess: (access: Omit<SharedAccess, 'id' | 'createdAt'>) => void;
  deleteSharedAccess: (id: string) => void;
  filteredTransactions: Transaction[];
  currentBalance: number;
  monthlySummary: MonthlySummary;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

const PLAN_MSG_PROFISSIONAL =
  'Esta função faz parte do plano Profissional ou Empresarial, como no comparativo do site.';
const PLAN_MSG_EMPRESARIAL = 'Multiusuários e permissões estão disponíveis apenas no plano Empresarial.';

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useUser();
  const caps = useMemo(
    () => mergePermissionsWithFallback(user.plan, user.permissions ?? undefined),
    [user.plan, user.permissions],
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('fin_transactions', []));
  const [goals, setGoals] = useState<FinancialGoal[]>(() => loadFromStorage('fin_goals', []));
  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => loadFromStorage('fin_budgets', []));
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(() => loadFromStorage('fin_recurring_transactions', []));
  const [creditCards, setCreditCards] = useState<CreditCardAccount[]>(() => loadFromStorage('fin_credit_cards', []));
  const [sharedAccesses, setSharedAccesses] = useState<SharedAccess[]>(() => loadFromStorage('fin_shared_accesses', []));
  const [filters, setFilters] = useState<Filters>({});

  const persist = useCallback((key: string, data: unknown) => saveToStorage(key, data), []);

  useEffect(() => {
    if (!isApiConfigured()) return;

    if (!isAuthenticated || !getApiToken()) {
      setTransactions([]);
      setGoals([]);
      setBudgets([]);
      setRecurringTransactions([]);
      setCreditCards([]);
      setSharedAccesses([]);
      return;
    }

    void (async () => {
      try {
        const [
          transactionsResponse,
          goalsResponse,
          budgetsResponse,
          recurringResponse,
          cardsResponse,
          accessesResponse,
        ] = await Promise.all([
          financeApi.transactions.list(),
          financeApi.goals.list(),
          financeApi.budgets.list(),
          financeApi.recurringTransactions.list(),
          financeApi.creditCards.list(),
          financeApi.sharedAccesses.list(),
        ]);

        setTransactions(transactionsResponse.transactions);
        setGoals(goalsResponse.goals);
        setBudgets(budgetsResponse.budgets);
        setRecurringTransactions(recurringResponse.recurringTransactions);
        setCreditCards(cardsResponse.creditCards);
        setSharedAccesses(accessesResponse.sharedAccesses);
      } catch (error) {
        console.error('Erro ao carregar dados do MySQL:', error);
      }
    })();
  }, [isAuthenticated]);

  /** Com API ativa, não mantemos no estado dados que o plano atual não permite ver (espelha o backend). */
  useEffect(() => {
    if (!isAuthenticated || !isApiConfigured() || !getApiToken()) return;
    if (!caps.categoryBudget) setBudgets([]);
    if (!caps.professionalAutomation) {
      setRecurringTransactions([]);
      setCreditCards([]);
    }
    if (!caps.multiUser) setSharedAccesses([]);
  }, [isAuthenticated, caps.categoryBudget, caps.professionalAutomation, caps.multiUser]);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (isApiConfigured() && getApiToken()) {
      const response = await financeApi.transactions.create(t);
      setTransactions(prev => [response.transaction, ...prev]);
      return response.transaction;
    }

    const transaction = { ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setTransactions(prev => {
      const next = [transaction, ...prev];
      persist('fin_transactions', next);
      return next;
    });
    return transaction;
  }, [persist]);

  const deleteTransaction = useCallback((id: string) => {
    if (isApiConfigured() && getApiToken()) {
      void financeApi.transactions.remove(id).then(() => {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }).catch(error => console.error('Erro ao remover transação no MySQL:', error));
      return;
    }

    setTransactions(prev => {
      const next = prev.filter(t => t.id !== id);
      persist('fin_transactions', next);
      return next;
    });
  }, [persist]);

  const updateTransactionStatus = useCallback((id: string, status: PaymentStatus) => {
    if (isApiConfigured() && getApiToken()) {
      void financeApi.transactions.updateStatus(id, status).then(response => {
        setTransactions(prev => prev.map(t => t.id === id ? response.transaction : t));
      }).catch(error => console.error('Erro ao atualizar status no MySQL:', error));
      return;
    }

    setTransactions(prev => {
      const next = prev.map(t => t.id === id ? { ...t, paymentStatus: status } : t);
      persist('fin_transactions', next);
      return next;
    });
  }, [persist]);

  const addGoal = useCallback((g: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    if (isApiConfigured() && getApiToken()) {
      void financeApi.goals.create(g).then(response => {
        setGoals(prev => [response.goal, ...prev]);
      }).catch(error => console.error('Erro ao salvar meta no MySQL:', error));
      return;
    }

    setGoals(prev => {
      const next = [{ ...g, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...prev];
      persist('fin_goals', next);
      return next;
    });
  }, [persist]);

  const updateGoalProgress = useCallback((id: string, amount: number) => {
    if (isApiConfigured() && getApiToken()) {
      void financeApi.goals.updateProgress(id, amount).then(response => {
        setGoals(prev => prev.map(g => g.id === id ? response.goal : g));
      }).catch(error => console.error('Erro ao atualizar meta no MySQL:', error));
      return;
    }

    setGoals(prev => {
      const next = prev.map(g => g.id === id ? { ...g, currentAmount: amount } : g);
      persist('fin_goals', next);
      return next;
    });
  }, [persist]);

  const deleteGoal = useCallback((id: string) => {
    if (isApiConfigured() && getApiToken()) {
      void financeApi.goals.remove(id).then(() => {
        setGoals(prev => prev.filter(g => g.id !== id));
      }).catch(error => console.error('Erro ao remover meta no MySQL:', error));
      return;
    }

    setGoals(prev => {
      const next = prev.filter(g => g.id !== id);
      persist('fin_goals', next);
      return next;
    });
  }, [persist]);

  const addBudget = useCallback((budget: Omit<CategoryBudget, 'id' | 'createdAt'>) => {
    if (!caps.categoryBudget) {
      toast.error(PLAN_MSG_PROFISSIONAL);
      return;
    }

    if (isApiConfigured() && getApiToken()) {
      void financeApi.budgets.create(budget).then(response => {
        setBudgets(prev => [response.budget, ...prev.filter(item => item.category !== response.budget.category)]);
      }).catch(error => console.error('Erro ao salvar orçamento no MySQL:', error));
      return;
    }

    setBudgets(prev => {
      const withoutSameCategory = prev.filter(item => item.category !== budget.category);
      const next = [{ ...budget, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...withoutSameCategory];
      persist('fin_budgets', next);
      return next;
    });
  }, [caps.categoryBudget, persist]);

  const deleteBudget = useCallback((id: string) => {
    if (isApiConfigured() && getApiToken()) {
      void financeApi.budgets.remove(id).then(() => {
        setBudgets(prev => prev.filter(item => item.id !== id));
      }).catch(error => console.error('Erro ao remover orçamento no MySQL:', error));
      return;
    }

    setBudgets(prev => {
      const next = prev.filter(item => item.id !== id);
      persist('fin_budgets', next);
      return next;
    });
  }, [persist]);

  const addRecurringTransaction = useCallback((recurring: Omit<RecurringTransaction, 'id' | 'createdAt'>) => {
    if (!caps.professionalAutomation) {
      toast.error(PLAN_MSG_PROFISSIONAL);
      return;
    }

    if (isApiConfigured() && getApiToken()) {
      void financeApi.recurringTransactions.create(recurring).then(response => {
        setRecurringTransactions(prev => [response.recurringTransaction, ...prev]);
      }).catch(error => console.error('Erro ao salvar recorrência no MySQL:', error));
      return;
    }

    setRecurringTransactions(prev => {
      const next = [{ ...recurring, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...prev];
      persist('fin_recurring_transactions', next);
      return next;
    });
  }, [caps.professionalAutomation, persist]);

  const deleteRecurringTransaction = useCallback((id: string) => {
    if (isApiConfigured() && getApiToken()) {
      void financeApi.recurringTransactions.remove(id).then(() => {
        setRecurringTransactions(prev => prev.filter(item => item.id !== id));
      }).catch(error => console.error('Erro ao remover recorrência no MySQL:', error));
      return;
    }

    setRecurringTransactions(prev => {
      const next = prev.filter(item => item.id !== id);
      persist('fin_recurring_transactions', next);
      return next;
    });
  }, [persist]);

  const addCreditCard = useCallback((card: Omit<CreditCardAccount, 'id' | 'createdAt'>) => {
    if (!caps.professionalAutomation) {
      toast.error(PLAN_MSG_PROFISSIONAL);
      return;
    }

    if (isApiConfigured() && getApiToken()) {
      void financeApi.creditCards.create(card).then(response => {
        setCreditCards(prev => [response.creditCard, ...prev]);
      }).catch(error => console.error('Erro ao salvar cartão no MySQL:', error));
      return;
    }

    setCreditCards(prev => {
      const next = [{ ...card, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...prev];
      persist('fin_credit_cards', next);
      return next;
    });
  }, [caps.professionalAutomation, persist]);

  const deleteCreditCard = useCallback((id: string) => {
    if (isApiConfigured() && getApiToken()) {
      void financeApi.creditCards.remove(id).then(() => {
        setCreditCards(prev => prev.filter(item => item.id !== id));
      }).catch(error => console.error('Erro ao remover cartão no MySQL:', error));
      return;
    }

    setCreditCards(prev => {
      const next = prev.filter(item => item.id !== id);
      persist('fin_credit_cards', next);
      return next;
    });
  }, [persist]);

  const addSharedAccess = useCallback((access: Omit<SharedAccess, 'id' | 'createdAt'>) => {
    if (!caps.multiUser) {
      toast.error(PLAN_MSG_EMPRESARIAL);
      return;
    }

    if (isApiConfigured() && getApiToken()) {
      void financeApi.sharedAccesses.create(access).then(response => {
        setSharedAccesses(prev => [response.sharedAccess, ...prev]);
      }).catch(error => console.error('Erro ao salvar acesso no MySQL:', error));
      return;
    }

    setSharedAccesses(prev => {
      const next = [{ ...access, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...prev];
      persist('fin_shared_accesses', next);
      return next;
    });
  }, [caps.multiUser, persist]);

  const deleteSharedAccess = useCallback((id: string) => {
    if (isApiConfigured() && getApiToken()) {
      void financeApi.sharedAccesses.remove(id).then(() => {
        setSharedAccesses(prev => prev.filter(item => item.id !== id));
      }).catch(error => console.error('Erro ao remover acesso no MySQL:', error));
      return;
    }

    setSharedAccesses(prev => {
      const next = prev.filter(item => item.id !== id);
      persist('fin_shared_accesses', next);
      return next;
    });
  }, [persist]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const query = filters.query?.trim().toLowerCase();
      if (query && !`${t.description} ${t.category}`.toLowerCase().includes(query)) return false;
      if (filters.type && t.type !== filters.type) return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.dateFrom && t.date < filters.dateFrom) return false;
      if (filters.dateTo && t.date > filters.dateTo) return false;
      return true;
    });
  }, [transactions, filters]);

  const currentBalance = useMemo(() => {
    return transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  const monthlySummary = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const totalIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [transactions]);

  return (
    <FinanceContext.Provider value={{
      transactions, goals, budgets, recurringTransactions, creditCards, sharedAccesses, filters, setFilters,
      addTransaction, deleteTransaction, updateTransactionStatus,
      addGoal, updateGoalProgress, deleteGoal,
      addBudget, deleteBudget,
      addRecurringTransaction, deleteRecurringTransaction,
      addCreditCard, deleteCreditCard,
      addSharedAccess, deleteSharedAccess,
      filteredTransactions, currentBalance, monthlySummary,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
