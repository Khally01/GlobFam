import { PrismaClient, Prisma, Goal, GoalType, GoalStatus } from '@prisma/client';
import { addMonths, differenceInDays, format } from 'date-fns';

interface CreateGoalInput {
  name: string;
  description?: string;
  type: GoalType;
  targetAmount: number;
  currency: string;
  targetDate: Date;
  autoContribute?: boolean;
  contributionAmount?: number;
  contributionFrequency?: string;
}

interface ContributeToGoalInput {
  goalId: string;
  amount: number;
  note?: string;
  transactionId?: string;
}

interface GoalProgress {
  goal: Goal;
  progress: number;
  daysRemaining: number;
  monthlyTargetContribution: number;
  onTrack: boolean;
  projectedCompletion?: Date;
}

export class GoalsService {
  constructor(private prisma: PrismaClient) {}

  async createGoal(
    userId: string,
    organizationId: string,
    input: CreateGoalInput
  ): Promise<Goal> {
    return this.prisma.goal.create({
      data: {
        ...input,
        targetAmount: new Prisma.Decimal(input.targetAmount),
        contributionAmount: input.contributionAmount 
          ? new Prisma.Decimal(input.contributionAmount)
          : undefined,
        userId,
        organizationId
      }
    });
  }

  async getGoals(
    userId: string,
    organizationId: string,
    status?: GoalStatus
  ): Promise<GoalProgress[]> {
    const goals = await this.prisma.goal.findMany({
      where: {
        userId,
        organizationId,
        ...(status && { status })
      },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    return goals.map(goal => this.calculateGoalProgress(goal));
  }

  async getGoalById(
    goalId: string,
    userId: string,
    organizationId: string
  ): Promise<GoalProgress | null> {
    const goal = await this.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
        organizationId
      },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!goal) return null;
    return this.calculateGoalProgress(goal);
  }

