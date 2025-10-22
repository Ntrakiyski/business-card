'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { setUsername } from '@/app/actions/profile'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [username, setUsernameValue] = useState('')
  
  // Get the base URL for preview
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await setUsername(formData)

      if (result && !result.success && result.error) {
        // Handle errors
        setLoading(false) // Reset loading state for errors
        if (typeof result.error === 'object' && 'username' in result.error) {
          const errors = result.error as { username?: string[] }
          if (errors.username) {
            errors.username.forEach(msg => toast.error(msg))
          }
        } else if (typeof result.error === 'object' && 'general' in result.error) {
          const errors = result.error as { general: string[] }
          errors.general.forEach(msg => toast.error(msg))
        } else {
          toast.error('Failed to set username. Please try again.')
        }
      } else if (result && result.success && result.redirectUrl) {
        // Keep loading state true during redirect
        // Handle successful redirect on the client side using window.location
        // This ensures a full page navigation which will trigger middleware checks
        window.location.href = result.redirectUrl;
      }
    } catch {
      setLoading(false) // Reset loading state for unexpected errors
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Choose Your Username</CardTitle>
          <CardDescription>
            This will be your unique identifier for your digital business card. Your card will be accessible at this URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                required
                disabled={loading}
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
                value={username}
                onChange={(e) => setUsernameValue(e.target.value.toLowerCase())}
              />
              {username && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                  <p className="text-sm font-medium text-blue-900">Your card URL:</p>
                  <p className="text-sm text-blue-700 break-all font-mono mt-1">
                    {baseUrl}/{username}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                3-20 characters. Letters, numbers, and underscores only.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Setting username...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
