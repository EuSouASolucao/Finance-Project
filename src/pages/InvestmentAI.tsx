import { useMemo, useState } from 'react';
import { Bot, BrainCircuit, CheckCircle2, LineChart, PiggyBank, Send, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import SummaryCards from '@/components/SummaryCards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFinance } from '@/contexts/FinanceContext';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { toast } from 'sonner';

type InvestorProfile = 'conservador' | 'moderado' | 'arrojado';
type InvestmentGoal = 'reserva' | 'renda' | 'patrimonio' | 'curto-prazo';
type Horizon = 'curto' | 'medio' | 'longo';

interface PortfolioItem {
  name: string;
  percentage: number;
  reason: string;
  color: string;
}

const profileDescription: Record<InvestorProfile, string> = {
  conservador: 'prioriza segurança, liquidez e baixa oscilação.',
  moderado: 'aceita pequenas oscilações para buscar retorno maior.',
  arrojado: 'tolera mais variação pensando no crescimento de longo prazo.',
};

const goalDescription: Record<InvestmentGoal, string> = {
  reserva: 'montar ou fortalecer a reserva de emergência.',
  renda: 'criar renda passiva recorrente.',
  patrimonio: 'aumentar patrimônio no médio e longo prazo.',
  'curto-prazo': 'guardar dinheiro para um objetivo próximo.',
};

function getPortfolio(profile: InvestorProfile, goal: InvestmentGoal, emergencyReady: boolean): PortfolioItem[] {
  if (!emergencyReady || goal === 'reserva') {
    return [
      { name: 'Tesouro Selic / CDB liquidez diária', percentage: 80, reason: 'base segura para emergência e saque rápido.', color: 'from-blue-700 to-cyan-600' },
      { name: 'Conta remunerada com FGC', percentage: 20, reason: 'complementa a liquidez sem travar o dinheiro.', color: 'from-emerald-600 to-teal-500' },
    ];
  }

  if (profile === 'conservador') {
    return [
      { name: 'Renda fixa pós-fixada', percentage: 55, reason: 'protege o capital e acompanha juros.', color: 'from-blue-700 to-cyan-600' },
      { name: 'Tesouro IPCA / CDB longo', percentage: 25, reason: 'ajuda a proteger contra inflação.', color: 'from-emerald-600 to-teal-500' },
      { name: 'Fundos imobiliários conservadores', percentage: 10, reason: 'inicia renda mensal com risco controlado.', color: 'from-slate-800 to-blue-700' },
      { name: 'Ações/ETFs', percentage: 10, reason: 'pequena exposição para crescimento.', color: 'from-teal-600 to-emerald-500' },
    ];
  }

  if (profile === 'moderado') {
    return [
      { name: 'Renda fixa estratégica', percentage: 40, reason: 'mantém estabilidade na carteira.', color: 'from-blue-700 to-cyan-600' },
      { name: 'Tesouro IPCA', percentage: 20, reason: 'foco em preservação de poder de compra.', color: 'from-emerald-600 to-teal-500' },
      { name: 'Fundos imobiliários', percentage: 20, reason: 'busca renda passiva e diversificação.', color: 'from-slate-800 to-blue-700' },
      { name: 'Ações/ETFs', percentage: 20, reason: 'potencial de valorização gradual.', color: 'from-teal-600 to-emerald-500' },
    ];
  }

  return [
    { name: 'Renda fixa de proteção', percentage: 25, reason: 'reduz oscilações e dá estabilidade.', color: 'from-blue-700 to-cyan-600' },
    { name: 'Tesouro IPCA', percentage: 15, reason: 'proteção contra inflação no longo prazo.', color: 'from-emerald-600 to-teal-500' },
    { name: 'Fundos imobiliários', percentage: 20, reason: 'renda mensal e exposição imobiliária.', color: 'from-slate-800 to-blue-700' },
    { name: 'Ações/ETFs', percentage: 40, reason: 'maior potencial de crescimento patrimonial.', color: 'from-teal-600 to-emerald-500' },
  ];
}

export default function InvestmentAI() {
  const formatCurrency = useFormatCurrency();
  const { currentBalance, monthlySummary, goals, transactions, addTransaction } = useFinance();
  const [profile, setProfile] = useState<InvestorProfile>('moderado');
  const [goal, setGoal] = useState<InvestmentGoal>('patrimonio');
  const [horizon, setHorizon] = useState<Horizon>('medio');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('Pergunte para a IA como investir melhor seu dinheiro com base no seu momento financeiro.');

  const analysis = useMemo(() => {
    const monthlyIncome = monthlySummary.totalIncome;
    const monthlyExpense = monthlySummary.totalExpense;
    const monthlyFreeCash = monthlySummary.balance;
    const savingsRate = monthlyIncome > 0 ? (monthlyFreeCash / monthlyIncome) * 100 : 0;
    const emergencyTarget = Math.max(monthlyExpense * 6, 1000);
    const emergencyProgress = emergencyTarget > 0 ? Math.min((Math.max(currentBalance, 0) / emergencyTarget) * 100, 100) : 0;
    const emergencyReady = emergencyProgress >= 100;
    const suggestedContribution = Math.max(Number(monthlyContribution) || monthlyFreeCash * 0.35, 0);
    const portfolio = getPortfolio(profile, goal, emergencyReady);

    return {
      monthlyIncome,
      monthlyExpense,
      monthlyFreeCash,
      savingsRate,
      emergencyTarget,
      emergencyProgress,
      emergencyReady,
      suggestedContribution,
      portfolio,
    };
  }, [currentBalance, goal, monthlyContribution, monthlySummary.balance, monthlySummary.totalExpense, monthlySummary.totalIncome, profile]);

  const investmentTransactions = transactions.filter(transaction => transaction.category === 'Investimentos');
  const investedThisMonth = investmentTransactions
    .filter(transaction => {
      const date = new Date(transaction.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const generateAnswer = () => {
    const lowerQuestion = question.toLowerCase();
    const emergencyMessage = analysis.emergencyReady
      ? 'Sua reserva de emergência parece estar em um nível saudável. Agora faz sentido diversificar aos poucos.'
      : `Antes de assumir muito risco, fortaleça a reserva de emergência. Meta estimada: ${formatCurrency(analysis.emergencyTarget)}.`;

    let specificTip = 'Minha sugestão é investir de forma recorrente, sem comprometer contas essenciais, e revisar sua carteira todo mês.';

    if (lowerQuestion.includes('quanto') || lowerQuestion.includes('valor')) {
      specificTip = `Pelo seu fluxo atual, um aporte prudente seria perto de ${formatCurrency(analysis.suggestedContribution)} por mês. Se o mês apertar, reduza o aporte antes de usar crédito.`;
    } else if (lowerQuestion.includes('risco') || lowerQuestion.includes('seguro')) {
      specificTip = `Para seu perfil ${profile}, mantenha a parte mais segura em renda fixa e aumente risco somente depois de proteger a reserva.`;
    } else if (lowerQuestion.includes('renda') || lowerQuestion.includes('dividendo')) {
      specificTip = 'Para renda passiva, avance com calma em fundos imobiliários e ativos pagadores, mantendo renda fixa como base de proteção.';
    } else if (lowerQuestion.includes('meta') || lowerQuestion.includes('objetivo')) {
      specificTip = goals.length
        ? `Você tem ${goals.length} meta(s) cadastrada(s). Priorize as metas com prazo mais curto antes de aumentar ativos de maior oscilação.`
        : 'Cadastre metas financeiras para a IA separar dinheiro de curto prazo, reserva e crescimento patrimonial.';
    }

    setAnswer(`${emergencyMessage} ${specificTip}`);
  };

  const registerContribution = () => {
    if (analysis.suggestedContribution <= 0) {
      toast.error('Ainda não há saldo livre suficiente para sugerir um aporte.');
      return;
    }

    addTransaction({
      type: 'expense',
      description: 'Aporte de investimento sugerido pela IA',
      amount: Number(analysis.suggestedContribution.toFixed(2)),
      category: 'Investimentos',
      date: new Date().toISOString().split('T')[0],
      paymentStatus: 'paid',
    });

    toast.success('Aporte registrado como investimento.');
  };

  return (
    <div className="space-y-6">
      <SummaryCards />

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70">
        <div className="bg-gradient-to-br from-slate-950 via-blue-900 to-emerald-700 p-6 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge className="mb-4 w-fit bg-white/15 text-white hover:bg-white/15">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> IA financeira local
              </Badge>
              <h1 className="font-heading text-2xl font-bold">Assistente de Investimentos</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50">
                Analisa seu saldo, receitas, despesas e metas para sugerir reserva de emergência, valor de aporte e uma carteira compatível com seu perfil.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-blue-50">Capacidade sugerida de aporte</p>
              <p className="mt-2 font-heading text-3xl font-bold">{formatCurrency(analysis.suggestedContribution)}</p>
              <p className="mt-1 text-xs text-blue-100">Baseada no saldo livre do mês e no valor informado.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900">Perfil do investidor</h2>
                  <p className="text-sm text-slate-500">Ajuste as respostas para a IA personalizar a recomendação.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Perfil de risco</Label>
                  <Select value={profile} onValueChange={value => setProfile(value as InvestorProfile)}>
                    <SelectTrigger className="rounded-xl bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservador">Conservador</SelectItem>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="arrojado">Arrojado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Objetivo principal</Label>
                  <Select value={goal} onValueChange={value => setGoal(value as InvestmentGoal)}>
                    <SelectTrigger className="rounded-xl bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reserva">Reserva de emergência</SelectItem>
                      <SelectItem value="curto-prazo">Objetivo de curto prazo</SelectItem>
                      <SelectItem value="renda">Renda passiva</SelectItem>
                      <SelectItem value="patrimonio">Crescimento patrimonial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prazo</Label>
                  <Select value={horizon} onValueChange={value => setHorizon(value as Horizon)}>
                    <SelectTrigger className="rounded-xl bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="curto">Até 1 ano</SelectItem>
                      <SelectItem value="medio">1 a 5 anos</SelectItem>
                      <SelectItem value="longo">Acima de 5 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Aporte mensal desejado</Label>
                  <Input
                    className="rounded-xl bg-white"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 500"
                    value={monthlyContribution}
                    onChange={event => setMonthlyContribution(event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
                Seu perfil atual é <strong>{profile}</strong>, que {profileDescription[profile]} O objetivo informado é {goalDescription[goal]} Prazo escolhido: <strong>{horizon}</strong>.
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900">Reserva de emergência</h2>
                  <p className="text-sm text-slate-500">A primeira camada antes de investir com mais risco.</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Progresso estimado</span>
                  <span className="font-semibold text-slate-900">{analysis.emergencyProgress.toFixed(0)}%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-emerald-600" style={{ width: `${analysis.emergencyProgress}%` }} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Meta de reserva</p>
                    <p className="mt-1 font-heading text-xl font-bold text-slate-900">{formatCurrency(analysis.emergencyTarget)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Investido no mês</p>
                    <p className="mt-1 font-heading text-xl font-bold text-emerald-700">{formatCurrency(investedThisMonth)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <LineChart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900">Carteira sugerida pela IA</h2>
                  <p className="text-sm text-slate-500">Distribuição educativa, sem recomendação personalizada oficial.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {analysis.portfolio.map(item => (
                  <div key={item.name} className="rounded-2xl bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-500">{item.reason}</p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{item.percentage}%</Badge>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <Button className="mt-5 w-full rounded-xl bg-slate-950 hover:bg-slate-800" onClick={registerContribution}>
                <PiggyBank className="h-4 w-4" /> Registrar aporte sugerido
              </Button>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900">Pergunte para a IA</h2>
                  <p className="text-sm text-slate-500">Receba orientação baseada nos dados atuais do painel.</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {answer}
              </div>

              <div className="mt-4 space-y-3">
                <Textarea
                  className="min-h-24 rounded-xl bg-slate-50"
                  placeholder="Ex: quanto posso investir por mês? Tenho perfil conservador, o que fazer primeiro?"
                  value={question}
                  onChange={event => setQuestion(event.target.value)}
                />
                <Button className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700" onClick={generateAnswer}>
                  <Send className="h-4 w-4" /> Analisar pergunta
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-1 h-5 w-5 text-blue-700" />
                <div>
                  <h3 className="font-heading font-bold text-blue-950">Leitura rápida da IA</h3>
                  <p className="mt-2 text-sm leading-6 text-blue-900">
                    Taxa de economia atual: <strong>{analysis.savingsRate.toFixed(1)}%</strong>. Saldo livre do mês: <strong>{formatCurrency(analysis.monthlyFreeCash)}</strong>. 
                    {analysis.monthlyFreeCash > 0 ? ' Existe espaço para investir com planejamento.' : ' No momento, priorize reduzir despesas antes de aumentar aportes.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <CheckCircle2 className="mr-2 inline h-4 w-4" />
        Esta IA é educativa e roda com os dados locais do sistema. Para recomendação oficial de investimentos, o ideal é consultar um profissional certificado.
      </div>
    </div>
  );
}
