import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

interface RecentTransactionsProps {
  currency: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Salary Deposit',
    category: 'Income',
    amount: 4250,
    type: 'income',
    date: '2024-01-15',
  },
  {
    id: '2',
    description: 'Woolworths',
    category: 'Groceries',
    amount: 187.50,
    type: 'expense',
    date: '2024-01-14',
  },
  {
    id: '3',
    description: 'School Fees - Term 1',
    category: 'Education',
    amount: 1200,
    type: 'expense',
    date: '2024-01-12',
  },
  {
    id: '4',
    description: 'Investment Dividend',
    category: 'Investment',
    amount: 325,
    type: 'income',
    date: '2024-01-10',
  },
  {
    id: '5',
    description: 'Electricity Bill',
    category: 'Utilities',
    amount: 245.80,
    type: 'expense',
    date: '2024-01-08',
  },
];

const currencySymbols: Record<string, string> = {
  USD: '$',
  AUD: 'A$',
  MNT: '₮',
};

export function RecentTransactions({ currency }: RecentTransactionsProps) {
  const symbol = currencySymbols[currency] || currency;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={clsx(
                      'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    )}>
                      {transaction.type === 'income' ? (
                        <ArrowDownIcon className="h-4 w-4" />
                      ) : (
                        <ArrowUpIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {transaction.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className={clsx(
                  'px-6 py-4 whitespace-nowrap text-sm font-medium text-right',
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                )}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {symbol}{transaction.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-6 border-t border-gray-200">
        <a href="/transactions" className="text-sm font-medium text-globfam-blue hover:underline">
          View all transactions →
        </a>
      </div>
    </div>
  );
}