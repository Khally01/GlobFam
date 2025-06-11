import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Modal, 
  Portal, 
  Card, 
  Title, 
  TextInput, 
  Button, 
  useTheme,
  SegmentedButtons,
  Chip,
  Text,
  IconButton
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppSelector, useAppDispatch } from '../store';
import { createTransaction } from '../store/slices/transactionSlice';
import currencyService from '../services/currencyService';
import { Transaction } from '../types';

interface TransactionModalProps {
  visible: boolean;
  onDismiss: () => void;
  initialType?: 'income' | 'expense';
}

const CATEGORIES = {
  income: ['Salary', 'Transfer', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Education', 'Rent', 'Utilities', 'Healthcare', 'Entertainment', 'Other']
};

const TransactionModal: React.FC<TransactionModalProps> = ({ visible, onDismiss, initialType = 'expense' }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user, isDemo } = useAppSelector((state) => state.auth);
  const { selectedCurrency } = useAppSelector((state) => state.currency);
  
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(selectedCurrency);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !category || !user) return;

    setLoading(true);
    
    try {
      if (isDemo) {
        // In demo mode, just add to local state
        const newTransaction: Transaction = {
          id: `demo-${Date.now()}`,
          userId: user.uid,
          type,
          amount: parseFloat(amount),
          currency,
          category,
          description,
          date,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // For demo, we'll just close the modal
        // In a real implementation, you'd update the local state
        onDismiss();
        resetForm();
      } else {
        await dispatch(createTransaction({
          userId: user.uid,
          type,
          amount: parseFloat(amount),
          currency,
          category,
          description,
          date
        })).unwrap();
        
        onDismiss();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date());
    setCurrency(selectedCurrency);
  };

  const popularCurrencies = currencyService.getPopularCurrencies();

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Title>Add Transaction</Title>
              <IconButton icon="close" onPress={onDismiss} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Transaction Type */}
              <SegmentedButtons
                value={type}
                onValueChange={(value) => {
                  setType(value as 'income' | 'expense');
                  setCategory(''); // Reset category when type changes
                }}
                buttons={[
                  { value: 'income', label: 'Income', icon: 'arrow-down' },
                  { value: 'expense', label: 'Expense', icon: 'arrow-up' }
                ]}
                style={styles.segmentedButtons}
              />

              {/* Amount */}
              <TextInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.input}
                left={<TextInput.Icon icon="cash" />}
              />

              {/* Currency Selection */}
              <Text style={styles.label}>Currency</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
                {popularCurrencies.map((curr) => (
                  <Chip
                    key={curr.code}
                    selected={currency === curr.code}
                    onPress={() => setCurrency(curr.code)}
                    style={styles.currencyChip}
                  >
                    {curr.code}
                  </Chip>
                ))}
              </ScrollView>

              {/* Category Selection */}
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES[type].map((cat) => (
                  <Chip
                    key={cat}
                    selected={category === cat}
                    onPress={() => setCategory(cat)}
                    style={styles.categoryChip}
                  >
                    {cat}
                  </Chip>
                ))}
              </ScrollView>

              {/* Description */}
              <TextInput
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={2}
                left={<TextInput.Icon icon="text" />}
              />

              {/* Date */}
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
                icon="calendar"
              >
                {date.toLocaleDateString()}
              </Button>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              )}

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={!amount || !category || loading}
                style={styles.submitButton}
              >
                Add Transaction
              </Button>
            </ScrollView>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  currencyScroll: {
    marginBottom: 16,
    flexGrow: 0,
  },
  currencyChip: {
    marginRight: 8,
  },
  categoryScroll: {
    marginBottom: 16,
    flexGrow: 0,
  },
  categoryChip: {
    marginRight: 8,
  },
  dateButton: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});

export default TransactionModal;