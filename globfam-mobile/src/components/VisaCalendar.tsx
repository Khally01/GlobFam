import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface, IconButton, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface WorkDay {
  date: Date;
  hours: number;
  employer: string;
}

interface VisaCalendarProps {
  visaExpiryDate: Date;
  courseEndDate: Date;
  workDays: WorkDay[];
  onDayPress?: (date: Date) => void;
}

const VisaCalendar: React.FC<VisaCalendarProps> = ({
  visaExpiryDate,
  courseEndDate,
  workDays,
  onDayPress
}) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isVisaExpiry = (date: Date) => {
    return date.toDateString() === visaExpiryDate.toDateString();
  };

  const isCourseEnd = (date: Date) => {
    return date.toDateString() === courseEndDate.toDateString();
  };

  const getWorkHours = (date: Date) => {
    const workDay = workDays.find(w => 
      new Date(w.date).toDateString() === date.toDateString()
    );
    return workDay?.hours || 0;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={goToPreviousMonth} />
        <TouchableOpacity onPress={goToToday}>
          <Text style={styles.monthText}>{formatMonthYear(currentMonth)}</Text>
        </TouchableOpacity>
        <IconButton icon="chevron-right" onPress={goToNextMonth} />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Work Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
          <Text style={styles.legendText}>Visa Expiry</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
          <Text style={styles.legendText}>Course End</Text>
        </View>
      </View>

      <View style={styles.weekDaysRow}>
        {weekDays.map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.emptyDay} />;
          }

          const workHours = getWorkHours(date);
          const isVisa = isVisaExpiry(date);
          const isCourse = isCourseEnd(date);
          const today = isToday(date);

          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={[
                styles.dayCell,
                today && styles.todayCell,
                isVisa && styles.visaExpiryCell,
                isCourse && styles.courseEndCell,
                workHours > 0 && styles.workDayCell
              ]}
              onPress={() => onDayPress?.(date)}
            >
              <Text style={[
                styles.dayText,
                today && styles.todayText,
                (isVisa || isCourse) && styles.specialDayText
              ]}>
                {date.getDate()}
              </Text>
              
              {workHours > 0 && (
                <View style={styles.workHoursBadge}>
                  <Text style={styles.workHoursText}>{workHours}h</Text>
                </View>
              )}
              
              {isVisa && (
                <MaterialCommunityIcons 
                  name="passport" 
                  size={16} 
                  color={theme.colors.error}
                  style={styles.dayIcon}
                />
              )}
              
              {isCourse && (
                <MaterialCommunityIcons 
                  name="school" 
                  size={16} 
                  color="#9C27B0"
                  style={styles.dayIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Surface style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <MaterialCommunityIcons name="passport" size={20} color={theme.colors.error} />
          <Text style={styles.summaryText}>
            Visa expires in {Math.ceil((visaExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <MaterialCommunityIcons name="school" size={20} color="#9C27B0" />
          <Text style={styles.summaryText}>
            Course ends in {Math.ceil((courseEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
          </Text>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  todayCell: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  todayText: {
    fontWeight: '600',
    color: '#1976D2',
  },
  visaExpiryCell: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  courseEndCell: {
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
  },
  workDayCell: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  specialDayText: {
    fontWeight: '600',
  },
  workHoursBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  workHoursText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  dayIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  summaryCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    flex: 1,
  },
});

export default VisaCalendar;