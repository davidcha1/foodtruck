import { supabase } from './supabase'

// Email notification types
export type NotificationType = 
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'payment_received'
  | 'payment_failed'
  | 'venue_owner_notification'
  | 'vendor_notification'

// Email template interface
export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Notification data interface
export interface NotificationData {
  to: string
  type: NotificationType
  data: Record<string, any>
  userId?: string
}

/**
 * Mock Email Service
 * This simulates email functionality for development
 * Replace with real email service (SendGrid, AWS SES, etc.) when ready
 */
class MockEmailService {
  private sentEmails: Array<{
    to: string
    subject: string
    html: string
    text: string
    timestamp: Date
  }> = []

  // Send email (mock)
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Store email for debugging
    this.sentEmails.push({
      to,
      subject,
      html,
      text,
      timestamp: new Date()
    })

    // Log email for development
    console.log('📧 Mock Email Sent:', {
      to,
      subject,
      timestamp: new Date().toISOString()
    })

    // Simulate 95% success rate
    return Math.random() > 0.05
  }

  // Get sent emails (for debugging)
  getSentEmails() {
    return this.sentEmails
  }

  // Clear sent emails (for testing)
  clearSentEmails() {
    this.sentEmails = []
  }
}

// Initialize mock email service
const mockEmailService = new MockEmailService()

/**
 * Email Templates
 */
