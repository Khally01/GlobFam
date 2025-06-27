import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { BudgetCategoriesService } from '../services/budget/budget-categories.service';
import { prisma } from '../lib/prisma';

const router = Router();
const budgetCategoriesService = new BudgetCategoriesService(prisma);

// Validation schemas
const createCategoryGroupSchema = z.object({
  name: z.string().min(1),
  order: z.number().optional()
});

const updateCategoryGroupSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().optional()
});

const createCategorySchema = z.object({
  name: z.string().min(1),
  groupId: z.string(),
  order: z.number().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  goalType: z.string().optional(),
  goalAmount: z.number().optional(),
  goalDate: z.string().transform(str => str ? new Date(str) : undefined).optional()
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isHidden: z.boolean().optional(),
  goalType: z.string().optional(),
  goalAmount: z.number().optional(),
  goalDate: z.string().transform(str => str ? new Date(str) : undefined).optional()
});

const reorderSchema = z.object({
  ids: z.array(z.string()).min(1)
});

// Get all categories with groups
router.get('/budget-categories', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const categories = await budgetCategoriesService.getCategories(req.user!.organizationId);
    res.json({ data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create default categories
router.post('/budget-categories/create-defaults', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await budgetCategoriesService.createDefaultCategories(req.user!.organizationId);
    const categories = await budgetCategoriesService.getCategories(req.user!.organizationId);
    res.json({ data: categories });
  } catch (error) {
    console.error('Create default categories error:', error);
    res.status(500).json({ error: 'Failed to create default categories' });
  }
});

// Create category group
router.post('/budget-categories/groups', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createCategoryGroupSchema.parse(req.body);
    const group = await budgetCategoriesService.createCategoryGroup(req.user!.organizationId, data);
    res.status(201).json({ data: group });
  } catch (error) {
    console.error('Create category group error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create category group' });
  }
});

// Update category group
router.put('/budget-categories/groups/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = updateCategoryGroupSchema.parse(req.body);
    const group = await budgetCategoriesService.updateCategoryGroup(
      req.params.id,
      req.user!.organizationId,
      data
    );
    res.json({ data: group });
  } catch (error) {
    console.error('Update category group error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update category group' });
  }
});

// Delete category group
router.delete('/budget-categories/groups/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await budgetCategoriesService.deleteCategoryGroup(req.params.id, req.user!.organizationId);
    res.json({ message: 'Category group deleted successfully' });
  } catch (error: any) {
    console.error('Delete category group error:', error);
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete category group' });
  }
});

// Reorder category groups
router.put('/budget-categories/groups/reorder', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = reorderSchema.parse(req.body);
    await budgetCategoriesService.reorderGroups(req.user!.organizationId, data.ids);
    res.json({ message: 'Groups reordered successfully' });
  } catch (error) {
    console.error('Reorder groups error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to reorder groups' });
  }
});

// Create category
router.post('/budget-categories/categories', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await budgetCategoriesService.createCategory(req.user!.organizationId, data);
    res.status(201).json({ data: category });
  } catch (error) {
    console.error('Create category error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/budget-categories/categories/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = updateCategorySchema.parse(req.body);
    const category = await budgetCategoriesService.updateCategory(
      req.params.id,
      req.user!.organizationId,
      data
    );
    res.json({ data: category });
  } catch (error) {
    console.error('Update category error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/budget-categories/categories/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await budgetCategoriesService.deleteCategory(req.params.id, req.user!.organizationId);
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Reorder categories within a group
router.put('/budget-categories/groups/:groupId/categories/reorder', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = reorderSchema.parse(req.body);
    await budgetCategoriesService.reorderCategories(
      req.params.groupId,
      req.user!.organizationId,
      data.ids
    );
    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
});

export default router;