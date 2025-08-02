import { supabase } from './supabase'
import { toast } from 'sonner'

// Mock Stripe configuration - replace with real Stripe when ready
const MOCK_STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_mock',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock'
}

// Payment status types
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled'
export type PaymentIntentStatus = 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded' | 'failed'

// Mock payment intent interface
export interface MockPaymentIntent {
  id: string
  amount: number
  currency: string
  status: PaymentIntentStatus
  client_secret: string
  created: number
  metadata: Record<string, string>
}

// Payment creation interface
export interface CreatePaymentData {
  bookingId: string
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, string>
}

// Payment confirmation interface
export interface ConfirmPaymentData {
  paymentIntentId: string
  paymentMethodId?: string
}

/**
 * Mock Stripe Payment Service
 * This simulates Stripe functionality for development
 * Replace with real Stripe SDK calls when ready
 */
class MockStripeService {
  private paymentIntents: Map<string, MockPaymentIntent> = new Map()

  // Create a payment intent (mock)
  async createPaymentIntent(data: CreatePaymentData): Promise<MockPaymentIntent> {
    const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const clientSecret = `pi_mock_${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`
    
    const paymentIntent: MockPaymentIntent = {
      id: paymentIntentId,
      amount: data.amount,
      currency: data.currency || 'usd',
      status: 'requires_payment_method',
      client_secret: clientSecret,
      created: Date.now(),
      metadata: {
        booking_id: data.bookingId,
        ...data.metadata
      }
    }

    this.paymentIntents.set(paymentIntentId, paymentIntent)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return paymentIntent
  }

