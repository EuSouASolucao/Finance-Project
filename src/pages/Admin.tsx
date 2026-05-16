import { useEffect, Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Crown,
  Database,
  DollarSign,
  History,
  Landmark,
  LayoutDashboard,
  LogOut,
  Receipt,
  ReceiptText,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import LoginScreen from '@/components/LoginScreen';
import { UserProvider, broadcastProfileSyncRequest, useUser } from '@/contexts/UserContext';
import { ADMIN_ASSIGNABLE_PLANS } from '@/data/subscriptionPlans';
import {
  PAYMENT_GATEWAY_IDS,
  PAYMENT_GATEWAY_UI,
  createDefaultGateways,
  mergeGatewaysFromApi,
  type PaymentGatewaysMap,
} from '@/data/paymentGateways';
import { AdminSummary, AdminUser, AdminAuditEntry, PaymentSettingsAdmin, PlanPermissionProfile, PurchaseInvoice, financeApi } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { PERMISSION_CATALOG } from '@/lib/permissions';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/** Se o plano na base não estiver na lista padrão, mostra uma opção extra para não perder o valor atual. */
function buildAdminPlanSelectOptions(planRaw: string | undefined): { value: string; label: string }[] {
  const current = planRaw?.trim() || 'Sem Plano';
  const opts = [...ADMIN_ASSIGNABLE_PLANS];
  if (!opts.some(o => o.value === current)) {
    return [{ value: current, label: `${current} (legado)` }, ...opts];
  }
  return opts;
}

const ADMIN_AUDIT_ACTION_LABELS: Record<string, string> = {
  'payment_settings.update': 'Pagamentos / PIX',
  'plan_permissions.update': 'Matriz de permissões',
  'user.update': 'Cliente atualizado',
  'user.delete': 'Cliente removido',
  'invoice.status': 'Estado da fatura',
};

type AdminTab = 'overview' | 'finance' | 'payments' | 'users' | 'permissions' | 'audit' | 'invoices';

const NAV_ITEMS: { id: AdminTab; label: string; description: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Visão geral', description: 'Indicadores da plataforma', icon: LayoutDashboard },
  { id: 'finance', label: 'Financeiro', description: 'Receitas e faturamento', icon: DollarSign },
  { id: 'payments', label: 'Pagamentos', description: 'PIX, gateways e webhook', icon: Landmark },
  { id: 'users', label: 'Clientes', description: 'Planos e permissões', icon: Users },
  { id: 'permissions', label: 'Permissões', description: 'Perfis no painel do cliente', icon: Shield },
  { id: 'audit', label: 'Registo', description: 'Histórico de alterações ADM', icon: History },
  { id: 'invoices', label: 'Faturas', description: 'Pedidos do site', icon: ShoppingBag },
];

function InvoiceStatusBadge({ status }: { status: PurchaseInvoice['status'] }) {
  const map = {
    pending: { label: 'Pendente', className: 'border-amber-200 bg-amber-50 text-amber-900' },
    paid: { label: 'Pago', className: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
    cancelled: { label: 'Cancelado', className: 'border-red-200 bg-red-50 text-red-900' },
  };
  const cfg = map[status];
  return (
    <Badge variant="outline" className={cn('font-medium', cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

function AdminContent() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUser();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [userQuery, setUserQuery] = useState('');
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsAdmin | null>(null);
  const [pixDraft, setPixDraft] = useState('');
  const [instrDraft, setInstrDraft] = useState('');
  const [webhookEnabledDraft, setWebhookEnabledDraft] = useState(false);
  const [webhookSecretDraft, setWebhookSecretDraft] = useState('');
  const [clearWebhookSecret, setClearWebhookSecret] = useState(false);
  const [savingPayments, setSavingPayments] = useState(false);
  const [gatewaysDraft, setGatewaysDraft] = useState<PaymentGatewaysMap>(() => createDefaultGateways());
  const [permissionProfiles, setPermissionProfiles] = useState<PlanPermissionProfile[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [savingPlanKey, setSavingPlanKey] = useState<string | null>(null);
  const [auditEntries, setAuditEntries] = useState<AdminAuditEntry[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (!paymentSettings) return;
    setPixDraft(paymentSettings.pixCopyPaste);
    setInstrDraft(paymentSettings.instructionsPublic);
    setWebhookEnabledDraft(paymentSettings.webhookEnabled);
    setGatewaysDraft(mergeGatewaysFromApi(paymentSettings.gateways));
  }, [paymentSettings]);

  const balance = useMemo(() => {
    if (!summary) return 0;
    return summary.incomeTotal - summary.expenseTotal;
  }, [summary]);

  const financialStats = useMemo(() => {
    const pending = invoices.filter(invoice => invoice.status === 'pending');
    const paid = invoices.filter(invoice => invoice.status === 'paid');
    const cancelled = invoices.filter(invoice => invoice.status === 'cancelled');
    const totalInvoices = invoices.length;
    const paidTotal = paid.reduce((sum, invoice) => sum + invoice.planPrice, 0);
    const pendingTotal = pending.reduce((sum, invoice) => sum + invoice.planPrice, 0);
    const cancelledTotal = cancelled.reduce((sum, invoice) => sum + invoice.planPrice, 0);

    return {
      pending,
      paid,
      cancelled,
      totalInvoices,
      paidTotal,
      pendingTotal,
      cancelledTotal,
      averageTicket: totalInvoices ? (paidTotal + pendingTotal + cancelledTotal) / totalInvoices : 0,
      conversionRate: totalInvoices ? (paid.length / totalInvoices) * 100 : 0,
    };
  }, [invoices]);

  const invoicesByPlan = useMemo(() => {
    const grouped = invoices.reduce<Record<string, { total: number; amount: number }>>((acc, invoice) => {
      acc[invoice.planName] = acc[invoice.planName] || { total: 0, amount: 0 };
      acc[invoice.planName].total += 1;
      acc[invoice.planName].amount += invoice.planPrice;
      return acc;
    }, {});

    return Object.entries(grouped).map(([planName, data]) => ({ planName, ...data }));
  }, [invoices]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.plan || '').toLowerCase().includes(q),
    );
  }, [users, userQuery]);

  const filteredInvoices = useMemo(() => {
    const q = invoiceQuery.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      inv =>
        inv.planName.toLowerCase().includes(q) ||
        (inv.customerName || '').toLowerCase().includes(q) ||
        (inv.customerEmail || '').toLowerCase().includes(q) ||
        (inv.issuerName || '').toLowerCase().includes(q) ||
        (inv.issuerEmail || '').toLowerCase().includes(q) ||
        inv.id.toLowerCase().includes(q),
    );
  }, [invoices, invoiceQuery]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    if (activeTab !== 'invoices' && activeTab !== 'finance') return;

    const refresh = async () => {
      try {
        const invoicesResponse = await financeApi.admin.invoices();
        setInvoices(invoicesResponse.invoices);
        if (activeTab === 'finance') {
          const summaryResponse = await financeApi.admin.summary();
          setSummary(summaryResponse.summary);
        }
      } catch {
        /* ignorar falhas pontuais do poll */
      }
    };

    void refresh();
    const timer = window.setInterval(() => void refresh(), 10000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, isAdmin, activeTab]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [summaryResponse, usersResponse, invoicesResponse] = await Promise.all([
        financeApi.admin.summary(),
        financeApi.admin.users(),
        financeApi.admin.invoices(),
      ]);
      setSummary(summaryResponse.summary);
      setUsers(usersResponse.users);
      setInvoices(invoicesResponse.invoices);
      try {
        const paymentResponse = await financeApi.admin.paymentSettings();
        setPaymentSettings(paymentResponse.settings);
      } catch {
        setPaymentSettings(null);
      }
    } catch (error) {
      console.error('Erro ao carregar painel ADM:', error);
      toast.error(error instanceof Error ? error.message.split('\n')[0] : 'Não foi possível carregar o painel ADM.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      void loadAdminData();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || activeTab !== 'permissions') return;
    let cancelled = false;
    void (async () => {
      setLoadingPermissions(true);
      try {
        const response = await financeApi.admin.planPermissions.list();
        if (!cancelled) setPermissionProfiles(response.profiles);
      } catch (error) {
        console.error('Erro ao carregar matriz de permissões:', error);
        toast.error(error instanceof Error ? error.message.split('\n')[0] : 'Não foi possível carregar permissões.');
      } finally {
        if (!cancelled) setLoadingPermissions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAdmin, activeTab]);

  const loadAuditLog = async () => {
    try {
      setAuditLoading(true);
      const res = await financeApi.admin.auditLog.list({ limit: 150, offset: 0 });
      setAuditEntries(res.entries);
      setAuditTotal(res.total);
    } catch (error) {
      console.error('Erro ao carregar registo ADM:', error);
      toast.error(error instanceof Error ? error.message.split('\n')[0] : 'Não foi possível carregar o registo.');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || activeTab !== 'audit') return;
    void loadAuditLog();
  }, [isAuthenticated, isAdmin, activeTab]);

  const updateUserPermission = async (client: AdminUser, role: 'user' | 'admin', plan = client.plan) => {
    const prevRole = client.role || 'user';
    const prevPlan = client.plan?.trim() || 'Sem Plano';
    const nextPlan = (plan ?? '').trim() || 'Sem Plano';

    try {
      await financeApi.admin.updateUser(client.id, { role, plan: nextPlan });
      setUsers(current =>
        current.map(item => (item.id === client.id ? { ...item, role, plan: nextPlan } : item)),
      );

      const roleChanged = role !== prevRole;
      const planChanged = nextPlan !== prevPlan;
      toast.success(
        planChanged && roleChanged
          ? 'Plano e permissão atualizados.'
          : planChanged
            ? 'Plano do cliente atualizado.'
            : roleChanged
              ? 'Permissão atualizada.'
              : 'Usuário atualizado.',
      );
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast.error(error instanceof Error ? error.message.split('\n')[0] : 'Não foi possível atualizar o usuário.');
    }
  };

  const updateUserPlan = async (client: AdminUser, plan: string) => {
    await updateUserPermission(client, client.role || 'user', plan);
  };

  const deleteUser = async (client: AdminUser) => {
    if (client.id === user.id) {
      toast.error('Você não pode excluir o próprio usuário administrador.');
      return;
    }

    const confirmed = window.confirm(
      `Excluir o usuário ${client.name}?\n\nEssa ação remove também transações, metas, recorrências, cartões e comprovantes vinculados.`,
    );
    if (!confirmed) return;

    try {
      await financeApi.admin.deleteUser(client.id);
      setUsers(current => current.filter(item => item.id !== client.id));
      toast.success('Usuário excluído com sucesso.');
      void loadAdminData();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error(error instanceof Error ? error.message.split('\n')[0] : 'Não foi possível excluir o usuário.');
    }
  };

  const savePaymentSettings = async () => {
    try {
      setSavingPayments(true);
      const response = await financeApi.admin.updatePaymentSettings({
        pixCopyPaste: pixDraft,
        instructionsPublic: instrDraft,
        webhookEnabled: webhookEnabledDraft,
        webhookSecret: webhookSecretDraft.trim() || undefined,
        clearWebhookSecret,
        gateways: gatewaysDraft,
      });
      setPaymentSettings(response.settings);
      setWebhookSecretDraft('');
      setClearWebhookSecret(false);
      toast.success('Formas de pagamento salvas.');
    } catch (error) {
      console.error('Erro ao salvar pagamentos:', error);
      toast.error(error instanceof Error ? error.message.split('\n')[0] : 'Não foi possível salvar.');
    } finally {
      setSavingPayments(false);
    }
  };

  const savePlanPermissionProfile = async (planKey: string, permissions: PlanPermissionProfile['permissions']) => {
    try {
      setSavingPlanKey(planKey);
      const response = await financeApi.admin.planPermissions.update(planKey, permissions);
      setPermissionProfiles(prev =>
        prev.map(p => (p.planKey === response.planKey ? { planKey: response.planKey, permissions: response.permissions } : p)),
      );
      toast.success(`Permissões do perfil «${planKey}» guardadas. Outros separadores do painel atualizam em segundos; noutros dispositivos, no máximo em ~2–3 minutos ou ao voltar a este separador.`);
      broadcastProfileSyncRequest();
    } catch (error) {
      console.error('Erro ao guardar permissões:', error);
      toast.error(error instanceof Error ? error.message.split('\n')[0] : 'Não foi possível guardar as permissões.');
    } finally {
      setSavingPlanKey(null);
    }
  };

  const adminInitials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  if (!isAuthenticated) return <LoginScreen />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-900 px-4 py-10 text-white">
        <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/[0.06] p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-amber-400/40">
            <ShieldCheck className="h-7 w-7 text-amber-300" />
          </div>
          <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight">Acesso restrito</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Sua conta está ativa, mas não possui permissão de administrador. Solicite ao responsável pela base de dados ou utilize outro usuário.
          </p>
          <Separator className="my-8 bg-white/10" />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button className="rounded-xl bg-white text-slate-900 hover:bg-white/90" onClick={() => navigate('/painel')}>
              Ir ao painel <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10"
              onClick={logout}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={value => setActiveTab(value as AdminTab)} className="flex min-h-screen w-full bg-slate-50">
      {/* Sidebar — desktop */}
      <aside className="relative hidden w-[260px] shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-lg shadow-emerald-900/30">
            <Crown className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-bold text-white">FinanceApp</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Administração</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                  active ? 'bg-white/[0.08] text-white ring-1 ring-white/10' : 'hover:bg-white/[0.04] hover:text-white',
                )}
              >
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', active ? 'text-emerald-400' : 'text-slate-500')} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block truncate text-xs text-slate-500">{item.description}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900/80 p-3 ring-1 ring-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-600 text-xs font-bold text-white">
              {adminInitials || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start rounded-xl text-slate-400 hover:bg-white/5 hover:text-white"
            onClick={() => navigate('/painel')}
          >
            Painel do cliente <ArrowRight className="ml-auto h-4 w-4 opacity-70" />
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl text-red-400 hover:bg-red-950/40 hover:text-red-300"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Encerrar sessão
          </Button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
            <div className="min-w-0 lg:hidden">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <Crown className="h-4 w-4" />
                  </div>
                  <span className="font-heading text-sm font-bold text-slate-900">Admin</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/painel')}
                  className="text-xs font-semibold text-blue-700 underline-offset-2 hover:underline"
                >
                  Ir ao painel
                </button>
              </div>
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label ?? 'Painel'}
              </p>
              <h1 className="truncate font-heading text-lg font-bold text-slate-900 sm:text-xl">
                {activeTab === 'overview' && 'Indicadores consolidados'}
                {activeTab === 'finance' && 'Financeiro da plataforma'}
                {activeTab === 'payments' && 'Meios de pagamento'}
                {activeTab === 'users' && 'Base de clientes'}
                {activeTab === 'permissions' && 'Matriz por perfil de plano'}
                {activeTab === 'audit' && 'Registo de alterações'}
                {activeTab === 'invoices' && 'Faturas e checkout'}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                size="sm"
                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                disabled={isLoading || (activeTab === 'audit' && auditLoading)}
                onClick={() => {
                  if (activeTab === 'audit') void loadAuditLog();
                  else void loadAdminData();
                }}
              >
                <RefreshCw
                  className={cn(
                    'mr-2 h-4 w-4',
                    ((activeTab === 'audit' && auditLoading) || (activeTab !== 'audit' && isLoading)) && 'animate-spin',
                  )}
                />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Tabs mobile */}
          <div className="border-t border-slate-100 px-4 pb-3 pt-2 lg:hidden">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:grid-cols-3">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="rounded-lg px-2 py-2 text-[10px] font-semibold leading-tight data-[state=active]:bg-white data-[state=active]:shadow-sm sm:text-xs"
                  >
                    <Icon className="mx-auto mb-1 block h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden">{item.label.split(' ')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </header>

        <main className="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <TabsContent value="overview" className="mt-0 space-y-6 outline-none focus-visible:outline-none">
            <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="font-heading text-xl text-slate-900">Central de operações</CardTitle>
                    <CardDescription className="mt-1 max-w-2xl text-slate-600">
                      Visão executiva do uso da plataforma: cadastros, movimentações financeiras registradas e pipeline de cobrança.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 hover:bg-emerald-50">
                    Administrador autenticado
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title: 'Usuários',
                    value: summary?.totalUsers ?? '—',
                    sub: `${summary?.adminUsers ?? 0} com perfil admin`,
                    icon: Users,
                    accent: 'from-blue-600 to-blue-500',
                  },
                  {
                    title: 'Transações',
                    value: summary?.transactions ?? '—',
                    sub: 'Lançamentos na base',
                    icon: BarChart3,
                    accent: 'from-violet-600 to-violet-500',
                  },
                  {
                    title: 'Saldo agregado',
                    value: summary ? formatCurrency(balance) : '—',
                    sub: 'Receitas − despesas (todos)',
                    icon: Wallet,
                    accent: 'from-emerald-600 to-teal-500',
                  },
                  {
                    title: 'Comprovantes',
                    value: summary?.receipts ?? '—',
                    sub: `${summary?.goals ?? 0} metas cadastradas`,
                    icon: Receipt,
                    accent: 'from-amber-600 to-orange-500',
                  },
                ].map(card => (
                  <div
                    key={card.title}
                    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className={cn('absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-[0.12]', `bg-gradient-to-br ${card.accent}`)} />
                    <div className="relative flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
                        <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
                        <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
                      </div>
                      <div className={cn('rounded-xl bg-gradient-to-br p-2.5 text-white shadow-inner', card.accent)}>
                        <card.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="rounded-2xl border-slate-200/80 shadow-sm lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 font-heading text-base">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    Pipeline de faturas
                  </CardTitle>
                  <CardDescription>Resumo do checkout público e cobranças vinculadas.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-medium text-slate-500">Total no sistema</p>
                    <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{summary?.purchaseInvoices ?? 0}</p>
                    <p className="mt-2 text-xs text-slate-500">Faturas geradas</p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                    <p className="text-xs font-medium text-amber-800/80">Pendentes</p>
                    <p className="mt-1 font-heading text-2xl font-bold text-amber-950">{summary?.pendingInvoices ?? financialStats.pending.length}</p>
                    <p className="mt-2 text-xs text-amber-900/70">{formatCurrency(summary?.invoiceTotal ?? financialStats.pendingTotal)}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <p className="text-xs font-medium text-emerald-800/80">Confirmadas</p>
                    <p className="mt-1 font-heading text-2xl font-bold text-emerald-950">{summary?.paidInvoices ?? financialStats.paid.length}</p>
                    <p className="mt-2 text-xs text-emerald-900/70">{formatCurrency(summary?.paidInvoiceTotal ?? financialStats.paidTotal)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 font-heading text-base">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Distribuição por plano
                  </CardTitle>
                  <CardDescription>Participação por tipo de assinatura.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(summary?.plans ?? []).length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">Sem dados de planos.</p>
                  ) : (
                    (summary?.plans ?? []).map(plan => {
                      const pct = Math.min(100, (Number(plan.total) / Math.max(1, summary?.totalUsers ?? 1)) * 100);
                      return (
                        <div key={plan.plan} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-800">{plan.plan || 'Sem plano'}</span>
                            <span className="text-slate-500">{plan.total}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="finance" className="mt-0 space-y-6 outline-none focus-visible:outline-none">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">Financeiro administrativo</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  Receita confirmada, valores em aberto, cancelamentos e indicadores comerciais derivados das faturas do carrinho. Esta vista sincroniza automaticamente com os pagamentos confirmados pelo gateway (mesmo intervalo que a lista de faturas).
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-lg">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">Potencial (pago + pendente)</p>
                <p className="font-heading text-2xl font-bold">{formatCurrency(financialStats.paidTotal + financialStats.pendingTotal)}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: 'Receita confirmada',
                  value: formatCurrency(summary?.paidInvoiceTotal ?? financialStats.paidTotal),
                  hint: `${summary?.paidInvoices ?? financialStats.paid.length} faturas pagas`,
                  icon: DollarSign,
                  ring: 'ring-emerald-500/20',
                  bg: 'bg-emerald-50',
                  fg: 'text-emerald-900',
                },
                {
                  title: 'A receber',
                  value: formatCurrency(summary?.invoiceTotal ?? financialStats.pendingTotal),
                  hint: `${summary?.pendingInvoices ?? financialStats.pending.length} pendentes`,
                  icon: ReceiptText,
                  ring: 'ring-blue-500/20',
                  bg: 'bg-blue-50',
                  fg: 'text-blue-900',
                },
                {
                  title: 'Canceladas',
                  value: formatCurrency(summary?.cancelledInvoiceTotal ?? financialStats.cancelledTotal),
                  hint: `${summary?.cancelledInvoices ?? financialStats.cancelled.length} faturas`,
                  icon: Database,
                  ring: 'ring-red-500/20',
                  bg: 'bg-red-50',
                  fg: 'text-red-900',
                },
                {
                  title: 'Conversão',
                  value: `${financialStats.conversionRate.toFixed(0)}%`,
                  hint: `Ticket médio ${formatCurrency(financialStats.averageTicket)}`,
                  icon: TrendingUp,
                  ring: 'ring-slate-400/30',
                  bg: 'bg-slate-100',
                  fg: 'text-slate-900',
                },
              ].map(card => (
                <Card key={card.title} className={cn('rounded-2xl border-0 shadow-sm ring-1', card.ring, card.bg)}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">{card.title}</p>
                      <card.icon className={cn('h-5 w-5 opacity-80', card.fg)} />
                    </div>
                    <p className={cn('mt-4 font-heading text-2xl font-bold', card.fg)}>{card.value}</p>
                    <p className="mt-1 text-xs text-slate-600">{card.hint}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Status das faturas</CardTitle>
                  <CardDescription>Proporção por situação de cobrança.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Pagas', total: financialStats.paid.length, amount: financialStats.paidTotal, color: 'bg-emerald-500' },
                    { label: 'Pendentes', total: financialStats.pending.length, amount: financialStats.pendingTotal, color: 'bg-blue-600' },
                    { label: 'Canceladas', total: financialStats.cancelled.length, amount: financialStats.cancelledTotal, color: 'bg-red-500' },
                  ].map(item => {
                    const width = financialStats.totalInvoices ? (item.total / financialStats.totalInvoices) * 100 : 0;
                    return (
                      <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-800">{item.label}</span>
                          <span className="tabular-nums text-slate-600">
                            {item.total} {item.total === 1 ? 'fatura' : 'faturas'}
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                          <div className={cn('h-full rounded-full transition-all', item.color)} style={{ width: `${width}%` }} />
                        </div>
                        <p className="mt-2 text-xs font-medium text-slate-500">{formatCurrency(item.amount)}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Faturamento por plano</CardTitle>
                  <CardDescription>Volume gerado por tipo de pacote vendido no site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {invoicesByPlan.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                      Nenhuma fatura agrupada por plano.
                    </p>
                  ) : (
                    invoicesByPlan.map(plan => (
                      <div
                        key={plan.planName}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{plan.planName}</p>
                          <p className="text-xs text-slate-500">
                            {plan.total} {plan.total === 1 ? 'fatura' : 'faturas'}
                          </p>
                        </div>
                        <p className="font-heading text-lg font-bold text-blue-800">{formatCurrency(plan.amount)}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-0 space-y-6 outline-none focus-visible:outline-none">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">Checkout e confirmação automática</h2>
                <p className="mt-1 max-w-3xl text-sm text-slate-600">
                  PIX, links de checkout para Mercado Pago, PayPal, PagSeguro e Infiniti Pay (URLs com placeholders), e webhook HMAC para confirmar pagamento e liberar plano.
                </p>
              </div>
              <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" disabled={savingPayments} onClick={() => void savePaymentSettings()}>
                {savingPayments ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar configurações
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">PIX (painel do cliente)</CardTitle>
                  <CardDescription>Código copia e cola e texto de orientação na página &quot;Regularizar pagamento&quot;.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pix-draft">PIX copia e cola</Label>
                    <Textarea
                      id="pix-draft"
                      className="min-h-[120px] rounded-xl border-slate-200 font-mono text-xs"
                      value={pixDraft}
                      onChange={e => setPixDraft(e.target.value)}
                      placeholder="Cole aqui o payload PIX estático..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instr-draft">Instruções públicas (opcional)</Label>
                    <Textarea
                      id="instr-draft"
                      className="min-h-[88px] rounded-xl border-slate-200 text-sm"
                      value={instrDraft}
                      onChange={e => setInstrDraft(e.target.value)}
                      placeholder="Ex.: enviar comprovante por e-mail, prazo de baixa, etc."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Webhook automático</CardTitle>
                  <CardDescription>
                    POST JSON para confirmar pagamento. Útil para integrar gateways que suportam URL de callback ou scripts próprios.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Ativar confirmação por webhook</p>
                      <p className="text-xs text-slate-500">Só aceita chamadas com assinatura válida.</p>
                    </div>
                    <Switch checked={webhookEnabledDraft} onCheckedChange={setWebhookEnabledDraft} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Segredo do webhook</Label>
                    <Input
                      id="webhook-secret"
                      type="password"
                      className="rounded-xl border-slate-200"
                      value={webhookSecretDraft}
                      onChange={e => setWebhookSecretDraft(e.target.value)}
                      placeholder={paymentSettings?.webhookSecretSet ? '•••••• (informe apenas para substituir)' : 'Defina uma chave forte'}
                      autoComplete="new-password"
                    />
                    <p className="text-xs text-slate-500">
                      Estado atual: {paymentSettings?.webhookSecretSet ? 'segredo configurado' : 'sem segredo'} · ao salvar com campo vazio o segredo anterior é mantido.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3">
                    <Checkbox id="clear-wh" checked={clearWebhookSecret} onCheckedChange={v => setClearWebhookSecret(Boolean(v))} />
                    <Label htmlFor="clear-wh" className="cursor-pointer text-sm font-normal leading-snug text-amber-950">
                      Remover segredo ao salvar (desativa validação até definir um novo).
                    </Label>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">Contrato do endpoint</p>
                    <p className="mt-2 font-mono text-[11px] text-slate-600">
                      POST route <span className="font-bold">/webhooks/payment</span> · Content-Type application/json
                    </p>
                    <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-[11px] text-emerald-100">
                      {`{\n  \"invoiceId\": \"<uuid da fatura>\",\n  \"signature\": \"<HMAC-SHA256 em hexadecimal do invoiceId usando o segredo>\"\n}`}
                    </pre>
                    <p className="mt-3 text-slate-600">
                      Base da API (env):{' '}
                      <span className="break-all font-mono text-slate-800">{import.meta.env.VITE_API_URL || '— defina VITE_API_URL —'}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Gateways online</CardTitle>
                <CardDescription>
                  Mercado Pago, PayPal, PagSeguro e Infiniti Pay — URL de redirecionamento gerada pelo seu backend ou pelo painel do gateway. Use{' '}
                  <code className="rounded bg-slate-100 px-1 text-[11px]">{'{{invoiceId}}'}</code>,{' '}
                  <code className="rounded bg-slate-100 px-1 text-[11px]">{'{{invoiceIdRaw}}'}</code>,{' '}
                  <code className="rounded bg-slate-100 px-1 text-[11px]">{'{{planPrice}}'}</code>,{' '}
                  <code className="rounded bg-slate-100 px-1 text-[11px]">{'{{planName}}'}</code> na URL (substituídos na página de pagamento).
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                {PAYMENT_GATEWAY_IDS.map(id => (
                  <div key={id} className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-heading font-bold text-slate-900">{PAYMENT_GATEWAY_UI[id].title}</p>
                        <p className="mt-1 text-xs text-slate-600">{PAYMENT_GATEWAY_UI[id].subtitle}</p>
                      </div>
                      <Switch
                        checked={gatewaysDraft[id].enabled}
                        onCheckedChange={checked =>
                          setGatewaysDraft(prev => ({
                            ...prev,
                            [id]: { ...prev[id], enabled: Boolean(checked) },
                          }))
                        }
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`gateway-url-${id}`}>URL de checkout</Label>
                      <Input
                        id={`gateway-url-${id}`}
                        className="rounded-xl border-slate-200 font-mono text-xs"
                        placeholder="https://... ?ref={{invoiceIdRaw}}"
                        value={gatewaysDraft[id].checkoutUrl}
                        onChange={e =>
                          setGatewaysDraft(prev => ({
                            ...prev,
                            [id]: { ...prev[id], checkoutUrl: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-0 space-y-6 outline-none focus-visible:outline-none">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">Clientes cadastrados</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Altere o <strong className="font-semibold text-slate-800">plano de assinatura</strong> de cada cliente na coluna Plano (Sem plano, Essencial, Profissional ou Empresarial). O papel Admin/User define o acesso ao painel ADM.
                </p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar nome, e-mail ou plano..."
                  className="rounded-xl border-slate-200 pl-9"
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
              <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">Lista de usuários</p>
                  <p className="text-xs text-slate-500">{filteredUsers.length} de {users.length} exibidos</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 hover:bg-transparent">
                        <TableHead className="font-semibold text-slate-700">Cliente</TableHead>
                        <TableHead className="font-semibold text-slate-700">Plano</TableHead>
                        <TableHead className="font-semibold text-slate-700">Permissão</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Movimento</TableHead>
                        <TableHead className="min-w-[128px] text-right font-semibold text-slate-700">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(client => {
                        const planOptions = buildAdminPlanSelectOptions(client.plan);
                        const selectedPlan = client.plan?.trim() || 'Sem Plano';

                        return (
                        <TableRow key={client.id} className="border-slate-100 hover:bg-slate-50/80">
                          <TableCell className="align-middle">
                            <p className="font-semibold text-slate-900">{client.name}</p>
                            <p className="text-xs text-slate-500">{client.email}</p>
                          </TableCell>
                          <TableCell className="align-middle">
                            <Select value={selectedPlan} onValueChange={plan => updateUserPlan(client, plan)}>
                              <SelectTrigger className="h-9 min-w-[172px] rounded-xl border-slate-200">
                                <SelectValue placeholder="Plano" />
                              </SelectTrigger>
                              <SelectContent>
                                {planOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="align-middle">
                            <Select value={client.role || 'user'} onValueChange={role => updateUserPermission(client, role as 'user' | 'admin')}>
                              <SelectTrigger className="h-9 w-[120px] rounded-xl border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Usuário</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="align-middle text-right">
                            <p className="font-semibold text-slate-900">{client.transactionCount} tx</p>
                            <p className="text-xs text-slate-500">{formatCurrency(client.incomeTotal - client.expenseTotal)}</p>
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-1.5 rounded-xl border-red-200 bg-white px-3 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-slate-50"
                              disabled={client.id === user.id}
                              onClick={() => deleteUser(client)}
                              title={client.id === user.id ? 'Não é possível excluir seu próprio usuário' : 'Excluir usuário'}
                            >
                              <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                              Excluir
                            </Button>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="py-14 text-center text-slate-500">
                            Nenhum usuário encontrado para esta busca.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              <Card className="h-fit rounded-2xl border-slate-200/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-base">Distribuição por plano</CardTitle>
                  <CardDescription>Contagem na base (use &quot;Atualizar&quot; após mudar planos).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(summary?.plans ?? []).map(plan => (
                    <div key={plan.plan} className="rounded-xl border border-slate-100 bg-slate-50/90 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{plan.plan || 'Sem plano'}</p>
                        <Badge variant="secondary" className="rounded-full font-mono">
                          {plan.total}
                        </Badge>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                          style={{
                            width: `${Math.min(100, (Number(plan.total) / Math.max(1, summary?.totalUsers ?? 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {(summary?.plans ?? []).length === 0 && (
                    <p className="text-center text-sm text-slate-500">Sem distribuição registrada.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="mt-0 space-y-6 outline-none focus-visible:outline-none">
            <div className="max-w-3xl space-y-2">
              <h2 className="font-heading text-xl font-bold text-slate-900">Controlo de permissões por perfil</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Defina o que cada perfil de plano (valor gravado em <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">users.plan</code>)
                pode usar no painel do cliente e nas APIs correspondentes. Utilizadores com papel <strong>admin</strong> continuam com acesso total ao
                painel do cliente. Após guardar, convém que os clientes voltem a iniciar sessão (ou recarreguem a página).
              </p>
            </div>

            {loadingPermissions ? (
              <p className="text-sm text-slate-500">A carregar matriz de permissões…</p>
            ) : (
              <div className="grid gap-6 xl:grid-cols-2">
                {permissionProfiles.map(profile => (
                  <Card key={profile.planKey} className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/80">
                      <CardTitle className="font-heading text-lg text-slate-900">Perfil: {profile.planKey}</CardTitle>
                      <CardDescription>
                        Módulos e recursos para utilizadores com este plano (atribuído no ADM ou após fatura paga).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {['Módulos do painel', 'Recursos avançados (por plano)'].map(group => (
                        <div key={group}>
                          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{group}</p>
                          <div className="grid gap-3">
                            {PERMISSION_CATALOG.filter(row => row.group === group).map(row => (
                              <label
                                key={row.key}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:border-slate-200"
                              >
                                <Checkbox
                                  className="mt-0.5"
                                  checked={profile.permissions[row.key]}
                                  onCheckedChange={checked => {
                                    const next = checked === true;
                                    setPermissionProfiles(prev =>
                                      prev.map(p =>
                                        p.planKey === profile.planKey
                                          ? { ...p, permissions: { ...p.permissions, [row.key]: next } }
                                          : p,
                                      ),
                                    );
                                  }}
                                />
                                <span className="text-sm font-medium leading-snug text-slate-800">{row.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50/50">
                      <Button
                        type="button"
                        className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                        disabled={savingPlanKey === profile.planKey}
                        onClick={() => void savePlanPermissionProfile(profile.planKey, profile.permissions)}
                      >
                        {savingPlanKey === profile.planKey ? 'A guardar…' : 'Guardar este perfil'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="audit" className="mt-0 space-y-6 outline-none focus-visible:outline-none">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">Registo de alterações</h2>
                <p className="mt-1 max-w-3xl text-sm text-slate-600">
                  Cada linha corresponde a uma ação de administrador: alterações em pagamentos, matriz de permissões por plano, clientes (plano/papel), remoção de
                  utilizador e mudança de estado de faturas. Os detalhes em JSON incluem valores antes/depois quando aplicável (não são guardados segredos completos do
                  PIX nem o webhook).
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {auditTotal} registo(s) na base · a mostrar {auditEntries.length} (últimos 150)
                </p>
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-700">Quando</TableHead>
                      <TableHead className="font-semibold text-slate-700">Administrador</TableHead>
                      <TableHead className="font-semibold text-slate-700">Área</TableHead>
                      <TableHead className="font-semibold text-slate-700">Referência</TableHead>
                      <TableHead className="min-w-[220px] font-semibold text-slate-700">Resumo</TableHead>
                      <TableHead className="font-semibold text-slate-700">IP</TableHead>
                      <TableHead className="w-12 font-semibold text-slate-700" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLoading && auditEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-14 text-center text-slate-500">
                          A carregar registo…
                        </TableCell>
                      </TableRow>
                    ) : null}
                    {auditEntries.map(entry => (
                      <Fragment key={entry.id}>
                        <TableRow className="border-slate-100 hover:bg-slate-50/80">
                          <TableCell className="align-top text-sm text-slate-700">
                            {new Date(entry.createdAt).toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell className="align-top">
                            <p className="text-sm font-medium text-slate-900">{entry.actorEmail}</p>
                            <p className="font-mono text-[10px] text-slate-400">{entry.actorUserId.slice(0, 8)}…</p>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="outline" className="rounded-lg font-medium">
                              {ADMIN_AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top text-sm text-slate-700">
                            <span className="text-xs uppercase tracking-wide text-slate-400">{entry.entityType}</span>
                            {entry.entityId ? (
                              <p className="font-mono text-xs text-slate-800">{entry.entityId}</p>
                            ) : (
                              <p className="text-xs text-slate-400">—</p>
                            )}
                          </TableCell>
                          <TableCell className="align-top text-sm leading-snug text-slate-700">{entry.summary}</TableCell>
                          <TableCell className="align-top font-mono text-xs text-slate-600">{entry.ipAddress || '—'}</TableCell>
                          <TableCell className="align-top">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 rounded-lg"
                              aria-expanded={expandedAuditId === entry.id}
                              aria-label={expandedAuditId === entry.id ? 'Ocultar detalhes JSON' : 'Ver detalhes JSON'}
                              onClick={() => setExpandedAuditId(current => (current === entry.id ? null : entry.id))}
                            >
                              <ChevronDown
                                className={cn('h-4 w-4 transition-transform', expandedAuditId === entry.id && 'rotate-180')}
                              />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedAuditId === entry.id ? (
                          <TableRow className="border-slate-100 bg-slate-50/90 hover:bg-slate-50/90">
                            <TableCell colSpan={7} className="p-4">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Detalhes (JSON)</p>
                              <pre className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-left font-mono text-[11px] leading-relaxed text-slate-800">
                                {JSON.stringify(entry.details ?? {}, null, 2)}
                              </pre>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </Fragment>
                    ))}
                    {!auditLoading && auditEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-14 text-center text-slate-500">
                          Ainda não há registos. As próximas alterações no painel ADM aparecerão aqui.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-0 space-y-6 outline-none focus-visible:outline-none">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">Faturas do carrinho</h2>
                <p className="mt-1 text-sm text-slate-600">
                  O status é definido automaticamente quando o pagamento é confirmado (webhook dos gateways ou fluxo configurado). Esta lista atualiza sozinha a cada poucos segundos enquanto você está em Faturas ou Financeiro — use Atualizar para forçar agora.
                </p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar cliente, plano ou ID..."
                  className="rounded-xl border-slate-200 pl-9"
                  value={invoiceQuery}
                  onChange={e => setInvoiceQuery(e.target.value)}
                />
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                <span className="text-sm font-semibold text-slate-900">Todas as faturas</span>
                <span className="text-xs text-slate-500">Atualização automática a cada 10s</span>
                <Separator orientation="vertical" className="hidden h-4 sm:block" />
                <div className="flex flex-wrap gap-2">
                  <InvoiceStatusBadge status="pending" />
                  <InvoiceStatusBadge status="paid" />
                  <InvoiceStatusBadge status="cancelled" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-700">Fatura</TableHead>
                      <TableHead className="font-semibold text-slate-700">Gerado por</TableHead>
                      <TableHead className="font-semibold text-slate-700">Cliente na fatura</TableHead>
                      <TableHead className="font-semibold text-slate-700">Plano</TableHead>
                      <TableHead className="font-semibold text-slate-700">Situação</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(invoice => (
                      <TableRow key={invoice.id} className="border-slate-100 hover:bg-slate-50/80">
                        <TableCell className="align-middle">
                          <p className="font-mono text-sm font-semibold text-slate-900">#{invoice.id.slice(0, 8)}</p>
                          <p className="text-xs text-slate-500">{new Date(invoice.createdAt).toLocaleString('pt-BR')}</p>
                          {invoice.paidAt ? (
                            <p className="text-xs text-emerald-700">Pago em {new Date(invoice.paidAt).toLocaleString('pt-BR')}</p>
                          ) : null}
                        </TableCell>
                        <TableCell className="align-middle">
                          {invoice.userId ? (
                            <>
                              <p className="font-semibold text-slate-900">{invoice.issuerName || '—'}</p>
                              <p className="text-xs text-slate-500">{invoice.issuerEmail || '—'}</p>
                              <p className="text-[10px] uppercase tracking-wide text-slate-400">Conta registrada</p>
                            </>
                          ) : (
                            <p className="text-sm text-slate-500">Checkout público / sem conta</p>
                          )}
                        </TableCell>
                        <TableCell className="align-middle">
                          <p className="font-semibold text-slate-900">{invoice.customerName || 'Visitante do site'}</p>
                          <p className="text-xs text-slate-500">{invoice.customerEmail || 'Sem e-mail'}</p>
                        </TableCell>
                        <TableCell className="align-middle">
                          <p className="font-semibold text-slate-900">{invoice.planName}</p>
                          <p className="text-xs capitalize text-slate-500">{invoice.source}</p>
                        </TableCell>
                        <TableCell className="align-middle">
                          <InvoiceStatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="align-middle text-right font-heading text-lg font-bold text-blue-800">
                          {formatCurrency(invoice.planPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInvoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-14 text-center text-slate-500">
                          Nenhuma fatura encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </main>
      </div>
    </Tabs>
  );
}

export default function Admin() {
  return (
    <UserProvider>
      <AdminContent />
    </UserProvider>
  );
}
