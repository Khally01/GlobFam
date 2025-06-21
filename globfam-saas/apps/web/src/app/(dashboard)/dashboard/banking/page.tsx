'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  RefreshCw, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import ConnectBankDialog from './ConnectBankDialog';

interface BankConnection {
  id: string;
  provider: string;
  institutionName: string;
  status: 'active' | 'disconnected' | 'error';
  lastSyncAt: string;
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    accountNumber: string;
  }>;
}

interface SupportedBank {
  id: string;
  name: string;
  logo: string;
  country: string;
  authType: string;
  status: 'available' | 'coming_soon';
}

export default function BankingPage() {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [supportedBanks, setSupportedBanks] = useState<SupportedBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState<SupportedBank | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [connectionsRes, banksRes] = await Promise.all([
        fetch('/api/banking/connections', { headers }),
        fetch('/api/banking/supported-banks', { headers })
      ]);

      if (!connectionsRes.ok || !banksRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const connectionsData = await connectionsRes.json();
      const banksData = await banksRes.json();

      setConnections(connectionsData.connections);
      setSupportedBanks(banksData.banks);
    } catch (error) {
      console.error('Error fetching banking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncing(connectionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/banking/sync/${connectionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to sync');
      }

      const result = await response.json();
      alert(`Sync completed! Imported: ${result.imported} transactions`);
      
      // Refresh connections
      await fetchData();
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync bank transactions');
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this bank account?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/banking/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      // Refresh connections
      await fetchData();
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('Failed to disconnect bank account');
    }
  };

  const handleConnect = (bank: SupportedBank) => {
    setSelectedBank(bank);
    setShowConnectDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Disconnected</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bank Connections</h1>
        <p className="text-muted-foreground">
          Connect your bank accounts to automatically import transactions
        </p>
      </div>

      {/* Connected Banks */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Banks</CardTitle>
          <CardDescription>
            Your active bank connections and their sync status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bank accounts connected yet</p>
              <Button 
                className="mt-4"
                onClick={() => setShowConnectDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Connect Your First Bank
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div 
                  key={connection.id} 
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">{connection.institutionName}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getStatusIcon(connection.status)}
                          {getStatusBadge(connection.status)}
                          <span>•</span>
                          <span>Last synced: {format(new Date(connection.lastSyncAt), 'PPp')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(connection.id)}
                        disabled={syncing === connection.id || connection.status !== 'active'}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${syncing === connection.id ? 'animate-spin' : ''}`} />
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(connection.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  {/* Accounts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {connection.accounts.map((account) => (
                      <div 
                        key={account.id}
                        className="bg-muted/50 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{account.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {account.type}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold">
                          {account.currency} {account.balance.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ••••{account.accountNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Banks */}
      <Card>
        <CardHeader>
          <CardTitle>Available Banks</CardTitle>
          <CardDescription>
            Connect to your bank to automatically import transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportedBanks.map((bank) => (
              <div 
                key={bank.id}
                className={`border rounded-lg p-4 ${
                  bank.status === 'coming_soon' ? 'opacity-60' : 'hover:border-primary cursor-pointer'
                }`}
                onClick={() => bank.status === 'available' && handleConnect(bank)}
              >
                <div className="flex items-center justify-between mb-3">
                  <Building2 className="h-10 w-10 text-primary" />
                  {bank.status === 'coming_soon' && (
                    <Badge variant="secondary">Coming Soon</Badge>
                  )}
                </div>
                <h3 className="font-semibold">{bank.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {bank.country === 'AU' ? 'Australia' : 'Mongolia'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connect Bank Dialog */}
      {showConnectDialog && selectedBank && (
        <ConnectBankDialog
          bank={selectedBank}
          open={showConnectDialog}
          onOpenChange={setShowConnectDialog}
          onSuccess={() => {
            setShowConnectDialog(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}