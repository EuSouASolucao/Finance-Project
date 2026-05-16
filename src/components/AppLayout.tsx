import { useEffect, useState } from 'react';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { PanelThemeContext } from '@/contexts/PanelThemeContext';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { Outlet } from 'react-router-dom';
import PanelNav from '@/components/PanelNav';
import TransactionForm from '@/components/TransactionForm';
import UserMenu from '@/components/UserMenu';
import LoginScreen from '@/components/LoginScreen';
import { BarChart3, Bot, BriefcaseBusiness, CreditCard, LayoutDashboard, ReceiptText, Target, Wallet, ArrowLeftRight, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffectivePermissions, type PermissionKey } from '@/lib/permissions';

const NAV_DEFINITIONS: { title: string; url: string; icon: typeof LayoutDashboard; permission: PermissionKey }[] = [
  { title: 'Dashboard', url: '/painel', icon: LayoutDashboard, permission: 'panelDashboard' },
  { title: 'Transações', url: '/painel/transacoes', icon: ArrowLeftRight, permission: 'panelTransactions' },
  { title: 'Análise', url: '/painel/relatorios', icon: BarChart3, permission: 'panelReports' },
  { title: 'Metas', url: '/painel/metas', icon: Target, permission: 'panelGoals' },
  { title: 'Pagamentos', url: '/painel/pagamentos', icon: CreditCard, permission: 'panelPayments' },
  { title: 'Comprovantes', url: '/painel/comprovantes', icon: ReceiptText, permission: 'panelReceipts' },
  { title: 'IA Investimentos', url: '/painel/ia-investimentos', icon: Bot, permission: 'panelInvestmentAi' },
  { title: 'Profissional', url: '/painel/profissional', icon: BriefcaseBusiness, permission: 'panelProfessional' },
];

