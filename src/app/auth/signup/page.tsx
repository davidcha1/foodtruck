import { SignUpForm } from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-off-white to-gray-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-bebas text-4xl font-bold text-charcoal mb-2">
            Join FoodTruck Hub
          </h1>
          <p className="text-muted-text text-lg">
            Connect with the UK's leading food truck marketplace
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
} 