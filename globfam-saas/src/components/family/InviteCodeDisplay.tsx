'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@/components/shared-ui'
import { Copy, Share2, Mail, MessageCircle, QrCode } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface InviteCodeDisplayProps {
  inviteCode: string
  familyName: string
}

export function InviteCodeDisplay({ inviteCode, familyName }: InviteCodeDisplayProps) {
  const { toast } = useToast()
  const [showShareOptions, setShowShareOptions] = useState(false)

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/join-family?code=${inviteCode}`
  const inviteMessage = `Join my family "${familyName}" on GlobFam! Use invite code: ${inviteCode} or click this link: ${inviteLink}`

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    })
  }

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`, '_blank')
  }

  const shareViaEmail = () => {
    const subject = `Join ${familyName} on GlobFam`
    const body = inviteMessage
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Invite Family Members
        </CardTitle>
        <CardDescription>
          Share this code with your family members to give them access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invite Code Display */}
        <div className="bg-primary/10 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">Invite Code</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-3xl font-mono font-bold tracking-wider">{inviteCode}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(inviteCode, 'Invite code')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Share Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleCopy(inviteLink, 'Invite link')}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={shareViaWhatsApp}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={shareViaEmail}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>

        {/* Instructions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">How family members can join:</h4>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li>1. Sign up for GlobFam</li>
            <li>2. Go to Family page</li>
            <li>3. Click "Join Family"</li>
            <li>4. Enter code: <span className="font-mono font-semibold">{inviteCode}</span></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}