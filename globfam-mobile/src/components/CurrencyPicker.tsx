import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Portal, 
  Dialog, 
  Button, 
  List, 
  Searchbar,
  useTheme,
  Divider 
} from 'react-native-paper';
import currencyService from '../services/currencyService';
import { Currency } from '../types';

interface CurrencyPickerProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (currency: Currency) => void;
  selectedCurrency?: string;
}

const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  visible,
  onDismiss,
  onSelect,
  selectedCurrency
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  const currencies = currencyService.getAllCurrencies();
  const popularCurrencies = currencyService.getPopularCurrencies();
  
  const filteredCurrencies = currencies.filter(currency =>
    currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (currency: Currency) => {
    onSelect(currency);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Select Currency</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <Searchbar
            placeholder="Search currencies..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
          
          <ScrollView style={styles.scrollView}>
            {searchQuery === '' && (
              <>
                <List.Subheader>Popular Currencies</List.Subheader>
                {popularCurrencies.map((currency) => (
                  <List.Item
                    key={currency.code}
                    title={`${currency.symbol} ${currency.code}`}
                    description={currency.name}
                    onPress={() => handleSelect(currency)}
                    left={(props) => (
                      <List.Icon 
                        {...props} 
                        icon={selectedCurrency === currency.code ? 'check' : 'currency-usd'} 
                        color={selectedCurrency === currency.code ? theme.colors.primary : undefined}
                      />
                    )}
                    style={selectedCurrency === currency.code ? styles.selectedItem : undefined}
                  />
                ))}
                <Divider />
                <List.Subheader>All Currencies</List.Subheader>
              </>
            )}
            
            {filteredCurrencies.map((currency) => (
              <List.Item
                key={currency.code}
                title={`${currency.symbol} ${currency.code}`}
                description={currency.name}
                onPress={() => handleSelect(currency)}
                left={(props) => (
                  <List.Icon 
                    {...props} 
                    icon={selectedCurrency === currency.code ? 'check' : 'currency-usd'} 
                    color={selectedCurrency === currency.code ? theme.colors.primary : undefined}
                  />
                )}
                style={selectedCurrency === currency.code ? styles.selectedItem : undefined}
              />
            ))}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  content: {
    paddingHorizontal: 0,
  },
  searchbar: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  scrollView: {
    maxHeight: 400,
  },
  selectedItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default CurrencyPicker;