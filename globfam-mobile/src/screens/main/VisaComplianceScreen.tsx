import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  Card,
  Title,
  Text,
  useTheme,
  ProgressBar,
  Button,
  Chip,
  IconButton,
  Surface,
  List,
  Divider,
  FAB,
  Portal,
  Modal,
  TextInput
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../../store';
import VisaComplianceService, {
  WORK_RESTRICTIONS,
  VISA_FINANCIAL_REQUIREMENTS,
  WorkHours,
  ChildcareDetails
} from '../../services/visaComplianceService';
import VisaCalendar from '../../components/VisaCalendar';

const { width } = Dimensions.get('window');

const VisaComplianceScreen: React.FC = () => {
  const theme = useTheme();
  const { user, isDemo } = useAppSelector((state) => state.auth);
  
  // Demo data
  const [visaDetails] = useState({
    visaType: 'Student Visa (Subclass 500)',
    visaNumber: 'DEMO123456',
    startDate: new Date('2023-07-15'),
    expiryDate: new Date('2025-07-14'),
    workCondition: '8105 - Maximum 48 hours per fortnight',
    courseEndDate: new Date('2025-06-30'),
    educationProvider: 'University of Sydney'
  });

  const [workRecords] = useState<WorkHours[]>([
    { id: '1', date: new Date(), hours: 8, employer: 'Campus Cafe', rate: 25, income: 200 },
    { id: '2', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), hours: 6, employer: 'Campus Cafe', rate: 25, income: 150 },
    { id: '3', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), hours: 8, employer: 'Campus Cafe', rate: 25, income: 200 },
    { id: '4', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), hours: 10, employer: 'Tutoring', rate: 35, income: 350 },
    { id: '5', date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), hours: 8, employer: 'Campus Cafe', rate: 25, income: 200 }
  ]);

  const [childcareDetails] = useState<ChildcareDetails[]>([
    {
      childName: 'Emma',
      age: 3,
      type: 'childcare',
      provider: 'Bright Stars Childcare',
      weeklyFee: 450,
      subsidyRate: 50,
      annualCost: 23400
    },
    {
      childName: 'Liam',
      age: 7,
      type: 'school',
      provider: 'Sydney Public School',
      weeklyFee: 20, // Public school fees
      subsidyRate: 0,
      annualCost: 1040
    }
  ]);

  const [showWorkModal, setShowWorkModal] = useState(false);
  const [workForm, setWorkForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    employer: '',
    rate: '',
  });

  // Calculate compliance metrics
  const workCompliance = VisaComplianceService.calculateFortnightHours(workRecords);
  const visaExpiry = VisaComplianceService.calculateVisaExpiry(visaDetails.expiryDate);
  const financialReq = VisaComplianceService.calculateFinancialRequirements(
    { students: 1, partners: 1, children: 2 },
    35000, // Annual course fees
    childcareDetails
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return theme.colors.primary;
      case 'warning': return '#FF9800';
      case 'critical': return theme.colors.error;
      case 'exceeded': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  const handleAddWork = () => {
    // In real app, save to database
    console.log('Adding work record:', workForm);
    setShowWorkModal(false);
    setWorkForm({ date: new Date().toISOString().split('T')[0], hours: '', employer: '', rate: '' });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Visa Status Card */}
      <Card style={[styles.card, { borderLeftColor: getStatusColor(visaExpiry.status), borderLeftWidth: 4 }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Title>{visaDetails.visaType}</Title>
              <Text style={styles.visaNumber}>Visa No: {visaDetails.visaNumber}</Text>
            </View>
            <Chip mode="flat" style={{ backgroundColor: getStatusColor(visaExpiry.status) }}>
              {visaExpiry.daysRemaining} days
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.visaInfo}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-start" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>Start: {visaDetails.startDate.toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-end" size={20} color={theme.colors.error} />
              <Text style={styles.infoText}>Expiry: {visaDetails.expiryDate.toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="school" size={20} color={theme.colors.secondary} />
              <Text style={styles.infoText}>{visaDetails.educationProvider}</Text>
            </View>
          </View>

          {visaExpiry.status === 'warning' && (
            <Button mode="contained" style={styles.renewButton} onPress={() => {}}>
              Start Visa Renewal
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Work Hours Tracker */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Work Hours Tracker</Title>
            <IconButton icon="plus" onPress={() => setShowWorkModal(true)} />
          </View>
          
          <Text style={styles.subtitle}>Current Fortnight</Text>
          <Text style={styles.dateRange}>
            {workCompliance.fortnightStart.toLocaleDateString()} - {workCompliance.fortnightEnd.toLocaleDateString()}
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.hoursText}>
                {workCompliance.currentHours} / {WORK_RESTRICTIONS.maxHoursPerFortnight} hours
              </Text>
              <Text style={[styles.statusText, { color: getStatusColor(workCompliance.status) }]}>
                {workCompliance.remainingHours} hours remaining
              </Text>
            </View>
            <ProgressBar
              progress={workCompliance.percentage / 100}
              color={getStatusColor(workCompliance.status)}
              style={styles.progressBar}
            />
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Recent Work</Text>
          {workRecords.slice(0, 3).map((record) => (
            <List.Item
              key={record.id}
              title={record.employer}
              description={`${record.hours} hours • $${record.income}`}
              left={() => <List.Icon icon="briefcase" />}
              right={() => <Text style={styles.dateText}>{record.date.toLocaleDateString()}</Text>}
            />
          ))}
        </Card.Content>
      </Card>

      {/* Financial Requirements */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Financial Requirements</Title>
          <Text style={styles.subtitle}>For visa compliance and renewal</Text>
          
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Annual Requirement</Text>
            <Text style={styles.totalAmount}>${financialReq.totalAnnual.toLocaleString()}</Text>
            <Text style={styles.monthlyAmount}>${financialReq.totalMonthly.toLocaleString()}/month</Text>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Breakdown</Text>
          {financialReq.breakdown.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <Text style={styles.breakdownCategory}>{item.category}</Text>
                <Text style={styles.breakdownDescription}>{item.description}</Text>
              </View>
              <Text style={styles.breakdownAmount}>${item.annualAmount.toLocaleString()}</Text>
            </View>
          ))}

          <Surface style={styles.savingsBox}>
            <MaterialCommunityIcons name="piggy-bank" size={24} color={theme.colors.primary} />
            <View style={styles.savingsInfo}>
              <Text style={styles.savingsLabel}>Savings Required for Visa</Text>
              <Text style={styles.savingsAmount}>${financialReq.savingsRequired.toLocaleString()}</Text>
            </View>
          </Surface>
        </Card.Content>
      </Card>

      {/* Calendar View */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Visa & Work Calendar</Title>
          <VisaCalendar
            visaExpiryDate={visaDetails.expiryDate}
            courseEndDate={visaDetails.courseEndDate}
            workDays={workRecords.map(record => ({
              date: record.date,
              hours: record.hours,
              employer: record.employer
            }))}
            onDayPress={(date) => {
              console.log('Day pressed:', date);
            }}
          />
        </Card.Content>
      </Card>

      {/* Childcare & Education */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Childcare & Education Costs</Title>
          
          {childcareDetails.map((child, index) => (
            <Surface key={index} style={styles.childCard}>
              <View style={styles.childHeader}>
                <MaterialCommunityIcons 
                  name={child.type === 'childcare' ? 'baby-carriage' : 'school'} 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.childName} ({child.age} years)</Text>
                  <Text style={styles.providerName}>{child.provider}</Text>
                </View>
              </View>
              
              <View style={styles.costInfo}>
                <View>
                  <Text style={styles.weeklyFee}>${child.weeklyFee}/week</Text>
                  {child.subsidyRate > 0 && (
                    <Text style={styles.subsidy}>{child.subsidyRate}% CCS applied</Text>
                  )}
                </View>
                <View style={styles.annualBox}>
                  <Text style={styles.annualLabel}>Annual</Text>
                  <Text style={styles.annualCost}>
                    ${(child.annualCost * (1 - (child.subsidyRate || 0) / 100)).toLocaleString()}
                  </Text>
                </View>
              </View>
            </Surface>
          ))}
        </Card.Content>
      </Card>

      {/* Work Hours Modal */}
      <Portal>
        <Modal visible={showWorkModal} onDismiss={() => setShowWorkModal(false)} contentContainerStyle={styles.modal}>
          <Title style={styles.modalTitle}>Add Work Hours</Title>
          
          <TextInput
            label="Date"
            value={workForm.date}
            onChangeText={(date) => setWorkForm({ ...workForm, date })}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Hours Worked"
            value={workForm.hours}
            onChangeText={(hours) => setWorkForm({ ...workForm, hours })}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          
          <TextInput
            label="Employer"
            value={workForm.employer}
            onChangeText={(employer) => setWorkForm({ ...workForm, employer })}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Hourly Rate ($)"
            value={workForm.rate}
            onChangeText={(rate) => setWorkForm({ ...workForm, rate })}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          
          <Button mode="contained" onPress={handleAddWork} style={styles.submitButton}>
            Add Work Record
          </Button>
        </Modal>
      </Portal>

      {/* FAB for quick actions */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowWorkModal(true)}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  visaNumber: {
    color: '#666',
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  visaInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
  },
  renewButton: {
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  totalBox: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginVertical: 8,
  },
  monthlyAmount: {
    fontSize: 18,
    color: '#2E7D32',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  breakdownDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  savingsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    elevation: 1,
  },
  savingsInfo: {
    marginLeft: 16,
  },
  savingsLabel: {
    fontSize: 14,
    color: '#666',
  },
  savingsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  childCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  childInfo: {
    marginLeft: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
  },
  providerName: {
    fontSize: 14,
    color: '#666',
  },
  costInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyFee: {
    fontSize: 18,
    fontWeight: '600',
  },
  subsidy: {
    fontSize: 14,
    color: '#4CAF50',
  },
  annualBox: {
    alignItems: 'flex-end',
  },
  annualLabel: {
    fontSize: 12,
    color: '#666',
  },
  annualCost: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default VisaComplianceScreen;