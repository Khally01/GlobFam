import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Text, useTheme, Card, FAB } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../../store';
import currencyService from '../../services/currencyService';

const TransactionsScreen: React.FC = () => {
  const theme = useTheme();
  const { transactions } = useAppSelector((state) => state.transaction);

  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: typeof transactions } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    
    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate();
  const dates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {dates.map(date => (
          <View key={date} style={styles.dateSection}>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedTransactions[date].map(transaction => (
              <Card key={transaction.id} style={styles.transactionCard}>
                <Card.Content style={styles.transactionContent}>
                  <View style={styles.transactionLeft}>
                    <MaterialCommunityIcons 
                      name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                      size={24} 
                      color={transaction.type === 'income' ? theme.colors.primary : theme.colors.error} 
                      style={styles.transactionIcon}
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
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        ))}
        
        {transactions.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="bank-transfer" 
              size={80} 
              color={theme.colors.primary} 
            />
            <Title style={styles.emptyTitle}>No Transactions Yet</Title>
            <Text style={styles.emptyText}>
              Start tracking your income and expenses
            </Text>
          </View>
        )}
      </ScrollView>
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Add transaction')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 8,
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
  transactionIcon: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TransactionsScreen;