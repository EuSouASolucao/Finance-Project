import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

interface UserProfileFormProps {
  onSaved?: () => void;
}

export default function UserProfileForm({ onSaved }: UserProfileFormProps) {
  const { user, updateUser } = useUser();
  const [form, setForm] = useState(user);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Informe pelo menos nome e e-mail.');
      return;
    }

    updateUser({
      ...user,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      document: form.document.trim(),
      plan: form.plan.trim() || 'Cliente',
      avatarUrl: form.avatarUrl?.trim(),
    });

    toast.success('Dados do cliente atualizados!');
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nome do cliente</Label>
          <Input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>CPF/CNPJ</Label>
          <Input value={form.document} onChange={event => setForm(current => ({ ...current, document: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Plano/Perfil</Label>
          <Input value={form.plan} onChange={event => setForm(current => ({ ...current, plan: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>URL do avatar</Label>
          <Input placeholder="Opcional" value={form.avatarUrl || ''} onChange={event => setForm(current => ({ ...current, avatarUrl: event.target.value }))} />
        </div>
      </div>

      <Button type="submit" className="rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 shadow-lg shadow-blue-700/20 hover:from-blue-800 hover:to-emerald-700">
        Salvar dados
      </Button>
    </form>
  );
}
