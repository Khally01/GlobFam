import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface WealthCardProps {
  title: string;
  amount: number;
  currency: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'amber' | 'purple';
  isPercentage?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
};

const currencySymbols: Record<string, string> = {
  USD: '$',
  AUD: 'A$',
  MNT: '₮',
  '%': '%',
};

export function WealthCard({
  title,
  amount,
  currency,
  change,
  icon: Icon,
  color,
  isPercentage = false,
}: WealthCardProps) {
  const isPositive = change >= 0;
  const symbol = currencySymbols[currency] || currency;

  const formatAmount = (value: number) => {
    if (isPercentage) {
      return `${value.toFixed(1)}${symbol}`;
    }
    return `${symbol}${value.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={clsx('p-2 rounded-lg', colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={clsx(
          'flex items-center text-sm font-medium',
          isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          {isPositive ? (
            <ArrowUpIcon className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 mr-1" />
          )}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="mt-2 text-2xl font-bold text-gray-900">{formatAmount(amount)}</p>
    </div>
  );
}