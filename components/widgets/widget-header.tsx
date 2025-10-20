'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit3, Eye, EyeOff } from 'lucide-react';
import { toggleWidgetVisibility } from '@/app/actions/widgets';
import { toast } from 'sonner';

interface WidgetHeaderProps {
  profileId: string;
  widgetType: string;
  enabled: boolean;
  onEdit: () => void;
}

export function WidgetHeader({ profileId, widgetType, enabled, onEdit }: WidgetHeaderProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleVisibility = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const result = await toggleWidgetVisibility(profileId, widgetType, checked);
      if (result.success) {
        setIsEnabled(checked);
        toast.success(checked ? 'Widget enabled' : 'Widget disabled');
      } else {
        toast.error(result.error || 'Failed to update widget visibility');
      }
    } catch (error) {
      toast.error('Failed to update widget visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <div className="flex items-center gap-2 bg-white rounded-lg border px-2 py-1">
        {isEnabled ? (
          <Eye className="h-4 w-4 text-gray-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggleVisibility}
          disabled={isUpdating}
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onEdit}
      >
        <Edit3 className="h-4 w-4" />
      </Button>
    </div>
  );
}