function AppShell() {
  const { isAuthenticated } = useUser();
  const perms = useEffectivePermissions();
  const visibleNavItems = NAV_DEFINITIONS.filter(item => perms[item.permission]).map(({ title, url, icon }) => ({
    title,
    url,
    icon,
  }));
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('financeapp_panel_theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('financeapp_panel_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  if (!isAuthenticated) return <LoginScreen />;

  const darkPanelClass = isDarkMode
    ? [
        'dark',
        '[&_.bg-white]:!bg-slate-900',
        '[&_.bg-slate-50]:!bg-slate-800',
        '[&_.bg-slate-50\\/80]:!bg-slate-800/80',
        '[&_.bg-slate-100]:!bg-slate-800',
        '[&_.bg-white\\/90]:!bg-slate-950/90',
        '[&_.bg-blue-50]:!bg-blue-950/40',
        '[&_.bg-blue-100]:!bg-blue-950/50',
        '[&_.bg-emerald-50]:!bg-emerald-950/40',
        '[&_.bg-emerald-100]:!bg-emerald-950/50',
        '[&_.bg-amber-50]:!bg-amber-950/40',
        '[&_.bg-red-50]:!bg-red-950/35',
        '[&_.border-slate-100]:!border-slate-800',
        '[&_.border-slate-200]:!border-slate-700',
        '[&_.border-slate-300]:!border-slate-600',
        '[&_.border-dashed.border-slate-200]:!border-slate-600',
        '[&_.text-slate-950]:!text-white',
        '[&_.text-slate-900]:!text-slate-100',
        '[&_.text-slate-800]:!text-slate-200',
        '[&_.text-slate-700]:!text-slate-200',
        '[&_.text-slate-600]:!text-slate-300',
        '[&_.text-slate-500]:!text-slate-400',
        '[&_.text-blue-950]:!text-blue-100',
        '[&_.text-blue-900]:!text-blue-200',
        '[&_.text-blue-800]:!text-blue-300',
        '[&_.text-blue-700]:!text-blue-300',
        '[&_.text-emerald-950]:!text-emerald-200',
        '[&_.text-emerald-900]:!text-emerald-300',
        '[&_.text-emerald-800]:!text-emerald-300',
        '[&_.text-emerald-700]:!text-emerald-400',
        '[&_.text-emerald-600]:!text-emerald-400',
        '[&_.text-amber-950]:!text-amber-200',
        '[&_.text-amber-900]:!text-amber-200',
        '[&_.text-amber-800]:!text-amber-300',
        '[&_.text-amber-700]:!text-amber-400',
        '[&_.text-red-700]:!text-red-400',
        '[&_.text-red-600]:!text-red-400',
        /* Sombras mais discretas no escuro (sem halo azul forte). */
        '[&_.shadow-sm]:![box-shadow:0_2px_10px_-2px_rgb(0_0_0_/_0.35)]',
        '[&_.shadow-md]:![box-shadow:0_8px_20px_-6px_rgb(0_0_0_/_0.38)]',
        '[&_.shadow-lg]:![box-shadow:0_12px_28px_-10px_rgb(0_0_0_/_0.42)]',
        '[&_.shadow-xl]:![box-shadow:0_16px_36px_-14px_rgb(0_0_0_/_0.45)]',
        '[&_.shadow-2xl]:![box-shadow:0_22px_48px_-16px_rgb(0_0_0_/_0.48)]',
        '[&_.shadow-blue-700\\/20]:![box-shadow:0_10px_26px_-10px_rgb(0_0_0_/_0.38)]',
        '[&_.shadow-blue-700\\/25]:![box-shadow:0_12px_30px_-10px_rgb(0_0_0_/_0.4)]',
        '[&_.shadow-blue-900\\/20]:![box-shadow:0_10px_26px_-10px_rgb(0_0_0_/_0.4)]',
        /* Evita cartões que “pulam” para branco no hover no tema escuro */
        '[&_.hover\\:bg-white:hover]:!bg-slate-800/95',
        '[&_.hover\\:bg-slate-50:hover]:!bg-slate-800/85',
        '[&_.hover\\:bg-slate-100:hover]:!bg-slate-800/80',
        '[&_input::placeholder]:!text-slate-500',
        '[&_textarea::placeholder]:!text-slate-500',
      ].join(' ')
    : '';

  return (
    <PanelThemeContext.Provider value={{ isDarkMode }}>
      <div className={`min-h-screen w-full ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white' : 'bg-gradient-to-br from-slate-100 via-blue-50 to-emerald-50 text-slate-950'} ${darkPanelClass}`}>
      <header className={isDarkMode ? 'sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl' : 'sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl'}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-blue-700 to-emerald-600 shadow-lg shadow-blue-900/20">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className={isDarkMode ? 'font-heading text-lg font-bold leading-none text-white' : 'font-heading text-lg font-bold leading-none text-blue-800'}>FinanceApp</p>
              <p className={isDarkMode ? 'mt-1 text-xs text-slate-400' : 'mt-1 text-xs text-slate-500'}>Gerencie suas finanças de forma inteligente</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              {perms.panelTransactions ? <TransactionForm /> : null}
            </div>
            <UserMenu />
            {/* Largura fixa no fluxo: o tema expande por cima para a direita sem empurrar avatar / Nova Transação */}
            <div className="relative z-10 h-9 w-9 shrink-0 overflow-visible">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDarkMode(current => !current)}
                aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
                title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
                className={cn(
                  'group absolute left-0 top-0 flex h-9 !justify-start gap-0 overflow-hidden rounded-full border p-0 shadow-sm transition-[width,min-width,gap,padding] duration-300 ease-out',
                  'w-9 min-w-9 hover:w-[148px] hover:min-w-[148px] hover:gap-1.5 hover:pl-1 hover:pr-3',
                  'focus-visible:w-[148px] focus-visible:min-w-[148px] focus-visible:gap-1.5 focus-visible:pl-1 focus-visible:pr-3',
                  isDarkMode
                    ? 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:text-white focus-visible:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50',
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold opacity-0 transition-[max-width,opacity] duration-300 ease-out',
                    'group-hover:max-w-[7.5rem] group-hover:opacity-100 group-focus-visible:max-w-[7.5rem] group-focus-visible:opacity-100',
                  )}
                >
                  {isDarkMode ? 'Modo claro' : 'Modo escuro'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <PanelNav items={visibleNavItems} isDarkMode={isDarkMode} />

        <div className="mb-5 sm:hidden">
          {perms.panelTransactions ? <TransactionForm /> : null}
        </div>

        <main>
          <Outlet />
        </main>
      </div>
      </div>
    </PanelThemeContext.Provider>
  );
}

export default function AppLayout() {
  return (
    <UserProvider>
      <FinanceProvider>
        <AppShell />
      </FinanceProvider>
    </UserProvider>
  );
}
