'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Users, 
  Building, 
  Truck, 
  Calendar, 
  DollarSign, 
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AdminStats {
  totalUsers: number
  totalVenueOwners: number
  totalVendors: number
  totalListings: number
  totalBookings: number
  totalRevenue: number
  pendingVerifications: number
  activeBookings: number
}

export default function AdminPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadAdminData()
    }
  }, [user])

  const loadAdminData = async () => {
    setLoading(true)
    try {
      // Load user statistics
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('role')

      if (usersError) throw usersError

      const totalUsers = users?.length || 0
      const totalVenueOwners = users?.filter(u => u.role === 'venue_owner').length || 0
      const totalVendors = users?.filter(u => u.role === 'vendor').length || 0

      // Load listing statistics
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')

      if (listingsError) throw listingsError

      const totalListings = listings?.length || 0

      // Load booking statistics
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')

      if (bookingsError) throw bookingsError

      const totalBookings = bookings?.length || 0
      const activeBookings = bookings?.filter(b => b.status === 'confirmed').length || 0
      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_cost || 0), 0) || 0

      // Load verification statistics
      const { data: venueOwnerProfiles, error: venueError } = await supabase
        .from('venue_owner_profiles')
        .select('verification_status')

      const { data: vendorProfiles, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('verification_status')

      if (venueError || vendorError) throw venueError || vendorError

      const pendingVerifications = 
        (venueOwnerProfiles?.filter(p => p.verification_status === 'pending').length || 0) +
        (vendorProfiles?.filter(p => p.verification_status === 'pending').length || 0)

      setStats({
        totalUsers,
        totalVenueOwners,
        totalVendors,
        totalListings,
        totalBookings,
        totalRevenue,
        pendingVerifications,
        activeBookings
      })

      // Load recent activity
      await loadRecentActivity()

    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const loadRecentActivity = async () => {
    try {
      // Get recent bookings
      const { data: recentBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          listings (title),
          users!vendor_id (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (bookingsError) throw bookingsError

      // Get recent users
      const { data: recentUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (usersError) throw usersError

      const activity = [
        ...(recentBookings?.map(booking => ({
          type: 'booking',
          data: booking,
          timestamp: booking.created_at
        })) || []),
        ...(recentUsers?.map(user => ({
          type: 'user',
          data: user,
          timestamp: user.created_at
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setRecentActivity(activity.slice(0, 10))
    } catch (error) {
      console.error('Error loading recent activity:', error)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p>Please sign in to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p>Loading admin dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalVenueOwners || 0} venue owners, {stats?.totalVendors || 0} vendors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalListings || 0}</div>
            <p className="text-xs text-muted-foreground">Active venues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeBookings || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Platform earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Platform Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Pending Verifications</span>
                  <Badge variant={stats?.pendingVerifications && stats.pendingVerifications > 0 ? 'destructive' : 'secondary'}>
                    {stats?.pendingVerifications || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Bookings</span>
                  <Badge variant="default">
                    {stats?.activeBookings || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Revenue</span>
                  <span className="font-medium">${stats?.totalRevenue?.toFixed(2) || '0.00'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Review Verifications
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Building className="w-4 h-4 mr-2" />
                  Review Listings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Bookings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      {activity.type === 'booking' ? (
                        <Calendar className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Users className="w-5 h-5 text-green-500" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">
                          {activity.type === 'booking' 
                            ? `New booking for ${activity.data.listings?.title}`
                            : `New ${activity.data.role} signed up`
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {activity.type === 'booking' ? 'Booking' : 'User'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Pending Verifications</span>
              </CardTitle>
              <CardDescription>
                {stats?.pendingVerifications || 0} verification requests pending review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  Verification management interface will be implemented here.
                </p>
                <Button className="mt-4" variant="outline">
                  View All Verifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 