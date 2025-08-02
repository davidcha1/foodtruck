'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { UserRole } from '@/types'
import Link from 'next/link'
import { MapPin, Truck, Building, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export const SignUpForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Form validation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    if (!role) {
      toast.error('Please select your role')
      setLoading(false)
      return
    }

    try {
      console.log('SignUpForm: Starting signup for:', { email, role })
      const result = await signUp(email, password, role as UserRole)
      console.log('SignUpForm: Signup completed:', result)
      
      // Since our trigger auto-confirms users, we can assume success
      console.log('SignUpForm: User created successfully, redirecting...')
      toast.success('Account created successfully!')
      
      // Reset form
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setRole('')
      setLoading(false)
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    } catch (error: any) {
      console.error('SignUpForm: Signup error:', error)
      toast.error(error.message || 'Failed to create account')
      setLoading(false)
    }
  }

  const RoleTile = ({ 
    roleValue, 
    icon: Icon, 
    title, 
    description,
    isVenueOwner = false
  }: {
    roleValue: UserRole
    icon: any
    title: string
    description: string
    isVenueOwner?: boolean
  }) => {
    const isSelected = role === roleValue
    
    return (
      <button
        type="button"
        onClick={() => setRole(roleValue)}
        disabled={loading}
        className={cn(
          "w-full p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-lg",
          isSelected 
            ? isVenueOwner
              ? "border-warm-red bg-warm-red/10 shadow-md" 
              : "border-mustard bg-mustard/10 shadow-md"
            : "border-gray-200 bg-white hover:border-gray-300"
        )}
      >
        <div className="flex items-start space-x-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
            isSelected 
              ? isVenueOwner 
                ? "bg-warm-red text-white" 
                : "bg-mustard text-charcoal"
              : isVenueOwner
                ? "bg-warm-red/10 text-warm-red group-hover:bg-warm-red group-hover:text-white"
                : "bg-mustard/10 text-mustard group-hover:bg-mustard group-hover:text-charcoal"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 text-charcoal">
              {title}
            </h3>
            <p className={cn(
              "text-sm transition-colors",
              isSelected ? "text-gray-600" : "text-muted-text"
            )}>
              {description}
            </p>
          </div>
          <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            isSelected 
              ? isVenueOwner
                ? "border-warm-red bg-warm-red" 
                : "border-mustard bg-mustard"
              : "border-gray-300 group-hover:border-gray-400"
          )}>
            {isSelected && (
              <div className="w-3 h-3 rounded-full bg-white"></div>
            )}
          </div>
        </div>
      </button>
    )
  }

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-charcoal">Create Your Account</CardTitle>
        <CardDescription className="text-muted-text">
          Choose your role and join our community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-4">
          <Label className="text-base font-semibold text-charcoal">I am a...</Label>
          <div className="space-y-3">
            <RoleTile
              roleValue="venue_owner"
              icon={Building}
              title="Venue Owner"
              description="I have outdoor spaces to rent to food trucks"
              isVenueOwner={true}
            />
            <RoleTile
              roleValue="vendor"
              icon={Truck}
              title="Food Truck Vendor"
              description="I need prime locations for my food truck business"
              isVenueOwner={false}
            />
          </div>
        </div>

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
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-charcoal font-medium">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-warm-red hover:bg-warm-red-700 text-white font-semibold text-lg mt-6" 
            disabled={loading || !role}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        
        <div className="text-center text-sm text-muted-text">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-warm-red hover:text-warm-red-700 font-medium hover:underline">
            Sign in here
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 