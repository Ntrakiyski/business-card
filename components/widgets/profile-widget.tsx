'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import { downloadVCard } from '@/lib/vcard-generator';
import { MapPin, User } from 'lucide-react';
import Image from 'next/image';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileWidgetProps {
  profile: Profile;
}

export function ProfileWidget({ profile }: ProfileWidgetProps) {
  const handleSaveContact = () => {
    downloadVCard(profile);
  };

  return (
    <Card className="w-full p-6">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Profile Image */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
          {profile.profile_image_url ? (
            <Image
              src={profile.profile_image_url}
              alt={profile.display_name || 'Profile'}
              fill
              className="object-cover"
              priority
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
        <div className="flex gap-3 w-full pt-2">
          <Button 
            onClick={handleSaveContact}
            className="flex-1"
            size="lg"
          >
            Save Contact
          </Button>
        </div>
      </div>
    </Card>
  );
}

