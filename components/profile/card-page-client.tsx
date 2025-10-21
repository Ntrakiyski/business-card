'use client';

import { useState } from 'react';
import { ProfileWidget } from '@/components/widgets/profile-widget';
import { BioWidget } from '@/components/widgets/bio-widget';
import { LinksWidget } from '@/components/widgets/links-widget';
import { SocialWidget } from '@/components/widgets/social-widget';
import { ServicesWidget } from '@/components/widgets/services-widget';
import { ContactWidget } from '@/components/widgets/contact-widget';
import { MapWidget } from '@/components/widgets/map-widget';
import { EditPreviewToggle } from '@/components/layout/edit-preview-toggle';
import { Sidebar } from '@/components/layout/sidebar';
import { LogoutButton } from '@/components/logout-button';
import { PublicToggle } from '@/components/profile/public-toggle';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'] & { user_id?: string; is_public?: boolean };
type CustomLink = Database['public']['Tables']['custom_links']['Row'];
type SocialLink = Database['public']['Tables']['social_links']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type WidgetSettings = Database['public']['Tables']['widget_settings']['Row'];

interface CardPageClientProps {
  profile: Profile;
  customLinks: CustomLink[];
  socialLinks: SocialLink[];
  services: Service[];
  widgetSettings: WidgetSettings[];
  isOwner: boolean;
  currentUsername?: string;
}

export function CardPageClient({
  profile,
  customLinks,
  socialLinks,
  services,
  widgetSettings,
  isOwner,
  currentUsername,
}: CardPageClientProps) {
  // Default to Edit mode for owner, Preview mode for visitors
  const [isEditMode, setIsEditMode] = useState(isOwner);

  // Create a map of widget type to settings
  const widgetSettingsMap: Record<string, WidgetSettings> = {};
  widgetSettings.forEach((setting) => {
    widgetSettingsMap[setting.widget_type] = setting;
  });

  // Filter links based on edit mode
  const displayCustomLinks = isEditMode && isOwner 
    ? customLinks 
    : customLinks.filter(link => link.enabled);
  
  const displaySocialLinks = isEditMode && isOwner 
    ? socialLinks 
    : socialLinks.filter(link => link.enabled);
  
  const displayServices = isEditMode && isOwner 
    ? services 
    : services.filter(service => service.enabled);

  // Define all widgets with their components
  const allWidgets = [
    { 
      type: 'profile', 
      order: widgetSettingsMap['profile']?.order ?? 1, 
      enabled: widgetSettingsMap['profile']?.enabled ?? true,
      component: (
        <ProfileWidget 
          key="profile" 
          profile={profile} 
          editable={isEditMode && isOwner}
          widgetSettings={widgetSettingsMap['profile']}
        />
      )
    },
    { 
      type: 'bio', 
      order: widgetSettingsMap['bio']?.order ?? 2,
      enabled: widgetSettingsMap['bio']?.enabled ?? true,
      component: (
        <BioWidget 
          key="bio" 
          bio={profile.bio ?? undefined} 
          profile={profile} 
          editable={isEditMode && isOwner}
          widgetSettings={widgetSettingsMap['bio']}
        />
      )
    },
    { 
      type: 'links', 
      order: widgetSettingsMap['links']?.order ?? 3,
      enabled: widgetSettingsMap['links']?.enabled ?? true,
      component: (
        <LinksWidget 
          key="links" 
          links={displayCustomLinks} 
          profileId={profile.id} 
          editable={isEditMode && isOwner}
          widgetSettings={widgetSettingsMap['links']}
        />
      )
    },
    { 
      type: 'social', 
      order: widgetSettingsMap['social']?.order ?? 4,
      enabled: widgetSettingsMap['social']?.enabled ?? true,
      component: (
        <SocialWidget 
          key="social" 
          links={displaySocialLinks} 
          profileId={profile.id} 
          editable={isEditMode && isOwner}
          widgetSettings={widgetSettingsMap['social']}
        />
      )
    },
    { 
      type: 'services', 
      order: widgetSettingsMap['services']?.order ?? 5,
      enabled: widgetSettingsMap['services']?.enabled ?? true,
      component: (
        <ServicesWidget 
          key="services" 
          services={displayServices} 
          profileId={profile.id} 
          editable={isEditMode && isOwner}
          widgetSettings={widgetSettingsMap['services']}
        />
      )
    },
    { 
      type: 'contact', 
      order: widgetSettingsMap['contact']?.order ?? 6,
      enabled: widgetSettingsMap['contact']?.enabled ?? true,
      component: (
        <ContactWidget 
          key="contact" 
          profile={profile} 
          editable={isEditMode && isOwner}
          widgetSettings={widgetSettingsMap['contact']}
        />
      )
    },
    { 
      type: 'map', 
      order: widgetSettingsMap['map']?.order ?? 7,
      enabled: widgetSettingsMap['map']?.enabled ?? true,
      component: (
        <MapWidget 
          key="map" 
          profile={profile} 
          editable={isEditMode && isOwner}
          widgetSettings={widgetSettingsMap['map']}
        />
      )
    },
  ];

  // Sort widgets by order
  // In edit mode, show all widgets. In preview mode, only show enabled widgets
  const sortedWidgets = allWidgets
    .filter(w => isEditMode && isOwner ? true : w.enabled)
    .sort((a, b) => a.order - b.order)
    .map(w => w.component);

  return (
    <>
      {/* Sidebar for all authenticated users */}
      {currentUsername && <Sidebar username={currentUsername} />}
      
      {/* Edit/Preview Toggle - only show for owner */}
      {isOwner && (
        <EditPreviewToggle onModeChange={setIsEditMode} />
      )}

      <div className="min-h-screen bg-gray-100 py-12 px-6 relative">
        {/* Logout button for profile owner */}
        {isOwner && (
          <div className="absolute top-6 left-6 z-10">
            <LogoutButton />
          </div>
        )}
        
        <div className="max-w-2xl mx-auto space-y-6 mt-16">
          {/* Public/Private Toggle for owner in edit mode */}
          {isOwner && isEditMode && (
            <PublicToggle profileId={profile.id} isPublic={profile.is_public ?? true} />
          )}
          
          {sortedWidgets}
        </div>
      </div>
    </>
  );
}

