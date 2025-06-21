import { PrismaClient, BankConnection } from '@prisma/client';
import axios from 'axios';
import { encrypt, decrypt } from '../../utils/crypto';
import { logger } from '../../utils/logger';

interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  accountNumber: string; // Last 4 digits only
}

interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: string;
  balance?: number;
}

interface BankProvider {
  connect(userId: string, credentials: any): Promise<{ accessToken: string; accounts: BankAccount[] }>;
  getAccounts(accessToken: string): Promise<BankAccount[]>;
  getTransactions(accessToken: string, accountId: string, from: Date, to: Date): Promise<BankTransaction[]>;
  refreshToken?(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
}

// Mock implementation for Commonwealth Bank
// In production, this would use the actual CommBank API
class CommonwealthBankProvider implements BankProvider {
  private baseUrl = process.env.COMMBANK_API_URL || 'https://api.commbank.com.au/sandbox';
  
  async connect(userId: string, credentials: { username: string; password: string }) {
    // In production, implement OAuth flow
    // This is a mock implementation
    try {
      // Simulate API call
      const mockResponse = {
        accessToken: 'mock_commbank_token_' + Date.now(),
        accounts: [
          {
            id: 'cba_acc_1',
            name: 'Smart Access',
            type: 'savings',
            balance: 5234.56,
            currency: 'AUD',
            accountNumber: '4567'
          },
          {
            id: 'cba_acc_2',
            name: 'NetBank Saver',
            type: 'savings',
            balance: 15678.90,
            currency: 'AUD',
            accountNumber: '8901'
          }
        ]
      };
      
      return mockResponse;
    } catch (error) {
      logger.error('CommBank connection error:', error);
      throw new Error('Failed to connect to Commonwealth Bank');
    }
  }
  
  async getAccounts(accessToken: string): Promise<BankAccount[]> {
    // Mock implementation
    return [
      {
        id: 'cba_acc_1',
        name: 'Smart Access',
        type: 'savings',
        balance: 5234.56,
        currency: 'AUD',
        accountNumber: '4567'
      }
    ];
  }
  
  async getTransactions(
    accessToken: string, 
    accountId: string, 
    from: Date, 
    to: Date
  ): Promise<BankTransaction[]> {
    // Mock implementation - return sample transactions
    const transactions: BankTransaction[] = [
      {
        id: 'cba_tx_1',
        date: new Date('2024-01-15'),
        description: 'Woolworths Sydney',
        amount: 125.43,
        type: 'debit',
        category: 'Groceries',
        balance: 5109.13
      },
      {
        id: 'cba_tx_2',
        date: new Date('2024-01-14'),
        description: 'Salary Payment',
        amount: 3500.00,
        type: 'credit',
        category: 'Income',
        balance: 5234.56
      },
      {
        id: 'cba_tx_3',
        date: new Date('2024-01-13'),
        description: 'Transport NSW',
        amount: 45.80,
        type: 'debit',
        category: 'Transport',
        balance: 1734.56
      }
    ];
    
    return transactions.filter(t => t.date >= from && t.date <= to);
  }
}

// Mock implementation for Khan Bank (Mongolia)
class KhanBankProvider implements BankProvider {
  private baseUrl = process.env.KHANBANK_API_URL || 'https://api.khanbank.com/sandbox';
  
  async connect(userId: string, credentials: { username: string; password: string }) {
    // Mock implementation
    try {
      const mockResponse = {
        accessToken: 'mock_khan_token_' + Date.now(),
        accounts: [
          {
            id: 'khan_acc_1',
            name: 'Current Account',
            type: 'checking',
            balance: 2500000, // MNT
            currency: 'MNT',
            accountNumber: '1234'
          },
          {
            id: 'khan_acc_2',
            name: 'Savings Account',
            type: 'savings',
            balance: 5000000, // MNT
            currency: 'MNT',
            accountNumber: '5678'
          }
        ]
      };
      
      return mockResponse;
    } catch (error) {
      logger.error('Khan Bank connection error:', error);
      throw new Error('Failed to connect to Khan Bank');
    }
  }
  
