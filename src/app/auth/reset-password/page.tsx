import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-off-white to-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-bebas text-4xl font-bold text-charcoal mb-2">
            Reset Password
          </h1>
          <p className="text-muted-text text-lg">
            Create a new password for your account
          </p>
        </div>
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warm-red"></div>
            <span className="ml-2">Loading...</span>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
} 