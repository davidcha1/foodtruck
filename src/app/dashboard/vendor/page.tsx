'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PaymentModal } from '@/components/booking/PaymentModal'
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
  AlertCircle,
  Truck,
  Users,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface VendorStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalSpent: number
  thisMonthSpent: number
  avgBookingCost: number
  totalVenues: number
  favoriteVenues: number
  upcomingBookings: number
}

interface VendorVenue {
  id: string
  title: string
  city: string
  status: 'active' | 'inactive' | 'pending'
  bookingsCount: number
  lastBooking?: string
  rating?: number
  reviewCount?: number
}

interface VendorBooking {
  id: string
  venueName: string
  date: string
  time: string
  duration: string
  totalCost: number
  platformFee: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
}

export default function VendorDashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [venues, setVenues] = useState<VendorVenue[]>([])
  const [bookings, setBookings] = useState<VendorBooking[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<VendorBooking | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id])

  const handlePaymentClick = (booking: VendorBooking) => {
    setSelectedBooking(booking)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedBooking(null)
    toast.success('Payment completed successfully!')
    // Refresh dashboard data
    loadDashboardData()
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setSelectedBooking(null)
  }

  const loadDashboardData = async () => {
    if (!user?.id) return
    
    try {
      // Load real bookings from database
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          start_time,
          end_time,
          total_hours,
          total_cost,
          status,
          payment_status,
          listings (
            title,
            address,
            city
          )
        `)
        .eq('vendor_id', user.id)
        .order('booking_date', { ascending: false })

      if (bookingsError) {
        console.error('Error loading bookings:', bookingsError)
      } else {
        const formattedBookings: VendorBooking[] = (bookingsData || []).map((booking: any) => ({
          id: booking.id,
          venueName: booking.listings?.title || 'Unknown Venue',
          date: new Date(booking.booking_date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          time: `${booking.start_time} - ${booking.end_time}`,
          duration: `${booking.total_hours} hours`,
          totalCost: booking.total_cost,
          platformFee: booking.total_cost * 0.1,
          totalAmount: booking.total_cost * 1.1,
          status: booking.status,
          paymentStatus: booking.payment_status
        }))
        setBookings(formattedBookings)
      }

      // For now, set mock data since we don't have vendor-specific functions yet
      setStats({
        totalBookings: 24,
        pendingBookings: 3,
        confirmedBookings: 21,
        totalSpent: 2840,
        thisMonthSpent: 680,
        avgBookingCost: 118,
        totalVenues: 2,
        favoriteVenues: 3,
        upcomingBookings: 5
      })
      
      setVenues([
        {
          id: '1',
          title: 'Downtown Plaza',
          city: 'Manchester',
          status: 'active',
          bookingsCount: 15,
          lastBooking: '2 days ago',
          rating: 4.8,
          reviewCount: 12
        },
        {
          id: '2',
          title: 'University Campus Parking',
          city: 'Manchester',
          status: 'active',
          bookingsCount: 9,
          lastBooking: '1 week ago',
          rating: 4.4,
          reviewCount: 8
        }
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      
      // Set default values on error
      setStats({
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        totalSpent: 0,
        thisMonthSpent: 0,
        avgBookingCost: 0,
        totalVenues: 0,
        favoriteVenues: 0,
        upcomingBookings: 0
      })
      setVenues([])
      
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

  if (user.role !== 'vendor') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This dashboard is only available to food truck vendors.</p>
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
              Food Truck Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.first_name || user.email}! Here's your venue booking overview.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/browse">
              <Button className="bg-mustard hover:bg-mustard/90 text-gray-900">
                <MapPin className="w-4 h-4 mr-2" />
                Find Venues
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
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{stats?.totalSpent || 0}</div>
            <p className="text-xs text-muted-foreground">
              £{stats?.thisMonthSpent || 0} this month
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
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.favoriteVenues || 0} favorite venues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
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
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="venues">
            <Truck className="h-4 w-4 mr-2" />
            My Venues
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Booking confirmed</p>
                      <p className="text-sm text-gray-600">Downtown Plaza - Tomorrow</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">New venue available</p>
                      <p className="text-sm text-gray-600">Central Market Square</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Booking request pending</p>
                      <p className="text-sm text-gray-600">University Campus Parking - Next week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/browse">
                    <Button className="w-full justify-start">
                      <MapPin className="w-4 h-4 mr-2" />
                      Find New Venues
                    </Button>
                  </Link>
                  <Link href="/dashboard/vendor?tab=bookings">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      View My Bookings
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="venues" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Venues I've Booked</CardTitle>
              <Link href="/browse">
                <Button size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find More Venues
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {venues.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No venues booked yet</h3>
                    <p className="text-gray-600 mb-4">Start by finding and booking venues for your food truck.</p>
                    <Link href="/browse">
                      <Button>
                        <MapPin className="w-4 h-4 mr-2" />
                        Find Venues to Book
                      </Button>
                    </Link>
                  </div>
                ) : (
                  venues.map((venue) => (
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
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{venue.bookingsCount} bookings made</span>
                          {venue.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              {venue.rating} rating
                            </span>
                          )}
                          {venue.lastBooking && <span>• Last booked: {venue.lastBooking}</span>}
                        </div>
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

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-600">You haven't booked any venues yet.</p>
                    <Link href="/browse">
                      <Button>
                        <MapPin className="w-4 h-4 mr-2" />
                        Find Venues to Book
                      </Button>
                    </Link>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{booking.venueName}</h3>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">£{booking.totalAmount.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">Booked on: {booking.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{booking.time}</span>
                        <span>• {booking.duration}</span>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handlePaymentClick(booking)}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                        {booking.status === 'pending' && (
                          <Button variant="outline" size="sm" disabled>
                            <Clock className="w-4 h-4 mr-1" />
                            Awaiting Approval
                          </Button>
                        )}
                        {booking.paymentStatus === 'paid' && (
                          <Button variant="outline" size="sm" className="text-green-600 border-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Paid
                          </Button>
                        )}
                        {booking.paymentStatus === 'failed' && (
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                            <XCircle className="w-4 h-4 mr-1" />
                            Payment Failed
                          </Button>
                        )}
                        {booking.paymentStatus === 'refunded' && (
                          <Button variant="outline" size="sm" className="text-gray-600 border-gray-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Refunded
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Management Coming Soon</h3>
                <p className="text-gray-600">
                  View and respond to customer reviews, track your ratings, and improve your business reputation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {showPaymentModal && selectedBooking && (
        <PaymentModal
          booking={selectedBooking}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  )
} 