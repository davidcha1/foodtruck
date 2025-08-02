'use client'

import { useState } from 'react'
import { PaymentForm } from '@/components/booking/PaymentForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { MockPaymentIntent } from '@/lib/payments'

export default function TestPaymentPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [testResults, setTestResults] = useState<{
    successful: number
    failed: number
    total: number
  }>({ successful: 0, failed: 0, total: 0 })

  const handlePaymentSuccess = (paymentIntent: MockPaymentIntent) => {
    setTestResults(prev => ({
      ...prev,
      successful: prev.successful + 1,
      total: prev.total + 1
    }))
    toast.success(`Payment successful! ID: ${paymentIntent.id}`)
    setShowPaymentForm(false)
  }

  const handlePaymentError = (error: Error) => {
    setTestResults(prev => ({
      ...prev,
      failed: prev.failed + 1,
      total: prev.total + 1
    }))
    toast.error(`Payment failed: ${error.message}`)
    setShowPaymentForm(false)
  }

  const handlePaymentCancel = () => {
    toast.info('Payment cancelled')
    setShowPaymentForm(false)
  }

  const resetTestResults = () => {
    setTestResults({ successful: 0, failed: 0, total: 0 })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payment System Test</h1>
          <p className="text-gray-600">Test the mock payment system with different scenarios</p>
        </div>

        {/* Test Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
            <CardDescription>
              Use these mock card numbers to test different payment scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-green-600 mb-2">✅ Successful Payment</h3>
                <p className="text-sm text-gray-600 mb-2">Card: 4242 4242 4242 4242</p>
                <p className="text-sm text-gray-600">Should always succeed</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-red-600 mb-2">❌ Failed Payment</h3>
                <p className="text-sm text-gray-600 mb-2">Card: 4000 0000 0000 0002</p>
                <p className="text-sm text-gray-600">Should always fail</p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-yellow-600 mb-2">🎲 Random Success/Failure</h3>
              <p className="text-sm text-gray-600 mb-2">Any other card number</p>
              <p className="text-sm text-gray-600">90% success rate for testing</p>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Track your payment test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.successful}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testResults.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testResults.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
            {testResults.total > 0 && (
              <div className="mt-4 text-center">
                <Badge variant="outline">
                  Success Rate: {((testResults.successful / testResults.total) * 100).toFixed(1)}%
                </Badge>
              </div>
            )}
            <div className="mt-4 flex justify-center">
              <Button onClick={resetTestResults} variant="outline">
                Reset Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        {showPaymentForm ? (
          <div className="max-w-2xl mx-auto">
            <PaymentForm
              bookingId="test-booking-123"
              amount={150.00}
              description="Test booking for payment system"
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <h2 className="text-xl font-semibold mb-4">Ready to Test Payments?</h2>
              <p className="text-gray-600 mb-6 text-center">
                Click the button below to start testing the payment form with different card numbers.
              </p>
              <Button onClick={() => setShowPaymentForm(true)} size="lg">
                Start Payment Test
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Console Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>
              Check the browser console for detailed logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• <strong>Payment Intent Creation:</strong> Look for "Creating payment intent" logs</p>
              <p>• <strong>Payment Processing:</strong> Look for "Processing payment" logs</p>
              <p>• <strong>Email Notifications:</strong> Look for "📧 Mock Email Sent" logs</p>
              <p>• <strong>Database Updates:</strong> Look for payment status updates</p>
            </div>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-xs font-mono">
                Press F12 → Console tab to view logs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 