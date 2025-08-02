'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'
import { getCurrentUser, signIn, signUp, signOut, ensureUserRecord } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: UserRole) => Promise<{ user: any | null; session: any | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  isSessionValid: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // First check if we have an auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        let currentUser = await getCurrentUser()
        
        // If user doesn't exist in our database, try to create the record
        if (!currentUser && session?.user) {
          console.log('Initial session: User record not found, attempting to create...')
          currentUser = await ensureUserRecord()
        }
        
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state change event:', { event, hasSession: !!session, userId: session?.user?.id })
        
        if (session?.user) {
          try {
            console.log('AuthContext: Session found, getting current user...')
            
            // Add a small delay to allow database triggers to complete
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Add timeout to prevent hanging
            const authTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Auth state change timeout')), 5000)
            )
            
            const authPromise = (async () => {
              let currentUser = await getCurrentUser()
              
              console.log('AuthContext: getCurrentUser result:', { 
                found: !!currentUser, 
                id: currentUser?.id, 
                email: currentUser?.email, 
                role: currentUser?.role 
              })
              
              // If user doesn't exist in our database, try to create the record
              if (!currentUser) {
                console.log('AuthContext: User record not found, attempting to create...')
                currentUser = await ensureUserRecord()
                console.log('AuthContext: ensureUserRecord result:', { 
                  found: !!currentUser, 
                  id: currentUser?.id, 
                  email: currentUser?.email 
                })
                
                // If still no user record after creation attempt, log error but continue
                if (!currentUser) {
                  console.warn('AuthContext: Failed to create user record for authenticated user - this is expected during development')
                  // Don't throw an error, just log it and continue with null user
                  // This allows the user to still use the app even if the database record creation fails
                }
              }
              
              return currentUser
            })()
            
            const currentUser = await Promise.race([
              authPromise,
              authTimeoutPromise
            ]) as User | null
            
            console.log('AuthContext: Setting user in state:', { 
              id: currentUser?.id, 
              email: currentUser?.email, 
              role: currentUser?.role 
            })
            
            // If we have an auth session but no user record, create a minimal user object
            // This prevents the app from breaking when the database record creation fails
            if (!currentUser && session.user) {
              console.log('AuthContext: Creating fallback user object from session')
              const fallbackUser: User = {
                id: session.user.id,
                email: session.user.email!,
                role: (session.user.user_metadata?.role as UserRole) || 'vendor',
                stripe_connect_id: null,
                first_name: session.user.user_metadata?.first_name || null,
                last_name: session.user.user_metadata?.last_name || null,
                phone: session.user.user_metadata?.phone || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
              setUser(fallbackUser)
            } else {
              setUser(currentUser)
            }
            
            // Handle automatic redirect after successful signup
            if (currentUser && window.location.pathname.includes('/auth/')) {
              const redirectPath = currentUser.role === 'venue_owner' ? '/dashboard' : '/browse'
              console.log('Redirecting user after signup:', { role: currentUser.role, redirectPath })
              // Set loading to false before redirect to prevent spinning
              setLoading(false)
              // Small delay to ensure state is updated before redirect
              setTimeout(() => {
                window.location.href = redirectPath
              }, 100)
              return // Exit early to prevent setting loading again below
            }
          } catch (error) {
            console.error('Error getting user after auth change:', error)
            console.error('Error details:', {
              error,
              message: error instanceof Error ? error.message : 'Unknown error',
              event,
              userId: session.user.id,
              userEmail: session.user.email
            })
            
            // If it's a timeout error, still set the user to null but don't break the flow
            if (error instanceof Error && error.message.includes('timeout')) {
              console.log('AuthContext: Timeout occurred, continuing with null user')
            }
            
            setUser(null)
          }
        } else {
          console.log('AuthContext: No session found, setting user to null')
          setUser(null)
        }
        
        console.log('AuthContext: Setting loading to false')
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log('AuthContext: Starting sign-in for:', email)
      const result = await signIn(email, password)
      console.log('AuthContext: Sign-in successful:', { userId: result.user?.id, email: result.user?.email })
      
      // Set a timeout to reset loading state in case auth state change doesn't fire
      setTimeout(() => {
        setLoading(false)
      }, 3000)
      
      // User will be set via the auth state change listener
    } catch (error) {
      console.error('AuthContext: Sign-in error:', error)
      setLoading(false)
      throw error
    }
  }

  const handleSignUp = async (email: string, password: string, role: UserRole) => {
    setLoading(true)
    try {
      console.log('AuthContext: Starting signup process')
      const result = await signUp(email, password, role)
      console.log('AuthContext: Signup result:', result)
      
      // Let the individual components manage their own loading states
      // The auth state change listener will handle the rest
      return result
    } catch (error) {
      console.error('AuthContext: Signup error:', error)
      setLoading(false)
      throw error
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    setLoading(true)
    try {
      // Force refresh session
      const { data: { session }, error } = await supabase.auth.refreshSession()
      console.log('AuthContext: Manual session refresh:', { hasSession: !!session, error })
      
      if (session?.user) {
        let currentUser = await getCurrentUser()
        
        if (!currentUser) {
          console.log('Manual refresh: User record not found, attempting to create...')
          currentUser = await ensureUserRecord()
        }
        
        setUser(currentUser)
        console.log('AuthContext: Manual refresh complete, user set to:', currentUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const isSessionValid = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('AuthContext: Session validity check:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        expiresAt: session?.expires_at 
      })
      return !!session?.user
    } catch (error) {
      console.error('Error checking session validity:', error)
      return false
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshUser,
    isSessionValid
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 