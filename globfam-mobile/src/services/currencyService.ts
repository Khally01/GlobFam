import axios from 'axios';
import { Currency } from '../types';

// Mock exchange rates (in production, use a real API)
const MOCK_RATES: { [key: string]: number } = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.0,
  CNY: 6.45,
  INR: 74.5,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  SEK: 8.5,
  NZD: 1.42,
  KRW: 1180.0,
  SGD: 1.35,
  HKD: 7.75,
  NOK: 8.8,
  MXN: 20.0,
  ZAR: 15.0,
  BRL: 5.2,
  RUB: 75.0,
  TRY: 8.5,
  MNT: 3450.0
};

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 74.5 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', rate: 0.92 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', rate: 8.5 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rate: 1.42 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1180.0 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.35 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 7.75 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', rate: 8.8 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 20.0 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 15.0 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.2 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 75.0 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 8.5 },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', rate: 3450.0 }
];

class CurrencyService {
  private apiKey: string = 'YOUR_API_KEY'; // Replace with actual API key
  private baseUrl: string = 'https://api.exchangerate-api.com/v4/latest/';
  private useRealApi: boolean = false; // Set to true when you have a real API key

  async getExchangeRates(baseCurrency: string = 'USD'): Promise<{ [key: string]: number }> {
    if (!this.useRealApi) {
      // Return mock rates converted to the base currency
      const baseRate = MOCK_RATES[baseCurrency] || 1;
      const rates: { [key: string]: number } = {};
      
      Object.keys(MOCK_RATES).forEach(currency => {
        rates[currency] = MOCK_RATES[currency] / baseRate;
      });
      
      return rates;
    }

    try {
      const response = await axios.get(`${this.baseUrl}${baseCurrency}`);
      return response.data.rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Fallback to mock rates
      return this.getExchangeRates(baseCurrency);
    }
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rates?: { [key: string]: number }): number {
    if (!rates) {
      // Use mock rates if no rates provided
      const fromRate = MOCK_RATES[fromCurrency] || 1;
      const toRate = MOCK_RATES[toCurrency] || 1;
      return (amount / fromRate) * toRate;
    }

    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    
    // Convert through USD as base
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  }

  formatCurrency(amount: number, currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (!currency) {
      return `${amount.toFixed(2)} ${currencyCode}`;
    }

    // Format based on currency conventions
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Position symbol based on currency
    if (['USD', 'CAD', 'AUD', 'NZD', 'HKD', 'SGD', 'MXN', 'BRL'].includes(currencyCode)) {
      return `${currency.symbol}${formatted}`;
    } else if (['EUR', 'GBP'].includes(currencyCode)) {
      return `${currency.symbol}${formatted}`;
    } else {
      return `${formatted} ${currency.symbol}`;
    }
  }

  getCurrencySymbol(currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  }

  getCurrencyName(currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    return currency?.name || currencyCode;
  }

  getAllCurrencies(): Currency[] {
    return SUPPORTED_CURRENCIES;
  }

  getPopularCurrencies(): Currency[] {
    const popularCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'MNT'];
    return SUPPORTED_CURRENCIES.filter(currency => popularCodes.includes(currency.code));
  }
}

export default new CurrencyService();