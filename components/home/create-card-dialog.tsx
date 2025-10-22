'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { createCard } from '@/app/actions/cards';
import { toast } from 'sonner';

const quickCardSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens'),
  card_name: z
    .string()
    .min(1, 'Card name is required')
    .max(100, 'Card name must be at most 100 characters'),
  display_name: z.string().optional(),
});

type QuickCardFormData = z.infer<typeof quickCardSchema>;

export function CreateCardDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickCardFormData>({
    resolver: zodResolver(quickCardSchema),
  });

  const onSubmit = async (data: QuickCardFormData) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', data.username.toLowerCase());
      formData.append('card_name', data.card_name);
      formData.append('display_name', data.display_name || '');
      formData.append('is_public', 'true');
      formData.append('is_primary', 'false');
      
      // Add default enabled widgets
      formData.append('enabledWidgets', JSON.stringify({
        profile: true,
        bio: true,
        links: true,
        social: true,
        services: true,
        contact: true,
        map: true,
      }));

      const result = await createCard(formData);

      if (result.success) {
        toast.success('Card created successfully!');
        setOpen(false);
        reset();
        router.refresh();
        // Navigate to the new card in edit mode
        router.push(`/${data.username}?edit=true`);
      } else {
        if (result.errors) {
          // Handle field-specific errors
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              toast.error(`${field}: ${messages[0]}`);
            }
          });
        } else {
          toast.error(result.error || 'Failed to create card');
        }
      }
    } catch (error) {
      console.error('Create card error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create New Card
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Create New Business Card</DrawerTitle>
            <DrawerDescription>
              Create a new digital business card with a unique username. You can customize it fully after creation.
            </DrawerDescription>
          </DrawerHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              placeholder="e.g., john-smith"
              {...register('username')}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Your card will be accessible at: yoursite.com/<strong>{'{username}'}</strong>
            </p>
          </div>

          {/* Card Name Field */}
          <div className="space-y-2">
            <Label htmlFor="card_name">
              Card Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="card_name"
              placeholder="e.g., Personal Card, Work Card"
              {...register('card_name')}
              disabled={isLoading}
            />
            {errors.card_name && (
              <p className="text-sm text-red-600">{errors.card_name.message}</p>
            )}
            <p className="text-xs text-gray-500">
              A descriptive name to identify this card in your dashboard
            </p>
          </div>

          {/* Display Name Field */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name (Optional)</Label>
            <Input
              id="display_name"
              placeholder="e.g., John Smith"
              {...register('display_name')}
              disabled={isLoading}
            />
            {errors.display_name && (
              <p className="text-sm text-red-600">{errors.display_name.message}</p>
            )}
            <p className="text-xs text-gray-500">
              The name that will appear on your card
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Card'}
            </Button>
          </div>
        </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
