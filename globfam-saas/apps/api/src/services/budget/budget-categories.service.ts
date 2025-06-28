import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../middleware/errorHandler';

export class BudgetCategoriesService {
  constructor(private prisma: PrismaClient) {}

  async getCategories(organizationId: string) {
    const groups = await this.prisma.budgetCategoryGroup.findMany({
      where: { organizationId },
      include: {
        categories: {
          where: { isHidden: false },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    return groups;
  }

  async createDefaultCategories(organizationId: string) {
    // Create default category groups with categories
    const defaultGroups = [
      {
        name: 'Fixed Expenses',
        order: 1,
        categories: [
          { name: 'Rent/Mortgage', order: 1 },
          { name: 'Insurance', order: 2 },
          { name: 'Phone', order: 3 },
          { name: 'Internet', order: 4 },
          { name: 'Utilities', order: 5 }
        ]
      },
      {
        name: 'Variable Expenses',
        order: 2,
        categories: [
          { name: 'Groceries', order: 1 },
          { name: 'Dining Out', order: 2 },
          { name: 'Transportation', order: 3 },
          { name: 'Entertainment', order: 4 },
          { name: 'Shopping', order: 5 },
          { name: 'Personal Care', order: 6 }
        ]
      },
      {
        name: 'Savings Goals',
        order: 3,
        categories: [
          { name: 'Emergency Fund', order: 1 },
          { name: 'Vacation', order: 2 },
          { name: 'New Car', order: 3 },
          { name: 'Home Down Payment', order: 4 }
        ]
      },
      {
        name: 'Debt Payments',
        order: 4,
        categories: [
          { name: 'Credit Card', order: 1 },
          { name: 'Student Loan', order: 2 },
          { name: 'Auto Loan', order: 3 }
        ]
      }
    ];

    for (const groupData of defaultGroups) {
      const group = await this.prisma.budgetCategoryGroup.create({
        data: {
          name: groupData.name,
          order: groupData.order,
          organizationId
        }
      });

      for (const categoryData of groupData.categories) {
        await this.prisma.budgetCategory.create({
          data: {
            name: categoryData.name,
            order: categoryData.order,
            groupId: group.id,
            organizationId
          }
        });
      }
    }
  }

  async createCategoryGroup(organizationId: string, data: {
    name: string;
    order?: number;
  }) {
    const maxOrder = await this.prisma.budgetCategoryGroup.findFirst({
      where: { organizationId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    return this.prisma.budgetCategoryGroup.create({
      data: {
        name: data.name,
        order: data.order ?? (maxOrder ? maxOrder.order + 1 : 1),
        organizationId
      }
    });
  }

  async updateCategoryGroup(id: string, organizationId: string, data: {
    name?: string;
    order?: number;
  }) {
    const group = await this.prisma.budgetCategoryGroup.findFirst({
      where: { id, organizationId }
    });

    if (!group) {
      throw new AppError('Category group not found', 404);
    }

    return this.prisma.budgetCategoryGroup.update({
      where: { id },
      data
    });
  }

  async deleteCategoryGroup(id: string, organizationId: string) {
    const group = await this.prisma.budgetCategoryGroup.findFirst({
      where: { id, organizationId },
      include: { categories: true }
    });

    if (!group) {
      throw new AppError('Category group not found', 404);
    }

    if (group.categories.length > 0) {
      throw new AppError('Cannot delete group with categories', 400);
    }

    await this.prisma.budgetCategoryGroup.delete({
      where: { id }
    });
  }

  async createCategory(organizationId: string, data: {
    name: string;
    groupId: string;
    order?: number;
    color?: string;
    icon?: string;
    goalType?: string;
    goalAmount?: number;
    goalDate?: Date;
  }) {
    // Verify group belongs to organization
    const group = await this.prisma.budgetCategoryGroup.findFirst({
      where: { id: data.groupId, organizationId }
    });

    if (!group) {
      throw new AppError('Category group not found', 404);
    }

    const maxOrder = await this.prisma.budgetCategory.findFirst({
      where: { groupId: data.groupId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    return this.prisma.budgetCategory.create({
      data: {
        name: data.name,
        groupId: data.groupId,
        order: data.order ?? (maxOrder ? maxOrder.order + 1 : 1),
        color: data.color,
        icon: data.icon,
        goalType: data.goalType,
        goalAmount: data.goalAmount,
        goalDate: data.goalDate,
        organizationId
      }
    });
  }

  async updateCategory(id: string, organizationId: string, data: {
    name?: string;
    order?: number;
    color?: string;
    icon?: string;
    isHidden?: boolean;
    goalType?: string;
    goalAmount?: number;
    goalDate?: Date;
  }) {
    const category = await this.prisma.budgetCategory.findFirst({
      where: { id, organizationId }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return this.prisma.budgetCategory.update({
      where: { id },
      data
    });
  }

  async deleteCategory(id: string, organizationId: string) {
    const category = await this.prisma.budgetCategory.findFirst({
      where: { id, organizationId }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category has transactions
    const transactionCount = await this.prisma.transaction.count({
      where: { budgetCategoryId: id }
    });

    if (transactionCount > 0) {
      throw new AppError('Cannot delete category with transactions', 400);
    }

    await this.prisma.budgetCategory.delete({
      where: { id }
    });
  }

  async reorderGroups(organizationId: string, groupIds: string[]) {
    const groups = await this.prisma.budgetCategoryGroup.findMany({
      where: { 
        id: { in: groupIds },
        organizationId 
      }
    });

    if (groups.length !== groupIds.length) {
      throw new AppError('Invalid group IDs', 400);
    }

    // Update order for each group
    await Promise.all(
      groupIds.map((id, index) =>
        this.prisma.budgetCategoryGroup.update({
          where: { id },
          data: { order: index + 1 }
        })
      )
    );
  }

  async reorderCategories(groupId: string, organizationId: string, categoryIds: string[]) {
    const group = await this.prisma.budgetCategoryGroup.findFirst({
      where: { id: groupId, organizationId }
    });

    if (!group) {
      throw new AppError('Category group not found', 404);
    }

    const categories = await this.prisma.budgetCategory.findMany({
      where: { 
        id: { in: categoryIds },
        groupId,
        organizationId 
      }
    });

    if (categories.length !== categoryIds.length) {
      throw new AppError('Invalid category IDs', 400);
    }

    // Update order for each category
    await Promise.all(
      categoryIds.map((id, index) =>
        this.prisma.budgetCategory.update({
          where: { id },
          data: { order: index + 1 }
        })
      )
    );
  }
}