  async contributeToGoal(
    userId: string,
    organizationId: string,
    input: ContributeToGoalInput
  ): Promise<Goal> {
    // Verify goal ownership
    const goal = await this.prisma.goal.findFirst({
      where: {
        id: input.goalId,
        userId,
        organizationId
      }
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    // Create contribution and update goal in transaction
    const [contribution, updatedGoal] = await this.prisma.$transaction([
      this.prisma.goalContribution.create({
        data: {
          goalId: input.goalId,
          amount: new Prisma.Decimal(input.amount),
          note: input.note,
          transactionId: input.transactionId
        }
      }),
      this.prisma.goal.update({
        where: { id: input.goalId },
        data: {
          currentAmount: {
            increment: input.amount
          }
        }
      })
    ]);

    // Check if goal is completed
    if (updatedGoal.currentAmount.gte(updatedGoal.targetAmount)) {
      await this.prisma.goal.update({
        where: { id: input.goalId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });
    }

    return updatedGoal;
  }

  async updateGoal(
    goalId: string,
    userId: string,
    organizationId: string,
    data: Partial<CreateGoalInput>
  ): Promise<Goal> {
    // Verify ownership
    const goal = await this.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
        organizationId
      }
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        ...data,
        targetAmount: data.targetAmount 
          ? new Prisma.Decimal(data.targetAmount)
          : undefined,
        contributionAmount: data.contributionAmount 
          ? new Prisma.Decimal(data.contributionAmount)
          : undefined
      }
    });
  }

  async deleteGoal(
    goalId: string,
    userId: string,
    organizationId: string
  ): Promise<void> {
    // Verify ownership
    const goal = await this.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
        organizationId
      }
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    await this.prisma.goal.delete({
      where: { id: goalId }
    });
  }

  async getGoalInsights(
    userId: string,
    organizationId: string
  ): Promise<any> {
    const goals = await this.prisma.goal.findMany({
      where: {
        userId,
        organizationId,
        status: 'ACTIVE'
      },
      include: {
        contributions: true
      }
    });

    const totalTargetAmount = goals.reduce(
      (sum, goal) => sum + goal.targetAmount.toNumber(),
      0
    );

    const totalCurrentAmount = goals.reduce(
      (sum, goal) => sum + goal.currentAmount.toNumber(),
      0
    );

    const goalsOnTrack = goals.filter(goal => {
      const progress = this.calculateGoalProgress(goal);
      return progress.onTrack;
    });

    const monthlyContributions = await this.getMonthlyContributions(
      userId,
      organizationId,
      6
    );

    return {
      activeGoals: goals.length,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress: totalTargetAmount > 0 
        ? (totalCurrentAmount / totalTargetAmount) * 100 
        : 0,
      goalsOnTrack: goalsOnTrack.length,
      goalsOffTrack: goals.length - goalsOnTrack.length,
      monthlyContributions,
      recommendations: this.generateGoalRecommendations(goals)
    };
  }

  private calculateGoalProgress(goal: any): GoalProgress {
    const targetAmount = goal.targetAmount.toNumber();
    const currentAmount = goal.currentAmount.toNumber();
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    
    const today = new Date();
    const daysRemaining = differenceInDays(new Date(goal.targetDate), today);
    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
    
    const remainingAmount = targetAmount - currentAmount;
    const monthlyTargetContribution = remainingAmount / monthsRemaining;
    
    // Calculate if on track based on time elapsed
    const totalDays = differenceInDays(new Date(goal.targetDate), new Date(goal.createdAt));
    const daysElapsed = totalDays - daysRemaining;
    const expectedProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
    
    const onTrack = progress >= expectedProgress * 0.9; // 90% of expected progress
    
    // Project completion date based on current contribution rate
    let projectedCompletion: Date | undefined;
    if (goal.contributions && goal.contributions.length > 0) {
      const recentContributions = goal.contributions.slice(0, 3);
      const avgContribution = recentContributions.reduce(
        (sum: number, c: any) => sum + c.amount.toNumber(),
        0
      ) / recentContributions.length;
      
      if (avgContribution > 0) {
        const monthsToComplete = remainingAmount / avgContribution;
        projectedCompletion = addMonths(today, monthsToComplete);
      }
    }
    
    return {
      goal,
      progress,
      daysRemaining,
      monthlyTargetContribution,
      onTrack,
      projectedCompletion
    };
  }

  private async getMonthlyContributions(
    userId: string,
    organizationId: string,
    months: number
  ): Promise<any[]> {
    const startDate = addMonths(new Date(), -months);
    
    const contributions = await this.prisma.goalContribution.findMany({
      where: {
        goal: {
          userId,
          organizationId
        },
        createdAt: {
          gte: startDate
        }
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    // Group by month
    const monthlyData = new Map<string, number>();
    contributions.forEach(contrib => {
      const month = format(contrib.createdAt, 'MMM yyyy');
      const current = monthlyData.get(month) || 0;
      monthlyData.set(month, current + contrib.amount.toNumber());
    });

    // Convert to array
    return Array.from(monthlyData.entries()).map(([month, amount]) => ({
      month,
      amount
    }));
  }

  private generateGoalRecommendations(goals: any[]): string[] {
    const recommendations: string[] = [];
    
    const offTrackGoals = goals.filter(goal => {
      const progress = this.calculateGoalProgress(goal);
      return !progress.onTrack;
    });

    if (offTrackGoals.length > 0) {
      recommendations.push(
        `${offTrackGoals.length} of your goals are behind schedule. Consider increasing contributions.`
      );
    }

    const noContributionGoals = goals.filter(
      goal => !goal.contributions || goal.contributions.length === 0
    );

    if (noContributionGoals.length > 0) {
      recommendations.push(
        `You haven't started contributing to ${noContributionGoals.length} goals yet.`
      );
    }

    const nearCompletionGoals = goals.filter(goal => {
      const progress = goal.currentAmount.toNumber() / goal.targetAmount.toNumber();
      return progress >= 0.8 && progress < 1;
    });

    if (nearCompletionGoals.length > 0) {
      recommendations.push(
        `${nearCompletionGoals.length} goals are close to completion! Keep it up!`
      );
    }

    return recommendations;
  }
}