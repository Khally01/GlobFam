import { Goal, GoalStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { io } from '../index';

interface CreateGoalDto {
  name: string;
  description?: string;
  targetAmount: number;
  currency: string;
  targetDate: Date;
  familyId?: string;
  priority?: number;
}

interface GoalContribution {
  goalId: string;
  amount: number;
  notes?: string;
}

interface GoalMilestone {
  percentage: number;
  reached: boolean;
  reachedAt?: Date;
  message: string;
}

export class GoalService {
  static async createGoal(userId: string, data: CreateGoalDto): Promise<Goal> {
    // If family goal, verify permission
    if (data.familyId) {
      const familyMember = await prisma.familyMember.findFirst({
        where: {
          userId,
          familyId: data.familyId,
          role: { in: ['ADMIN', 'PARENT'] },
        },
      });

      if (!familyMember) {
        throw new AppError('You do not have permission to create family goals', 403);
      }
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        familyId: data.familyId,
        name: data.name,
        description: data.description,
        targetAmount: data.targetAmount,
        currency: data.currency as any,
        targetDate: data.targetDate,
        priority: data.priority || 1,
      },
    });

    logger.info(`Goal created: ${goal.id} for user ${userId}`);
    
    // Send notification
    await this.sendGoalNotification(userId, goal, 'created');
    
    return goal;
  }

  static async getGoals(userId: string, includeFamily: boolean = true) {
    const where: Prisma.GoalWhereInput = {
      OR: [{ userId }],
    };

    // Include family goals if requested
    if (includeFamily) {
      const families = await prisma.familyMember.findMany({
        where: { userId },
        select: { familyId: true },
      });
      
      const familyIds = families.map(f => f.familyId);
      where.OR!.push({ familyId: { in: familyIds } });
    }

    const goals = await prisma.goal.findMany({
      where,
      include: {
        family: true,
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { targetDate: 'asc' },
      ],
    });

    // Calculate milestones for each goal
    const goalsWithMilestones = goals.map(goal => ({
      ...goal,
      milestones: this.calculateMilestones(goal),
      daysRemaining: this.calculateDaysRemaining(goal.targetDate),
      progressPercentage: this.calculateProgress(goal),
    }));

    return goalsWithMilestones;
  }

  static async contributeToGoal(userId: string, contribution: GoalContribution) {
    const goal = await prisma.goal.findFirst({
      where: {
        id: contribution.goalId,
        OR: [
          { userId },
          { family: { members: { some: { userId } } } },
        ],
      },
    });

    if (!goal) {
      throw new AppError('Goal not found or access denied', 404);
    }

    const newAmount = Number(goal.currentAmount) + contribution.amount;
    const wasCompleted = goal.status === 'COMPLETED';

    // Update goal
    const updatedGoal = await prisma.goal.update({
      where: { id: contribution.goalId },
      data: {
        currentAmount: newAmount,
        status: newAmount >= Number(goal.targetAmount) ? 'COMPLETED' : goal.status,
        completedAt: newAmount >= Number(goal.targetAmount) && !wasCompleted ? new Date() : undefined,
      },
    });

    // Create contribution record (extend schema if needed)
    // For now, we'll log it
    logger.info(`Contribution of ${contribution.amount} to goal ${goal.id} by user ${userId}`);

    // Check for milestone achievements
    const milestones = this.calculateMilestones(updatedGoal);
    const newlyReachedMilestones = milestones.filter(m => 
      m.reached && !this.calculateMilestones(goal).find(om => om.percentage === m.percentage)?.reached
    );

    // Send notifications for milestones
    for (const milestone of newlyReachedMilestones) {
      await this.sendMilestoneNotification(userId, updatedGoal, milestone);
    }

    // If goal completed, send completion notification
    if (updatedGoal.status === 'COMPLETED' && !wasCompleted) {
      await this.sendGoalNotification(userId, updatedGoal, 'completed');
      
      // Emit real-time update
      if (goal.familyId) {
        io.to(`family-${goal.familyId}`).emit('goal-completed', {
          goalId: updatedGoal.id,
          completedBy: userId,
        });
      }
    }

    return updatedGoal;
  }

  static async updateGoal(userId: string, goalId: string, data: Partial<CreateGoalDto>) {
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        OR: [
          { userId },
          { family: { members: { some: { userId, role: { in: ['ADMIN', 'PARENT'] } } } } },
        ],
      },
    });

    if (!goal) {
      throw new AppError('Goal not found or insufficient permissions', 404);
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        name: data.name,
        description: data.description,
        targetAmount: data.targetAmount,
        targetDate: data.targetDate,
        priority: data.priority,
      },
    });

    return updatedGoal;
  }

  static async pauseGoal(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!goal) {
      throw new AppError('Active goal not found', 404);
    }

    return prisma.goal.update({
      where: { id: goalId },
      data: { status: 'PAUSED' },
    });
  }

  static async resumeGoal(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
        status: 'PAUSED',
      },
    });

    if (!goal) {
      throw new AppError('Paused goal not found', 404);
    }

    return prisma.goal.update({
      where: { id: goalId },
      data: { status: 'ACTIVE' },
    });
  }

  static async getGoalAnalytics(userId: string) {
    const goals = await this.getGoals(userId);
    
    const activeGoals = goals.filter(g => g.status === 'ACTIVE');
    const completedGoals = goals.filter(g => g.status === 'COMPLETED');
    
    const totalTargetAmount = activeGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
    const totalCurrentAmount = activeGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    
    // Calculate completion rate
    const totalGoals = goals.length;
    const completionRate = totalGoals > 0 ? (completedGoals.length / totalGoals) * 100 : 0;
    
    // Average time to complete
    const completedWithTime = completedGoals.filter(g => g.completedAt);
    const avgDaysToComplete = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, g) => {
          const days = Math.floor(
            (g.completedAt!.getTime() - g.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0) / completedWithTime.length
      : 0;

    return {
      summary: {
        totalGoals,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        pausedGoals: goals.filter(g => g.status === 'PAUSED').length,
        overallProgress,
        completionRate,
        avgDaysToComplete,
      },
      topPriorities: activeGoals
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 3)
        .map(g => ({
          id: g.id,
          name: g.name,
          progress: this.calculateProgress(g),
          daysRemaining: this.calculateDaysRemaining(g.targetDate),
        })),
      nearingCompletion: activeGoals
        .filter(g => this.calculateProgress(g) >= 75)
        .sort((a, b) => this.calculateProgress(b) - this.calculateProgress(a))
        .slice(0, 3),
      recentlyCompleted: completedGoals
        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
        .slice(0, 3),
    };
  }

  private static calculateMilestones(goal: Goal): GoalMilestone[] {
    const milestones = [25, 50, 75, 100];
    const currentProgress = this.calculateProgress(goal);

    return milestones.map(percentage => ({
      percentage,
      reached: currentProgress >= percentage,
      reachedAt: currentProgress >= percentage ? new Date() : undefined,
      message: this.getMilestoneMessage(percentage),
    }));
  }

  private static calculateProgress(goal: Goal): number {
    const current = Number(goal.currentAmount);
    const target = Number(goal.targetAmount);
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  }

  private static calculateDaysRemaining(targetDate: Date): number {
    const today = new Date();
    const days = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }

  private static getMilestoneMessage(percentage: number): string {
    const messages: Record<number, string> = {
      25: "Great start! You're 1/4 of the way there!",
      50: "Halfway there! Keep up the momentum!",
      75: "Almost there! Just a little more to go!",
      100: "Congratulations! Goal achieved! 🎉",
    };
    return messages[percentage] || `${percentage}% complete`;
  }

  private static async sendGoalNotification(userId: string, goal: Goal, type: 'created' | 'completed') {
    const titles: Record<string, string> = {
      created: 'New Goal Created',
      completed: 'Goal Achieved! 🎉',
    };

    const messages: Record<string, string> = {
      created: `Your goal "${goal.name}" has been created. Target: ${goal.currency}${goal.targetAmount}`,
      completed: `Congratulations! You've achieved your goal "${goal.name}"!`,
    };

    await prisma.notification.create({
      data: {
        userId,
        type: 'GOAL_PROGRESS',
        title: titles[type],
        message: messages[type],
        data: { goalId: goal.id, type },
      },
    });
  }

  private static async sendMilestoneNotification(userId: string, goal: Goal, milestone: GoalMilestone) {
    await prisma.notification.create({
      data: {
        userId,
        type: 'GOAL_PROGRESS',
        title: `Milestone Reached: ${milestone.percentage}%`,
        message: `${milestone.message} Goal: ${goal.name}`,
        data: { 
          goalId: goal.id, 
          milestone: milestone.percentage,
        },
      },
    });
  }
}