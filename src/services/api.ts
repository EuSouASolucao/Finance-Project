import { CategoryBudget, CreditCardAccount, FinancialGoal, RecurringTransaction, SharedAccess, Transaction } from '@/types/finance';
import type { PaymentGatewaysMap } from '@/data/paymentGateways';
import type { PanelPermissions } from '@/lib/permissionsCore';
import { ClientUser } from '@/types/user';

const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'financeapp_api_token';

type RequestOptions = RequestInit & {
  auth?: boolean;
  /** Parâmetros GET adicionais (ex.: limit/offset junto de `route=` no index.php). */
  query?: Record<string, string | number | undefined>;
};

export interface AdminUser extends ClientUser {
  createdAt: string;
  transactionCount: number;
  incomeTotal: number;
  expenseTotal: number;
}

export interface AdminSummary {
  totalUsers: number;
  adminUsers: number;
  transactions: number;
  incomeTotal: number;
  expenseTotal: number;
  goals: number;
  recurringTransactions: number;
  receipts: number;
  purchaseInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  cancelledInvoices: number;
  invoiceTotal: number;
  paidInvoiceTotal: number;
  cancelledInvoiceTotal: number;
  plans: Array<{ plan: string; total: number }>;
}

export interface PurchaseInvoice {
  id: string;
  planName: string;
  planPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  userId?: string | null;
  issuerName?: string;
  issuerEmail?: string;
  status: 'pending' | 'paid' | 'cancelled';
  source: string;
  createdAt: string;
  paidAt?: string | null;
}

export interface PaymentSettingsPublic {
  pixCopyPaste: string;
  instructionsPublic: string;
  gateways: PaymentGatewaysMap;
}

export interface PaymentSettingsAdmin extends PaymentSettingsPublic {
  webhookEnabled: boolean;
  webhookSecretSet: boolean;
}

export interface PlanPermissionProfile {
  planKey: string;
  permissions: PanelPermissions;
}

export interface AdminAuditEntry {
  id: string;
  actorUserId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

function compactResponse(text: string) {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

export function isApiConfigured() {
  return Boolean(API_URL);
}

export function getApiToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setApiToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearApiToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('VITE_API_URL não configurada.');
  }

  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = options.auth !== false ? getApiToken() : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const separator = API_URL.includes('?') ? '&' : '?';
  const authQuery = token ? `&auth_token=${encodeURIComponent(token)}` : '';

  const queryPairs = options.query ? Object.entries(options.query).filter(([, v]) => v !== undefined && v !== '') : [];
  const extraQs =
    queryPairs.length > 0
      ? new URLSearchParams(queryPairs.map(([k, v]) => [k, String(v)])).toString()
      : '';

  let url: string;
  if (API_URL.includes('index.php')) {
    url = `${API_URL}${separator}route=${encodeURIComponent(normalizedPath)}${authQuery}`;
    if (extraQs) url += `&${extraQs}`;
  } else {
    url = `${API_URL}${normalizedPath}`;
    if (extraQs) url += `${normalizedPath.includes('?') ? '&' : '?'}${extraQs}`;
  }

