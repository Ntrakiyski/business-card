'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { WidgetEditDrawer } from '@/components/edit/widget-edit-drawer';
import { WidgetHeader } from './widget-header';

import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type WidgetSettings = Database['public']['Tables']['widget_settings']['Row'];

interface BioWidgetProps {
  bio?: string;
  editable?: boolean;
  profile?: Profile;
  widgetSettings?: WidgetSettings;
}

export function BioWidget({ bio, editable = false, profile, widgetSettings }: BioWidgetProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  if (!bio && !editable) return null;

  return (
    <>
      <Card className="w-full p-8 relative">
        {editable && widgetSettings && profile && (
          <WidgetHeader
            profileId={profile.id}
            widgetType={widgetSettings.widget_type}
            enabled={widgetSettings.enabled}
            onEdit={() => setIsEditDrawerOpen(true)}
          />
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
