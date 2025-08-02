'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

export const SignInForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('SignInForm: Starting sign-in for:', email)
      await signIn(email, password)
      console.log('SignInForm: Sign-in completed successfully')
      toast.success('Successfully signed in!')
    } catch (error: any) {
      console.error('SignInForm: Sign-in error:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        details: error.details || error
      })
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-charcoal">Sign Into Your Account</CardTitle>
        <CardDescription className="text-muted-text">
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-charcoal font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-charcoal font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 bg-warm-red hover:bg-warm-red-700 text-white font-semibold text-lg mt-6" 
            disabled={loading}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="text-center space-y-2">
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-warm-red hover:text-warm-red-700 font-medium hover:underline block"
          >
            Forgot your password?
          </Link>
          <div className="text-sm text-muted-text">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-warm-red hover:text-warm-red-700 font-medium hover:underline">
              Sign up here
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 