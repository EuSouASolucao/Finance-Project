export type TransactionType = 'income' | 'expense';

export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Investimentos',
  'Salário',
  'Renda Extra',
  'Contas',
  'Outros',
] as const;

export type Category = typeof CATEGORIES[number];

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: Category;
  date: string; // ISO date string
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryBudget {
  id: string;
  category: Category;
  monthlyLimit: number;
  alertPercentage: number;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  type: TransactionType;
  amount: number;
  category: Category;
  dayOfMonth: number;
  paymentStatus: PaymentStatus;
  active: boolean;
  createdAt: string;
}

export interface CreditCardAccount {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  currentInvoice: number;
  createdAt: string;
}

export type AccessPermission = 'Visualização' | 'Edição' | 'Administrador';

export interface SharedAccess {
  id: string;
  name: string;
  email: string;
  role: string;
  permission: AccessPermission;
  createdAt: string;
}
