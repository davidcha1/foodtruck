'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Shield,
  Lock,
  DollarSign
} from 'lucide-react'
import { 
  createBookingPayment, 
  confirmBookingPayment, 
  getPaymentStatus,
  MockPaymentIntent 
} from '@/lib/payments'

interface PaymentFormProps {
  bookingId: string
  amount: number
  description?: string
  onPaymentSuccess: (paymentIntent: MockPaymentIntent) => void
  onPaymentError: (error: Error) => void
  onCancel: () => void
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  description,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}) => {
  const [paymentIntent, setPaymentIntent] = useState<MockPaymentIntent | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')

  // Initialize payment intent when component mounts
  useEffect(() => {
    initializePayment()
  }, [])

  const initializePayment = async () => {
    setLoading(true)
    try {
      const intent = await createBookingPayment(bookingId, amount * 100, description) // Convert to cents
      setPaymentIntent(intent)
      toast.success('Payment form ready')
    } catch (error) {
      console.error('Error initializing payment:', error)
      toast.error('Failed to initialize payment')
      onPaymentError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentIntent) {
      toast.error('Payment not initialized')
      return
    }

    // Validate form
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      toast.error('Please fill in all payment details')
      return
    }

    setLoading(true)
    setPaymentStatus('processing')

    try {
      // Simulate payment processing with mock data
      const confirmedPayment = await confirmBookingPayment(paymentIntent.id)
      
      if (confirmedPayment.status === 'succeeded') {
        setPaymentStatus('success')
        toast.success('Payment successful!')
        onPaymentSuccess(confirmedPayment)
      } else {
        setPaymentStatus('failed')
        toast.error('Payment failed. Please try again.')
        onPaymentError(new Error('Payment failed'))
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      setPaymentStatus('failed')
      toast.error('Payment failed. Please try again.')
      onPaymentError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  if (loading && !paymentIntent) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          <span className="ml-2">Initializing payment...</span>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Payment ID: {paymentIntent?.id}
            </p>
            <p className="text-sm text-gray-600">
              Amount: ${amount.toFixed(2)}
            </p>
          </div>
          <Button 
            onClick={() => onPaymentSuccess(paymentIntent!)}
            className="w-full"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'failed') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            There was an issue processing your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => {
              setPaymentStatus('pending')
              setCardNumber('')
              setExpiryDate('')
              setCvv('')
              setCardholderName('')
            }}
            className="w-full"
          >
            Try Again
          </Button>
          <Button 
            onClick={onCancel}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Payment Details</span>
        </CardTitle>
        <CardDescription>
          Complete your booking with secure payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Booking Amount:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Platform Fee (10%):</span>
            <span>${(amount * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-2">
            <span>Total:</span>
            <span>${(amount * 1.1).toFixed(2)}</span>
          </div>
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your payment information is secure and encrypted. We use industry-standard security measures.
          </AlertDescription>
        </Alert>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardholder">Cardholder Name</Label>
            <Input
              id="cardholder"
              type="text"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                maxLength={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                maxLength={4}
                required
              />
            </div>
          </div>

          {/* Mock Payment Notice */}
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <strong>Development Mode:</strong> This is a mock payment system for testing. 
              No real charges will be made. In production, this will use real Stripe payments.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay ${(amount * 1.1).toFixed(2)}
                </>
              )}
            </Button>
            
            <Button 
              type="button"
              variant="outline" 
              className="w-full"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 