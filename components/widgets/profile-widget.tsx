'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database } from '@/lib/database.types';
import { downloadVCard } from '@/lib/vcard-generator';
import { MapPin, User, Pencil } from 'lucide-react';
import Image from 'next/image';
import { updateProfile } from '@/app/actions/profile';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileWidgetProps {
  profile: Profile;
  isOwner: boolean;
}

export function ProfileWidget({ profile, isOwner }: ProfileWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    job_title: profile.job_title || '',
    company: profile.company || '',
    location: profile.location || '',
  });
  const [isPending, startTransition] = useTransition();

  const handleSaveContact = () => {
    downloadVCard(profile);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfile(profile.id, formData);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
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

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>
          </div>

          <SheetFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFormData({
                  display_name: profile.display_name || '',
                  job_title: profile.job_title || '',
                  company: profile.company || '',
                  location: profile.location || '',
                });
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
