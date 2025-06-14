import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { redisClient } from '../config/redis';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export class PlaidService {
  static async createLinkToken(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const request = {
        user: {
          client_user_id: userId,
        },
        client_name: 'GlobFam',
        products: [Products.Accounts, Products.Transactions],
        country_codes: [CountryCode.Us, CountryCode.Au], // US and Australia
        language: 'en',
        redirect_uri: process.env.PLAID_REDIRECT_URI,
      };

      const response = await plaidClient.linkTokenCreate(request);
      
      // Cache the link token
      await redisClient.setEx(
        `plaid:link:${userId}`,
        300, // 5 minutes
        response.data.link_token
      );

      logger.info(`Plaid link token created for user ${userId}`);
      
      return {
        linkToken: response.data.link_token,
        expiration: response.data.expiration,
      };
    } catch (error: any) {
      logger.error('Plaid link token creation failed:', error);
      throw new AppError('Failed to create bank connection link', 500);
    }
  }

  static async exchangePublicToken(userId: string, publicToken: string) {
    try {
      // Exchange public token for access token
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      // Get account details
      const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken,
      });

      // Store accounts in database
      for (const account of accountsResponse.data.accounts) {
        await prisma.account.create({
          data: {
            userId,
            name: account.name,
            type: this.mapPlaidAccountType(account.type),
            currency: account.balances.iso_currency_code || 'USD',
            balance: account.balances.current || 0,
            plaidAccountId: account.account_id,
            plaidAccessToken: accessToken,
          },
        });
      }

      // Fetch initial transactions
      await this.syncTransactions(userId, accessToken);

      logger.info(`Plaid accounts connected for user ${userId}`);
      
      return {
        success: true,
        accountsConnected: accountsResponse.data.accounts.length,
      };
    } catch (error: any) {
      logger.error('Plaid token exchange failed:', error);
      throw new AppError('Failed to connect bank account', 500);
    }
  }

  static async syncTransactions(userId: string, accessToken?: string) {
    try {
      // Get all Plaid-connected accounts for user
      const accounts = await prisma.account.findMany({
        where: {
          userId,
          plaidAccessToken: { not: null },
        },
      });

      if (accounts.length === 0) {
        return { synced: 0 };
      }

      let totalSynced = 0;

      for (const account of accounts) {
        const token = accessToken || account.plaidAccessToken!;
        
        // Get transactions from last 30 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const response = await plaidClient.transactionsGet({
          access_token: token,
          start_date: startDate.toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
        });

        // Process transactions
        for (const transaction of response.data.transactions) {
          // Check if transaction already exists
          const existing = await prisma.transaction.findFirst({
            where: {
              plaidTransactionId: transaction.transaction_id,
            },
          });

          if (!existing) {
            // Map category
            const categoryId = await this.findOrCreateCategory(
              transaction.category?.[0] || 'Other',
              transaction.amount > 0 ? 'EXPENSE' : 'INCOME'
            );

            await prisma.transaction.create({
              data: {
                userId,
                accountId: account.id,
                amount: Math.abs(transaction.amount),
                currency: transaction.iso_currency_code || 'USD',
                type: transaction.amount > 0 ? 'EXPENSE' : 'INCOME',
                description: transaction.name,
                date: new Date(transaction.date),
                categoryId,
                plaidTransactionId: transaction.transaction_id,
                merchantName: transaction.merchant_name,
              },
            });

            totalSynced++;
          }
        }

        // Update account balance
        const balanceResponse = await plaidClient.accountsBalanceGet({
          access_token: token,
        });

        const plaidAccount = balanceResponse.data.accounts.find(
          a => a.account_id === account.plaidAccountId
        );

        if (plaidAccount) {
          await prisma.account.update({
            where: { id: account.id },
            data: {
              balance: plaidAccount.balances.current || 0,
              lastSyncedAt: new Date(),
            },
          });
        }
      }

      logger.info(`Synced ${totalSynced} transactions for user ${userId}`);
      
      return { synced: totalSynced };
    } catch (error: any) {
      logger.error('Transaction sync failed:', error);
      throw new AppError('Failed to sync transactions', 500);
    }
  }

  static async unlinkAccount(userId: string, accountId: string) {
    try {
      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          userId,
          plaidAccessToken: { not: null },
        },
      });

      if (!account) {
        throw new AppError('Account not found or not connected via Plaid', 404);
      }

      // Remove item from Plaid
      await plaidClient.itemRemove({
        access_token: account.plaidAccessToken!,
      });

      // Update account to remove Plaid connection
      await prisma.account.update({
        where: { id: accountId },
        data: {
          plaidAccessToken: null,
          plaidAccountId: null,
        },
      });

      logger.info(`Plaid account unlinked: ${accountId}`);
      
      return { success: true };
    } catch (error: any) {
      logger.error('Plaid unlink failed:', error);
      throw new AppError('Failed to unlink bank account', 500);
    }
  }

  static async getAccountBalance(accountId: string) {
    try {
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account || !account.plaidAccessToken) {
        throw new AppError('Account not found or not connected', 404);
      }

      const response = await plaidClient.accountsBalanceGet({
        access_token: account.plaidAccessToken,
      });

      const plaidAccount = response.data.accounts.find(
        a => a.account_id === account.plaidAccountId
      );

      if (!plaidAccount) {
        throw new AppError('Plaid account not found', 404);
      }

      return {
        available: plaidAccount.balances.available,
        current: plaidAccount.balances.current,
        limit: plaidAccount.balances.limit,
        currency: plaidAccount.balances.iso_currency_code || 'USD',
      };
    } catch (error: any) {
      logger.error('Balance fetch failed:', error);
      throw new AppError('Failed to fetch account balance', 500);
    }
  }

  private static mapPlaidAccountType(plaidType: string): any {
    const typeMap: Record<string, string> = {
      'depository': 'SAVINGS',
      'checking': 'CHECKING',
      'savings': 'SAVINGS',
      'credit': 'CREDIT_CARD',
      'loan': 'LOAN',
      'investment': 'INVESTMENT',
    };

    return typeMap[plaidType.toLowerCase()] || 'OTHER';
  }

  private static async findOrCreateCategory(name: string, type: 'INCOME' | 'EXPENSE') {
    let category = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        type,
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name,
          type,
          isSystem: true,
        },
      });
    }

    return category.id;
  }
}