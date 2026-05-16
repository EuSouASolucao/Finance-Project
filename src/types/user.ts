import type { PanelCurrencyCode } from '@/lib/currencyFormat';
import type { PanelPermissions } from '@/lib/permissionsCore';

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  plan: string;
  role?: 'user' | 'admin';
  avatarUrl?: string;
  /** Moeda de exibição no painel (valores continuam armazenados como número). */
  preferredCurrency?: PanelCurrencyCode;
  /** Matriz efetiva enviada pela API (`/auth/me`) conforme perfil de plano configurado no ADM. */
  permissions?: PanelPermissions;
}
