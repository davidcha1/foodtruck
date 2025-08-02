'use client'

import { SignInForm } from '@/components/auth/SignInForm'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const clearAuthState = async () => {
    await supabase.auth.signOut()
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substr(0, eqPos) : c
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    })
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </a>
          </p>
        </div>
        
        <div className="space-y-4">
          <SignInForm />
          
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={clearAuthState}
              className="text-sm"
            >
              Clear Auth State (if having issues)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 