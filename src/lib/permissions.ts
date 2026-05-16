import { useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import {
  mergePermissionsWithFallback,
  type PanelPermissions,
  type PermissionKey,
} from '@/lib/permissionsCore';

export type { PanelPermissions, PermissionKey, PlanTier } from '@/lib/permissionsCore';
export {
  PERMISSION_KEYS,
  PERMISSION_CATALOG,
  planTierFromLabel,
  fallbackPermissionsFromPlan,
  mergePermissionsWithFallback,
} from '@/lib/permissionsCore';

/** Permissões efetivas do utilizador autenticado (API + fallback por plano). */
export function useEffectivePermissions(): PanelPermissions {
  const { user } = useUser();
  return useMemo(
    () => mergePermissionsWithFallback(user.plan, user.permissions ?? undefined),
    [user.plan, user.permissions],
  );
}
