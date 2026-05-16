import BudgetOverview from '@/components/BudgetOverview';
import GoalsSection from '@/components/GoalsSection';
import SummaryCards from '@/components/SummaryCards';

export default function Goals() {
  return (
    <div className="space-y-6">
      <SummaryCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GoalsSection />
        <BudgetOverview />
      </div>
    </div>
  );
}
