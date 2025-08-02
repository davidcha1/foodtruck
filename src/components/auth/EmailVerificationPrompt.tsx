'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Mail, RefreshCw } from 'lucide-react'

interface EmailVerificationPromptProps {
  email: string
  onResendSuccess?: () => void
}

export const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({ 
  email, 
  onResendSuccess 
}) => {
  const [resending, setResending] = useState(false)

  const handleResendVerification = async () => {
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        }
      })

      if (error) throw error

      toast.success('Verification email sent! Check your inbox.')
      onResendSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-brand-orange" />
        </div>
        <CardTitle className="font-bebas text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-text">
            Click the link in the email to verify your account and complete your registration.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>Can&apos;t find the email?</strong> Check your spam folder or wait a few minutes for delivery.
            </p>
          </div>

          <Button 
            onClick={handleResendVerification}
            variant="outline" 
            className="w-full"
            disabled={resending}
          >
            {resending && (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            )}
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </Button>

          <p className="text-xs text-muted-text">
            The verification link will expire in 24 hours.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 