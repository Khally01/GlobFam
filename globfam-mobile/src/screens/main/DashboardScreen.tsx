import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Text, useTheme, Button, Surface, Chip, ActivityIndicator, ProgressBar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchUserBalances, setSelectedCurrency } from '../../store/slices/currencySlice';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import currencyService from '../../services/currencyService';
import TransactionModal from '../../components/TransactionModal';
import BudgetingService from '../../services/budgetingService';
import { DEMO_VISA } from '../../services/mockDataService';

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user, isDemo } = useAppSelector((state) => state.auth);
  const { balances, selectedCurrency, isLoading: currencyLoading } = useAppSelector((state) => state.currency);
  const { transactions, isLoading: transactionLoading } = useAppSelector((state) => state.transaction);
  const [refreshing, setRefreshing] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
      // Load upcoming payments
      const reminders = BudgetingService.generateYearlyReminders(user.uid, true, 35000);
      const upcoming = BudgetingService.getUpcomingReminders(reminders, 7); // Next 7 days
      setUpcomingPayments(upcoming);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    // Skip Firebase calls in demo mode - data is already loaded
    if (isDemo) {
      try {
        const rates = await currencyService.getExchangeRates(selectedCurrency);
        setExchangeRates(rates);
      } catch (error) {
        console.error('Error loading rates:', error);
      }
      return;
    }
    
    try {
      await Promise.all([
        dispatch(fetchUserBalances(user.uid)),
        dispatch(fetchTransactions(user.uid))
      ]);
      
      const rates = await currencyService.getExchangeRates(selectedCurrency);
      setExchangeRates(rates);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTotalBalance = () => {
    let total = 0;
    balances.forEach(balance => {
      const convertedAmount = currencyService.convertCurrency(
        balance.amount,
        balance.currency,
        selectedCurrency,
        exchangeRates
      );
      total += convertedAmount;
    });
    return total;
  };

  const getRecentTransactions = () => {
    return transactions.slice(0, 5);
  };

  const handleCurrencyChange = (currency: string) => {
    dispatch(setSelectedCurrency(currency));
  };

  if (currencyLoading || transactionLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.greeting}>Hello, {user?.displayName}!</Title>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
        {isDemo && (
          <Chip mode="flat" style={styles.demoChip} icon="test-tube">
            Demo Mode
          </Chip>
        )}
      </View>

      {/* Total Balance Card */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Chip 
              mode="outlined" 
              onPress={() => {}} 
              style={styles.currencyChip}
            >
              {selectedCurrency}
            </Chip>
          </View>
          <Title style={styles.balanceAmount}>
            {currencyService.formatCurrency(getTotalBalance(), selectedCurrency)}
          </Title>
        </Card.Content>
      </Card>

      {/* Currency Balances */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Currency Balances</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {balances.map((balance) => (
            <Surface key={balance.currency} style={styles.currencyCard}>
              <Text style={styles.currencyCode}>{balance.currency}</Text>
              <Text style={styles.currencyAmount}>
                {currencyService.formatCurrency(balance.amount, balance.currency)}
              </Text>
              <Text style={styles.convertedAmount}>
                ≈ {currencyService.formatCurrency(
                  currencyService.convertCurrency(balance.amount, balance.currency, selectedCurrency, exchangeRates),
                  selectedCurrency
                )}
              </Text>
            </Surface>
          ))}
          {balances.length === 0 && (
            <Surface style={styles.emptyCard}>
              <MaterialCommunityIcons name="currency-usd" size={40} color={theme.colors.primary} />
              <Text style={styles.emptyText}>No balances yet</Text>
              <Button mode="text" onPress={() => {}}>
                Add Currency
              </Button>
            </Surface>
          )}
        </ScrollView>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Recent Transactions</Title>
          <Button mode="text" onPress={() => {}}>
            View All
          </Button>
        </View>
        {getRecentTransactions().map((transaction) => (
          <Card key={transaction.id} style={styles.transactionCard}>
            <Card.Content style={styles.transactionContent}>
              <View style={styles.transactionLeft}>
                <MaterialCommunityIcons 
                  name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                  size={24} 
                  color={transaction.type === 'income' ? theme.colors.primary : theme.colors.error} 
                />
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? theme.colors.primary : theme.colors.error }
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {currencyService.formatCurrency(transaction.amount, transaction.currency)}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
        {transactions.length === 0 && (
          <Card style={styles.emptyTransactionCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="swap-horizontal" size={40} color={theme.colors.primary} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Button mode="contained" onPress={() => setTransactionModalVisible(true)} style={styles.addButton}>
                Add Transaction
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Quick Actions</Title>
        <View style={styles.actionGrid}>
          <Surface style={styles.actionCard} onTouchEnd={() => {
            setTransactionType('income');
            setTransactionModalVisible(true);
          }}>
            <MaterialCommunityIcons name="plus" size={32} color={theme.colors.primary} />
            <Text style={styles.actionText}>Add Income</Text>
          </Surface>
          <Surface style={styles.actionCard} onTouchEnd={() => {
            setTransactionType('expense');
            setTransactionModalVisible(true);
          }}>
            <MaterialCommunityIcons name="minus" size={32} color={theme.colors.error} />
            <Text style={styles.actionText}>Add Expense</Text>
          </Surface>
          <Surface style={styles.actionCard}>
            <MaterialCommunityIcons name="swap-horizontal" size={32} color={theme.colors.secondary} />
            <Text style={styles.actionText}>Transfer</Text>
          </Surface>
          <Surface style={styles.actionCard}>
            <MaterialCommunityIcons name="chart-line" size={32} color={theme.colors.tertiary} />
            <Text style={styles.actionText}>Analytics</Text>
          </Surface>
        </View>
      </View>

      {/* Upcoming Payments Alert */}
      {upcomingPayments.length > 0 && (
        <Card style={[styles.card, { margin: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.error }]}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="bell-alert" size={24} color={theme.colors.error} />
              <Title style={{ marginLeft: 8, fontSize: 18 }}>Upcoming Payments</Title>
            </View>
            {upcomingPayments.slice(0, 3).map((payment, index) => (
              <View key={payment.id} style={{ 
                paddingVertical: 8, 
                borderBottomWidth: index < upcomingPayments.length - 1 ? 1 : 0,
                borderBottomColor: '#f0f0f0'
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '500' }}>{payment.title}</Text>
                  <Text style={{ fontWeight: '600', color: theme.colors.primary }}>
                    ${payment.amount}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  Due in {Math.ceil((payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </Text>
              </View>
            ))}
            <Button 
              mode="text" 
              onPress={() => {}} 
              style={{ marginTop: 8 }}
              icon="arrow-right"
            >
              View All Payments
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Visa Savings Progress */}
      <Card style={[styles.card, { margin: 16 }]}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MaterialCommunityIcons name="piggy-bank" size={24} color={theme.colors.primary} />
            <Title style={{ marginLeft: 8, fontSize: 18 }}>Visa Savings Progress</Title>
          </View>
          <ProgressBar 
            progress={0.33} 
            color={theme.colors.primary} 
            style={{ height: 8, borderRadius: 4, marginBottom: 8 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#666' }}>
              $25,000 of $75,419 saved (33%)
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.primary }}>
              $1,000/fortnight
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Transaction Modal */}
      <TransactionModal
        visible={transactionModalVisible}
        onDismiss={() => setTransactionModalVisible(false)}
        initialType={transactionType}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  demoChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  balanceCard: {
    margin: 20,
    marginTop: 10,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  currencyChip: {
    height: 28,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  currencyCard: {
    padding: 16,
    marginLeft: 20,
    marginRight: 8,
    borderRadius: 12,
    elevation: 2,
    minWidth: 150,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currencyAmount: {
    fontSize: 16,
    marginBottom: 2,
  },
  convertedAmount: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyCard: {
    padding: 20,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
    minWidth: 200,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.7,
  },
  transactionCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    elevation: 2,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyTransactionCard: {
    marginHorizontal: 20,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 20,
  },
  addButton: {
    marginTop: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
  },
});

export default DashboardScreen;