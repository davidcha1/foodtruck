import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  MapPin, 
  Clock, 
  Shield, 
  DollarSign, 
  Users, 
  Truck, 
  Search,
  Calendar,
  Star,
  CheckCircle,
  ArrowRight,
  Zap,
  Heart,
  TrendingUp
} from 'lucide-react'

export default function Home() {
  // Background pattern SVG for hero section
  const dotPatternUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"

  return (
    <div className="bg-off-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-charcoal via-charcoal-800 to-charcoal-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{ backgroundImage: `url("${dotPatternUrl}")` }}
          ></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Badge */}
            <Badge variant="secondary" className="mb-6 bg-mustard/20 text-mustard border-mustard/30 text-sm font-medium px-4 py-2">
              🚚 The UK's Leading Food Truck Marketplace
            </Badge>
            
            {/* Hero Headline */}
            <h1 className="font-bebas text-display sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 text-white leading-tight">
              Connect Venues with
              <span className="text-mustard block mt-2">Food Trucks</span>
            </h1>
            
            {/* Hero Subheading */}
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The premier marketplace for venue owners to monetize unused outdoor spaces 
              and food truck vendors to find perfect trading locations across the UK and beyond.
            </p>
            
            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-warm-red hover:bg-warm-red-700 text-white text-lg px-8 py-4 h-auto font-semibold shadow-xl">
                <Link href="/auth/signup?role=venue_owner">
                  <MapPin className="h-5 w-5 mr-2" />
                  List Your Space
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="border-2 border-mustard text-mustard hover:bg-mustard hover:text-charcoal text-lg px-8 py-4 h-auto font-semibold">
                <Link href="/browse">
                  <Search className="h-5 w-5 mr-2" />
                  Find a Space
                </Link>
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-mustard rounded-full border-2 border-charcoal flex items-center justify-center">
                      <Truck className="h-4 w-4 text-charcoal" />
                    </div>
                  ))}
                </div>
                <span>1000+ venues listed</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-mustard fill-current" />
                <span>4.9/5 average rating</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success-green" />
                <span>Growing nationwide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bebas text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Why Choose FoodTruck Hub?
            </h2>
            <p className="text-xl text-muted-text max-w-3xl mx-auto leading-relaxed">
              We make it easy for venue owners and food truck vendors to connect, 
              book, and transact safely with our community-driven platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-transparent hover:border-mustard/30 transition-all duration-300 group bg-white shadow-lg hover:shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-warm-red/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-warm-red/20 transition-colors">
                  <MapPin className="h-8 w-8 text-warm-red" />
                </div>
                <CardTitle className="text-xl font-bold text-charcoal">Prime Locations</CardTitle>
                <CardDescription className="text-muted-text leading-relaxed">
                  Access to premium outdoor spaces in high-traffic areas perfect for food truck operations nationwide.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-transparent hover:border-mustard/30 transition-all duration-300 group bg-white shadow-lg hover:shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-electric-blue/20 transition-colors">
                  <Clock className="h-8 w-8 text-electric-blue" />
                </div>
                <CardTitle className="text-xl font-bold text-charcoal">Flexible Booking</CardTitle>
                <CardDescription className="text-muted-text leading-relaxed">
                  Book by the hour, day, or week. Perfect for events, regular trading, or seasonal operations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-transparent hover:border-mustard/30 transition-all duration-300 group bg-white shadow-lg hover:shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-success-green/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-success-green/20 transition-colors">
                  <Shield className="h-8 w-8 text-success-green" />
                </div>
                <CardTitle className="text-xl font-bold text-charcoal">Secure Payments</CardTitle>
                <CardDescription className="text-muted-text leading-relaxed">
                  Safe and secure transactions with automated payouts through Stripe Connect.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-transparent hover:border-mustard/30 transition-all duration-300 group bg-white shadow-lg hover:shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-mustard/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-mustard/20 transition-colors">
                  <DollarSign className="h-8 w-8 text-mustard" />
                </div>
                <CardTitle className="text-xl font-bold text-charcoal">Fair Pricing</CardTitle>
                <CardDescription className="text-muted-text leading-relaxed">
                  Transparent fee structure with competitive rates. No hidden costs or surprise charges.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-transparent hover:border-mustard/30 transition-all duration-300 group bg-white shadow-lg hover:shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-warm-red/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-warm-red/20 transition-colors">
                  <Users className="h-8 w-8 text-warm-red" />
                </div>
                <CardTitle className="text-xl font-bold text-charcoal">Community Focused</CardTitle>
                <CardDescription className="text-muted-text leading-relaxed">
                  Join a growing community of venue owners and food truck operators across the UK.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-transparent hover:border-mustard/30 transition-all duration-300 group bg-white shadow-lg hover:shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-electric-blue/20 transition-colors">
                  <Zap className="h-8 w-8 text-electric-blue" />
                </div>
                <CardTitle className="text-xl font-bold text-charcoal">Full Amenities</CardTitle>
                <CardDescription className="text-muted-text leading-relaxed">
                  Find spaces with power, water, waste disposal, and other essential amenities.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bebas text-4xl md:text-5xl font-bold text-charcoal mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-text max-w-2xl mx-auto">
              Simple steps for both venue owners and food truck vendors
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* For Venue Owners */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-red rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bebas text-2xl font-bold text-charcoal mb-2">
                  For Venue Owners
                </h3>
                <p className="text-muted-text">Turn your unused space into income</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-warm-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">List Your Space</h4>
                    <p className="text-muted-text text-sm">Create detailed listings with photos, amenities, and pricing in minutes.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-warm-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">Receive Bookings</h4>
                    <p className="text-muted-text text-sm">Food truck vendors discover and book your space through our platform.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-warm-red text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">Get Paid</h4>
                    <p className="text-muted-text text-sm">Automatic payments with instant transfers to your account.</p>
                  </div>
                </div>
              </div>
              
              <Button asChild className="w-full mt-8 bg-warm-red hover:bg-warm-red-700">
                <Link href="/auth/signup?role=venue_owner">
                  Start Listing <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* For Food Truck Vendors */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-mustard rounded-full mb-4">
                  <Truck className="h-8 w-8 text-charcoal" />
                </div>
                <h3 className="font-bebas text-2xl font-bold text-charcoal mb-2">
                  For Food Truck Vendors
                </h3>
                <p className="text-muted-text">Find your perfect trading spot</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-mustard text-charcoal rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">Search & Filter</h4>
                    <p className="text-muted-text text-sm">Find spaces by location, amenities, pricing, and availability across the UK.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-mustard text-charcoal rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">Book & Pay</h4>
                    <p className="text-muted-text text-sm">Secure your spot with instant booking and payment through our platform.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-mustard text-charcoal rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">Start Trading</h4>
                    <p className="text-muted-text text-sm">Set up your food truck and start serving customers in prime locations.</p>
                  </div>
                </div>
              </div>
              
              <Button asChild className="w-full mt-8 bg-mustard text-charcoal hover:bg-mustard-700 hover:text-white">
                <Link href="/auth/signup?role=vendor">
                  Start Searching <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bebas text-4xl md:text-5xl font-bold mb-4">
              Trusted by the Community
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See what venue owners and food truck vendors are saying about FoodTruck Hub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-charcoal-800 border-cool-grey/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-mustard fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "FoodTruck Hub helped us monetize our empty car park. We've had consistent bookings and the platform makes everything so easy."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-warm-red rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-gray-400">Venue Owner, Manchester</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-charcoal-800 border-cool-grey/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-mustard fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "As a food truck owner, finding good spots was always a challenge. This platform changed everything - bookings are simple and venues are perfect."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-mustard rounded-full flex items-center justify-center mr-3">
                    <span className="text-charcoal font-bold">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold">Marcus Rodriguez</p>
                    <p className="text-sm text-gray-400">Tacos El Fuego, London</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-charcoal-800 border-cool-grey/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-mustard fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "The community aspect is brilliant. We've built lasting relationships with venue owners and it's boosted our business significantly."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-electric-blue rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">EP</span>
                  </div>
                  <div>
                    <p className="font-semibold">Emma Phillips</p>
                    <p className="text-sm text-gray-400">The Rolling Scone, Birmingham</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-warm-red to-warm-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bebas text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            Join thousands of venue owners and food truck vendors already using FoodTruck Hub across the UK
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-warm-red hover:bg-gray-100 text-lg px-8 py-4 h-auto font-semibold">
              <Link href="/auth/signup">
                <Heart className="h-5 w-5 mr-2" />
                Join the Community
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-warm-red text-lg px-8 py-4 h-auto font-semibold">
              <Link href="/browse">
                <Search className="h-5 w-5 mr-2" />
                Explore Venues
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-mustard rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-charcoal" />
                </div>
                <span className="font-bebas text-xl font-bold">FoodTruck Hub</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting venues with food trucks across the UK and beyond. Building communities one meal at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/browse" className="hover:text-mustard transition-colors">Browse Venues</Link></li>
                <li><Link href="/auth/signup" className="hover:text-mustard transition-colors">Sign Up</Link></li>
                <li><Link href="/auth/signin" className="hover:text-mustard transition-colors">Sign In</Link></li>
                <li><Link href="/profile" className="hover:text-mustard transition-colors">My Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/help" className="hover:text-mustard transition-colors">Help Centre</Link></li>
                <li><Link href="/contact" className="hover:text-mustard transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-mustard transition-colors">FAQ</Link></li>
                <li><Link href="/safety" className="hover:text-mustard transition-colors">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/privacy" className="hover:text-mustard transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-mustard transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-mustard transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2024 FoodTruck Hub. All rights reserved.</p>
            <p>Made with <Heart className="h-4 w-4 inline text-warm-red" /> in the UK</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