const emailTemplates: Record<NotificationType, (data: Record<string, any>) => EmailTemplate> = {
  booking_created: (data) => ({
    subject: `Booking Request: ${data.venueName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Booking Request</h2>
        <p>Hello ${data.vendorName},</p>
        <p>Your booking request has been submitted successfully!</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Venue:</strong> ${data.venueName}</p>
          <p><strong>Date:</strong> ${data.bookingDate}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>Duration:</strong> ${data.totalHours} hours</p>
          <p><strong>Total Cost:</strong> $${data.totalCost}</p>
        </div>
        <p>You'll receive another email once the venue owner confirms your booking.</p>
        <p>Best regards,<br>FoodTruck Hub Team</p>
      </div>
    `,
    text: `
      New Booking Request
      
      Hello ${data.vendorName},
      
      Your booking request has been submitted successfully!
      
      Booking Details:
      - Venue: ${data.venueName}
      - Date: ${data.bookingDate}
      - Time: ${data.startTime} - ${data.endTime}
      - Duration: ${data.totalHours} hours
      - Total Cost: $${data.totalCost}
      
      You'll receive another email once the venue owner confirms your booking.
      
      Best regards,
      FoodTruck Hub Team
    `
  }),

  booking_confirmed: (data) => ({
    subject: `Booking Confirmed: ${data.venueName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Booking Confirmed!</h2>
        <p>Hello ${data.vendorName},</p>
        <p>Great news! Your booking has been confirmed by the venue owner.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Confirmed Booking:</h3>
          <p><strong>Venue:</strong> ${data.venueName}</p>
          <p><strong>Date:</strong> ${data.bookingDate}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>Duration:</strong> ${data.totalHours} hours</p>
          <p><strong>Total Cost:</strong> $${data.totalCost}</p>
        </div>
        <p>Please arrive 15 minutes before your scheduled time to set up.</p>
        <p>Best regards,<br>FoodTruck Hub Team</p>
      </div>
    `,
    text: `
      Booking Confirmed!
      
      Hello ${data.vendorName},
      
      Great news! Your booking has been confirmed by the venue owner.
      
      Confirmed Booking:
      - Venue: ${data.venueName}
      - Date: ${data.bookingDate}
      - Time: ${data.startTime} - ${data.endTime}
      - Duration: ${data.totalHours} hours
      - Total Cost: $${data.totalCost}
      
      Please arrive 15 minutes before your scheduled time to set up.
      
      Best regards,
      FoodTruck Hub Team
    `
  }),

  booking_cancelled: (data) => ({
    subject: `Booking Cancelled: ${data.venueName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Booking Cancelled</h2>
        <p>Hello ${data.vendorName},</p>
        <p>Your booking has been cancelled.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Cancelled Booking:</h3>
          <p><strong>Venue:</strong> ${data.venueName}</p>
          <p><strong>Date:</strong> ${data.bookingDate}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>Reason:</strong> ${data.cancellationReason || 'No reason provided'}</p>
        </div>
        <p>If you have any questions, please contact support.</p>
        <p>Best regards,<br>FoodTruck Hub Team</p>
      </div>
    `,
    text: `
      Booking Cancelled
      
      Hello ${data.vendorName},
      
      Your booking has been cancelled.
      
      Cancelled Booking:
      - Venue: ${data.venueName}
      - Date: ${data.bookingDate}
      - Time: ${data.startTime} - ${data.endTime}
      - Reason: ${data.cancellationReason || 'No reason provided'}
      
      If you have any questions, please contact support.
      
      Best regards,
      FoodTruck Hub Team
    `
  }),

  payment_received: (data) => ({
    subject: `Payment Received: ${data.venueName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Payment Successful!</h2>
        <p>Hello ${data.vendorName},</p>
        <p>Your payment has been processed successfully.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <p><strong>Venue:</strong> ${data.venueName}</p>
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>Payment ID:</strong> ${data.paymentId}</p>
          <p><strong>Date:</strong> ${data.paymentDate}</p>
        </div>
        <p>Your booking is now confirmed and paid for.</p>
        <p>Best regards,<br>FoodTruck Hub Team</p>
      </div>
    `,
    text: `
      Payment Successful!
      
      Hello ${data.vendorName},
      
      Your payment has been processed successfully.
      
      Payment Details:
      - Venue: ${data.venueName}
      - Amount: $${data.amount}
      - Payment ID: ${data.paymentId}
      - Date: ${data.paymentDate}
      
      Your booking is now confirmed and paid for.
      
      Best regards,
      FoodTruck Hub Team
    `
  }),

  payment_failed: (data) => ({
    subject: `Payment Failed: ${data.venueName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Payment Failed</h2>
        <p>Hello ${data.vendorName},</p>
        <p>There was an issue processing your payment.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <p><strong>Venue:</strong> ${data.venueName}</p>
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>Error:</strong> ${data.errorMessage}</p>
        </div>
        <p>Please try again or contact support if the issue persists.</p>
        <p>Best regards,<br>FoodTruck Hub Team</p>
      </div>
    `,
    text: `
      Payment Failed
      
      Hello ${data.vendorName},
      
      There was an issue processing your payment.
      
      Payment Details:
      - Venue: ${data.venueName}
      - Amount: $${data.amount}
      - Error: ${data.errorMessage}
      
      Please try again or contact support if the issue persists.
      
      Best regards,
      FoodTruck Hub Team
    `
  }),

  venue_owner_notification: (data) => ({
    subject: `New Booking Request: ${data.venueName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Booking Request</h2>
        <p>Hello ${data.venueOwnerName},</p>
        <p>You have received a new booking request for your venue.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Vendor:</strong> ${data.vendorName}</p>
          <p><strong>Date:</strong> ${data.bookingDate}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>Duration:</strong> ${data.totalHours} hours</p>
          <p><strong>Total Revenue:</strong> $${data.totalRevenue}</p>
          ${data.specialRequests ? `<p><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ''}
        </div>
        <p>Please log in to your dashboard to review and respond to this request.</p>
        <p>Best regards,<br>FoodTruck Hub Team</p>
      </div>
    `,
    text: `
      New Booking Request
      
      Hello ${data.venueOwnerName},
      
      You have received a new booking request for your venue.
      
      Booking Details:
      - Vendor: ${data.vendorName}
      - Date: ${data.bookingDate}
      - Time: ${data.startTime} - ${data.endTime}
      - Duration: ${data.totalHours} hours
      - Total Revenue: $${data.totalRevenue}
      ${data.specialRequests ? `- Special Requests: ${data.specialRequests}` : ''}
      
      Please log in to your dashboard to review and respond to this request.
      
      Best regards,
      FoodTruck Hub Team
    `
  }),

  vendor_notification: (data) => ({
    subject: `Booking Update: ${data.venueName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Booking Update</h2>
        <p>Hello ${data.vendorName},</p>
        <p>${data.message}</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Venue:</strong> ${data.venueName}</p>
          <p><strong>Date:</strong> ${data.bookingDate}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>Status:</strong> ${data.status}</p>
        </div>
        <p>Best regards,<br>FoodTruck Hub Team</p>
      </div>
    `,
    text: `
      Booking Update
      
      Hello ${data.vendorName},
      
      ${data.message}
      
      Booking Details:
      - Venue: ${data.venueName}
      - Date: ${data.bookingDate}
      - Time: ${data.startTime} - ${data.endTime}
      - Status: ${data.status}
      
      Best regards,
      FoodTruck Hub Team
    `
  })
}

/**
 * Notification Service
 */
export class NotificationService {
  private emailService = mockEmailService

  // Send notification
  async sendNotification(notification: NotificationData): Promise<boolean> {
    try {
      const template = emailTemplates[notification.type](notification.data)
      
      const success = await this.emailService.sendEmail(
        notification.to,
        template.subject,
        template.html,
        template.text
      )

      // Log notification for debugging (in production, you'd store this in a database)
      if (success) {
        console.log('📧 Notification sent successfully:', {
          type: notification.type,
          to: notification.to,
          timestamp: new Date().toISOString()
        })
      }

      return success
    } catch (error) {
      console.error('Error sending notification:', error)
      return false
    }
  }

  // Get sent emails (for debugging)
  getSentEmails() {
    return this.emailService.getSentEmails()
  }

  // Clear sent emails (for testing)
  clearSentEmails() {
    this.emailService.clearSentEmails()
  }
}

// Export notification service instance
export const notificationService = new NotificationService()

/**
 * Convenience functions for common notifications
 */

// Send booking created notification
export const sendBookingCreatedNotification = async (
  vendorEmail: string,
  vendorName: string,
  venueName: string,
  bookingData: any
) => {
  return await notificationService.sendNotification({
    to: vendorEmail,
    type: 'booking_created',
    data: {
      vendorName,
      venueName,
      bookingDate: bookingData.booking_date,
      startTime: bookingData.start_time,
      endTime: bookingData.end_time,
      totalHours: bookingData.total_hours,
      totalCost: bookingData.total_cost
    }
  })
}

// Send booking confirmed notification
export const sendBookingConfirmedNotification = async (
  vendorEmail: string,
  vendorName: string,
  venueName: string,
  bookingData: any
) => {
  return await notificationService.sendNotification({
    to: vendorEmail,
    type: 'booking_confirmed',
    data: {
      vendorName,
      venueName,
      bookingDate: bookingData.booking_date,
      startTime: bookingData.start_time,
      endTime: bookingData.end_time,
      totalHours: bookingData.total_hours,
      totalCost: bookingData.total_cost
    }
  })
}

// Send venue owner notification
export const sendVenueOwnerNotification = async (
  venueOwnerEmail: string,
  venueOwnerName: string,
  vendorName: string,
  venueName: string,
  bookingData: any
) => {
  return await notificationService.sendNotification({
    to: venueOwnerEmail,
    type: 'venue_owner_notification',
    data: {
      venueOwnerName,
      vendorName,
      venueName,
      bookingDate: bookingData.booking_date,
      startTime: bookingData.start_time,
      endTime: bookingData.end_time,
      totalHours: bookingData.total_hours,
      totalRevenue: bookingData.total_cost,
      specialRequests: bookingData.special_requests
    }
  })
}

// Send payment received notification
export const sendPaymentReceivedNotification = async (
  vendorEmail: string,
  vendorName: string,
  venueName: string,
  paymentData: any
) => {
  return await notificationService.sendNotification({
    to: vendorEmail,
    type: 'payment_received',
    data: {
      vendorName,
      venueName,
      amount: paymentData.amount,
      paymentId: paymentData.payment_intent_id,
      paymentDate: new Date().toISOString()
    }
  })
} 