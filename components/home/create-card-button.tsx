'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { setUsername } from '@/app/actions/profile';
import { toast } from 'sonner';

export function CreateCardButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsernameValue] = useState('');
  
  // Get the base URL for preview
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await setUsername(formData);

    if (result.success && result.redirectUrl) {
      toast.success('Username created successfully!');
      setOpen(false);
      router.push(result.redirectUrl);
      router.refresh();
    } else {
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            toast.error(`${field}: ${messages[0]}`);
          }
        });
      } else {
        toast.error(result.error || 'Failed to create username');
      }
    }

    setLoading(false);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create New Card
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-2xl">Choose Your Username</DrawerTitle>
            <DrawerDescription>
              This will be your unique identifier for your digital business card. Your card will be accessible at this URL.
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !username}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Continue'}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
