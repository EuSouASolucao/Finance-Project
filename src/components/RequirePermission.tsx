import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { PermissionKey } from '@/lib/permissions';
import { useEffectivePermissions } from '@/lib/permissions';

type Props = {
  permission: PermissionKey;
  children: ReactNode;
};

/** Bloqueia rota quando o perfil (plano + matriz ADM) não inclui a permissão. */
export default function RequirePermission({ permission, children }: Props) {
  const perms = useEffectivePermissions();
  if (!perms[permission]) {
    return <Navigate to="/painel/acesso-negado" replace state={{ permission }} />;
  }
  return <>{children}</>;
}
