'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  ExternalLink, 
  User, 
  Building,
  Truck,
  Calendar,
  Phone,
  Mail
} from 'lucide-react'

interface PendingVerification {
  user_id: string
  email: string
  role: 'venue_owner' | 'vendor'
  first_name: string | null
  last_name: string | null
  phone: string | null
  verification_status: 'pending' | 'verified' | 'rejected'
  business_name?: string
  food_truck_name?: string
  business_type?: string
  cuisine_type?: string
  created_at: string
  business_description?: string
  special_requirements?: string
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
}

export function AdminVerificationDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingVerification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<PendingVerification | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadPendingVerifications()
  }, [])

  const loadPendingVerifications = async () => {
    setIsLoading(true)
    try {
      // Get venue owners pending verification
      const { data: venueOwners, error: venueError } = await supabase
        .from('venue_owner_profiles')
        .select(`
          *,
          users!inner(*)
        `)
        .eq('verification_status', 'pending')

      if (venueError) throw venueError

      // Get vendors pending verification
      const { data: vendors, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select(`
          *,
          users!inner(*)
        `)
        .eq('verification_status', 'pending')

      if (vendorError) throw vendorError

      // Combine and format the data
      const allPending: PendingVerification[] = [
        ...(venueOwners || []).map((profile: any) => ({
          user_id: profile.user_id,
          email: profile.users.email,
          role: 'venue_owner' as const,
          first_name: profile.users.first_name,
          last_name: profile.users.last_name,
          phone: profile.users.phone,
          verification_status: profile.verification_status,
          business_name: profile.business_name,
          business_type: profile.business_type,
          created_at: profile.created_at,
          business_description: profile.business_description
        })),
        ...(vendors || []).map((profile: any) => ({
          user_id: profile.user_id,
          email: profile.users.email,
          role: 'vendor' as const,
          first_name: profile.users.first_name,
          last_name: profile.users.last_name,
          phone: profile.users.phone,
          verification_status: profile.verification_status,
          food_truck_name: profile.food_truck_name,
          cuisine_type: profile.cuisine_type,
          created_at: profile.created_at,
          special_requirements: profile.special_requirements
        }))
      ]

      setPendingUsers(allPending)
    } catch (error: any) {
      console.error('Error loading pending verifications:', error)
      toast.error('Failed to load pending verifications')
    } finally {
      setIsLoading(false)
    }
  }

  const processVerification = async (userId: string, status: 'verified' | 'rejected') => {
    if (!selectedUser) return

    setIsProcessing(true)
    try {
      const profileTable = selectedUser.role === 'venue_owner' ? 'venue_owner_profiles' : 'vendor_profiles'
      
      // Update the verification status
      const { error } = await supabase
        .from(profileTable)
        .update({
          verification_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error

      toast.success(`User ${status === 'verified' ? 'verified' : 'rejected'} successfully!`)
      
      // Reload the pending list
      loadPendingVerifications()
      setSelectedUser(null)
      setReviewNotes('')

    } catch (error: any) {
      console.error('Error processing verification:', error)
      toast.error('Failed to process verification')
    } finally {
      setIsProcessing(false)
    }
  }

  const extractVerificationData = (user: PendingVerification) => {
    const data = user.role === 'venue_owner' ? user.business_description : user.special_requirements
    if (!data) return null

    const lines = data.split('\n')
    const docStart = lines.findIndex(line => line.includes('--- Verification Documents ---'))
    
    if (docStart === -1) return null

    const documents: Record<string, string> = {}
    for (let i = docStart + 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes(':')) {
        const [key, value] = line.split(':')
        if (value && value.trim().startsWith('http')) {
          documents[key.trim()] = value.trim()
        }
      }
    }

    return documents
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading verification requests...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Verification Dashboard</CardTitle>
              <CardDescription>
                Review and manage user verification requests
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="mb-2">No Pending Verifications</CardTitle>
            <CardDescription>
              All verification requests have been processed
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending List */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests ({pendingUsers.length})</CardTitle>
              <CardDescription>Users awaiting verification review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingUsers.map((user) => {
                const StatusIcon = statusConfig[user.verification_status].icon
                const roleIcon = user.role === 'venue_owner' ? Building : Truck
                const RoleIcon = roleIcon

                return (
                  <div
                    key={user.user_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.user_id === user.user_id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/30'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <RoleIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : user.email
                              }
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.role === 'venue_owner' ? user.business_name : user.food_truck_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusConfig[user.verification_status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {user.verification_status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Review Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Review Details</CardTitle>
              <CardDescription>
                {selectedUser ? 'Review verification documents' : 'Select a user to review'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <p className="font-medium">
                        {selectedUser.first_name && selectedUser.last_name 
                          ? `${selectedUser.first_name} ${selectedUser.last_name}`
                          : 'Not provided'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedUser.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Business Type</Label>
                      <p className="font-medium">
                        {selectedUser.role === 'venue_owner' 
                          ? selectedUser.business_type || 'Not specified'
                          : selectedUser.cuisine_type || 'Not specified'
                        }
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Documents */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Verification Documents</Label>
                    
                    {(() => {
                      const docs = extractVerificationData(selectedUser)
                      if (!docs) {
                        return (
                          <p className="text-sm text-muted-foreground">
                            No verification documents found in profile
                          </p>
                        )
                      }

                      return (
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(docs).map(([docType, url]) => (
                            <div key={docType} className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{docType}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>

                  <Separator />

                  {/* Review Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                    <Textarea
                      id="reviewNotes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add any notes about the verification review..."
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => processVerification(selectedUser.user_id, 'verified')}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => processVerification(selectedUser.user_id, 'rejected')}
                      disabled={isProcessing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a user from the list to review their verification documents</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 