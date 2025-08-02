'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Upload, Plus, X } from 'lucide-react'
import type { Database } from '@/types/database'

type VenueOwnerProfile = Database['public']['Tables']['venue_owner_profiles']['Row']
type VenueOwnerProfileInsert = Database['public']['Tables']['venue_owner_profiles']['Insert']
type VenueOwnerProfileUpdate = Database['public']['Tables']['venue_owner_profiles']['Update']

const businessTypes = [
  { value: 'pub', label: 'Pub' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'event_space', label: 'Event Space' },
  { value: 'retail', label: 'Retail' },
  { value: 'office', label: 'Office' },
  { value: 'other', label: 'Other' }
] as const

const verificationStatusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

export function VenueOwnerProfileForm() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<VenueOwnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [socialLinks, setSocialLinks] = useState<string[]>([''])
  
  const [formData, setFormData] = useState<Partial<VenueOwnerProfileUpdate>>({
    business_name: '',
    business_type: undefined,
    business_registration: '',
    business_address: '',
    website: '',
    business_hours: '',
    contact_person: '',
    contact_phone: '',
    business_description: '',
    profile_photo_url: ''
  })

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('venue_owner_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile(data)
        setFormData({
          business_name: data.business_name || '',
          business_type: data.business_type,
          business_registration: data.business_registration || '',
          business_address: data.business_address || '',
          website: data.website || '',
          business_hours: data.business_hours || '',
          contact_person: data.contact_person || '',
          contact_phone: data.contact_phone || '',
          business_description: data.business_description || '',
          profile_photo_url: data.profile_photo_url || ''
        })
        setSocialLinks(data.social_links || [''])
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setSaving(true)
    try {
      const profileData: VenueOwnerProfileUpdate = {
        ...formData,
        social_links: socialLinks.filter(link => link.trim() !== ''),
        updated_at: new Date().toISOString()
      }

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('venue_owner_profiles')
          .update(profileData)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('Profile updated successfully!')
      } else {
        // Create new profile
        const insertData: VenueOwnerProfileInsert = {
          user_id: user.id,
          ...profileData
        }

        const { error } = await supabase
          .from('venue_owner_profiles')
          .insert(insertData)

        if (error) throw error
        toast.success('Profile created successfully!')
      }

      loadProfile() // Reload to get updated data
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, ''])
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const updateSocialLink = (index: number, value: string) => {
    const updated = [...socialLinks]
    updated[index] = value
    setSocialLinks(updated)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>
              Manage your business information and venue details
            </CardDescription>
          </div>
          {profile && (
            <Badge className={verificationStatusStyles[profile.verification_status]}>
              {profile.verification_status.charAt(0).toUpperCase() + profile.verification_status.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={formData.business_name || ''}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select
                value={formData.business_type || ''}
                onValueChange={(value) => setFormData({ ...formData, business_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_registration">Business Registration</Label>
              <Input
                id="business_registration"
                value={formData.business_registration || ''}
                onChange={(e) => setFormData({ ...formData, business_registration: e.target.value })}
                placeholder="ABN, business license number, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.example.com"
              />
            </div>
          </div>

          {/* Address and Contact */}
          <div className="space-y-2">
            <Label htmlFor="business_address">Business Address</Label>
            <Textarea
              id="business_address"
              value={formData.business_address || ''}
              onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
              placeholder="Full business address"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person || ''}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Name of primary contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="Business phone number"
              />
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-2">
            <Label htmlFor="business_hours">Business Hours</Label>
            <Input
              id="business_hours"
              value={formData.business_hours || ''}
              onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
              placeholder="e.g., Mon-Fri 9AM-5PM, Sat 10AM-3PM"
            />
          </div>

          {/* Business Description */}
          <div className="space-y-2">
            <Label htmlFor="business_description">Business Description</Label>
            <Textarea
              id="business_description"
              value={formData.business_description || ''}
              onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
              placeholder="Describe your business and what makes your venues special..."
              rows={4}
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Social Media Links</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
            {socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={link}
                  onChange={(e) => updateSocialLink(index, e.target.value)}
                  placeholder="https://instagram.com/yourbusiness"
                  className="flex-1"
                />
                {socialLinks.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSocialLink(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Profile Photo */}
          <div className="space-y-2">
            <Label htmlFor="profile_photo_url">Profile Photo URL</Label>
            <Input
              id="profile_photo_url"
              type="url"
              value={formData.profile_photo_url || ''}
              onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
              placeholder="URL to your business photo"
            />
            <p className="text-sm text-muted-foreground">
              We'll add image upload functionality soon. For now, you can use an image URL.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 