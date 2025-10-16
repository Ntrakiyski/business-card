'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { updateContact } from '@/app/actions/profile';
import { toast } from 'sonner';

const contactSchema = z.object({
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

type ContactFormData = z.infer<typeof contactSchema>;

import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ContactWidgetEditFormProps {
  profile: Profile;
  onClose: () => void;
}

export function ContactWidgetEditForm({ profile, onClose }: ContactWidgetEditFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: profile.phone || '',
      email: profile.email || '',
      website: profile.website || '',
      address: profile.address || '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      const result = await updateContact(data);
      
      if (result.success) {
        toast.success('Contact information updated successfully!');
        onClose();
      } else {
        if (result.error) {
          Object.entries(result.error).forEach(([field, messages]) => {
            messages.forEach(msg => toast.error(`${field}: ${msg}`));
          });
        }
      }
    } catch {
      toast.error('Failed to update contact information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register('email')}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="text-red-500 text-sm">{errors.website.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="123 Main St, City, Country"
                rows={2}
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}