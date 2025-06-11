// Australian Student Visa (Subclass 500) Compliance Service

export interface VisaDetails {
  visaType: string;
  visaNumber: string;
  startDate: Date;
  expiryDate: Date;
  workCondition: string; // e.g., "8105 - 48 hours per fortnight"
  courseEndDate: Date;
  educationProvider: string;
}

export interface WorkHours {
  id: string;
  date: Date;
  hours: number;
  employer: string;
  rate: number;
  income: number;
}

export interface FinancialRequirement {
  category: string;
  annualAmount: number;
  monthlyAmount: number;
  description: string;
}

export interface ChildcareDetails {
  childName: string;
  age: number;
  type: 'childcare' | 'school';
  provider: string;
  weeklyFee: number;
  subsidyRate?: number; // Child Care Subsidy percentage
  annualCost: number;
}

// Australian Government Requirements (2024)
export const VISA_FINANCIAL_REQUIREMENTS = {
  // Living costs as per Department of Home Affairs
  primary: {
    student: 24505, // Annual living cost for student
    partner: 8574,  // Annual living cost for partner
    child: 3670     // Annual living cost per child
  },
  // Course fees (average)
  education: {
    undergraduate: 35000,  // Average annual
    postgraduate: 40000,   // Average annual
    english: 300          // Per week
  },
  // Childcare costs in Australia (average)
  childcare: {
    longDaycare: {
      daily: 130,
      weekly: 650,
      annual: 33800
    },
    familyDaycare: {
      daily: 110,
      weekly: 550,
      annual: 28600
    },
    beforeAfterSchool: {
      daily: 30,
      weekly: 150,
      annual: 7800
    }
  },
  // School costs
  school: {
    public: {
      primary: 500,    // Annual fees
      secondary: 800   // Annual fees
    },
    private: {
      primary: 15000,  // Annual average
      secondary: 25000 // Annual average
    }
  }
};

// Work restrictions for Student Visa 500
export const WORK_RESTRICTIONS = {
  maxHoursPerFortnight: 48,
  maxHoursPerWeek: 24,
  unlimitedDuringBreaks: true,
  warningThreshold: 44, // Hours before warning
  criticalThreshold: 46 // Hours before critical warning
};

export class VisaComplianceService {
  // Calculate work hours for current fortnight
  static calculateFortnightHours(workRecords: WorkHours[]): {
    currentHours: number;
    remainingHours: number;
    percentage: number;
    status: 'safe' | 'warning' | 'critical' | 'exceeded';
    fortnightStart: Date;
    fortnightEnd: Date;
  } {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Australian fortnight starts on Monday
    const fortnightStart = new Date(today);
    fortnightStart.setDate(today.getDate() - daysToMonday - (Math.floor(daysToMonday / 7) * 7));
    fortnightStart.setHours(0, 0, 0, 0);
    
    const fortnightEnd = new Date(fortnightStart);
    fortnightEnd.setDate(fortnightStart.getDate() + 13);
    fortnightEnd.setHours(23, 59, 59, 999);
    
    // Calculate hours in current fortnight
    const currentHours = workRecords
      .filter(record => 
        record.date >= fortnightStart && 
        record.date <= fortnightEnd
      )
      .reduce((total, record) => total + record.hours, 0);
    
    const remainingHours = Math.max(0, WORK_RESTRICTIONS.maxHoursPerFortnight - currentHours);
    const percentage = (currentHours / WORK_RESTRICTIONS.maxHoursPerFortnight) * 100;
    
    let status: 'safe' | 'warning' | 'critical' | 'exceeded';
    if (currentHours > WORK_RESTRICTIONS.maxHoursPerFortnight) {
      status = 'exceeded';
    } else if (currentHours >= WORK_RESTRICTIONS.criticalThreshold) {
      status = 'critical';
    } else if (currentHours >= WORK_RESTRICTIONS.warningThreshold) {
      status = 'warning';
    } else {
      status = 'safe';
    }
    
    return {
      currentHours,
      remainingHours,
      percentage,
      status,
      fortnightStart,
      fortnightEnd
    };
  }

  // Calculate days until visa expiry
  static calculateVisaExpiry(expiryDate: Date): {
    daysRemaining: number;
    monthsRemaining: number;
    status: 'expired' | 'critical' | 'warning' | 'safe';
    renewalDeadline: Date;
  } {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const monthsRemaining = Math.ceil(daysRemaining / 30);
    
    // Visa renewal should start 3 months before expiry
    const renewalDeadline = new Date(expiry);
    renewalDeadline.setMonth(expiry.getMonth() - 3);
    
    let status: 'expired' | 'critical' | 'warning' | 'safe';
    if (daysRemaining < 0) {
      status = 'expired';
    } else if (daysRemaining <= 30) {
      status = 'critical';
    } else if (daysRemaining <= 90) {
      status = 'warning';
    } else {
      status = 'safe';
    }
    
    return {
      daysRemaining,
      monthsRemaining,
      status,
      renewalDeadline
    };
  }

