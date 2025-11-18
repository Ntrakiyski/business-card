'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Pencil } from 'lucide-react';
import { updateProfile } from '@/app/actions/profile';
import { toast } from 'sonner';

interface BioWidgetProps {
  bio: string;
  profileId: string;
  isOwner: boolean;
}

export function BioWidget({ bio, profileId, isOwner }: BioWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedBio, setEditedBio] = useState(bio);
  const [isPending, startTransition] = useTransition();

  if (!bio && !isOwner) return null;

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfile(profileId, { bio: editedBio });
      
      if (result.success) {
        toast.success('Bio updated successfully!');
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to update bio');
      }
    });
  };

  return (
    <>
      <Card className="w-full p-6 relative">
        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => setIsOpen(true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}
        
        <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {bio || 'No bio yet'}
        </p>
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Edit Bio</SheetTitle>
          </SheetHeader>
          
          <div className="py-4">
            <Textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              placeholder="Tell people about yourself..."
              className="min-h-[200px]"
            />
          </div>

          <SheetFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditedBio(bio);
                setIsOpen(false);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

