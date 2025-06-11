import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  List, 
  Divider, 
  useTheme, 
  Avatar, 
  Title, 
  Text, 
  Card,
  Switch,
  Button,
  Portal,
  Dialog,
  Banner,
  SegmentedButtons
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import NotificationService from '../../services/notificationService';
import BudgetingService from '../../services/budgetingService';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedCurrency } = useAppSelector((state) => state.currency);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [notificationSettingsVisible, setNotificationSettingsVisible] = useState(false);
  const [reminderDays, setReminderDays] = useState({
    visa: [90, 60, 30, 14, 7],
    tuition: [30, 14, 7, 3, 1],
    other: [14, 7, 3, 1]
  });
  const [selectedReminderType, setSelectedReminderType] = useState<'visa' | 'tuition' | 'other'>('visa');

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const enabled = await NotificationService.areNotificationsEnabled();
    setNotificationsEnabled(enabled);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await NotificationService.requestPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        // Schedule notifications for existing reminders
        const reminders = BudgetingService.generateYearlyReminders(user?.uid || 'demo', true, 35000);
        await NotificationService.scheduleMultipleReminders(reminders);
        Alert.alert('Success', 'Payment reminders have been enabled!');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
      }
    } else {
      setNotificationsEnabled(false);
      await NotificationService.cancelAllNotifications();
    }
  };

  const handleTestNotification = async () => {
    await NotificationService.scheduleTestNotification();
    Alert.alert('Test Sent', 'You should receive a test notification in 5 seconds.');
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Card */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={user?.displayName?.charAt(0).toUpperCase() || 'U'} 
          />
          <View style={styles.profileInfo}>
            <Title>{user?.displayName}</Title>
            <Text style={styles.email}>{user?.email}</Text>
            <Button mode="outlined" style={styles.editButton}>
              Edit Profile
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Preferences Section */}
      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        
        <List.Item
          title="Default Currency"
          description={selectedCurrency}
          left={(props) => <List.Icon {...props} icon="currency-usd" />}
          right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
          onPress={() => console.log('Change currency')}
        />
        
        <List.Item
          title="Payment Reminders"
          description={notificationsEnabled ? "Enabled" : "Disabled"}
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
            />
          )}
          onPress={() => setNotificationSettingsVisible(true)}
        />
        
        <List.Item
          title="Dark Mode"
          description="Use dark theme"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
            />
          )}
        />
      </List.Section>

      <Divider />

      {/* Family Section */}
      <List.Section>
        <List.Subheader>Family</List.Subheader>
        
        <List.Item
          title="Family Settings"
          description="Manage your family group"
          left={(props) => <List.Icon {...props} icon="account-group" />}
          right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
          onPress={() => console.log('Family settings')}
        />
        
        <List.Item
          title="Invite Members"
          description="Share invite code"
          left={(props) => <List.Icon {...props} icon="account-plus" />}
          right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
          onPress={() => console.log('Invite members')}
        />
      </List.Section>

      <Divider />

      {/* Security Section */}
      <List.Section>
        <List.Subheader>Security</List.Subheader>
        
        <List.Item
          title="Change Password"
          description="Update your password"
          left={(props) => <List.Icon {...props} icon="lock" />}
          right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
          onPress={() => console.log('Change password')}
        />
        
        <List.Item
          title="Two-Factor Authentication"
          description="Not enabled"
          left={(props) => <List.Icon {...props} icon="shield-check" />}
          right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
          onPress={() => console.log('2FA')}
        />
      </List.Section>

      <Divider />

      {/* Support Section */}
      <List.Section>
        <List.Subheader>Support</List.Subheader>
        
        <List.Item
          title="Help Center"
          description="Get help and support"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
          onPress={() => console.log('Help center')}
        />
        
        <List.Item
          title="Privacy Policy"
          left={(props) => <List.Icon {...props} icon="shield-lock" />}
          right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
          onPress={() => console.log('Privacy policy')}
        />
        
        <List.Item
          title="Terms of Service"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          right={() => <MaterialCommunityIcons name="chevron-right" size={24} />}
          onPress={() => console.log('Terms of service')}
        />
      </List.Section>

      <Divider />

      {/* About Section */}
      <List.Section>
        <List.Subheader>About</List.Subheader>
        
        <List.Item
          title="Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
      </List.Section>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button 
          mode="outlined" 
          onPress={() => setLogoutDialogVisible(true)}
          style={styles.logoutButton}
          icon="logout"
        >
          Log Out
        </Button>
      </View>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Log Out</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout}>Log Out</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Notification Settings Dialog */}
        <Dialog 
          visible={notificationSettingsVisible} 
          onDismiss={() => setNotificationSettingsVisible(false)}
          style={{ maxHeight: '80%' }}
        >
          <Dialog.Title>Payment Reminder Settings</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <View style={{ padding: 20 }}>
                <Banner
                  visible={notificationsEnabled}
                  icon="bell-check"
                  style={{ marginBottom: 16 }}
                >
                  Reminders are active! You'll be notified before important payment dates.
                </Banner>

                <Title style={{ fontSize: 18, marginBottom: 12 }}>Reminder Schedule</Title>
                <Text style={{ marginBottom: 16, color: '#666' }}>
                  Choose when to receive reminders for different payment types:
                </Text>

                <SegmentedButtons
                  value={selectedReminderType}
                  onValueChange={(value) => setSelectedReminderType(value as any)}
                  buttons={[
                    { value: 'visa', label: 'Visa' },
                    { value: 'tuition', label: 'Tuition' },
                    { value: 'other', label: 'Other' }
                  ]}
                  style={{ marginBottom: 16 }}
                />

                <View style={{ marginBottom: 16 }}>
                  {selectedReminderType === 'visa' && (
                    <>
                      <Text style={{ fontWeight: '600', marginBottom: 8 }}>Visa Payment Reminders</Text>
                      <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
                        Critical reminders for visa renewal payments
                      </Text>
                      {reminderDays.visa.map(day => (
                        <View key={day} style={styles.reminderDayItem}>
                          <MaterialCommunityIcons name="bell" size={20} color={day <= 7 ? '#F44336' : '#2196F3'} />
                          <Text style={{ marginLeft: 12, flex: 1 }}>
                            {day} days before due date
                          </Text>
                          {day <= 7 && <Text style={{ color: '#F44336', fontSize: 12 }}>URGENT</Text>}
                        </View>
                      ))}
                    </>
                  )}
                  {selectedReminderType === 'tuition' && (
                    <>
                      <Text style={{ fontWeight: '600', marginBottom: 8 }}>Tuition Payment Reminders</Text>
                      <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
                        University fee payment reminders
                      </Text>
                      {reminderDays.tuition.map(day => (
                        <View key={day} style={styles.reminderDayItem}>
                          <MaterialCommunityIcons name="bell" size={20} color={day <= 3 ? '#FF9800' : '#2196F3'} />
                          <Text style={{ marginLeft: 12, flex: 1 }}>
                            {day} days before due date
                          </Text>
                          {day <= 3 && <Text style={{ color: '#FF9800', fontSize: 12 }}>SOON</Text>}
                        </View>
                      ))}
                    </>
                  )}
                  {selectedReminderType === 'other' && (
                    <>
                      <Text style={{ fontWeight: '600', marginBottom: 8 }}>Other Payment Reminders</Text>
                      <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
                        School fees, childcare, and other payments
                      </Text>
                      {reminderDays.other.map(day => (
                        <View key={day} style={styles.reminderDayItem}>
                          <MaterialCommunityIcons name="bell" size={20} color="#2196F3" />
                          <Text style={{ marginLeft: 12, flex: 1 }}>
                            {day} days before due date
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>

                <Button 
                  mode="contained"
                  onPress={handleTestNotification}
                  style={{ marginTop: 16 }}
                  icon="bell-ring"
                >
                  Send Test Notification
                </Button>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setNotificationSettingsVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    margin: 20,
    elevation: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  editButton: {
    marginTop: 12,
  },
  logoutContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    borderColor: 'red',
  },
  reminderDayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default SettingsScreen;