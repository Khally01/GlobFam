'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Button, 
  Input, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/shared-ui'
import { 
  Users, 
  UserPlus, 
  Copy, 
  Settings,
  Crown,
  Shield,
  Eye
} from 'lucide-react'
import { familiesApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/hooks/use-toast'
import type { Family } from '@/lib/shared-types'

const createFamilySchema = z.object({
  name: z.string().min(2, 'Family name must be at least 2 characters'),
  description: z.string().optional(),
})

const joinFamilySchema = z.object({
  inviteCode: z.string().min(4, 'Invalid invite code'),
})

type CreateFamilyForm = z.infer<typeof createFamilySchema>
type JoinFamilyForm = z.infer<typeof joinFamilySchema>

export default function FamilyPage() {
  const { family, updateFamily } = useAuthStore()
  const { toast } = useToast()
  const [familyData, setFamilyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)

  const createForm = useForm<CreateFamilyForm>({
    resolver: zodResolver(createFamilySchema),
  })

  const joinForm = useForm<JoinFamilyForm>({
    resolver: zodResolver(joinFamilySchema),
  })

  useEffect(() => {
    fetchFamilyData()
  }, [])

  const fetchFamilyData = async () => {
    try {
      const response = await familiesApi.getCurrent()
      setFamilyData(response.data.data.family)
      updateFamily(response.data.data.family)
    } catch (error) {
      console.error('Error fetching family data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFamily = async (data: CreateFamilyForm) => {
    setCreating(true)
    try {
      const response = await familiesApi.create(data)
      setFamilyData(response.data.data.family)
      updateFamily(response.data.data.family)
      
      toast({
        title: 'Family created!',
        description: 'Your family group has been created successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create family',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleJoinFamily = async (data: JoinFamilyForm) => {
    setJoining(true)
    try {
      const response = await familiesApi.join(data.inviteCode)
      setFamilyData(response.data.data.family)
      updateFamily(response.data.data.family)
      
      toast({
        title: 'Joined family!',
        description: 'You have successfully joined the family group.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to join family',
        variant: 'destructive',
      })
    } finally {
      setJoining(false)
    }
  }

  const handleCopyInviteCode = () => {
    if (familyData?.inviteCode) {
      navigator.clipboard.writeText(familyData.inviteCode)
      toast({
        title: 'Copied!',
        description: 'Invite code copied to clipboard.',
      })
    }
  }

  const handleRegenerateInvite = async () => {
    try {
      const response = await familiesApi.regenerateInvite()
      setFamilyData({
        ...familyData,
        inviteCode: response.data.data.inviteCode
      })
      
      toast({
        title: 'New invite code generated',
        description: 'Your family invite code has been updated.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to regenerate invite code',
        variant: 'destructive',
      })
    }
  }

  const handleLeaveFamily = async () => {
    if (confirm('Are you sure you want to leave this family? This action cannot be undone.')) {
      try {
        await familiesApi.leave()
        setFamilyData(null)
        updateFamily(null)
        
        toast({
          title: 'Left family',
          description: 'You have left the family group.',
        })
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to leave family',
          variant: 'destructive',
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Family Management</h1>
        <p className="text-muted-foreground">
          Create or join a family to share financial data
        </p>
      </div>

      {familyData ? (
        /* Existing Family */
        <div className="space-y-6">
          {/* Family Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {familyData.name}
                  </CardTitle>
                  <CardDescription>{familyData.description || 'No description'}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Invite Code */}
                <div>
                  <label className="text-sm font-medium">Invite Code</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={familyData.inviteCode}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyInviteCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerateInvite}
                    >
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this code with family members to invite them
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family Members */}
          <Card>
            <CardHeader>
              <CardTitle>Family Members ({familyData.members?.length || 0})</CardTitle>
              <CardDescription>People who have access to shared family data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {familyData.members?.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10" />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.role === 'OWNER' && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      {member.role === 'ADMIN' && (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                      {member.role === 'VIEWER' && (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {member.role?.toLowerCase() || 'member'}
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-4">
                    No other family members yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Actions that cannot be undone</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleLeaveFamily}
              >
                Leave Family
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* No Family - Create or Join */
        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Family */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Create Family
              </CardTitle>
              <CardDescription>
                Start a new family group and invite members
              </CardDescription>
            </CardHeader>
            <form onSubmit={createForm.handleSubmit(handleCreateFamily)}>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Family Name</label>
                  <Input
                    placeholder="The Smith Family"
                    {...createForm.register('name')}
                    disabled={creating}
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {createForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Input
                    placeholder="Our family finance group"
                    {...createForm.register('description')}
                    disabled={creating}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Family'}
                </Button>
              </CardContent>
            </form>
          </Card>

          {/* Join Family */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Join Family
              </CardTitle>
              <CardDescription>
                Join an existing family using an invite code
              </CardDescription>
            </CardHeader>
            <form onSubmit={joinForm.handleSubmit(handleJoinFamily)}>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Invite Code</label>
                  <Input
                    placeholder="ABC123"
                    className="font-mono"
                    {...joinForm.register('inviteCode')}
                    disabled={joining}
                  />
                  {joinForm.formState.errors.inviteCode && (
                    <p className="text-sm text-destructive mt-1">
                      {joinForm.formState.errors.inviteCode.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Get this code from a family member
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={joining}>
                  {joining ? 'Joining...' : 'Join Family'}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}