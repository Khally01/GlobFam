import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  CurrencyDollarIcon, 
  TrendingUpIcon, 
  BanknotesIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { CurrencyToggle } from '@/components/dashboard/CurrencyToggle';
import { WealthCard } from '@/components/dashboard/WealthCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { FamilyOverview } from '@/components/dashboard/FamilyOverview';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Mock data - in real app, this would come from API
  const stats = {
    totalWealth: 125000,
    monthlyIncome: 4250,
    monthlyExpenses: 3200,
    savingsRate: 24.7,
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <CurrencyToggle
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <WealthCard
            title="Total Family Wealth"
            amount={stats.totalWealth}
            currency={selectedCurrency}
            change={12.5}
            icon={CurrencyDollarIcon}
            color="blue"
          />
          <WealthCard
            title="Monthly Income"
            amount={stats.monthlyIncome}
            currency={selectedCurrency}
            change={8.2}
            icon={TrendingUpIcon}
            color="green"
          />
          <WealthCard
            title="Monthly Expenses"
            amount={stats.monthlyExpenses}
            currency={selectedCurrency}
            change={-3.1}
            icon={BanknotesIcon}
            color="amber"
          />
          <WealthCard
            title="Savings Rate"
            amount={stats.savingsRate}
            currency="%"
            change={2.3}
            icon={ChartBarIcon}
            color="purple"
            isPercentage
          />
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Transactions - 2 columns */}
          <div className="lg:col-span-2">
            <RecentTransactions currency={selectedCurrency} />
          </div>

          {/* Goal Progress - 1 column */}
          <div>
            <GoalProgress currency={selectedCurrency} />
          </div>
        </div>

        {/* Family Overview */}
        <div className="mt-8">
          <FamilyOverview currency={selectedCurrency} />
        </div>
      </div>
    </div>
  );
}