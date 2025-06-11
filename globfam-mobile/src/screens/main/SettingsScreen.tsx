import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
  Dialog
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedCurrency } = useAppSelector((state) => state.currency);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    }
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
          title="Notifications"
          description="Receive transaction alerts"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          )}
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
});

export default SettingsScreen;