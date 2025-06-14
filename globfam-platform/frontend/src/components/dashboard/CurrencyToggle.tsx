import clsx from 'clsx';

interface CurrencyToggleProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

const currencies = [
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'AUD', symbol: '$', flag: '🇦🇺' },
  { code: 'MNT', symbol: '₮', flag: '🇲🇳' },
];

export function CurrencyToggle({ selectedCurrency, onCurrencyChange }: CurrencyToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      {currencies.map((currency) => (
        <button
          key={currency.code}
          onClick={() => onCurrencyChange(currency.code)}
          className={clsx(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
            selectedCurrency === currency.code
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <span className="mr-1">{currency.flag}</span>
          {currency.code}
        </button>
      ))}
    </div>
  );
}