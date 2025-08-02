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
import { Plus, X, Truck, DollarSign } from 'lucide-react'
import type { Database } from '@/types/database'

type VendorProfile = Database['public']['Tables']['vendor_profiles']['Row']
type VendorProfileInsert = Database['public']['Tables']['vendor_profiles']['Insert']
type VendorProfileUpdate = Database['public']['Tables']['vendor_profiles']['Update']

const cuisineTypes = [
  { value: 'asian', label: 'Asian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'italian', label: 'Italian' },
  { value: 'american', label: 'American' },
  { value: 'indian', label: 'Indian' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'fusion', label: 'Fusion' },
  { value: 'other', label: 'Other' }
] as const

const truckSizes = [
  { value: 'Small (under 20ft)', label: 'Small (under 20ft)' },
  { value: 'Medium (20-30ft)', label: 'Medium (20-30ft)' },
  { value: 'Large (over 30ft)', label: 'Large (over 30ft)' }
]

const verificationStatusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

export function VendorProfileForm() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [menuHighlights, setMenuHighlights] = useState<string[]>([''])
  const [socialLinks, setSocialLinks] = useState<string[]>([''])
  
  const [formData, setFormData] = useState<Partial<VendorProfileUpdate>>({
    food_truck_name: '',
    cuisine_type: undefined,
    food_license_number: '',
    truck_description: '',
    website: '',
    instagram_handle: '',
    facebook_page: '',
    profile_photo_url: '',
    truck_size: '',
    setup_time_minutes: 30,
    operating_radius_km: 50,
    min_booking_value: undefined,
    special_requirements: ''
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
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile(data)
        setFormData({
          food_truck_name: data.food_truck_name || '',
          cuisine_type: data.cuisine_type,
          food_license_number: data.food_license_number || '',
          truck_description: data.truck_description || '',
          website: data.website || '',
          instagram_handle: data.instagram_handle || '',
          facebook_page: data.facebook_page || '',
          profile_photo_url: data.profile_photo_url || '',
          truck_size: data.truck_size || '',
          setup_time_minutes: data.setup_time_minutes || 30,
          operating_radius_km: data.operating_radius_km || 50,
          min_booking_value: data.min_booking_value || undefined,
          special_requirements: data.special_requirements || ''
        })
        setMenuHighlights(data.menu_highlights || [''])
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
      const profileData: VendorProfileUpdate = {
        ...formData,
        menu_highlights: menuHighlights.filter(item => item.trim() !== ''),
        social_links: socialLinks.filter(link => link.trim() !== ''),
        updated_at: new Date().toISOString()
      }

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('vendor_profiles')
          .update(profileData)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('Profile updated successfully!')
      } else {
        // Create new profile
        const insertData: VendorProfileInsert = {
          user_id: user.id,
          food_truck_name: formData.food_truck_name || 'My Food Truck',
          ...profileData
        }

        const { error } = await supabase
          .from('vendor_profiles')
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

  const addMenuItem = () => {
    setMenuHighlights([...menuHighlights, ''])
  }

  const removeMenuItem = (index: number) => {
    setMenuHighlights(menuHighlights.filter((_, i) => i !== index))
  }

  const updateMenuItem = (index: number, value: string) => {
    const updated = [...menuHighlights]
    updated[index] = value
    setMenuHighlights(updated)
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
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Food Truck Profile</CardTitle>
              <CardDescription>
                Manage your food truck information and business details
              </CardDescription>
            </div>
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
          {/* Basic Truck Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="food_truck_name">Food Truck Name *</Label>
              <Input
                id="food_truck_name"
                value={formData.food_truck_name || ''}
                onChange={(e) => setFormData({ ...formData, food_truck_name: e.target.value })}
                placeholder="Enter your truck name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Select
                value={formData.cuisine_type || ''}
                onValueChange={(value) => setFormData({ ...formData, cuisine_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine type" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="food_license_number">Food License Number</Label>
              <Input
                id="food_license_number"
                value={formData.food_license_number || ''}
                onChange={(e) => setFormData({ ...formData, food_license_number: e.target.value })}
                placeholder="Food handling license number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="truck_size">Truck Size</Label>
              <Select
                value={formData.truck_size || ''}
                onValueChange={(value) => setFormData({ ...formData, truck_size: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select truck size" />
                </SelectTrigger>
                <SelectContent>
                  {truckSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Truck Description */}
          <div className="space-y-2">
            <Label htmlFor="truck_description">Truck Description</Label>
            <Textarea
              id="truck_description"
              value={formData.truck_description || ''}
              onChange={(e) => setFormData({ ...formData, truck_description: e.target.value })}
              placeholder="Describe your food truck, what makes it special, your story..."
              rows={4}
            />
          </div>

          {/* Menu Highlights */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Menu Highlights</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMenuItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            {menuHighlights.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateMenuItem(index, e.target.value)}
                  placeholder="Popular menu item"
                  className="flex-1"
                />
                {menuHighlights.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMenuItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Online Presence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.yourfoodtruck.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_handle">Instagram Handle</Label>
              <Input
                id="instagram_handle"
                value={formData.instagram_handle || ''}
                onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                placeholder="@yourfoodtruck"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook_page">Facebook Page</Label>
              <Input
                id="facebook_page"
                value={formData.facebook_page || ''}
                onChange={(e) => setFormData({ ...formData, facebook_page: e.target.value })}
                placeholder="Facebook page URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_photo_url">Truck Photo URL</Label>
              <Input
                id="profile_photo_url"
                type="url"
                value={formData.profile_photo_url || ''}
                onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
                placeholder="URL to your truck photo"
              />
            </div>
          </div>

          {/* Additional Social Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Additional Social Media Links</Label>
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
                  placeholder="https://tiktok.com/@yourfoodtruck"
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

          {/* Operational Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Operational Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="setup_time_minutes">Setup Time (minutes)</Label>
                <Input
                  id="setup_time_minutes"
                  type="number"
                  min="1"
                  value={formData.setup_time_minutes || ''}
                  onChange={(e) => setFormData({ ...formData, setup_time_minutes: parseInt(e.target.value) || 30 })}
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operating_radius_km">Operating Radius (km)</Label>
                <Input
                  id="operating_radius_km"
                  type="number"
                  min="1"
                  value={formData.operating_radius_km || ''}
                  onChange={(e) => setFormData({ ...formData, operating_radius_km: parseInt(e.target.value) || 50 })}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_booking_value">Minimum Booking Value ($)</Label>
                <Input
                  id="min_booking_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.min_booking_value || ''}
                  onChange={(e) => setFormData({ ...formData, min_booking_value: parseFloat(e.target.value) || undefined })}
                  placeholder="100.00"
                />
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          <div className="space-y-2">
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              id="special_requirements"
              value={formData.special_requirements || ''}
              onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
              placeholder="Any special power requirements, equipment needs, accessibility considerations..."
              rows={3}
            />
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