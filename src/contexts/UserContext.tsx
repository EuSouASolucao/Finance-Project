import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { normalizePanelCurrency } from '@/lib/currencyFormat';
import { mergePermissionsWithFallback } from '@/lib/permissionsCore';
import { ClientUser } from '@/types/user';
import { clearApiToken, financeApi, getApiToken, setApiToken } from '@/services/api';

const USER_STORAGE_KEY = 'fin_client_user';
const SESSION_STORAGE_KEY = 'fin_client_session';

/** O mesmo nome de canal deve ser usado ao guardar permissões no ADM (outro separador). */
const PROFILE_SYNC_CHANNEL = 'fincontrol_profile_sync';

/** Notifica outros separadores do mesmo browser para refetch de `/auth/me` (ex.: matriz ADM atualizada). */
export function broadcastProfileSyncRequest(): void {
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    const bc = new BroadcastChannel(PROFILE_SYNC_CHANNEL);
    bc.postMessage({ type: 'plan_permissions_updated' });
    bc.close();
  } catch {
    /* ignorar ambientes restritos */
  }
}

const defaultUser: ClientUser = {
  id: 'demo-client',
  name: 'João Dias',
  email: 'joao.dias@email.com',
  phone: '(11) 99999-0000',
  document: '000.000.000-00',
  plan: 'Sem Plano',
  role: 'user',
  preferredCurrency: 'BRL',
};

interface UserContextType {
  user: ClientUser;
  initials: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (data: ClientUser) => void;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

/** Grava utilizador sem `permissions`: a matriz vem sempre da API ou do fallback pelo nome do plano. */
function persistUserSnapshot(user: ClientUser): void {
  const { permissions: _omit, ...rest } = user;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(rest));
}

function loadUser(): ClientUser {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    const merged = stored ? ({ ...defaultUser, ...JSON.parse(stored) } as ClientUser) : defaultUser;
    const plan = (merged.plan ?? 'Sem Plano').trim() || 'Sem Plano';
    return {
      ...merged,
      plan,
      preferredCurrency: normalizePanelCurrency(merged.preferredCurrency),
      permissions: mergePermissionsWithFallback(plan, undefined),
    };
  } catch {
    return {
      ...defaultUser,
      preferredCurrency: normalizePanelCurrency(defaultUser.preferredCurrency),
      permissions: mergePermissionsWithFallback(defaultUser.plan, undefined),
    };
  }
}

function loadSession() {
  return Boolean(getApiToken());
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'CL';
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  /** Utilizador devolvido pela API — usa `permissions` do servidor (matriz efetiva por plano). */
  const normalizeApiUser = useCallback((incoming: ClientUser): ClientUser => {
    const plan = (incoming.plan ?? 'Sem Plano').trim() || 'Sem Plano';
    return {
      ...incoming,
      plan,
      preferredCurrency: normalizePanelCurrency(incoming.preferredCurrency),
      permissions: mergePermissionsWithFallback(plan, incoming.permissions ?? undefined),
    };
  }, []);

  const [user, setUser] = useState<ClientUser>(loadUser);
  const [isAuthenticated, setIsAuthenticated] = useState(loadSession);
  const [isLoading, setIsLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!getApiToken()) return;
    try {
      const { user: serverUser } = await financeApi.me();
      const synced = normalizeApiUser(serverUser);
      setUser(synced);
      persistUserSnapshot(synced);
    } catch (error) {
      console.error('Erro ao atualizar dados da sessão:', error);
    }
  }, [normalizeApiUser]);

  useEffect(() => {
    if (!getApiToken()) return;
    void refreshProfile();
  }, [refreshProfile]);

  const lastBgSyncRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated || !getApiToken()) return;

    const periodMs = 2.5 * 60 * 1000;
    const minGapMs = 20_000;

    const intervalId = window.setInterval(() => {
      void refreshProfile();
    }, periodMs);

    const maybeRefresh = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastBgSyncRef.current < minGapMs) return;
      lastBgSyncRef.current = now;
      void refreshProfile();
    };

    document.addEventListener('visibilitychange', maybeRefresh);
    window.addEventListener('focus', maybeRefresh);

    let bc: BroadcastChannel | undefined;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel(PROFILE_SYNC_CHANNEL);
        bc.onmessage = (ev: MessageEvent<{ type?: string }>) => {
          if (ev.data?.type === 'plan_permissions_updated') {
            void refreshProfile();
          }
        };
      } catch {
        bc = undefined;
      }
    }

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', maybeRefresh);
      window.removeEventListener('focus', maybeRefresh);
      bc?.close();
    };
  }, [isAuthenticated, refreshProfile]);

  const updateUser = useCallback((data: ClientUser) => {
    const plan = (data.plan ?? 'Sem Plano').trim() || 'Sem Plano';
    const next: ClientUser = {
      ...data,
      plan,
      preferredCurrency: normalizePanelCurrency(data.preferredCurrency),
      permissions: mergePermissionsWithFallback(plan, undefined),
    };
    setUser(next);
    persistUserSnapshot(next);

    if (getApiToken()) {
      void financeApi.updateUser(next).then(response => {
        const synced = normalizeApiUser(response.user);
        setUser(synced);
        persistUserSnapshot(synced);
      }).catch(error => console.error('Erro ao atualizar usuário no MySQL:', error));
    }
  }, [normalizeApiUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await financeApi.login(email, password);
      setApiToken(response.token);
      const synced = normalizeApiUser(response.user);
      setUser(synced);
      persistUserSnapshot(synced);
      localStorage.setItem(SESSION_STORAGE_KEY, 'signed-in');
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, [normalizeApiUser]);

  const register = useCallback(async (data: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await financeApi.register(data);
      setApiToken(response.token);
      const synced = normalizeApiUser(response.user);
      setUser(synced);
      persistUserSnapshot(synced);
      localStorage.setItem(SESSION_STORAGE_KEY, 'signed-in');
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, [normalizeApiUser]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    clearApiToken();
    localStorage.setItem(SESSION_STORAGE_KEY, 'signed-out');
  }, []);

  const value = useMemo(
    () => ({
      user,
      initials: getInitials(user.name),
      isAuthenticated,
      isLoading,
      updateUser,
      refreshProfile,
      login,
      register,
      logout,
    }),
    [isAuthenticated, isLoading, login, logout, refreshProfile, register, updateUser, user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
