'use client'

import { useState } from 'react'
import { User, CreditCard, Bell, Shield, Globe } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/shared-ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/auth'
import { api, subscriptionsApi, usersApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { user, organization } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    language: user?.language || 'en',
    timezone: 'UTC',
    currency: 'USD'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    budgetAlerts: true,
    securityAlerts: true,
    monthlyReports: false
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await usersApi.updateProfile(profileData)
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      await usersApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      toast({
        title: 'Success',
        description: 'Password changed successfully'
      })
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await subscriptionsApi.createPortal(window.location.href)
      window.location.href = response.data.data.url
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open billing portal',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={profileData.language} 
                      onValueChange={(value) => setProfileData({ ...profileData, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={profileData.timezone} 
                      onValueChange={(value) => setProfileData({ ...profileData, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailAlerts">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  id="emailAlerts"
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, emailAlerts: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="budgetAlerts">Budget Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you exceed budget limits
                  </p>
                </div>
                <Switch
                  id="budgetAlerts"
                  checked={notifications.budgetAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, budgetAlerts: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="securityAlerts">Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about account security and logins
                  </p>
                </div>
                <Switch
                  id="securityAlerts"
                  checked={notifications.securityAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, securityAlerts: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="monthlyReports">Monthly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive monthly financial summary reports
                  </p>
                </div>
                <Switch
                  id="monthlyReports"
                  checked={notifications.monthlyReports}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, monthlyReports: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Current Plan</p>
                  <p className="text-sm text-muted-foreground">{organization?.plan || 'Free Trial'}</p>
                </div>
                <Button onClick={handleManageSubscription}>
                  Manage Subscription
                </Button>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  Your subscription is managed through Stripe. Click "Manage Subscription" to:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                  <li>Update payment methods</li>
                  <li>Change your plan</li>
                  <li>View billing history</li>
                  <li>Cancel subscription</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your GlobFam experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select value={profileData.currency} onValueChange={(value) => setProfileData({ ...profileData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select defaultValue="MM/DD/YYYY">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number Format</Label>
                <Select defaultValue="1,234.56">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1,234.56">1,234.56</SelectItem>
                    <SelectItem value="1.234,56">1.234,56</SelectItem>
                    <SelectItem value="1 234.56">1 234.56</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}