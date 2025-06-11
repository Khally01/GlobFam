import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Share, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Text, 
  useTheme, 
  Button, 
  Avatar, 
  List, 
  FAB, 
  Portal, 
  Dialog, 
  TextInput,
  ActivityIndicator,
  Chip,
  Surface,
  Divider
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchFamily, createNewFamily, joinExistingFamily } from '../../store/slices/familySlice';

const FamilyHubScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { family, members, isLoading } = useAppSelector((state) => state.family);
  
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    if (user?.familyId) {
      dispatch(fetchFamily(user.familyId));
    }
  }, [user?.familyId]);

  const onRefresh = async () => {
    if (user?.familyId) {
      setRefreshing(true);
      await dispatch(fetchFamily(user.familyId));
      setRefreshing(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim() || !user) {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }

    try {
      await dispatch(createNewFamily({
        name: familyName.trim(),
        userId: user.id,
        userDisplayName: user.displayName || user.email,
        userEmail: user.email
      })).unwrap();
      
      setDialogVisible(false);
      setFamilyName('');
      Alert.alert('Success', 'Family created successfully!');
    } catch (error: any) {
      console.error('Error creating family:', error);
      Alert.alert('Error', error.message || 'Failed to create family');
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim() || !user) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      await dispatch(joinExistingFamily({
        inviteCode: inviteCode.trim().toUpperCase(),
        userId: user.id,
        userDisplayName: user.displayName || user.email,
        userEmail: user.email
      })).unwrap();
      
      setJoinDialogVisible(false);
      setInviteCode('');
      Alert.alert('Success', 'Joined family successfully!');
    } catch (error: any) {
      console.error('Error joining family:', error);
      Alert.alert('Error', error.message || 'Invalid invite code');
    }
  };

  const handleShareInviteCode = async () => {
    if (!family) return;
    try {
      await Share.share({
        message: `Join my family on GlobFam! Use invite code: ${family.inviteCode}`,
        title: 'GlobFam Family Invite'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getUserRole = (userId: string) => {
    const member = members.find(m => m.userId === userId);
    return member?.role || 'member';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!family) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name="account-group-outline" 
              size={60} 
              color="#666" 
            />
          </View>
          <Text style={styles.emptyStateTitle}>Start your family journey</Text>
          <Text style={styles.emptyStateSubtitle}>
            Create a family group to manage finances together across borders
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => setDialogVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Create a family</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => setJoinDialogVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color={theme.colors.primary} />
            <Text style={styles.secondaryButtonText}>Join with code</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Clean Header Section */}
        <View style={styles.header}>
          <Text style={styles.familyName}>{family.name}</Text>
          <Text style={styles.memberCount}>{members.length} {members.length === 1 ? 'member' : 'members'}</Text>
          
          <TouchableOpacity 
            style={styles.inviteButton}
            onPress={handleShareInviteCode}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="share-variant" size={16} color={theme.colors.primary} />
            <Text style={styles.inviteButtonText}>Invite code: {family.inviteCode}</Text>
          </TouchableOpacity>
        </View>

        {/* Clean Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Family Balance</Text>
            <Text style={styles.statValue}>$12,450</Text>
            <Text style={styles.statChange}>+15% this month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Your Contribution</Text>
            <Text style={styles.statValue}>$3,200</Text>
            <Text style={styles.statChange}>26% of total</Text>
          </View>
        </View>

        {/* Clean Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          <View style={styles.membersList}>
            {members.map((member, index) => (
              <View key={member.userId}>
                <View style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.avatarText}>
                      {member.displayName ? member.displayName.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.displayName || member.email}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  {member.role === 'admin' && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminText}>Admin</Text>
                    </View>
                  )}
                </View>
                {index < members.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Clean Activity Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="plus" size={20} color="#4CAF50" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>John added $500 USD</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#E3F2FD' }]}>
                <MaterialCommunityIcons name="swap-horizontal" size={20} color="#2196F3" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Sarah converted €200 to USD</Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="cart" size={20} color="#FF9800" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Mike paid for groceries</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FAB for admin actions */}
      {family && getUserRole(user?.id || '') === 'admin' && (
        <FAB.Group
          open={fabOpen}
          visible
          icon={fabOpen ? 'close' : 'plus'}
          actions={[
            {
              icon: 'account-plus',
              label: 'Invite Member',
              onPress: () => console.log('Invite member'),
            },
            {
              icon: 'cog',
              label: 'Family Settings',
              onPress: () => console.log('Family settings'),
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
          onPress={() => {
            if (fabOpen) {
              // do something if the speed dial is open
            }
          }}
        />
      )}

      {/* Create Family Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Create New Family</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Family Name"
              value={familyName}
              onChangeText={setFamilyName}
              mode="outlined"
              placeholder="e.g., The Smiths"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCreateFamily} disabled={!familyName}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Join Family Dialog */}
        <Dialog visible={joinDialogVisible} onDismiss={() => setJoinDialogVisible(false)}>
          <Dialog.Title>Join Existing Family</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Invite Code"
              value={inviteCode}
              onChangeText={setInviteCode}
              mode="outlined"
              placeholder="e.g., ABC123"
              autoCapitalize="characters"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setJoinDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleJoinFamily} disabled={!inviteCode}>
              Join
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty State Styles (Pearler-inspired)
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#1A1A1A',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Header Styles (Clean, Pearler-inspired)
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  familyName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  inviteButtonText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 6,
    fontWeight: '500',
  },
  // Stats Styles
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginTop: 1,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statChange: {
    fontSize: 13,
    color: '#4CAF50',
  },
  // Section Styles
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  // Members Styles
  membersList: {
    paddingHorizontal: 20,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  adminBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
  },
  divider: {
    marginLeft: 52,
    marginRight: 0,
    backgroundColor: '#F0F0F0',
  },
  // Activity Styles
  activityList: {
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: '#666',
  },
});

export default FamilyHubScreen;