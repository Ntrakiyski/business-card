'use client';

import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ProfileWidgetEditForm } from './forms/profile-widget-edit-form';
import { BioWidgetEditForm } from './forms/bio-widget-edit-form';
import { LinksWidgetEditForm } from './forms/links-widget-edit-form';
import { SocialWidgetEditForm } from './forms/social-widget-edit-form';
import { ServicesWidgetEditForm } from './forms/services-widget-edit-form';
import { ContactWidgetEditForm } from './forms/contact-widget-edit-form';
import { MapWidgetEditForm } from './forms/map-widget-edit-form';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type CustomLink = Database['public']['Tables']['custom_links']['Row'];
type SocialLink = Database['public']['Tables']['social_links']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

interface WidgetEditDrawerProps {
  widgetType: 'profile' | 'bio' | 'links' | 'social' | 'services' | 'contact' | 'map';
  profile: Profile;
  customLinks?: CustomLink[];
  socialLinks?: SocialLink[];
  services?: Service[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WidgetEditDrawer({ 
  widgetType, 
  profile, 
  customLinks, 
  socialLinks, 
  services,
  open, 
  onOpenChange 
}: WidgetEditDrawerProps) {


  const renderEditForm = () => {
    switch (widgetType) {
      case 'profile':
        return <ProfileWidgetEditForm profile={profile} onClose={() => onOpenChange(false)} />;
      case 'bio':
        return <BioWidgetEditForm profile={profile} onClose={() => onOpenChange(false)} />;
      case 'links':
        return <LinksWidgetEditForm links={customLinks || []} profileId={profile.id} onClose={() => onOpenChange(false)} />;
      case 'social':
        return <SocialWidgetEditForm links={socialLinks || []} profileId={profile.id} onClose={() => onOpenChange(false)} />;
      case 'services':
        return <ServicesWidgetEditForm services={services || []} profileId={profile.id} onClose={() => onOpenChange(false)} />;
      case 'contact':
        return <ContactWidgetEditForm profile={profile} onClose={() => onOpenChange(false)} />;
      case 'map':
        return <MapWidgetEditForm profile={profile} onClose={() => onOpenChange(false)} />;
      default:
        return <div>Unsupported widget type</div>;
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Drawer.Root 
      open={open} 
      onOpenChange={onOpenChange}
      direction="bottom"
      modal={true}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-3xl max-h-[90vh] fixed bottom-0 left-0 right-0 z-50">
          <div className="p-4 bg-white rounded-t-3xl flex flex-col h-full">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-4" />
            
            <div className="flex justify-between items-center mb-4">
              <Drawer.Title className="font-medium text-gray-900">
                Edit {widgetType.charAt(0).toUpperCase() + widgetType.slice(1)} Widget
              </Drawer.Title>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {renderEditForm()}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}