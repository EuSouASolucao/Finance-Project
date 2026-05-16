import { Coins, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserProfileForm from '@/components/UserProfileForm';
import { useUser } from '@/contexts/UserContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { PANEL_CURRENCY_OPTIONS, normalizePanelCurrency } from '@/lib/currencyFormat';

export default function Settings() {
  const { user, initials, logout, updateUser } = useUser();
  const formatCurrency = useFormatCurrency();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-emerald-600 text-lg font-bold text-white shadow-lg shadow-blue-700/20">
              {initials}
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-slate-950">Configurações do Cliente</h1>
              <p className="mt-1 text-sm text-slate-500">{user.name} · {user.plan}</p>
              <p className="mt-1 text-xs text-slate-400">Valores em exemplo: {formatCurrency(1234.56)}</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={logout}>
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="mb-5">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
              <UserRound className="h-5 w-5 text-blue-700" /> Dados cadastrais
            </h2>
            <p className="mt-1 text-sm text-slate-500">Essas informações ficam salvas neste navegador e sincronizam com o servidor quando a API está configurada.</p>
          </div>
          <UserProfileForm />
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
              <Coins className="h-5 w-5 text-amber-600" /> Moeda do painel
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Escolha como os valores aparecem no seu painel (saldo, transações, metas, relatórios). Os dados continuam armazenados como números; só mudam o símbolo e o formato regional.
            </p>
            <div className="mt-5 space-y-2">
              <Label htmlFor="currency-select">Moeda padrão</Label>
              <Select
                value={normalizePanelCurrency(user.preferredCurrency)}
                onValueChange={value => {
                  updateUser({ ...user, preferredCurrency: normalizePanelCurrency(value) });
                  toast.success('Moeda de exibição atualizada.');
                }}
              >
                <SelectTrigger id="currency-select" className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PANEL_CURRENCY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> Sessão local
            </h2>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                <p className="mt-1 font-semibold text-emerald-600">Cliente logado</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Armazenamento</p>
                <p className="mt-1">Perfil (incluindo moeda), metas e transações usam este navegador; com API ativa, o perfil também é gravado no servidor.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
