'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react';
import { WidgetEditDrawer } from '@/components/edit/widget-edit-drawer';

import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface BioWidgetProps {
  bio?: string;
  editable?: boolean;
  profile?: Profile;
}

export function BioWidget({ bio, editable = false, profile }: BioWidgetProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  if (!bio && !editable) return null;

  return (
    <>
      <Card className="w-full p-6 relative">
        {editable && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8"
            onClick={() => setIsEditDrawerOpen(true)}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
        
        <div className="pt-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Bio</h2>
          {bio ? (
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {bio}
            </p>
          ) : (
            <p className="text-gray-500 italic">
              No bio added yet. Click the edit button to add one.
            </p>
          )}
        </div>
      </Card>
      
      {editable && profile && (
        <WidgetEditDrawer
          widgetType="bio"
          profile={profile}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}
    </>
  );
}

