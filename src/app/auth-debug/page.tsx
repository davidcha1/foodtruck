'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function AuthDebugPage() {
  const { user, loading } = useAuth()
  const [clientSession, setClientSession] = useState<any>(null)

  const checkClientSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      setClientSession({
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: error?.message,
        cookies: document.cookie,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setClientSession({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Auth State Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Auth Context (Client-side):</h3>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify({ user, loading }, null, 2)}
            </pre>
          </div>

          <div>
            <Button onClick={checkClientSession} className="w-full">
              Check Client Session
            </Button>
          </div>

          {clientSession && (
            <div>
              <h3 className="font-semibold mb-2">Client Session Details:</h3>
              <pre className="text-sm bg-blue-50 p-3 rounded overflow-auto">
                {JSON.stringify(clientSession, null, 2)}
              </pre>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Instructions:</strong> Check browser console for middleware logs when visiting protected routes.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
                Test Dashboard (Check Console)
              </Button>
              <Button onClick={() => window.location.href = '/profile'} className="w-full">
                Test Profile (Check Console)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 