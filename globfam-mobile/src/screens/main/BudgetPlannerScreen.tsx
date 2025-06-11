import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Title,
  Text,
  useTheme,
  ProgressBar,
  Button,
  Chip,
  Surface,
  List,
  Divider,
  IconButton,
  FAB,
  Portal,
  Modal,
  TextInput,
  SegmentedButtons
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../../store';
import BudgetingService, {
  PaymentReminder,
  SavingsGoal,
  BudgetCategory
} from '../../services/budgetingService';
import { DEMO_VISA } from '../../services/mockDataService';
import NotificationService from '../../services/notificationService';

const BudgetPlannerScreen: React.FC = () => {
  const theme = useTheme();
  const { user, isDemo } = useAppSelector((state) => state.auth);

  // Demo data
  const [savingsGoals] = useState<SavingsGoal[]>([
    {
      id: 'visa-renewal',
      name: 'Visa Renewal Fund',
      targetAmount: 75419,
      currency: 'AUD',
      targetDate: new Date('2025-04-14'), // 3 months before visa expiry
      currentAmount: 25000,
      category: 'visa',
      autoSaveAmount: 1000,
      autoSavePeriod: 'fortnightly'
    },
    {
      id: 'emergency-fund',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currency: 'AUD',
      targetDate: new Date('2025-12-31'),
      currentAmount: 3500,
      category: 'emergency',
      autoSaveAmount: 250,
      autoSavePeriod: 'monthly'
    },
    {
      id: 'semester-2-tuition',
      name: 'Semester 2 Tuition',
      targetAmount: 17500,
      currency: 'AUD',
      targetDate: new Date('2025-07-01'),
      currentAmount: 5000,
      category: 'education',
      autoSaveAmount: 500,
      autoSavePeriod: 'fortnightly'
    }
  ]);

  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'goals' | 'reminders' | 'budget'>('goals');
  
  const monthlyIncome = 4500; // Part-time work + family support
  const visaExpiryDate = new Date(DEMO_VISA.expiryDate);
  
  useEffect(() => {
    // Generate reminders
    const generatedReminders = BudgetingService.generateYearlyReminders('demo-user', true, 35000);
    setReminders(generatedReminders);
    
    // Schedule notifications for reminders
    scheduleReminderNotifications(generatedReminders);
  }, []);

  const scheduleReminderNotifications = async (reminders: PaymentReminder[]) => {
    const hasPermission = await NotificationService.areNotificationsEnabled();
    if (hasPermission) {
      await NotificationService.scheduleMultipleReminders(reminders);
    }
  };

  // Calculate visa savings plan
  const visaSavingsPlan = BudgetingService.calculateVisaSavingsPlan(
    visaExpiryDate,
    75419, // Total required for visa
    25000, // Current savings
    'fortnightly'
  );

  // Get upcoming reminders
  const upcomingReminders = BudgetingService.getUpcomingReminders(reminders, 30);

  // Calculate budget
  const monthsUntilVisa = Math.ceil((visaExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
  const fixedExpenses = {
    rent: 1200,
    groceries: 600,
    transport: 180,
    utilities: 150,
    childcare: 900, // After subsidy
    phone: 50,
    internet: 80,
    entertainment: 200
  };

  const budgetAnalysis = BudgetingService.calculateVisaPeriodBudget(
    monthsUntilVisa,
    monthlyIncome,
    fixedExpenses,
    50419 // Remaining savings needed
  );

  const budgetCategories = BudgetingService.getStudentBudgetCategories(monthlyIncome);

  const getGoalIcon = (category: string) => {
    switch (category) {
      case 'visa': return 'passport';
      case 'education': return 'school';
      case 'emergency': return 'shield-home';
      case 'travel': return 'airplane';
      default: return 'piggy-bank';
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'visa': return 'passport';
      case 'tuition': return 'school';
      case 'school': return 'human-child';
      case 'childcare': return 'baby-carriage';
      case 'rent': return 'home';
      default: return 'calendar-clock';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'AUD') => {
    return `${currency === 'AUD' ? 'A$' : '$'}${amount.toLocaleString()}`;
  };

  const getDaysUntil = (date: Date) => {
    const days = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Visa Savings Summary */}
      <Card style={[styles.card, styles.summaryCard]}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="passport" size={32} color={theme.colors.primary} />
            <View style={styles.summaryInfo}>
              <Title>Visa Renewal Savings</Title>
              <Text style={styles.summarySubtitle}>
                {Math.ceil((visaExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days until visa expires
              </Text>
            </View>
          </View>

          <View style={styles.savingsProgress}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress to Goal</Text>
              <Text style={styles.progressAmount}>
                {formatCurrency(25000)} / {formatCurrency(75419)}
              </Text>
            </View>
            <ProgressBar
              progress={25000 / 75419}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressPercentage}>33% Complete</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.savingsPlanDetails}>
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>Save per fortnight:</Text>
              <Text style={styles.planValue}>{formatCurrency(visaSavingsPlan.amountPerPeriod)}</Text>
            </View>
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>Periods remaining:</Text>
              <Text style={styles.planValue}>{visaSavingsPlan.totalPeriods}</Text>
            </View>
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>Target date:</Text>
              <Text style={styles.planValue}>{visaSavingsPlan.targetReached.toLocaleDateString()}</Text>
            </View>
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>Status:</Text>
              <Chip 
                mode="flat" 
                style={{
                  backgroundColor: visaSavingsPlan.onTrack ? '#E8F5E9' : '#FFEBEE'
                }}
                textStyle={{
                  color: visaSavingsPlan.onTrack ? '#2E7D32' : '#D32F2F'
                }}
              >
                {visaSavingsPlan.onTrack ? 'On Track' : `$${visaSavingsPlan.shortfall} Short`}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Tab Navigation */}
      <SegmentedButtons
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value as any)}
        buttons={[
          { value: 'goals', label: 'Savings Goals', icon: 'target' },
          { value: 'reminders', label: 'Payments', icon: 'bell' },
          { value: 'budget', label: 'Budget', icon: 'calculator' }
        ]}
        style={styles.tabs}
      />

      {/* Savings Goals Tab */}
      {selectedTab === 'goals' && (
        <>
          {savingsGoals.map(goal => {
            const progress = BudgetingService.calculateSavingsProgress(goal);
            return (
              <Card key={goal.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.goalHeader}>
                    <MaterialCommunityIcons 
                      name={getGoalIcon(goal.category)} 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalName}>{goal.name}</Text>
                      <Text style={styles.goalTarget}>
                        Target: {formatCurrency(goal.targetAmount)} by {goal.targetDate.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.goalProgress}>
                    <ProgressBar
                      progress={progress.percentageComplete / 100}
                      color={progress.onTrack ? theme.colors.primary : theme.colors.error}
                      style={styles.progressBar}
                    />
                    <View style={styles.goalStats}>
                      <Text style={styles.statValue}>{progress.percentageComplete.toFixed(0)}%</Text>
                      <Text style={styles.statValue}>{formatCurrency(goal.currentAmount)}</Text>
                      <Text style={styles.statValue}>{progress.daysRemaining} days</Text>
                    </View>
                    <View style={styles.goalStats}>
                      <Text style={styles.statLabel}>Complete</Text>
                      <Text style={styles.statLabel}>Saved</Text>
                      <Text style={styles.statLabel}>Remaining</Text>
                    </View>
                  </View>

                  {goal.autoSaveAmount && (
                    <View style={styles.autoSaveInfo}>
                      <MaterialCommunityIcons name="sync" size={16} color={theme.colors.primary} />
                      <Text style={styles.autoSaveText}>
                        Auto-saving {formatCurrency(goal.autoSaveAmount)} {goal.autoSavePeriod}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </>
      )}

      {/* Payment Reminders Tab */}
      {selectedTab === 'reminders' && (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Upcoming Payments</Title>
              <Text style={styles.sectionSubtitle}>Next 30 days</Text>
              
              {upcomingReminders.map(reminder => (
                <List.Item
                  key={reminder.id}
                  title={reminder.title}
                  description={`${formatCurrency(reminder.amount)} • Due ${getDaysUntil(reminder.dueDate)}`}
                  left={() => (
                    <View style={[
                      styles.reminderIcon,
                      { backgroundColor: reminder.type === 'visa' ? '#FFEBEE' : '#E3F2FD' }
                    ]}>
                      <MaterialCommunityIcons 
                        name={getReminderIcon(reminder.type)} 
                        size={24} 
                        color={reminder.type === 'visa' ? theme.colors.error : theme.colors.primary} 
                      />
                    </View>
                  )}
                  right={() => (
                    <Chip 
                      mode="flat"
                      style={{ 
                        backgroundColor: reminder.dueDate <= new Date() ? '#FFEBEE' : '#FFF3E0' 
                      }}
                    >
                      {reminder.dueDate.toLocaleDateString()}
                    </Chip>
                  )}
                  style={styles.reminderItem}
                />
              ))}
            </Card.Content>
          </Card>

          {/* Payment Schedule */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Annual Payment Schedule</Title>
              
              <View style={styles.scheduleGrid}>
                <Surface style={styles.scheduleCard}>
                  <MaterialCommunityIcons name="school" size={32} color={theme.colors.primary} />
                  <Text style={styles.scheduleTitle}>University</Text>
                  <Text style={styles.scheduleAmount}>{formatCurrency(35000)}/year</Text>
                  <Text style={styles.scheduleFreq}>2 payments</Text>
                </Surface>

                <Surface style={styles.scheduleCard}>
                  <MaterialCommunityIcons name="human-child" size={32} color="#9C27B0" />
                  <Text style={styles.scheduleTitle}>School Fees</Text>
                  <Text style={styles.scheduleAmount}>{formatCurrency(1000)}/year</Text>
                  <Text style={styles.scheduleFreq}>4 terms</Text>
                </Surface>

                <Surface style={styles.scheduleCard}>
                  <MaterialCommunityIcons name="baby-carriage" size={32} color="#FF9800" />
                  <Text style={styles.scheduleTitle}>Childcare</Text>
                  <Text style={styles.scheduleAmount}>{formatCurrency(11700)}/year</Text>
                  <Text style={styles.scheduleFreq}>Weekly</Text>
                </Surface>

                <Surface style={styles.scheduleCard}>
                  <MaterialCommunityIcons name="passport" size={32} color={theme.colors.error} />
                  <Text style={styles.scheduleTitle}>Visa Renewal</Text>
                  <Text style={styles.scheduleAmount}>{formatCurrency(1680)}</Text>
                  <Text style={styles.scheduleFreq}>Every 2 years</Text>
                </Surface>
              </View>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Budget Tab */}
      {selectedTab === 'budget' && (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Monthly Budget Analysis</Title>
              
              <View style={styles.budgetSummary}>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Income</Text>
                  <Text style={[styles.budgetValue, { color: theme.colors.primary }]}>
                    +{formatCurrency(monthlyIncome)}
                  </Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Expenses</Text>
                  <Text style={[styles.budgetValue, { color: theme.colors.error }]}>
                    -{formatCurrency(Object.values(fixedExpenses).reduce((a, b) => a + b, 0))}
                  </Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Available</Text>
                  <Text style={[styles.budgetValue, { fontWeight: '700' }]}>
                    {formatCurrency(monthlyIncome - Object.values(fixedExpenses).reduce((a, b) => a + b, 0))}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.visaBudget}>
                <Text style={styles.visaBudgetTitle}>Visa Savings Analysis</Text>
                <View style={styles.analysisRow}>
                  <Text>Monthly savings needed:</Text>
                  <Text style={styles.analysisValue}>
                    {formatCurrency(budgetAnalysis.monthlySavingsNeeded)}
                  </Text>
                </View>
                <View style={styles.analysisRow}>
                  <Text>Feasibility:</Text>
                  <Chip 
                    mode="flat"
                    style={{ 
                      backgroundColor: budgetAnalysis.feasible ? '#E8F5E9' : '#FFEBEE' 
                    }}
                  >
                    {budgetAnalysis.feasible ? 'Achievable' : 'Needs Adjustment'}
                  </Chip>
                </View>
              </View>

              {/* Recommendations */}
              {budgetAnalysis.recommendations.length > 0 && (
                <View style={styles.recommendations}>
                  <Text style={styles.recommendTitle}>Recommendations</Text>
                  {budgetAnalysis.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendItem}>
                      <MaterialCommunityIcons name="lightbulb" size={20} color="#FF9800" />
                      <Text style={styles.recommendText}>{rec}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Budget Categories */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Budget Categories</Title>
              
              {budgetCategories.map(category => (
                <View key={category.name} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(category.budgeted)} ({category.percentage}%)
                    </Text>
                  </View>
                  <ProgressBar
                    progress={category.percentage / 100}
                    color={theme.colors.primary}
                    style={styles.categoryProgress}
                  />
                </View>
              ))}
            </Card.Content>
          </Card>
        </>
      )}

      {/* FAB for adding goals/reminders */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          if (selectedTab === 'goals') setShowGoalModal(true);
          else if (selectedTab === 'reminders') setShowReminderModal(true);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  summaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryInfo: {
    marginLeft: 16,
    flex: 1,
  },
  summarySubtitle: {
    color: '#666',
    marginTop: 4,
  },
  savingsProgress: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressPercentage: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  savingsPlanDetails: {
    gap: 12,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLabel: {
    fontSize: 16,
    color: '#666',
  },
  planValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    margin: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalInfo: {
    marginLeft: 12,
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
  },
  goalTarget: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  goalProgress: {
    marginBottom: 12,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  autoSaveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  autoSaveText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  reminderItem: {
    paddingVertical: 8,
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  scheduleCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  scheduleAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
    marginTop: 4,
  },
  scheduleFreq: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  budgetSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  visaBudget: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  visaBudgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  recommendations: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
  },
  recommendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
    color: '#666',
  },
  categoryProgress: {
    height: 6,
    borderRadius: 3,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default BudgetPlannerScreen;