'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { updateLocation } from '@/app/actions/profile';
import { toast } from 'sonner';

const locationSchema = z.object({
  address: z.string().optional().or(z.literal('')),
  latitude: z.string().optional().or(z.literal('')),
  longitude: z.string().optional().or(z.literal('')),
});

type LocationFormData = z.infer<typeof locationSchema>;

import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MapWidgetEditFormProps {
  profile: Partial<Profile> & { id: string };
  onClose: () => void;
}

export function MapWidgetEditForm({ profile, onClose }: MapWidgetEditFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: profile.address || '',
      latitude: profile.latitude ? String(profile.latitude) : '',
      longitude: profile.longitude ? String(profile.longitude) : '',
    },
  });

  const onSubmit = async (data: LocationFormData) => {
    setLoading(true);
    try {
      // Convert string coordinates to numbers if they exist
      const locationData = {
        address: data.address || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
      };
      
      const result = await updateLocation(locationData);
      
      if (result.success) {
        toast.success('Location updated successfully!');
        onClose();
      } else {
        if (result.error) {
          Object.entries(result.error).forEach(([field, messages]) => {
            messages.forEach(msg => toast.error(`${field}: ${msg}`));
          });
        }
      }
    } catch {
      toast.error('Failed to update location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="123 Main St, City, Country"
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address.message}</p>
              )}
            </div>

            {/* Latitude */}
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register('latitude')}
                placeholder="40.7128"
              />
              {errors.latitude && (
                <p className="text-red-500 text-sm">{errors.latitude.message}</p>
              )}
            </div>

            {/* Longitude */}
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register('longitude')}
                placeholder="-74.0060"
              />
              {errors.longitude && (
                <p className="text-red-500 text-sm">{errors.longitude.message}</p>
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
