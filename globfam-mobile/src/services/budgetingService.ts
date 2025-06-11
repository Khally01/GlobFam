// Budgeting and Payment Reminder Service

export interface PaymentReminder {
  id: string;
  type: 'visa' | 'tuition' | 'school' | 'childcare' | 'rent' | 'other';
  title: string;
  amount: number;
  currency: string;
  dueDate: Date;
  frequency: 'once' | 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'semester' | 'yearly';
  reminderDays: number[]; // Days before due date to remind [30, 14, 7, 1]
  isPaid: boolean;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currency: string;
  targetDate: Date;
  currentAmount: number;
  category: 'visa' | 'education' | 'emergency' | 'travel' | 'other';
  autoSaveAmount?: number; // Amount to save per period
  autoSavePeriod?: 'weekly' | 'fortnightly' | 'monthly';
}

export interface BudgetPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  savingsTarget: number;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}

// Australian education payment schedules
export const PAYMENT_SCHEDULES = {
  university: {
    domestic: {
      census_dates: ['March 31', 'August 31'], // HECS-HELP census dates
      payment_due: 'Before census date'
    },
    international: {
      payment_schedule: 'Per semester',
      due_dates: ['February 15', 'July 15'],
      late_fee: 200
    }
  },
  school: {
    public: {
      payment_schedule: 'Per term',
      terms: 4,
      due_dates: ['January 31', 'April 30', 'July 31', 'October 31']
    },
    private: {
      payment_schedule: 'Per term or yearly',
      terms: 4,
      discount_yearly: 0.05 // 5% discount for yearly payment
    }
  },
  childcare: {
    payment_schedule: 'Weekly or fortnightly',
    gap_fee: 'After CCS applied',
    late_fee: 20
  }
};

