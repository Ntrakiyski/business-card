'use client';

import { useState } from 'react';
import { completeOnboarding, checkUsernameAvailability } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{
    available: boolean;
    message: string;
  } | null>(null);
  
  const router = useRouter();
  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      setChecking(true);
      checkUsernameAvailability(debouncedUsername).then((result) => {
        setAvailability(result);
        setChecking(false);
      });
    } else {
      setAvailability(null);
    }
  }, [debouncedUsername]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await completeOnboarding(formData);
    setLoading(false);

    if (!result.success) {
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            toast.error(`${field}: ${messages[0]}`);
          }
        });
      } else {
        toast.error(result.message || 'Failed to complete setup');
      }
      return;
    }

    toast.success('Welcome to your digital business card!');
    router.push(`/${result.username}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Choose your username</CardTitle>
          <CardDescription>
            This will be your unique URL: yourapp.com/username
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johnsmith"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                disabled={loading}
                className="lowercase"
              />
              {checking && (
                <p className="text-sm text-muted-foreground">Checking availability...</p>
              )}
              {availability && !checking && (
                <p className={`text-sm ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
                  {availability.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                3-30 characters, letters, numbers, hyphens, and underscores only
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                placeholder="John Smith"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                This is how your name will appear on your card
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !availability?.available}
            >
              {loading ? 'Creating profile...' : 'Create my card'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

