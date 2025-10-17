'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import { downloadVCard } from '@/lib/vcard-generator';
import { MapPin, User, Edit3, Share2 } from 'lucide-react';
import { WidgetEditDrawer } from '@/components/edit/widget-edit-drawer';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileWidgetProps {
  profile: Profile;
  editable?: boolean;
}

export function ProfileWidget({ profile, editable = false }: ProfileWidgetProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  
  const handleSaveContact = () => {
    downloadVCard(profile);
  };

  const handleShareContact = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.display_name || profile.username,
          text: `Check out ${profile.display_name || profile.username}'s digital business card`,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <>
      <Card className="w-full p-8 relative">
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
        
        <div className="flex flex-col items-center text-center space-y-4 pt-0">
          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 relative">
            {profile.profile_image_url ? (
              <Image
                src={profile.profile_image_url}
                alt={profile.display_name || 'Profile'}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.display_name}
            </h1>
            
            {/* Job Title & Company */}
            {(profile.job_title || profile.company) && (
              <p className="text-sm text-gray-600 mt-1">
                {profile.job_title}
                {profile.job_title && profile.company && ' at '}
                {profile.company}
              </p>
            )}
            
            {/* Location */}
            {profile.location && (
              <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 w-full pt-2">
            <Button 
              onClick={handleSaveContact}
              className="w-full"
              size="lg"
            >
              Save Contact
            </Button>
            <Button 
              onClick={handleShareContact}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Contact
            </Button>
          </div>
        </div>
      </Card>
      
      {editable && (
        <WidgetEditDrawer
          widgetType="profile"
          profile={profile}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}
    </>
  );
}
