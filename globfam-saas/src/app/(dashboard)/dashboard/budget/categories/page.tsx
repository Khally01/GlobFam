'use client'

import { useState, useEffect } from 'react'
import { Plus, Folder, MoreVertical, Trash2, Edit2, GripVertical } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge } from '@/components/shared-ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface BudgetCategory {
  id: string
  name: string
  order: number
  isHidden: boolean
  color?: string
  icon?: string
  groupId: string
}

interface BudgetCategoryGroup {
  id: string
  name: string
  order: number
  isSystem: boolean
  categories: BudgetCategory[]
}

export default function BudgetCategoriesPage() {
  const [groups, setGroups] = useState<BudgetCategoryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false)
  const [editingGroup, setEditingGroup] = useState<BudgetCategoryGroup | null>(null)
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const { toast } = useToast()

  const [groupFormData, setGroupFormData] = useState({
    name: ''
  })

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    groupId: '',
    color: '#635bff'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/budget-categories')
      setGroups(response.data.data || [])
      
      // If no categories exist, show empty state
      if (response.data.data?.length === 0) {
        // Empty state will be shown, no toast needed
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast({
        title: 'Error',
        description: 'Failed to load budget categories',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createDefaultCategories = async () => {
    try {
      const response = await api.post('/api/budget-categories/create-defaults')
      setGroups(response.data.data || [])
      toast({
        title: 'Success',
        description: 'Default categories created successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create default categories',
        variant: 'destructive'
      })
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/budget-categories/groups', groupFormData)
      toast({
        title: 'Success',
        description: 'Category group created successfully'
      })
      setShowCreateGroupDialog(false)
      setGroupFormData({ name: '' })
      fetchCategories()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category group',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGroup) return
    
    try {
      await api.put(`/api/budget-categories/groups/${editingGroup.id}`, {
        name: groupFormData.name
      })
      toast({
        title: 'Success',
        description: 'Category group updated successfully'
      })
      setEditingGroup(null)
      setGroupFormData({ name: '' })
      fetchCategories()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category group',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return
    
    try {
      await api.delete(`/api/budget-categories/groups/${groupId}`)
      toast({
        title: 'Success',
        description: 'Category group deleted successfully'
      })
      fetchCategories()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete category group',
        variant: 'destructive'
      })
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/budget-categories/categories', categoryFormData)
      toast({
        title: 'Success',
        description: 'Category created successfully'
      })
      setShowCreateCategoryDialog(false)
      setCategoryFormData({ name: '', groupId: '', color: '#635bff' })
      fetchCategories()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    
    try {
      await api.put(`/api/budget-categories/categories/${editingCategory.id}`, {
        name: categoryFormData.name,
        color: categoryFormData.color
      })
      toast({
        title: 'Success',
        description: 'Category updated successfully'
      })
      setEditingCategory(null)
      setCategoryFormData({ name: '', groupId: '', color: '#635bff' })
      fetchCategories()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      await api.delete(`/api/budget-categories/categories/${categoryId}`)
      toast({
        title: 'Success',
        description: 'Category deleted successfully'
      })
      fetchCategories()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete category',
        variant: 'destructive'
      })
    }
  }

  const handleToggleHideCategory = async (category: BudgetCategory) => {
    try {
      await api.put(`/api/budget-categories/categories/${category.id}`, {
        isHidden: !category.isHidden
      })
      fetchCategories()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="brand-title text-2xl sm:text-brand-h2">Budget Categories</h1>
          <p className="brand-subtitle text-sm sm:text-brand-body text-globfam-steel mt-1">
            Organize your budget with custom categories
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-globfam-border text-sm sm:text-base">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Category</span>
                <span className="sm:hidden">Category</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>Add a new category to a group</DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    placeholder="e.g., Groceries"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category-group">Group</Label>
                  <select
                    id="category-group"
                    value={categoryFormData.groupId}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, groupId: e.target.value })}
                    className="w-full px-3 py-2 border border-globfam-border rounded-md"
                    required
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="category-color">Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="category-color"
                      type="color"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      placeholder="#635bff"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full brand-button">Create Category</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
            <DialogTrigger asChild>
              <Button className="brand-button text-sm sm:text-base">
                <Folder className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Group</span>
                <span className="sm:hidden">Group</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>Create a new category group</DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({ name: e.target.value })}
                    placeholder="e.g., Fixed Expenses"
                    required
                  />
                </div>

                <Button type="submit" className="w-full brand-button">Create Group</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card className="brand-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-globfam-deep-blue mb-2">No categories yet</h3>
            <p className="text-globfam-steel text-center mb-4">
              Start by creating default categories or add your own
            </p>
            <div className="flex gap-2">
              <Button onClick={createDefaultCategories} className="brand-button">
                Create Default Categories
              </Button>
              <Button onClick={() => setShowCreateGroupDialog(true)} variant="outline">
                Create Custom Group
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.id} className="brand-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-globfam-steel cursor-move" />
                    <CardTitle className="text-lg text-globfam-deep-blue">{group.name}</CardTitle>
                    {group.isSystem && <Badge variant="secondary">System</Badge>}
                  </div>
                  {!group.isSystem && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingGroup(group)
                          setGroupFormData({ name: group.name })
                        }}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-600"
                          disabled={group.categories.length > 0}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.categories.map((category) => (
                    <div
                      key={category.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        category.isHidden ? "opacity-50 bg-gray-50" : "bg-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color || '#635bff' }}
                        />
                        <span className={cn(
                          "font-medium",
                          category.isHidden && "line-through"
                        )}>
                          {category.name}
                        </span>
                        {category.isHidden && (
                          <Badge variant="secondary" className="text-xs">Hidden</Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingCategory(category)
                            setCategoryFormData({
                              name: category.name,
                              groupId: category.groupId,
                              color: category.color || '#635bff'
                            })
                          }}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleHideCategory(category)}>
                            {category.isHidden ? 'Show' : 'Hide'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                  {group.categories.length === 0 && (
                    <p className="text-sm text-globfam-steel text-center py-4">
                      No categories in this group
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Update the group name</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateGroup} className="space-y-4">
            <div>
              <Label htmlFor="edit-group-name">Group Name</Label>
              <Input
                id="edit-group-name"
                value={groupFormData.name}
                onChange={(e) => setGroupFormData({ name: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full brand-button">Update Group</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div>
              <Label htmlFor="edit-category-name">Category Name</Label>
              <Input
                id="edit-category-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-category-color">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="edit-category-color"
                  type="color"
                  value={categoryFormData.color}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={categoryFormData.color}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                  placeholder="#635bff"
                />
              </div>
            </div>

            <Button type="submit" className="w-full brand-button">Update Category</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}