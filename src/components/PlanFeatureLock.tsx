import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description: string;
  upgradeHint: string;
  className?: string;
};

/** Faixa quando o plano atual não inclui o recurso (espelha o comparativo da landing). */
export default function PlanFeatureLock({ title, description, upgradeHint, className }: Props) {
  const navigate = useNavigate();

  const goPlans = () => {
    navigate('/');
    window.setTimeout(() => {
      document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  };

  return (
    <div
      className={cn(
        'panel-feature-lock-island rounded-2xl border border-dashed border-zinc-400 bg-zinc-100 p-6 text-center shadow-inner',
        className,
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200">
        <Lock className="h-5 w-5 text-zinc-700" aria-hidden />
      </div>
      <h3 className="mt-4 font-heading text-base font-bold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
      <p className="mt-3 text-xs font-medium text-[#4338ca]">{upgradeHint}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-5 rounded-xl border-zinc-400 bg-zinc-50 text-zinc-900 hover:bg-zinc-200/80 hover:text-zinc-950"
        onClick={goPlans}
      >
        Ver planos no site
      </Button>
    </div>
  );
}
