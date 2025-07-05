import { Progress } from '@/components/ui/progress'

interface CurrencyItem {
  currency: string
  amount: number
  usdEquivalent: number
  percentage: number
  flag: string
}

interface CurrencyPortfolioProps {
  currencies: CurrencyItem[]
  totalUSD: number
}

export function CurrencyPortfolio({ currencies, totalUSD }: CurrencyPortfolioProps) {
  return (
    <div className="bg-white rounded-2xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Multi-Currency Portfolio</h3>
        <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
          {currencies.length} Currencies
        </span>
      </div>
      
      <div className="space-y-4">
        {currencies.map((currency) => (
          <div key={currency.currency} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currency.flag}</span>
                <div>
                  <p className="font-semibold">
                    ${currency.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{currency.currency}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${currency.usdEquivalent.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{currency.percentage}%</p>
              </div>
            </div>
            <Progress 
              value={currency.percentage} 
              className="h-2"
            />
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">Total USD Equivalent</p>
          <p className="text-xl font-bold">${totalUSD.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}