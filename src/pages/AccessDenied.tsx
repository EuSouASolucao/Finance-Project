import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PERMISSION_CATALOG } from '@/lib/permissions';
import type { PermissionKey } from '@/lib/permissions';
import { useEffectivePermissions } from '@/lib/permissions';
import { ShieldAlert } from 'lucide-react';
import { panelPortalDarkRootClass, usePanelTheme } from '@/contexts/PanelThemeContext';
import { cn } from '@/lib/utils';

export default function AccessDenied() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = usePanelTheme();
  const perms = useEffectivePermissions();
  const requested = (location.state as { permission?: PermissionKey } | undefined)?.permission;
  const label = requested ? PERMISSION_CATALOG.find(c => c.key === requested)?.label : undefined;

  const firstAllowedPath = [
    { path: '/painel', key: 'panelDashboard' as const },
    { path: '/painel/transacoes', key: 'panelTransactions' as const },
    { path: '/painel/relatorios', key: 'panelReports' as const },
    { path: '/painel/metas', key: 'panelGoals' as const },
    { path: '/painel/pagamentos', key: 'panelPayments' as const },
    { path: '/painel/comprovantes', key: 'panelReceipts' as const },
    { path: '/painel/ia-investimentos', key: 'panelInvestmentAi' as const },
    { path: '/painel/profissional', key: 'panelProfessional' as const },
    { path: '/painel/configuracoes', key: 'panelSettings' as const },
  ].find(entry => perms[entry.key]);

  return (
    <div
      className={cn(
        panelPortalDarkRootClass(isDarkMode),
        'mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-16 text-center',
        isDarkMode ? 'text-slate-100' : 'text-slate-900',
      )}
    >
      <div
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full',
          isDarkMode ? 'bg-amber-950/60 text-amber-300' : 'bg-amber-100 text-amber-800',
        )}
      >
        <ShieldAlert className="h-8 w-8" aria-hidden />
      </div>
      <h1 className="mt-6 font-heading text-xl font-bold">Acesso não autorizado</h1>
      <p className={cn('mt-3 text-sm leading-relaxed', isDarkMode ? 'text-slate-400' : 'text-slate-600')}>
        {label
          ? `O seu perfil de plano não inclui o módulo «${label}». Contacte o administrador ou consulte os planos disponíveis.`
          : 'Não tem permissão para ver esta área do painel. As permissões são definidas pelo administrador para cada perfil de plano.'}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {firstAllowedPath ? (
          <Button type="button" className="rounded-xl" onClick={() => navigate(firstAllowedPath.path)}>
            Ir para o painel
          </Button>
        ) : null}
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate('/')}>
          Página inicial do site
        </Button>
      </div>
    </div>
  );
}