  async getAccounts(accessToken: string): Promise<BankAccount[]> {
    return [
      {
        id: 'khan_acc_1',
        name: 'Current Account',
        type: 'checking',
        balance: 2500000,
        currency: 'MNT',
        accountNumber: '1234'
      }
    ];
  }
  
  async getTransactions(
    accessToken: string, 
    accountId: string, 
    from: Date, 
    to: Date
  ): Promise<BankTransaction[]> {
    const transactions: BankTransaction[] = [
      {
        id: 'khan_tx_1',
        date: new Date('2024-01-15'),
        description: 'Nomin Supermarket',
        amount: 85000,
        type: 'debit',
        category: 'Groceries',
        balance: 2415000
      },
      {
        id: 'khan_tx_2',
        date: new Date('2024-01-10'),
        description: 'Salary Deposit',
        amount: 1500000,
        type: 'credit',
        category: 'Income',
        balance: 2500000
      }
    ];
    
    return transactions.filter(t => t.date >= from && t.date <= to);
  }
}

// Basiq provider for Australian banks (real implementation)
class BasiqProvider implements BankProvider {
  private baseUrl = 'https://au-api.basiq.io';
  private apiKey = process.env.BASIQ_API_KEY || '';
  
  async connect(userId: string, credentials: { institutionId: string; loginId: string; password: string }) {
    if (!this.apiKey) {
      throw new Error('Basiq API key not configured');
    }
    
    try {
      // Get auth token
      const authResponse = await axios.post(
        `${this.baseUrl}/token`,
        'scope=SERVER_ACCESS',
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'basiq-version': '3.0'
          }
        }
      );
      
      const serverToken = authResponse.data.access_token;
      
