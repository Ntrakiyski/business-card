'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Globe, Lock } from 'lucide-react';
import { toggleProfilePublic } from '@/app/actions/widgets';
import { toast } from 'sonner';

interface PublicToggleProps {
  profileId: string;
  isPublic: boolean;
}

export function PublicToggle({ profileId, isPublic }: PublicToggleProps) {
  const [isPublicState, setIsPublicState] = useState(isPublic);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const result = await toggleProfilePublic(profileId, checked);
      if (result.success) {
        setIsPublicState(checked);
        toast.success(
          checked
            ? 'Your card is now public and visible in the directory'
            : 'Your card is now private and hidden from the directory'
        );
      } else {
        toast.error(result.error || 'Failed to update card visibility');
      }
    } catch (error) {
      toast.error('Failed to update card visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isPublicState ? (
            <Globe className="h-5 w-5 text-green-600" />
          ) : (
            <Lock className="h-5 w-5 text-gray-600" />
          )}
          <div>
            <Label htmlFor="public-toggle" className="text-base font-medium cursor-pointer">
              {isPublicState ? 'Public Card' : 'Private Card'}
            </Label>
            <p className="text-sm text-gray-500">
              {isPublicState
                ? 'Visible in the public directory'
                : 'Only you can see this card'}
            </p>
          </div>
        </div>
        <Switch
          id="public-toggle"
          checked={isPublicState}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
        />
      </div>
    </Card>
  );
}
