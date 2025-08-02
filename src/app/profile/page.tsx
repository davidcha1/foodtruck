'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { VenueOwnerProfileForm } from '@/components/profiles/VenueOwnerProfileForm'
import { VendorProfileForm } from '@/components/profiles/VendorProfileForm'
import { VerificationRequestForm } from '@/components/verification/VerificationRequestForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2, Shield, User } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'verification'>('profile')
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending')

  // Debug logging
  console.log('ProfilePage: Current auth state:', { user, loading, hasUser: !!user })

  if (loading) {
    console.log('ProfilePage: Showing loading state')
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    console.log('ProfilePage: No user found, showing access denied')
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need to be logged in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 mt-4 p-2 bg-gray-100 rounded">
              <strong>Debug Info:</strong><br/>
              Loading: {loading ? 'true' : 'false'}<br/>
              User: {user ? 'exists' : 'null'}<br/>
              Check browser console for more details.
            </div>
            <div className="mt-4 space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="w-full"
              >
                Refresh Page
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth/signin'} 
                className="w-full"
              >
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user.role) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Profile Setup Required</CardTitle>
            <CardDescription>
              Your account role is not set. Please contact support or create a new account.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tab Navigation */}
      <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>
                  Manage your profile and business verification
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === 'profile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant={activeTab === 'verification' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('verification')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verification
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <>
            {user.role === 'venue_owner' && <VenueOwnerProfileForm />}
            {user.role === 'vendor' && <VendorProfileForm />}
          </>
        )}

        {activeTab === 'verification' && (
          <VerificationRequestForm
            userRole={user.role}
            currentStatus={verificationStatus}
            onStatusUpdate={() => {
              // In a real app, you'd reload the verification status here
              console.log('Verification status updated')
            }}
                     />
         )}
       </div>
   )
 } 