export class BudgetingService {
  // Calculate how much to save per period for visa renewal
  static calculateVisaSavingsPlan(
    visaExpiryDate: Date,
    totalRequired: number,
    currentSavings: number = 0,
    savingFrequency: 'weekly' | 'fortnightly' | 'monthly' = 'fortnightly'
  ): {
    amountPerPeriod: number;
    totalPeriods: number;
    targetReached: Date;
    onTrack: boolean;
    shortfall: number;
  } {
    const today = new Date();
    const daysUntilExpiry = Math.ceil((visaExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate periods based on frequency
    let periodsUntilExpiry = 0;
    switch (savingFrequency) {
      case 'weekly':
        periodsUntilExpiry = Math.floor(daysUntilExpiry / 7);
        break;
      case 'fortnightly':
        periodsUntilExpiry = Math.floor(daysUntilExpiry / 14);
        break;
      case 'monthly':
        periodsUntilExpiry = Math.floor(daysUntilExpiry / 30);
        break;
    }
    
    const amountNeeded = totalRequired - currentSavings;
    const amountPerPeriod = Math.ceil(amountNeeded / periodsUntilExpiry);
    
    // Calculate when target will be reached
    const targetReached = new Date();
    switch (savingFrequency) {
      case 'weekly':
        targetReached.setDate(today.getDate() + (periodsUntilExpiry * 7));
        break;
      case 'fortnightly':
        targetReached.setDate(today.getDate() + (periodsUntilExpiry * 14));
        break;
      case 'monthly':
        targetReached.setMonth(today.getMonth() + periodsUntilExpiry);
        break;
    }
    
    const onTrack = targetReached <= visaExpiryDate;
    const shortfall = onTrack ? 0 : amountNeeded - (amountPerPeriod * periodsUntilExpiry);
    
    return {
      amountPerPeriod,
      totalPeriods: periodsUntilExpiry,
      targetReached,
      onTrack,
      shortfall
    };
  }

  // Generate payment reminders for the year
  static generateYearlyReminders(
    userId: string,
    hasChildren: boolean = true,
    universityFees: number = 35000
  ): PaymentReminder[] {
    const reminders: PaymentReminder[] = [];
    const currentYear = new Date().getFullYear();
    
    // University tuition (2 semesters)
    reminders.push(
      {
        id: `tuition-sem1-${currentYear}`,
        type: 'tuition',
        title: 'Semester 1 Tuition Payment',
        amount: universityFees / 2,
        currency: 'AUD',
        dueDate: new Date(currentYear, 1, 15), // Feb 15
        frequency: 'semester',
        reminderDays: [30, 14, 7, 3, 1],
        isPaid: false,
        notes: 'International student tuition - must pay before census date'
      },
      {
        id: `tuition-sem2-${currentYear}`,
        type: 'tuition',
        title: 'Semester 2 Tuition Payment',
        amount: universityFees / 2,
        currency: 'AUD',
        dueDate: new Date(currentYear, 6, 15), // July 15
        frequency: 'semester',
        reminderDays: [30, 14, 7, 3, 1],
        isPaid: false,
        notes: 'International student tuition - must pay before census date'
      }
    );
    
    // School fees (if has children)
    if (hasChildren) {
      for (let term = 1; term <= 4; term++) {
        const monthIndex = [0, 3, 6, 9][term - 1]; // Jan, Apr, Jul, Oct
        reminders.push({
          id: `school-term${term}-${currentYear}`,
          type: 'school',
          title: `School Fees - Term ${term}`,
          amount: 250, // Public school term fee
          currency: 'AUD',
          dueDate: new Date(currentYear, monthIndex, 31),
          frequency: 'quarterly',
          reminderDays: [14, 7, 3, 1],
          isPaid: false,
          notes: 'Sydney Public School term fees'
        });
      }
      
      // Weekly childcare reminders (just next 4 weeks as example)
      for (let week = 0; week < 4; week++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (week * 7) + 7);
        
        reminders.push({
          id: `childcare-week-${week}`,
          type: 'childcare',
          title: 'Childcare Weekly Fee',
          amount: 225, // After 50% CCS
          currency: 'AUD',
          dueDate: dueDate,
          frequency: 'weekly',
          reminderDays: [3, 1],
          isPaid: false,
          notes: 'Bright Stars Childcare - Gap fee after CCS'
        });
      }
    }
    
    // Visa renewal reminder (if within 6 months)
    const visaExpiry = new Date(currentYear + 1, 6, 14); // Example: July 14 next year
    const monthsUntilExpiry = Math.ceil((visaExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsUntilExpiry <= 6) {
      reminders.push({
        id: `visa-renewal-${currentYear}`,
        type: 'visa',
        title: 'Visa Renewal Application',
        amount: 1680, // Subclass 500 visa fee
        currency: 'AUD',
        dueDate: new Date(visaExpiry.getTime() - (90 * 24 * 60 * 60 * 1000)), // 90 days before expiry
        frequency: 'once',
        reminderDays: [90, 60, 30, 14, 7],
        isPaid: false,
        notes: 'Student visa renewal - apply 3 months before expiry'
      });
    }
    
    return reminders;
  }

  // Calculate budget breakdown for visa period
  static calculateVisaPeriodBudget(
    monthsUntilVisa: number,
    monthlyIncome: number,
    fixedExpenses: { [key: string]: number },
    savingsRequired: number
  ): {
    totalIncome: number;
    totalExpenses: number;
    monthlySavingsNeeded: number;
    feasible: boolean;
    adjustmentNeeded: number;
    recommendations: string[];
  } {
    const totalIncome = monthlyIncome * monthsUntilVisa;
    const monthlyExpenses = Object.values(fixedExpenses).reduce((sum, expense) => sum + expense, 0);
    const totalExpenses = monthlyExpenses * monthsUntilVisa;
    const monthlySavingsNeeded = savingsRequired / monthsUntilVisa;
    
    const availableForSavings = monthlyIncome - monthlyExpenses;
    const feasible = availableForSavings >= monthlySavingsNeeded;
    const adjustmentNeeded = feasible ? 0 : monthlySavingsNeeded - availableForSavings;
    
    const recommendations: string[] = [];
    
    if (!feasible) {
      recommendations.push(`Need to reduce expenses by $${adjustmentNeeded.toFixed(2)}/month`);
      
      // Suggest specific cuts
      if (fixedExpenses['entertainment'] > 100) {
        recommendations.push('Consider reducing entertainment budget by 50%');
      }
      if (fixedExpenses['dining'] > 200) {
        recommendations.push('Cook more at home - save up to $150/month');
      }
      recommendations.push('Look for additional part-time work opportunities');
      recommendations.push('Apply for scholarships or financial aid');
    } else {
      const surplus = availableForSavings - monthlySavingsNeeded;
      if (surplus > 100) {
        recommendations.push(`You have $${surplus.toFixed(2)}/month extra - consider emergency fund`);
      }
      recommendations.push('On track to meet visa savings goal!');
    }
    
    return {
      totalIncome,
      totalExpenses,
      monthlySavingsNeeded,
      feasible,
      adjustmentNeeded,
      recommendations
    };
  }

  // Get upcoming payment reminders
  static getUpcomingReminders(
    reminders: PaymentReminder[],
    daysAhead: number = 30
  ): PaymentReminder[] {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    return reminders
      .filter(reminder => !reminder.isPaid && reminder.dueDate >= today && reminder.dueDate <= futureDate)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  // Calculate savings progress
  static calculateSavingsProgress(goal: SavingsGoal): {
    percentageComplete: number;
    amountRemaining: number;
    daysRemaining: number;
    onTrack: boolean;
    projectedCompletion: Date;
    monthlyRequired: number;
  } {
    const today = new Date();
    const percentageComplete = (goal.currentAmount / goal.targetAmount) * 100;
    const amountRemaining = goal.targetAmount - goal.currentAmount;
    const daysRemaining = Math.ceil((goal.targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const monthsRemaining = daysRemaining / 30;
    const monthlyRequired = amountRemaining / monthsRemaining;
    
    // Calculate projected completion based on auto-save
    let projectedCompletion = new Date(goal.targetDate);
    if (goal.autoSaveAmount && goal.autoSavePeriod) {
      const periodsNeeded = Math.ceil(amountRemaining / goal.autoSaveAmount);
      
      switch (goal.autoSavePeriod) {
        case 'weekly':
          projectedCompletion = new Date();
          projectedCompletion.setDate(today.getDate() + (periodsNeeded * 7));
          break;
        case 'fortnightly':
          projectedCompletion = new Date();
          projectedCompletion.setDate(today.getDate() + (periodsNeeded * 14));
          break;
        case 'monthly':
          projectedCompletion = new Date();
          projectedCompletion.setMonth(today.getMonth() + periodsNeeded);
          break;
      }
    }
    
    const onTrack = projectedCompletion <= goal.targetDate;
    
    return {
      percentageComplete,
      amountRemaining,
      daysRemaining,
      onTrack,
      projectedCompletion,
      monthlyRequired
    };
  }

  // Generate budget categories for international students
  static getStudentBudgetCategories(monthlyIncome: number): BudgetCategory[] {
    const categories = [
      { name: 'Rent', budgeted: monthlyIncome * 0.35, spent: 0, remaining: 0, percentage: 35 },
      { name: 'Groceries', budgeted: monthlyIncome * 0.15, spent: 0, remaining: 0, percentage: 15 },
      { name: 'Transport', budgeted: monthlyIncome * 0.08, spent: 0, remaining: 0, percentage: 8 },
      { name: 'Utilities', budgeted: monthlyIncome * 0.05, spent: 0, remaining: 0, percentage: 5 },
      { name: 'Education', budgeted: monthlyIncome * 0.10, spent: 0, remaining: 0, percentage: 10 },
      { name: 'Healthcare', budgeted: monthlyIncome * 0.03, spent: 0, remaining: 0, percentage: 3 },
      { name: 'Entertainment', budgeted: monthlyIncome * 0.05, spent: 0, remaining: 0, percentage: 5 },
      { name: 'Savings', budgeted: monthlyIncome * 0.15, spent: 0, remaining: 0, percentage: 15 },
      { name: 'Other', budgeted: monthlyIncome * 0.04, spent: 0, remaining: 0, percentage: 4 }
    ];
    
    categories.forEach(cat => {
      cat.remaining = cat.budgeted - cat.spent;
    });
    
    return categories;
  }
}

export default BudgetingService;