'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardOwnerRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main dashboard
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    </div>
  )
} 