import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons, useTheme } from 'react-native-paper';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={language}
        onValueChange={(value) => setLanguage(value as 'en' | 'mn')}
        buttons={[
          {
            value: 'mn',
            label: '🇲🇳 MN',
            style: language === 'mn' ? { backgroundColor: theme.colors.primaryContainer } : {}
          },
          {
            value: 'en',
            label: '🇬🇧 EN',
            style: language === 'en' ? { backgroundColor: theme.colors.primaryContainer } : {}
          }
        ]}
        style={styles.buttons}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttons: {
    height: 36,
  },
});

export default LanguageToggle;