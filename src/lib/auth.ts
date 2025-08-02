import { supabase } from './supabase'
import { User, UserRole } from '@/types'

export const signUp = async (email: string, password: string, role: UserRole) => {
  try {
    console.log('Starting signup process for:', { email, role })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role
        },
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
      }
    })

    if (error) {
      console.error('Supabase auth signup error:', error)
      console.error('Auth error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        code: (error as any).code,
        details: (error as any).details
      })
      throw error
    }

    console.log('Auth signup successful:', { 
      userId: data.user?.id, 
      email: data.user?.email,
      confirmed: data.user?.email_confirmed_at,
      session: !!data.session
    })

    // Small delay to allow database triggers to complete
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Auth signup process completed')
    
    // User record will be created automatically by database trigger
    return data
  } catch (error) {
    console.error('Error in signUp function:', error)
    console.error('SignUp error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      email,
      role
    })
    throw error
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    console.log('auth.ts: Starting sign-in for:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('auth.ts: Sign-in error:', error)
      console.error('Sign-in error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name
      })
      throw error
    }

    console.log('auth.ts: Sign-in successful:', {
      userId: data.user?.id,
      email: data.user?.email,
      session: !!data.session
    })

    return data
  } catch (error) {
    console.error('auth.ts: Exception in signIn:', error)
    throw error
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  if (error) throw error
}

export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log('getCurrentUser: Starting to fetch current user')
    const { data: authUser } = await supabase.auth.getUser()
    
    if (!authUser.user) {
      console.log('getCurrentUser: No auth user found')
      return null
    }

    console.log('getCurrentUser: Auth user found:', {
      id: authUser.user.id,
      email: authUser.user.email
    })

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 3000)
    )
    
    const queryPromise = supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single()

    const { data: user, error } = await Promise.race([
      queryPromise,
      timeoutPromise
    ]) as any

    if (error) {
      console.error('getCurrentUser: Error fetching user from database:', error)
      
      // If user doesn't exist in our users table yet, return null instead of throwing
      if (error.code === 'PGRST116') {
        console.log('getCurrentUser: User record not found in database, may need to be created')
        return null
      }
      return null
    }

    console.log('getCurrentUser: Successfully fetched user from database:', {
      id: user?.id,
      email: user?.email,
      role: user?.role
    })
    
    return user
  } catch (error) {
    console.error('getCurrentUser: Exception in getCurrentUser:', error)
    console.log('getCurrentUser: Returning null due to error/timeout')
    return null
  }
}

export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession()
  if (error) throw error
  return data
}

export const updateUserProfile = async (
  userId: string, 
  updates: Partial<User>
) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const hasRole = (user: User | null, role: UserRole): boolean => {
  return user?.role === role
}

export const isAuthenticated = (user: User | null): boolean => {
  return user !== null
}

export const isVenueOwner = (user: User | null): boolean => {
  return hasRole(user, 'venue_owner')
}

export const isVendor = (user: User | null): boolean => {
  return hasRole(user, 'vendor')
}

// Helper function to ensure user record exists
export const ensureUserRecord = async (): Promise<User | null> => {
  console.log('ensureUserRecord: Starting to ensure user record exists')
  const { data: authUser } = await supabase.auth.getUser()
  
  if (!authUser.user) {
    console.log('ensureUserRecord: No auth user found')
    return null
  }

  console.log('ensureUserRecord: Auth user found:', {
    id: authUser.user.id,
    email: authUser.user.email,
    metadata: authUser.user.user_metadata
  })

  try {
    // First, try to get existing user record
    console.log('ensureUserRecord: Checking if user record exists in database...')
    
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single()

    if (existingUser && !fetchError) {
      console.log('ensureUserRecord: Found existing user record:', existingUser)
      return existingUser
    }

    // If no existing record, create one directly
    console.log('ensureUserRecord: No existing record found, creating new one...')
    
    const userData = {
      id: authUser.user.id,
      email: authUser.user.email!,
      role: (authUser.user.user_metadata?.role as UserRole) || 'vendor',
      stripe_connect_id: null,
      first_name: authUser.user.user_metadata?.first_name || null,
      last_name: authUser.user.user_metadata?.last_name || null,
      phone: authUser.user.user_metadata?.phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('ensureUserRecord: Creating user record with data:', userData)

    const { data: newUser, error } = await supabase
      .from('users')
      .upsert(userData, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error) {
      console.error('ensureUserRecord: Error creating user record:', error)
      console.error('ensureUserRecord: Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Try to fetch the user record one more time in case it was created by a trigger
      console.log('ensureUserRecord: Trying to fetch user record after error...')
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.user.id)
        .single()
      
      if (existingUser && !fetchError) {
        console.log('ensureUserRecord: Found user record after error:', existingUser)
        return existingUser
      }
      
      return null
    }

    console.log('ensureUserRecord: Successfully created user record:', newUser)
    return newUser
    
  } catch (error) {
    console.error('ensureUserRecord: Exception in ensureUserRecord:', error)
    console.error('ensureUserRecord: Exception error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack',
      userId: authUser.user.id,
      userEmail: authUser.user.email
    })
    return null
  }
} 