import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Github, Lock, Mail, PieChart, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const REMEMBER_EMAIL_KEY = 'fin_remember_client';

function readRememberedEmail(): string {
  try {
    return localStorage.getItem(REMEMBER_EMAIL_KEY)?.trim() ?? '';
  } catch {
    return '';
  }
}

export default function LoginScreen() {
  const { login, register, isLoading } = useUser();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(readRememberedEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => Boolean(readRememberedEmail()));

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === 'register' && !name.trim()) {
      toast.error('Informe seu nome para criar a conta.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      toast.error('Informe e-mail e senha para continuar.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      toast.error('A confirmação de senha não confere.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      if (mode === 'register') {
        await register({ name: name.trim(), email: email.trim(), password });
        toast.success('Conta criada com sucesso!');
      } else {
        await login(email.trim(), password);
        toast.success('Login realizado com sucesso!');
      }

      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível autenticar.';
      console.error('Falha na autenticação:', error);
      toast.error(message.split('\n').slice(0, 4).join('\n'));
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Entrada com ${provider} será conectada em uma próxima etapa.`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-emerald-700 px-4 py-8">
      <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[-12%] right-[-8%] h-[28rem] w-[28rem] rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] bg-white/12 shadow-2xl shadow-slate-950/40 backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden min-h-[650px] flex-col justify-between p-10 text-white xl:flex">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-xl">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-heading text-2xl font-bold">FinanceApp</h1>
                  <p className="text-sm text-white/75">Controle suas finanças com inteligência</p>
                </div>
              </div>

              <div className="mt-14 max-w-md">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white/85">
                  <ShieldCheck className="h-4 w-4" /> Login seguro com MySQL
                </p>
                <h2 className="mt-5 font-heading text-4xl font-bold leading-tight">
                  Veja seu dinheiro com clareza antes de tomar decisões.
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/75">
                  Acompanhe saldo, metas, orçamentos, pagamentos e relatórios em um painel financeiro simples e visual.
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl" role="img" aria-label="Ilustração de painel financeiro com gráficos e cartão">
              <div className="absolute -left-6 top-10 rounded-3xl bg-white/15 p-4 shadow-xl backdrop-blur">
                <TrendingUp className="h-6 w-6 text-emerald-200" />
                <p className="mt-2 text-xs text-white/70">Receitas</p>
                <p className="font-heading text-xl font-bold">+18%</p>
              </div>

              <svg viewBox="0 0 620 390" className="h-auto w-full drop-shadow-2xl">
                <defs>
                  <linearGradient id="loginCard" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
                    <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="loginAccent" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#0f766e" />
                  </linearGradient>
                </defs>
                <rect x="65" y="38" width="490" height="314" rx="34" fill="url(#loginCard)" />
                <rect x="92" y="72" width="180" height="90" rx="24" fill="url(#loginAccent)" />
                <rect x="300" y="72" width="106" height="90" rx="24" fill="#10b981" />
                <rect x="425" y="72" width="104" height="90" rx="24" fill="#f97316" />
                <rect x="112" y="95" width="70" height="8" rx="4" fill="#ffffff" opacity="0.65" />
                <rect x="112" y="122" width="118" height="18" rx="9" fill="#ffffff" opacity="0.95" />
                <path d="M114 274 C160 210, 196 250, 242 196 S340 215, 387 155 S465 180, 515 116" fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
                <path d="M114 305 C169 270, 219 286, 274 246 S372 263, 422 221 S486 229, 516 196" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" opacity="0.75" />
                <rect x="112" y="200" width="48" height="118" rx="14" fill="#0f766e" opacity="0.88" />
                <rect x="176" y="228" width="48" height="90" rx="14" fill="#2563eb" opacity="0.9" />
                <rect x="240" y="178" width="48" height="140" rx="14" fill="#06b6d4" opacity="0.9" />
                <circle cx="463" cy="247" r="58" fill="#e2e8f0" />
                <path d="M463 189 A58 58 0 0 1 518 266 L463 247 Z" fill="#2563eb" />
                <path d="M518 266 A58 58 0 0 1 424 290 L463 247 Z" fill="#10b981" />
                <path d="M424 290 A58 58 0 0 1 463 189 L463 247 Z" fill="#f97316" />
              </svg>

              <div className="absolute -right-4 bottom-6 rounded-3xl bg-white p-4 text-slate-900 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Economia/meta</p>
                    <p className="font-heading text-lg font-bold">R$ 2.265,20</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/60">© 2026 FinanceApp. Todos os direitos reservados.</p>
          </section>

          <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-8">
            <div className="w-full max-w-md">
              <div className="text-center xl:hidden">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-emerald-500 shadow-lg shadow-blue-500/25">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <h1 className="mt-4 font-heading text-2xl font-bold text-slate-950">FinanceApp</h1>
                <p className="mt-1 text-sm text-slate-500">Controle suas finanças com inteligência</p>
              </div>

              <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-200/80 xl:mt-0">
                <div className="text-center">
                  <h2 className="font-heading text-2xl font-bold text-slate-950">
                    {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {mode === 'login'
                      ? 'Entre com o usuário cadastrado no banco de dados'
                      : 'Cadastre seus dados para salvar informações no MySQL'}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  {mode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nome</Label>
                      <Input
                        id="register-name"
                        className="h-11 rounded-xl border-slate-200 bg-slate-50"
                        placeholder="Seu nome"
                        value={name}
                        onChange={event => setName(event.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="login-email"
                        type="email"
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-10"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                        onClick={() => setShowPassword(current => !current)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-10"
                          placeholder="Digite a senha novamente"
                          value={confirmPassword}
                          onChange={event => setConfirmPassword(event.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="login-remember-me"
                        checked={remember}
                        onCheckedChange={value => setRemember(value === true)}
                      />
                      <Label htmlFor="login-remember-me" className="cursor-pointer font-normal text-slate-600">
                        Lembrar-me
                      </Label>
                    </div>
                    <button type="button" className="font-medium text-blue-700 hover:text-blue-800" onClick={() => toast.info('Recuperação de senha ficará disponível com autenticação real.')}>
                      Esqueceu a senha?
                    </button>
                  </div>

                  <Button type="submit" disabled={isLoading} className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-emerald-700">
                    {isLoading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs text-slate-400">Ou continue com</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="h-10 rounded-xl border-slate-200" onClick={() => handleSocialLogin('Google')}>
                    <span className="font-bold">G</span> Google
                  </Button>
                  <Button type="button" variant="outline" className="h-10 rounded-xl border-slate-200" onClick={() => handleSocialLogin('GitHub')}>
                    <Github className="h-4 w-4" /> GitHub
                  </Button>
                </div>

                <p className="mt-5 text-center text-xs text-slate-500">
                  {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                  <button
                    type="button"
                    className="font-semibold text-blue-700 hover:text-blue-800"
                    onClick={() => {
                      setConfirmPassword('');
                      setMode(current => current === 'login' ? 'register' : 'login');
                    }}
                  >
                    {mode === 'login' ? 'Criar conta grátis' : 'Entrar'}
                  </button>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
