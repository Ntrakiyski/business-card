'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database } from '@/lib/database.types';
import { Mail, Phone, Globe, MapPin, Pencil } from 'lucide-react';
import { updateProfile } from '@/app/actions/profile';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ContactWidgetProps {
  profile: Profile;
  isOwner: boolean;
}

export function ContactWidget({ profile, isOwner }: ContactWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    phone: profile.phone || '',
    email: profile.email || '',
    website: profile.website || '',
    address: profile.address || '',
  });
  const [isPending, startTransition] = useTransition();

  const hasContactInfo = profile.phone || profile.email || profile.website || profile.address;
  
  if (!hasContactInfo && !isOwner) return null;

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfile(profile.id, formData);
      
      if (result.success) {
        toast.success('Contact info updated successfully!');
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to update contact info');
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

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
        
        <div className="space-y-3">
          {/* Phone */}
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium text-gray-900">{profile.phone}</p>
              </div>
            </a>
          )}
          
          {/* Email */}
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 truncate">{profile.email}</p>
              </div>
            </a>
          )}
          
          {/* Website */}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Website</p>
                <p className="font-medium text-gray-900 truncate">{profile.website}</p>
              </div>
            </a>
          )}
          
          {/* Address */}
          {profile.address && (
            <div className="flex items-center gap-3 p-3 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{profile.address}</p>
              </div>
            </div>
          )}

          {!hasContactInfo && isOwner && (
            <p className="text-gray-500 text-sm">No contact information added yet</p>
          )}
        </div>
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Edit Contact Info</SheetTitle>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </div>

          <SheetFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFormData({
                  phone: profile.phone || '',
                  email: profile.email || '',
                  website: profile.website || '',
                  address: profile.address || '',
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