  let response: Response;
  try {
    const { auth: _omitAuth, query: _omitQuery, ...fetchInit } = options;
    response = await fetch(url, {
      ...fetchInit,
      credentials: options.credentials || 'same-origin',
      headers,
    });
  } catch (error) {
    throw new Error(
      `Falha ao acessar a API.
URL: ${url}
Método: ${options.method || 'GET'}
Origem: ${window.location.origin}
Detalhe: ${error instanceof Error ? error.message : 'Erro de rede desconhecido'}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  let data: { message?: string } = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { message: response.ok ? undefined : undefined };
  }

  if (!response.ok) {
    const detail = compactResponse(responseText);
    const message = [
      data.message || `API retornou erro HTTP ${response.status}.`,
      `URL: ${url}`,
      `Método: ${options.method || 'GET'}`,
      `Status: ${response.status} ${response.statusText}`,
      detail ? `Resposta: ${detail}` : 'Resposta: vazia',
    ].join('\n');

    console.error('Erro detalhado da API:', {
      url,
      method: options.method || 'GET',
      status: response.status,
      statusText: response.statusText,
      responseText,
    });

    throw new Error(message);
  }

  return data as T;
}

export const financeApi = {
  health: () => apiRequest<{ status: string; database: string }>('/health', { auth: false }),
  me: () => apiRequest<{ user: ClientUser }>('/auth/me'),
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: ClientUser }>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: { name: string; email: string; password: string }) =>
    apiRequest<{ token: string; user: ClientUser }>('/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(payload),
    }),
  updateUser: (payload: ClientUser) =>
    apiRequest<{ user: ClientUser }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  transactions: {
    list: () => apiRequest<{ transactions: Transaction[] }>('/transactions'),
    create: (payload: unknown) => apiRequest<{ transaction: Transaction }>('/transactions', { method: 'POST', body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/transactions/${id}`, { method: 'DELETE' }),
    updateStatus: (id: string, status: string) =>
      apiRequest<{ transaction: Transaction }>(`/transactions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  goals: {
    list: () => apiRequest<{ goals: FinancialGoal[] }>('/goals'),
    create: (payload: unknown) => apiRequest<{ goal: FinancialGoal }>('/goals', { method: 'POST', body: JSON.stringify(payload) }),
    updateProgress: (id: string, currentAmount: number) =>
      apiRequest<{ goal: FinancialGoal }>(`/goals/${id}/progress`, { method: 'PATCH', body: JSON.stringify({ currentAmount }) }),
    remove: (id: string) => apiRequest(`/goals/${id}`, { method: 'DELETE' }),
  },
  budgets: {
    list: () => apiRequest<{ budgets: CategoryBudget[] }>('/budgets'),
    create: (payload: unknown) => apiRequest<{ budget: CategoryBudget }>('/budgets', { method: 'POST', body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/budgets/${id}`, { method: 'DELETE' }),
  },
  recurringTransactions: {
    list: () => apiRequest<{ recurringTransactions: RecurringTransaction[] }>('/recurring-transactions'),
    create: (payload: unknown) => apiRequest<{ recurringTransaction: RecurringTransaction }>('/recurring-transactions', { method: 'POST', body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/recurring-transactions/${id}`, { method: 'DELETE' }),
  },
  creditCards: {
    list: () => apiRequest<{ creditCards: CreditCardAccount[] }>('/credit-cards'),
    create: (payload: unknown) => apiRequest<{ creditCard: CreditCardAccount }>('/credit-cards', { method: 'POST', body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/credit-cards/${id}`, { method: 'DELETE' }),
  },
  sharedAccesses: {
    list: () => apiRequest<{ sharedAccesses: SharedAccess[] }>('/shared-accesses'),
    create: (payload: unknown) => apiRequest<{ sharedAccess: SharedAccess }>('/shared-accesses', { method: 'POST', body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest(`/shared-accesses/${id}`, { method: 'DELETE' }),
  },
  receipts: {
    create: (payload: FormData) => apiRequest<{ id: string }>('/receipts', { method: 'POST', body: payload }),
  },
  checkout: {
    createInvoice: (payload: { planName: string; planPrice: number; customerName?: string; customerEmail?: string; customerPhone?: string }) =>
      apiRequest<{ invoice: PurchaseInvoice }>('/checkout/invoices', { method: 'POST', auth: false, body: JSON.stringify(payload) }),
  },
  paymentSettings: {
    public: () =>
      apiRequest<{ settings: PaymentSettingsPublic }>('/payment-settings/public', {
        auth: false,
      }),
  },
  billing: {
    invoices: () => apiRequest<{ invoices: PurchaseInvoice[] }>('/billing/invoices'),
    invoice: (id: string) => apiRequest<{ invoice: PurchaseInvoice }>(`/billing/invoices/${encodeURIComponent(id)}`),
    createInvoice: (payload: { planName: string; planPrice: number; customerName?: string; customerEmail?: string; customerPhone?: string }) =>
      apiRequest<{ invoice: PurchaseInvoice }>('/billing/invoices', { method: 'POST', body: JSON.stringify(payload) }),
  },
  admin: {
    summary: () => apiRequest<{ summary: AdminSummary }>('/admin/summary'),
    users: () => apiRequest<{ users: AdminUser[] }>('/admin/users'),
    invoices: () => apiRequest<{ invoices: PurchaseInvoice[] }>('/admin/invoices'),
    updateInvoiceStatus: (id: string, status: 'pending' | 'paid' | 'cancelled') =>
      apiRequest<{ invoice: PurchaseInvoice }>(`/admin/invoices/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    updateUser: (id: string, payload: { role: 'user' | 'admin'; plan: string }) =>
      apiRequest<{ user: ClientUser }>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    deleteUser: (id: string) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
    paymentSettings: () => apiRequest<{ settings: PaymentSettingsAdmin }>('/admin/payment-settings'),
    updatePaymentSettings: (payload: {
      pixCopyPaste?: string;
      instructionsPublic?: string;
      webhookEnabled?: boolean;
      webhookSecret?: string;
      clearWebhookSecret?: boolean;
      gateways?: PaymentGatewaysMap;
    }) =>
      apiRequest<{ settings: PaymentSettingsAdmin }>('/admin/payment-settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    planPermissions: {
      list: () => apiRequest<{ profiles: PlanPermissionProfile[] }>('/admin/plan-permissions'),
      update: (planKey: string, permissions: Partial<PanelPermissions>) =>
        apiRequest<PlanPermissionProfile>('/admin/plan-permissions', {
          method: 'PATCH',
          body: JSON.stringify({ planKey, permissions }),
        }),
    },
    auditLog: {
      list: (params?: { limit?: number; offset?: number }) =>
        apiRequest<{ entries: AdminAuditEntry[]; total: number; limit: number; offset: number }>('/admin/audit-log', {
          query: {
            limit: params?.limit ?? 100,
            offset: params?.offset ?? 0,
          },
        }),
    },
  },
};
