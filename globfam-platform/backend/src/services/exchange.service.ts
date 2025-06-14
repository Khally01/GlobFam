import axios from 'axios';
import { Currency } from '@prisma/client';
import { prisma } from '../config/database';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: Date;
}

interface ConversionResult {
  from: {
    currency: Currency;
    amount: number;
  };
  to: {
    currency: Currency;
    amount: number;
  };
  rate: number;
  timestamp: Date;
}

export class ExchangeService {
  private static readonly CACHE_TTL = 3600; // 1 hour
  private static readonly API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';
  
  // Fallback rates if API is unavailable
  private static readonly FALLBACK_RATES: Record<string, Record<string, number>> = {
    USD: { USD: 1, AUD: 1.52, MNT: 3450, EUR: 0.92, GBP: 0.79 },
    AUD: { USD: 0.66, AUD: 1, MNT: 2270, EUR: 0.61, GBP: 0.52 },
    MNT: { USD: 0.00029, AUD: 0.00044, MNT: 1, EUR: 0.00027, GBP: 0.00023 },
  };

  static async getExchangeRate(from: Currency, to: Currency): Promise<number> {
    if (from === to) return 1;

    // Check cache first
    const cacheKey = `exchange:${from}:${to}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return parseFloat(cached);
    }

    try {
      // Try to get from database (recent rates)
      const dbRate = await prisma.exchangeRate.findFirst({
        where: {
          fromCurrency: from,
          toCurrency: to,
          updatedAt: {
            gte: new Date(Date.now() - this.CACHE_TTL * 1000),
          },
        },
      });

      if (dbRate) {
        const rate = Number(dbRate.rate);
        await redisClient.setEx(cacheKey, this.CACHE_TTL, rate.toString());
        return rate;
      }

      // Fetch from API
      const rate = await this.fetchFromAPI(from, to);
      
      // Store in database
      await prisma.exchangeRate.upsert({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: from,
            toCurrency: to,
          },
        },
        update: {
          rate,
          updatedAt: new Date(),
        },
        create: {
          fromCurrency: from,
          toCurrency: to,
          rate,
        },
      });

      // Cache the rate
      await redisClient.setEx(cacheKey, this.CACHE_TTL, rate.toString());
      
      return rate;
    } catch (error) {
      logger.error('Failed to get exchange rate:', error);
      
      // Use fallback rates
      return this.getFallbackRate(from, to);
    }
  }

  static async convert(amount: number, from: Currency, to: Currency): Promise<ConversionResult> {
    const rate = await this.getExchangeRate(from, to);
    const convertedAmount = amount * rate;

    return {
      from: { currency: from, amount },
      to: { currency: to, amount: convertedAmount },
      rate,
      timestamp: new Date(),
    };
  }

  static async getMultipleRates(base: Currency, targets: Currency[]): Promise<ExchangeRate[]> {
    const rates: ExchangeRate[] = [];

    // Use Promise.all for concurrent fetching
    await Promise.all(
      targets.map(async (target) => {
        const rate = await this.getExchangeRate(base, target);
        rates.push({
          from: base,
          to: target,
          rate,
          timestamp: new Date(),
        });
      })
    );

    return rates;
  }

  static async updateAllRates() {
    const currencies: Currency[] = ['USD', 'AUD', 'MNT', 'EUR', 'GBP'];
    let updated = 0;

    for (const base of currencies) {
      for (const target of currencies) {
        if (base !== target) {
          try {
            await this.getExchangeRate(base, target);
            updated++;
          } catch (error) {
            logger.error(`Failed to update rate ${base} to ${target}:`, error);
          }
        }
      }
    }

    logger.info(`Updated ${updated} exchange rates`);
    return { updated };
  }

  static async getHistoricalRates(
    from: Currency,
    to: Currency,
    days: number = 30
  ): Promise<Array<{ date: Date; rate: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rates = await prisma.exchangeRate.findMany({
      where: {
        fromCurrency: from,
        toCurrency: to,
        updatedAt: { gte: startDate },
      },
      orderBy: { updatedAt: 'asc' },
    });

    // Fill in missing days with interpolated values
    const result: Array<{ date: Date; rate: number }> = [];
    const rateMap = new Map(rates.map(r => [r.updatedAt.toDateString(), Number(r.rate)]));

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateStr = date.toDateString();
      
      const rate = rateMap.get(dateStr) || (await this.getExchangeRate(from, to));
      result.push({ date, rate });
    }

    return result;
  }

  private static async fetchFromAPI(from: Currency, to: Currency): Promise<number> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/${from}`, {
        timeout: 5000,
      });

      const rates = response.data.rates;
      const rate = rates[to];

      if (!rate) {
        throw new Error(`Rate not found for ${from} to ${to}`);
      }

      return rate;
    } catch (error: any) {
      logger.error('API fetch failed:', error.message);
      
      // Try alternative API (e.g., Fixer.io, CurrencyAPI)
      return this.fetchFromAlternativeAPI(from, to);
    }
  }

  private static async fetchFromAlternativeAPI(from: Currency, to: Currency): Promise<number> {
    // Implement alternative API if primary fails
    // For now, return fallback rate
    return this.getFallbackRate(from, to);
  }

  private static getFallbackRate(from: Currency, to: Currency): number {
    const fromRates = this.FALLBACK_RATES[from];
    if (fromRates && fromRates[to]) {
      return fromRates[to];
    }
    
    // If no direct rate, try to calculate through USD
    if (from !== 'USD' && to !== 'USD') {
      const fromToUSD = this.FALLBACK_RATES[from]?.USD || 1;
      const USDToTarget = this.FALLBACK_RATES.USD[to] || 1;
      return fromToUSD * USDToTarget;
    }
    
    return 1; // Last resort
  }

  // Helper method for frontend to get all supported currencies
  static getSupportedCurrencies() {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
      { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', flag: '🇲🇳' },
      { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
      { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    ];
  }
}