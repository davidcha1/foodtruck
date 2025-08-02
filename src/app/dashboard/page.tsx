'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { BookingManagement } from '@/components/booking/BookingManagement'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  CalendarDays,
  MapPin,
  Plus,
  Eye,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getDashboardStats, getRecentVenues, DashboardStats, RecentVenue } from '@/lib/dashboard'
import { VenueCalendar } from '@/components/dashboard/VenueCalendar'

export default function VenueOwnerDashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentVenues, setRecentVenues] = useState<RecentVenue[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id])

  const loadDashboardData = async () => {
    if (!user?.id) return
    
    try {
      // Fetch real data from the database
      const [statsData, venuesData] = await Promise.all([
        getDashboardStats(user.id),
        getRecentVenues(user.id)
      ])
      
      setStats(statsData)
      setRecentVenues(venuesData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      
      // Set default values on error to prevent UI breaking
      setStats({
        totalVenues: 0,
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        avgBookingValue: 0
      })
      setRecentVenues([])
      
      toast.error('Failed to load dashboard data')
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">You need to be logged in to access the dashboard.</p>
            <Link href="/auth/signin">
              <Button className="mt-4 w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user.role === 'vendor') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Redirecting to Vendor Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Redirecting you to the vendor dashboard...</p>
            <Link href="/dashboard/vendor">
              <Button className="mt-4 w-full">Go to Vendor Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user.role !== 'venue_owner') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This dashboard is only available to venue owners.</p>
            <Link href="/browse">
              <Button className="mt-4 w-full">Browse Venues</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-bebas text-gray-900">
            Venue Owner Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user.first_name || user.email}! Here's your venue performance overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/listings/create">
            <Button className="bg-mustard hover:bg-mustard/90 text-gray-900">
              <Plus className="w-4 h-4 mr-2" />
              Add New Venue
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{stats?.totalRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              £{stats?.thisMonthRevenue || 0} this month
            </p>
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
              {stats?.confirmedBookings || 0} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires your approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVenues || 0}</div>
            <p className="text-xs text-muted-foreground">
              Listed venues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="venues">
            <MapPin className="h-4 w-4 mr-2" />
            My Venues
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {user.id && <VenueCalendar ownerId={user.id} />}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          {user.id && <BookingManagement ownerId={user.id} />}
        </TabsContent>

        <TabsContent value="venues" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Venues</CardTitle>
              <Link href="/listings/create">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Venue
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentVenues.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No venues yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first venue to the platform.</p>
                    <Link href="/listings/create">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Venue
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentVenues.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{venue.title}</h3>
                          <Badge variant={venue.status === 'active' ? 'default' : 'secondary'}>
                            {venue.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {venue.city}
                        </p>
                        <p className="text-sm text-gray-500">
                          {venue.bookingsCount} bookings
                          {venue.lastBooking && ` • Last booking: ${venue.lastBooking}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-600">
                  Detailed analytics including booking trends, revenue insights, and performance metrics will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 