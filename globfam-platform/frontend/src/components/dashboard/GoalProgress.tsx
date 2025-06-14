interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color: string;
}

interface GoalProgressProps {
  currency: string;
}

const mockGoals: Goal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 15000,
    currentAmount: 11250,
    targetDate: '2024-06-30',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'Kids Education',
    targetAmount: 50000,
    currentAmount: 28500,
    targetDate: '2026-12-31',
    color: 'bg-green-500',
  },
  {
    id: '3',
    name: 'Family Vacation',
    targetAmount: 8000,
    currentAmount: 3200,
    targetDate: '2024-12-31',
    color: 'bg-amber-500',
  },
  {
    id: '4',
    name: 'Home Renovation',
    targetAmount: 25000,
    currentAmount: 5000,
    targetDate: '2025-06-30',
    color: 'bg-purple-500',
  },
];

const currencySymbols: Record<string, string> = {
  USD: '$',
  AUD: 'A$',
  MNT: '₮',
};

export function GoalProgress({ currency }: GoalProgressProps) {
  const symbol = currencySymbols[currency] || currency;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Goal Progress</h2>
      <div className="space-y-4">
        {mockGoals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = Math.ceil(
            (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{goal.name}</h3>
                  <p className="text-xs text-gray-500">{daysLeft} days left</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {symbol}{goal.currentAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    of {symbol}{goal.targetAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${goal.color} transition-all duration-300`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 text-right">{progress.toFixed(0)}%</p>
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <a href="/goals" className="text-sm font-medium text-globfam-blue hover:underline">
          Manage goals →
        </a>
      </div>
    </div>
  );
}