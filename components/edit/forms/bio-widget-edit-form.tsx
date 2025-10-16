'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bioSchema } from '@/lib/validations/profile';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { updateBio } from '@/app/actions/profile';
import { toast } from 'sonner';

type BioFormData = z.infer<typeof bioSchema>;

import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface BioWidgetEditFormProps {
  profile: Profile;
  onClose: () => void;
}

export function BioWidgetEditForm({ profile, onClose }: BioWidgetEditFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BioFormData>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      bio: profile.bio || '',
    },
  });

  const onSubmit = async (data: BioFormData) => {
    setLoading(true);
    try {
      const result = await updateBio(data.bio);
      
      if (result.success) {
        toast.success('Bio updated successfully!');
        onClose();
      } else {
        if (result.error) {
          Object.entries(result.error).forEach(([field, messages]) => {
            messages.forEach(msg => toast.error(`${field}: ${msg}`));
          });
        }
      }
    } catch {
      toast.error('Failed to update bio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Bio Text */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Tell people about yourself..."
                rows={5}
              />
              {errors.bio && (
                <p className="text-red-500 text-sm">{errors.bio.message}</p>
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