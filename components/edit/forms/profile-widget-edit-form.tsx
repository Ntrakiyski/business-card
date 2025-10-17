'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '@/lib/validations/profile';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { updateProfile } from '@/app/actions/profile';
import { toast } from 'sonner';

type ProfileFormData = z.infer<typeof profileSchema>;

import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileWidgetEditFormProps {
  profile: Partial<Profile> & { id: string };
  onClose: () => void;
}

export function ProfileWidgetEditForm({ profile, onClose }: ProfileWidgetEditFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile.display_name || '',
      job_title: profile.job_title || '',
      company: profile.company || '',
      location: profile.location || '',
      profile_image_url: profile.profile_image_url || '',
      bio: profile.bio || '',
    },
  });

  const profileImageUrl = watch('profile_image_url');

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const result = await updateProfile(data);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        onClose();
      } else {
        if (result.error) {
          Object.entries(result.error).forEach(([field, messages]) => {
            messages.forEach(msg => toast.error(`${field}: ${msg}`));
          });
        }
      }
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Profile Image URL */}
            <div className="space-y-2">
              <Label htmlFor="profile_image_url">Profile Image URL</Label>
              <Input
                id="profile_image_url"
                {...register('profile_image_url')}
                placeholder="https://example.com/image.jpg"
              />
              {errors.profile_image_url && (
                <p className="text-red-500 text-sm">{errors.profile_image_url.message}</p>
              )}
              
              {/* Preview */}
              {profileImageUrl ? (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={profileImageUrl}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                {...register('display_name')}
                placeholder="John Doe"
              />
              {errors.display_name && (
                <p className="text-red-500 text-sm">{errors.display_name.message}</p>
              )}
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                {...register('job_title')}
                placeholder="Software Engineer"
              />
              {errors.job_title && (
                <p className="text-red-500 text-sm">{errors.job_title.message}</p>
              )}
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="Acme Inc."
              />
              {errors.company && (
                <p className="text-red-500 text-sm">{errors.company.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="New York, NY"
              />
              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location.message}</p>
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
