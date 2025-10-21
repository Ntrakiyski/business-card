'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditPreviewToggleProps {
  onModeChange?: (isEditMode: boolean) => void;
  className?: string;
}

export function EditPreviewToggle({ onModeChange, className }: EditPreviewToggleProps) {
  const [isEditMode, setIsEditMode] = useState(true);

  const handleToggle = () => {
    const newMode = !isEditMode;
    setIsEditMode(newMode);
    onModeChange?.(newMode);
  };

  return (
    <div className={cn("fixed top-4 right-4 z-30", className)}>
      <Button
        onClick={handleToggle}
        size="lg"
        className={cn(
          "gap-2 shadow-lg transition-all",
          isEditMode
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-green-600 hover:bg-green-700"
        )}
      >
        {isEditMode ? (
          <>
            <Edit3 className="h-5 w-5" />
            Edit Mode
          </>
        ) : (
          <>
            <Eye className="h-5 w-5" />
            Preview Mode
          </>
        )}
      </Button>
    </div>
  );
}

