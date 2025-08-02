'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Shield, Upload, CheckCircle, Clock, XCircle, FileText, Camera, Users } from 'lucide-react'

interface VerificationRequestData {
  business_license_url: string
  insurance_certificate_url: string
  identity_document_url: string
  business_address_proof_url: string
  additional_notes: string
  contact_person: string
  contact_phone: string
  business_years_operating: number
}

interface VerificationRequestFormProps {
  userRole: 'venue_owner' | 'vendor'
  currentStatus: 'pending' | 'verified' | 'rejected'
  onStatusUpdate?: () => void
}

const verificationRequirements = {
  venue_owner: [
    {
      title: 'Business License',
      description: 'Valid business registration/license',
      icon: FileText,
      required: true
    },
    {
      title: 'Public Liability Insurance',
      description: 'Current insurance certificate (min $5M)',
      icon: Shield,
      required: true
    },
    {
      title: 'Identity Document',
      description: 'Government-issued photo ID of business owner',
      icon: Users,
      required: true
    },
    {
      title: 'Address Verification',
      description: 'Utility bill or lease agreement for business address',
      icon: FileText,
      required: false
    }
  ],
  vendor: [
    {
      title: 'Food Business License',
      description: 'Valid food handling/mobile vendor license',
      icon: FileText,
      required: true
    },
    {
      title: 'Public Liability Insurance',
      description: 'Current insurance certificate (min $2M)',
      icon: Shield,
      required: true
    },
    {
      title: 'Identity Document',
      description: 'Government-issued photo ID of truck owner',
      icon: Users,
      required: true
    },
    {
      title: 'Vehicle Registration',
      description: 'Current food truck registration documents',
      icon: Camera,
      required: false
    }
  ]
}

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    title: 'Verification Pending',
    description: 'Your verification request is being reviewed'
  },
  verified: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    title: 'Verified Business',
    description: 'Your business has been successfully verified'
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    title: 'Verification Rejected',
    description: 'Additional documentation required'
  }
}

export function VerificationRequestForm({ userRole, currentStatus, onStatusUpdate }: VerificationRequestFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<VerificationRequestData>({
    business_license_url: '',
    insurance_certificate_url: '',
    identity_document_url: '',
    business_address_proof_url: '',
    additional_notes: '',
    contact_person: '',
    contact_phone: '',
    business_years_operating: 1
  })

  const requirements = verificationRequirements[userRole]
  const status = statusConfig[currentStatus]
  const StatusIcon = status.icon

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsSubmitting(true)
    try {
      // Validate required fields
      if (!formData.business_license_url || !formData.insurance_certificate_url || !formData.identity_document_url) {
        toast.error('Please provide all required documents')
        return
      }

      // Store verification data in profile notes and update status
      const profileTable = userRole === 'venue_owner' ? 'venue_owner_profiles' : 'vendor_profiles'
      const verificationData = {
        business_license_url: formData.business_license_url,
        insurance_certificate_url: formData.insurance_certificate_url,
        identity_document_url: formData.identity_document_url,
        business_address_proof_url: formData.business_address_proof_url || null,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        business_years_operating: formData.business_years_operating,
        submitted_at: new Date().toISOString()
      }

      const verificationNotes = formData.additional_notes + 
        '\n\n--- Verification Documents ---\n' +
        `Business License: ${formData.business_license_url}\n` +
        `Insurance: ${formData.insurance_certificate_url}\n` +
        `ID Document: ${formData.identity_document_url}\n` +
        (formData.business_address_proof_url ? `Address Proof: ${formData.business_address_proof_url}\n` : '') +
        `Contact: ${formData.contact_person} (${formData.contact_phone})\n` +
        `Years Operating: ${formData.business_years_operating}\n` +
        `Submitted: ${new Date().toISOString()}`

      // Update profile with verification data and set status to pending
      const updateData = userRole === 'venue_owner' 
        ? { 
            verification_status: 'pending' as const,
            business_description: verificationNotes
          }
        : { 
            verification_status: 'pending' as const,
            special_requirements: verificationNotes
          }

      const { error } = await supabase
        .from(profileTable)
        .update(updateData)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Verification request submitted successfully!')
      onStatusUpdate?.()

    } catch (error: any) {
      console.error('Error submitting verification:', error)
      toast.error('Failed to submit verification request')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (currentStatus === 'verified') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-800">Business Verified</CardTitle>
              <CardDescription>
                Your business has been successfully verified and approved
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Trusted {userRole === 'venue_owner' ? 'Venue Owner' : 'Food Truck Vendor'}</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your verified status will be displayed to other users, building trust in your listings and bookings.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle>Business Verification</CardTitle>
                <CardDescription>
                  Verify your business to build trust with customers
                </CardDescription>
              </div>
            </div>
            <Badge className={status.color}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {status.title}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{status.description}</p>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requirements</CardTitle>
          <CardDescription>
            Please prepare the following documents for {userRole === 'venue_owner' ? 'venue owner' : 'food truck vendor'} verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map((req, index) => {
              const Icon = req.icon
              return (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  <Icon className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{req.title}</h4>
                      {req.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Verification Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Verification Documents</CardTitle>
          <CardDescription>
            Upload or provide links to your verification documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Documents */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="business_license_url">
                  Business License URL *
                </Label>
                <Input
                  id="business_license_url"
                  type="url"
                  value={formData.business_license_url}
                  onChange={(e) => setFormData({ ...formData, business_license_url: e.target.value })}
                  placeholder="https://drive.google.com/file/your-license"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance_certificate_url">
                  Insurance Certificate URL *
                </Label>
                <Input
                  id="insurance_certificate_url"
                  type="url"
                  value={formData.insurance_certificate_url}
                  onChange={(e) => setFormData({ ...formData, insurance_certificate_url: e.target.value })}
                  placeholder="https://drive.google.com/file/your-insurance"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identity_document_url">
                  Identity Document URL *
                </Label>
                <Input
                  id="identity_document_url"
                  type="url"
                  value={formData.identity_document_url}
                  onChange={(e) => setFormData({ ...formData, identity_document_url: e.target.value })}
                  placeholder="https://drive.google.com/file/your-id"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_address_proof_url">
                  Address Proof URL (Optional)
                </Label>
                <Input
                  id="business_address_proof_url"
                  type="url"
                  value={formData.business_address_proof_url}
                  onChange={(e) => setFormData({ ...formData, business_address_proof_url: e.target.value })}
                  placeholder="https://drive.google.com/file/address-proof"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Primary contact for verification"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="Phone number for verification calls"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_years_operating">Years in Business</Label>
              <Input
                id="business_years_operating"
                type="number"
                min="0"
                max="100"
                value={formData.business_years_operating}
                onChange={(e) => setFormData({ ...formData, business_years_operating: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                placeholder="Any additional information that might help with verification..."
                rows={3}
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                All documents will be reviewed by our verification team within 3-5 business days. 
                You'll receive an email notification once the review is complete.
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? 'Submitting...' : 'Submit Verification Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 