  // Confirm a payment intent (mock)
  async confirmPaymentIntent(data: ConfirmPaymentData): Promise<MockPaymentIntent> {
    const paymentIntent = this.paymentIntents.get(data.paymentIntentId)
    
    if (!paymentIntent) {
      throw new Error('Payment intent not found')
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock successful payment (90% success rate for testing)
    const isSuccess = Math.random() > 0.1
    
    const updatedPaymentIntent: MockPaymentIntent = {
      ...paymentIntent,
      status: isSuccess ? 'succeeded' : 'failed'
    }

    this.paymentIntents.set(data.paymentIntentId, updatedPaymentIntent)
    
    return updatedPaymentIntent
  }

  // Get payment intent status
  async getPaymentIntent(paymentIntentId: string): Promise<MockPaymentIntent | null> {
    return this.paymentIntents.get(paymentIntentId) || null
  }

  // Create a refund (mock)
  async createRefund(paymentIntentId: string, amount?: number): Promise<any> {
    const paymentIntent = this.paymentIntents.get(paymentIntentId)
    
    if (!paymentIntent) {
      throw new Error('Payment intent not found')
    }

    const refundId = `re_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: refundId,
      amount: amount || paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'succeeded',
      payment_intent: paymentIntentId
    }
  }
}

// Initialize mock Stripe service
const mockStripeService = new MockStripeService()

/**
 * Payment Service - Main interface for payment operations
 * This abstracts the payment provider (mock or real Stripe)
 */
export class PaymentService {
  private stripe: MockStripeService

  constructor() {
    this.stripe = mockStripeService
  }

           // Create a payment intent for a booking
         async createPaymentIntent(bookingId: string, amount: number, description?: string): Promise<MockPaymentIntent> {
           try {
             const paymentIntent = await this.stripe.createPaymentIntent({
               bookingId,
               amount,
               currency: 'usd',
               description: description || `Booking payment for booking ${bookingId}`,
               metadata: {
                 booking_id: bookingId,
                 type: 'booking_payment'
               }
             })

             // Store payment intent in database (don't fail if this doesn't work)
             await this.storePaymentIntent(bookingId, paymentIntent)
             
             return paymentIntent
           } catch (error) {
             console.error('Error creating payment intent:', error)
             throw new Error('Failed to create payment intent')
           }
         }

  // Confirm a payment
  async confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<MockPaymentIntent> {
    try {
      const paymentIntent = await this.stripe.confirmPaymentIntent({
        paymentIntentId,
        paymentMethodId
      })

      // Update payment status in database
      await this.updatePaymentStatus(paymentIntentId, paymentIntent.status)
      
      return paymentIntent
    } catch (error) {
      console.error('Error confirming payment:', error)
      throw new Error('Failed to confirm payment')
    }
  }

  // Get payment intent status
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus> {
    try {
      const paymentIntent = await this.stripe.getPaymentIntent(paymentIntentId)
      
      if (!paymentIntent) {
        throw new Error('Payment intent not found')
      }

      return this.mapStripeStatusToPaymentStatus(paymentIntent.status)
    } catch (error) {
      console.error('Error getting payment status:', error)
      throw new Error('Failed to get payment status')
    }
  }

  // Create a refund
  async createRefund(paymentIntentId: string, amount?: number): Promise<any> {
    try {
      const refund = await this.stripe.createRefund(paymentIntentId, amount)
      
      // Update payment record with refund information
      await this.updatePaymentWithRefund(paymentIntentId, refund)
      
      return refund
    } catch (error) {
      console.error('Error creating refund:', error)
      throw new Error('Failed to create refund')
    }
  }

           // Store payment intent in database
         private async storePaymentIntent(bookingId: string, paymentIntent: MockPaymentIntent) {
           try {
             // First check if the booking exists
             const { data: booking, error: bookingError } = await supabase
               .from('bookings')
               .select('id')
               .eq('id', bookingId)
               .single()

             if (bookingError || !booking) {
               console.warn(`Booking ${bookingId} not found in database, skipping payment storage for mock payment`)
               return
             }

             const { error } = await supabase
               .from('payments')
               .insert({
                 booking_id: bookingId,
                 stripe_payment_intent_id: paymentIntent.id,
                 amount: paymentIntent.amount / 100, // Convert from cents
                 platform_fee: (paymentIntent.amount * 0.1) / 100, // 10% platform fee
                 vendor_payout: (paymentIntent.amount * 0.9) / 100, // 90% to vendor
                 payment_status: this.mapStripeStatusToPaymentStatus(paymentIntent.status),
                 payout_status: 'pending'
               })

             if (error) {
               console.error('Error storing payment intent:', error)
               console.error('Error details:', {
                 code: error.code,
                 message: error.message,
                 details: error.details,
                 hint: error.hint
               })
               // Don't throw error, just log it for development
               console.warn('Payment intent storage failed, but continuing with mock payment...')
             } else {
               console.log(`Payment intent ${paymentIntent.id} stored successfully for booking ${bookingId}`)
             }
           } catch (error) {
             console.error('Exception storing payment intent:', error)
             console.warn('Payment intent storage failed, but continuing with mock payment...')
           }
         }

           // Update payment status in database
         private async updatePaymentStatus(paymentIntentId: string, stripeStatus: PaymentIntentStatus) {
           const paymentStatus = this.mapStripeStatusToPaymentStatus(stripeStatus)
           
           try {
             // First, get the booking ID from the payment record
             const { data: paymentData, error: fetchError } = await supabase
               .from('payments')
               .select('booking_id')
               .eq('stripe_payment_intent_id', paymentIntentId)
               .single()

             if (fetchError) {
               console.error('Error fetching payment record:', fetchError)
               console.warn('Could not update booking status, but continuing...')
               return
             }

             // Update payment status
             const { error: paymentError } = await supabase
               .from('payments')
               .update({
                 payment_status: paymentStatus,
                 updated_at: new Date().toISOString()
               })
               .eq('stripe_payment_intent_id', paymentIntentId)

             if (paymentError) {
               console.error('Error updating payment status:', paymentError)
               console.warn('Payment status update failed, but continuing...')
             }

             // Update booking status based on payment status
             let bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' = 'pending'
             let bookingPaymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending'
             
             if (paymentStatus === 'succeeded') {
               bookingStatus = 'confirmed'
               bookingPaymentStatus = 'paid'
             } else if (paymentStatus === 'failed') {
               bookingStatus = 'pending'
               bookingPaymentStatus = 'failed'
             }

             // Update booking status and payment status
             const { error: bookingError } = await supabase
               .from('bookings')
               .update({
                 status: bookingStatus,
                 payment_status: bookingPaymentStatus,
                 stripe_payment_intent_id: paymentIntentId,
                 updated_at: new Date().toISOString()
               })
               .eq('id', paymentData.booking_id)

             if (bookingError) {
               console.error('Error updating booking status:', bookingError)
               console.warn('Booking status update failed, but continuing...')
             } else {
               console.log(`Booking ${paymentData.booking_id} updated to status: ${bookingStatus}, payment_status: ${bookingPaymentStatus}`)
             }
           } catch (error) {
             console.error('Exception updating payment status:', error)
             console.warn('Payment status update failed, but continuing...')
           }
         }

           // Update payment with refund information
         private async updatePaymentWithRefund(paymentIntentId: string, refund: any) {
           try {
             const { error } = await supabase
               .from('payments')
               .update({
                 stripe_refund_id: refund.id,
                 payout_status: 'paid', // Refunded
                 updated_at: new Date().toISOString()
               })
               .eq('stripe_payment_intent_id', paymentIntentId)

             if (error) {
               console.error('Error updating payment with refund:', error)
               console.warn('Payment refund update failed, but continuing...')
             }
           } catch (error) {
             console.error('Exception updating payment with refund:', error)
             console.warn('Payment refund update failed, but continuing...')
           }
         }

  // Map Stripe status to our payment status
  private mapStripeStatusToPaymentStatus(stripeStatus: PaymentIntentStatus): PaymentStatus {
    switch (stripeStatus) {
      case 'succeeded':
        return 'succeeded'
      case 'canceled':
        return 'cancelled'
      case 'failed':
        return 'failed'
      default:
        return 'pending'
    }
  }
}

// Export payment service instance
export const paymentService = new PaymentService()

/**
 * Payment utility functions for components
 */

// Create payment intent for a booking
export const createBookingPayment = async (bookingId: string, amount: number, description?: string) => {
  try {
    const paymentIntent = await paymentService.createPaymentIntent(bookingId, amount, description)
    return paymentIntent
  } catch (error) {
    console.error('Error creating booking payment:', error)
    throw error
  }
}

// Confirm a booking payment
export const confirmBookingPayment = async (paymentIntentId: string, paymentMethodId?: string) => {
  try {
    const paymentIntent = await paymentService.confirmPayment(paymentIntentId, paymentMethodId)
    return paymentIntent
  } catch (error) {
    console.error('Error confirming booking payment:', error)
    throw error
  }
}

// Get payment status
export const getPaymentStatus = async (paymentIntentId: string) => {
  try {
    return await paymentService.getPaymentStatus(paymentIntentId)
  } catch (error) {
    console.error('Error getting payment status:', error)
    throw error
  }
}

// Create refund
export const createPaymentRefund = async (paymentIntentId: string, amount?: number) => {
  try {
    return await paymentService.createRefund(paymentIntentId, amount)
  } catch (error) {
    console.error('Error creating refund:', error)
    throw error
  }
}

/**
 * Stripe Connect functionality for venue owners
 * (Mock implementation - replace with real Stripe Connect when ready)
 */

export interface StripeConnectAccount {
  id: string
  business_type: string
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  country: string
  email: string
}

// Mock Stripe Connect service
export class MockStripeConnectService {
  private accounts: Map<string, StripeConnectAccount> = new Map()

  // Create a Connect account for venue owner
  async createConnectAccount(userId: string, email: string, country: string = 'US'): Promise<StripeConnectAccount> {
    const accountId = `acct_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const account: StripeConnectAccount = {
      id: accountId,
      business_type: 'individual',
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
      country,
      email
    }

    this.accounts.set(accountId, account)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return account
  }

  // Get Connect account
  async getConnectAccount(accountId: string): Promise<StripeConnectAccount | null> {
    return this.accounts.get(accountId) || null
  }

  // Create account link for onboarding
  async createAccountLink(accountId: string, returnUrl: string, refreshUrl: string): Promise<string> {
    // Mock account link - in real implementation, this would be a Stripe hosted page
    return `${returnUrl}?account_id=${accountId}&mock=true`
  }
}

export const mockStripeConnectService = new MockStripeConnectService()

// Initialize venue owner's Stripe Connect account
export const initializeVenueOwnerAccount = async (userId: string, email: string) => {
  try {
    const account = await mockStripeConnectService.createConnectAccount(userId, email)
    
    // Update user record with Stripe Connect ID
    const { error } = await supabase
      .from('users')
      .update({
        stripe_connect_id: account.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user with Stripe Connect ID:', error)
      throw new Error('Failed to update user with Stripe Connect ID')
    }

    return account
  } catch (error) {
    console.error('Error initializing venue owner account:', error)
    throw error
  }
}

// Get venue owner's Stripe Connect account
export const getVenueOwnerAccount = async (userId: string) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('stripe_connect_id')
      .eq('id', userId)
      .single()

    if (!user?.stripe_connect_id) {
      return null
    }

    return await mockStripeConnectService.getConnectAccount(user.stripe_connect_id)
  } catch (error) {
    console.error('Error getting venue owner account:', error)
    throw error
  }
} 