      // Create user consent
      const consentResponse = await axios.post(
        `${this.baseUrl}/users/${userId}/consents`,
        {
          institution: { id: credentials.institutionId },
          credentials: {
            loginId: credentials.loginId,
            password: credentials.password
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${serverToken}`,
            'Content-Type': 'application/json',
            'basiq-version': '3.0'
          }
        }
      );
      
      // Wait for connection to be established
      // In production, implement proper polling or webhooks
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Get accounts
      const accountsResponse = await axios.get(
        `${this.baseUrl}/users/${userId}/accounts`,
        {
          headers: {
            'Authorization': `Bearer ${serverToken}`,
            'basiq-version': '3.0'
          }
        }
      );
      
      const accounts = accountsResponse.data.data.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        type: acc.accountType,
        balance: acc.balance,
        currency: acc.currency,
        accountNumber: acc.accountNo.slice(-4)
      }));
      
      return {
        accessToken: serverToken,
        accounts
      };
    } catch (error: any) {
      logger.error('Basiq connection error:', error.response?.data || error);
      throw new Error('Failed to connect via Basiq');
    }
  }
  
  async getAccounts(accessToken: string): Promise<BankAccount[]> {
    // Implementation would fetch from Basiq
    return [];
  }
  
  async getTransactions(
    accessToken: string, 
    accountId: string, 
    from: Date, 
    to: Date
  ): Promise<BankTransaction[]> {
    // Implementation would fetch from Basiq
    return [];
  }
}

export class BankingService {
  private providers: Map<string, BankProvider>;
  
  constructor(private prisma: PrismaClient) {
    this.providers = new Map([
      ['commonwealth', new CommonwealthBankProvider()],
      ['khanbank', new KhanBankProvider()],
      ['basiq', new BasiqProvider()]
    ]);
  }
  
  async connectBank(
    userId: string,
    organizationId: string,
    provider: string,
    credentials: any
  ): Promise<BankConnection> {
    const bankProvider = this.providers.get(provider);
    if (!bankProvider) {
      throw new Error(`Unsupported bank provider: ${provider}`);
    }
    
    try {
      const { accessToken, accounts } = await bankProvider.connect(userId, credentials);
      
      // Store encrypted tokens
      const encryptedToken = encrypt(accessToken);
      
      // Create bank connection record
      const connection = await this.prisma.bankConnection.create({
        data: {
          provider,
          institutionName: this.getInstitutionName(provider),
          status: 'active',
          accessToken: encryptedToken,
          metadata: { accounts },
          userId,
          organizationId,
          lastSyncAt: new Date()
        }
      });
      
      // Create asset records for each account
      await Promise.all(accounts.map(account => 
        this.prisma.asset.create({
          data: {
            name: `${account.name} (${this.getInstitutionName(provider)})`,
            type: 'BANK_ACCOUNT',
            subtype: account.type,
            country: this.getCountryForProvider(provider),
            currency: account.currency,
            amount: account.balance,
            dataSource: 'BANK_SYNC',
            externalId: account.id,
            metadata: {
              bankConnectionId: connection.id,
              accountNumber: account.accountNumber
            },
            userId,
            organizationId
          }
        })
      ));
      
      return connection;
    } catch (error) {
      logger.error('Bank connection error:', error);
      throw error;
    }
  }
  
  async syncBankTransactions(
    connectionId: string,
    userId: string,
    organizationId: string
  ): Promise<{ imported: number; errors: number }> {
    const connection = await this.prisma.bankConnection.findFirst({
      where: {
        id: connectionId,
        userId,
        organizationId
      }
    });
    
    if (!connection) {
      throw new Error('Bank connection not found');
    }
    
    const provider = this.providers.get(connection.provider);
    if (!provider) {
      throw new Error('Provider not available');
    }
    
    const accessToken = decrypt(connection.accessToken!);
    const accounts = (connection.metadata as any).accounts || [];
    
    let imported = 0;
    let errors = 0;
    
    for (const account of accounts) {
      try {
        // Get linked asset
        const asset = await this.prisma.asset.findFirst({
          where: {
            externalId: account.id,
            organizationId
          }
        });
        
        if (!asset) continue;
        
        // Fetch transactions from last 30 days
        const from = new Date();
        from.setDate(from.getDate() - 30);
        const to = new Date();
        
        const transactions = await provider.getTransactions(
          accessToken,
          account.id,
          from,
          to
        );
        
        // Import transactions
        for (const tx of transactions) {
          try {
            // Check for duplicate
            const existing = await this.prisma.transaction.findFirst({
              where: {
                externalId: tx.id,
                assetId: asset.id
              }
            });
            
            if (!existing) {
              await this.prisma.transaction.create({
                data: {
                  type: tx.type === 'credit' ? 'INCOME' : 'EXPENSE',
                  category: tx.category || 'Other',
                  amount: tx.amount,
                  currency: asset.currency,
                  description: tx.description,
                  date: tx.date,
                  externalId: tx.id,
                  metadata: { balance: tx.balance },
                  assetId: asset.id,
                  userId,
                  organizationId
                }
              });
              imported++;
            }
          } catch (error) {
            errors++;
            logger.error('Transaction import error:', error);
          }
        }
        
        // Update asset balance
        if (transactions.length > 0) {
          const latestTx = transactions[0];
          if (latestTx.balance) {
            await this.prisma.asset.update({
              where: { id: asset.id },
              data: {
                amount: latestTx.balance,
                lastSyncedAt: new Date()
              }
            });
          }
        }
      } catch (error) {
        errors++;
        logger.error('Account sync error:', error);
      }
    }
    
    // Update last sync time
    await this.prisma.bankConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() }
    });
    
    return { imported, errors };
  }
  
  async disconnectBank(
    connectionId: string,
    userId: string,
    organizationId: string
  ): Promise<void> {
    const connection = await this.prisma.bankConnection.findFirst({
      where: {
        id: connectionId,
        userId,
        organizationId
      }
    });
    
    if (!connection) {
      throw new Error('Bank connection not found');
    }
    
    // Update status to disconnected
    await this.prisma.bankConnection.update({
      where: { id: connectionId },
      data: { status: 'disconnected' }
    });
  }
  
  async getBankConnections(
    userId: string,
    organizationId: string
  ): Promise<BankConnection[]> {
    return this.prisma.bankConnection.findMany({
      where: {
        userId,
        organizationId
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  private getInstitutionName(provider: string): string {
    const names: Record<string, string> = {
      commonwealth: 'Commonwealth Bank',
      khanbank: 'Khan Bank',
      basiq: 'Australian Bank'
    };
    return names[provider] || provider;
  }
  
  private getCountryForProvider(provider: string): string {
    const countries: Record<string, string> = {
      commonwealth: 'AU',
      khanbank: 'MN',
      basiq: 'AU'
    };
    return countries[provider] || 'AU';
  }
}