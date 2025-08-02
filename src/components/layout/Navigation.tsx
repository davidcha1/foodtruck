'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Truck, User, LogOut, Settings, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

export const Navigation = () => {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const getInitials = (user: any) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <nav className="bg-charcoal border-b border-charcoal-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-mustard rounded-lg flex items-center justify-center group-hover:bg-mustard-600 transition-colors">
                <Truck className="h-5 w-5 text-charcoal" />
              </div>
              <span className="font-bebas text-xl font-bold text-white group-hover:text-mustard transition-colors">
                FoodTruck Hub
              </span>
            </Link>
          </div>

          {/* Navigation items */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Main navigation based on role */}
                <div className="hidden md:flex items-center space-x-6">
                  <Link
                    href="/browse"
                    className="text-gray-300 hover:text-mustard px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Browse Venues
                  </Link>
                  
                  {user.role === 'venue_owner' && (
                    <>
                      <Link
                        href="/dashboard"
                        className="text-gray-300 hover:text-mustard px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        My Dashboard
                      </Link>
                      <Button asChild className="bg-warm-red hover:bg-warm-red-700 text-white font-semibold">
                        <Link href="/listings/create">
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add Listing
                        </Link>
                      </Button>
                    </>
                  )}
                  
                  {user.role === 'vendor' && (
                    <Link
                      href="/dashboard/vendor"
                      className="text-gray-300 hover:text-mustard px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      My Dashboard
                    </Link>
                  )}
                </div>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-charcoal-700">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-mustard text-charcoal font-semibold">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white border-cool-grey/20" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-charcoal">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-text">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-text capitalize">
                          {user.role.replace('_', ' ')}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-cool-grey/20" />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer text-charcoal hover:text-warm-red hover:bg-gray-50">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        href={user.role === 'venue_owner' ? '/dashboard' : '/dashboard/vendor'} 
                        className="cursor-pointer text-charcoal hover:text-warm-red hover:bg-gray-50"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-cool-grey/20" />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-charcoal hover:text-error-red hover:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Unauthenticated user menu */}
                <div className="hidden md:flex items-center space-x-6">
                  <Link
                    href="/browse"
                    className="text-gray-300 hover:text-mustard px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Browse Venues
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" asChild className="border-mustard text-mustard hover:bg-mustard hover:text-charcoal font-medium">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-warm-red hover:bg-warm-red-700 text-white font-semibold">
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 