  // Calculate total financial requirements
  static calculateFinancialRequirements(
    familySize: { students: number; partners: number; children: number },
    courseFees: number,
    childcareDetails: ChildcareDetails[]
  ): {
    totalAnnual: number;
    totalMonthly: number;
    breakdown: FinancialRequirement[];
    savingsRequired: number; // For visa application
  } {
    const breakdown: FinancialRequirement[] = [];
    
    // Living costs
    const studentCosts = familySize.students * VISA_FINANCIAL_REQUIREMENTS.primary.student;
    const partnerCosts = familySize.partners * VISA_FINANCIAL_REQUIREMENTS.primary.partner;
    const childrenCosts = familySize.children * VISA_FINANCIAL_REQUIREMENTS.primary.child;
    
    breakdown.push({
      category: 'Student Living Costs',
      annualAmount: studentCosts,
      monthlyAmount: studentCosts / 12,
      description: `$${VISA_FINANCIAL_REQUIREMENTS.primary.student.toLocaleString()} per student per year`
    });
    
    if (familySize.partners > 0) {
      breakdown.push({
        category: 'Partner Living Costs',
        annualAmount: partnerCosts,
        monthlyAmount: partnerCosts / 12,
        description: `$${VISA_FINANCIAL_REQUIREMENTS.primary.partner.toLocaleString()} per partner per year`
      });
    }
    
    if (familySize.children > 0) {
      breakdown.push({
        category: 'Children Living Costs',
        annualAmount: childrenCosts,
        monthlyAmount: childrenCosts / 12,
        description: `$${VISA_FINANCIAL_REQUIREMENTS.primary.child.toLocaleString()} per child per year`
      });
    }
    
    // Course fees
    breakdown.push({
      category: 'Course Fees',
      annualAmount: courseFees,
      monthlyAmount: courseFees / 12,
      description: 'Annual tuition fees'
    });
    
    // Childcare/School costs
    let totalChildcareCosts = 0;
    childcareDetails.forEach(child => {
      const annualCost = child.annualCost * (1 - (child.subsidyRate || 0) / 100);
      totalChildcareCosts += annualCost;
      
      breakdown.push({
        category: `${child.childName} - ${child.type === 'childcare' ? 'Childcare' : 'School'}`,
        annualAmount: annualCost,
        monthlyAmount: annualCost / 12,
        description: `${child.provider} - $${child.weeklyFee}/week${child.subsidyRate ? ` (${child.subsidyRate}% CCS)` : ''}`
      });
    });
    
    const totalAnnual = studentCosts + partnerCosts + childrenCosts + courseFees + totalChildcareCosts;
    const totalMonthly = totalAnnual / 12;
    
    // Savings required for visa (12 months of living costs + course fees)
    const savingsRequired = studentCosts + partnerCosts + childrenCosts + courseFees;
    
    return {
      totalAnnual,
      totalMonthly,
      breakdown,
      savingsRequired
    };
  }

  // Calculate Child Care Subsidy (CCS)
  static calculateChildCareSubsidy(
    familyIncome: number,
    activityHours: number
  ): {
    subsidyPercentage: number;
    maxHoursPerFortnight: number;
  } {
    // Australian CCS rates (2024)
    let subsidyPercentage = 0;
    
    if (familyIncome <= 75535) {
      subsidyPercentage = 85;
    } else if (familyIncome <= 85535) {
      subsidyPercentage = 85 - ((familyIncome - 75535) / 10000) * 5;
    } else if (familyIncome <= 175535) {
      subsidyPercentage = 50;
    } else if (familyIncome <= 255535) {
      subsidyPercentage = 50 - ((familyIncome - 175535) / 80000) * 30;
    } else if (familyIncome <= 355535) {
      subsidyPercentage = 20;
    } else {
      subsidyPercentage = 0;
    }
    
    // Activity test for hours
    let maxHoursPerFortnight = 0;
    if (activityHours <= 8) {
      maxHoursPerFortnight = 24;
    } else if (activityHours <= 16) {
      maxHoursPerFortnight = 48;
    } else if (activityHours <= 48) {
      maxHoursPerFortnight = 72;
    } else {
      maxHoursPerFortnight = 100;
    }
    
    return {
      subsidyPercentage: Math.max(0, Math.min(85, subsidyPercentage)),
      maxHoursPerFortnight
    };
  }

  // Generate visa compliance report
  static generateComplianceReport(
    visa: VisaDetails,
    workRecords: WorkHours[],
    financials: any
  ): {
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check visa expiry
    const expiryCheck = this.calculateVisaExpiry(visa.expiryDate);
    if (expiryCheck.status === 'expired') {
      issues.push('Visa has expired!');
    } else if (expiryCheck.status === 'critical') {
      issues.push(`Visa expires in ${expiryCheck.daysRemaining} days`);
      recommendations.push('Start visa renewal process immediately');
    } else if (expiryCheck.status === 'warning') {
      recommendations.push(`Consider starting visa renewal - ${expiryCheck.daysRemaining} days remaining`);
    }
    
    // Check work hours
    const hoursCheck = this.calculateFortnightHours(workRecords);
    if (hoursCheck.status === 'exceeded') {
      issues.push(`Work hours exceeded: ${hoursCheck.currentHours}/${WORK_RESTRICTIONS.maxHoursPerFortnight} hours`);
    } else if (hoursCheck.status === 'critical') {
      issues.push(`Close to work limit: ${hoursCheck.currentHours}/${WORK_RESTRICTIONS.maxHoursPerFortnight} hours`);
    }
    
    // Financial recommendations
    if (financials.totalMonthly > financials.currentIncome) {
      recommendations.push('Consider additional income sources or reduce expenses');
    }
    
    return {
      compliant: issues.length === 0,
      issues,
      recommendations
    };
  }
}

// Export types and constants
export default VisaComplianceService;