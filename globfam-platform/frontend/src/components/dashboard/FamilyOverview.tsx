interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age?: number;
  avatar: string;
  personalSavings: number;
  monthlyAllowance?: number;
}

interface FamilyOverviewProps {
  currency: string;
}

const mockFamily: FamilyMember[] = [
  {
    id: '1',
    name: 'Khali',
    role: 'Mom',
    avatar: 'K',
    personalSavings: 85000,
  },
  {
    id: '2',
    name: 'Partner',
    role: 'Dad',
    avatar: 'P',
    personalSavings: 40000,
  },
  {
    id: '3',
    name: 'Emma',
    role: 'Daughter',
    age: 8,
    avatar: '👧',
    personalSavings: 850,
    monthlyAllowance: 50,
  },
  {
    id: '4',
    name: 'Sophie',
    role: 'Daughter',
    age: 4,
    avatar: '👶',
    personalSavings: 520,
    monthlyAllowance: 20,
  },
];

const currencySymbols: Record<string, string> = {
  USD: '$',
  AUD: 'A$',
  MNT: '₮',
};

export function FamilyOverview({ currency }: FamilyOverviewProps) {
  const symbol = currencySymbols[currency] || currency;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl shadow-sm border border-yellow-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Family Legacy Dashboard</h2>
        <span className="text-2xl">👨‍👩‍👧‍👦</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockFamily.map((member) => (
          <div key={member.id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mongolian-red to-australian-teal flex items-center justify-center text-white font-bold text-lg">
                {member.avatar}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">
                  {member.role} {member.age && `(${member.age}y)`}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Personal Savings</p>
                <p className="text-lg font-bold text-prosperity-green">
                  {symbol}{member.personalSavings.toLocaleString()}
                </p>
              </div>

              {member.monthlyAllowance && (
                <div>
                  <p className="text-xs text-gray-500">Monthly Allowance</p>
                  <p className="text-sm font-medium text-gray-700">
                    {symbol}{member.monthlyAllowance}
                  </p>
                </div>
              )}
            </div>

            {member.age && member.age < 18 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Money Garden</span>
                  <div className="flex space-x-1">
                    {[...Array(Math.min(Math.floor(member.personalSavings / 200), 5))].map((_, i) => (
                      <span key={i} className="text-sm">🌱</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white/50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          💡 <strong>Family Tip:</strong> Teaching kids about money early builds lifelong financial habits. 
          Consider setting savings goals together!
        </p>
      </div>
    </div>
  );
}