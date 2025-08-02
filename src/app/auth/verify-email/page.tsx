'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if the user came from an email verification link
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setErrorMessage(error.message)
          setVerificationStatus('error')
          return
        }

        if (data.session) {
          // User is verified and logged in
          setVerificationStatus('success')
          toast.success('Email verified successfully!')
          
          // Redirect to profile completion or home page after a delay
          setTimeout(() => {
            router.push('/profile')
          }, 2000)
        } else {
          setErrorMessage('Verification link is invalid or expired')
          setVerificationStatus('error')
        }
      } catch (error: any) {
        setErrorMessage(error.message || 'Verification failed')
        setVerificationStatus('error')
      }
    }

    handleEmailVerification()
  }, [router])

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-off-white to-gray-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="w-full">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
              <span className="ml-2">Verifying your email...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-off-white to-gray-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="font-bebas text-2xl">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. Welcome to FoodTruck Hub!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-text text-center">
                You&apos;ll be redirected to complete your profile shortly.
              </p>
              <Button 
                onClick={() => router.push('/profile')}
                className="w-full"
              >
                Complete Your Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-off-white to-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="font-bebas text-2xl">Verification Failed</CardTitle>
            <CardDescription>
              {errorMessage || 'There was a problem verifying your email address.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-text text-center">
              The verification link may be expired or invalid. Try requesting a new one.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => router.push('/auth/signin')}
                variant="outline"
                className="flex-1"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/auth/signup')}
                className="flex-1"
              >
                Sign Up Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 