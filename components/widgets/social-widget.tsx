'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, Github, Edit3, Send, Phone } from 'lucide-react';
import { WidgetEditDrawer } from '@/components/edit/widget-edit-drawer';
import { WidgetHeader } from './widget-header';

type SocialLink = Database['public']['Tables']['social_links']['Row'];

interface SocialWidgetProps {
  links: SocialLink[];
  editable?: boolean;
  profileId?: string;
  widgetSettings?: Database["public"]["Tables"]["widget_settings"]["Row"];
}

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  spotify: Music,
  github: Github,
  tiktok: Music, // Using Music as placeholder for TikTok
  telegram: Send,
  whatsapp: Phone,
};

const socialColors = {
  facebook: 'hover:text-[#1877F2]',
  instagram: 'hover:text-[#E4405F]',
  twitter: 'hover:text-[#1DA1F2]',
  linkedin: 'hover:text-[#0A66C2]',
  youtube: 'hover:text-[#FF0000]',
  spotify: 'hover:text-[#1DB954]',
  github: 'hover:text-[#181717]',
  tiktok: 'hover:text-[#000000]',
  telegram: 'hover:text-[#2AABEE]',
  whatsapp: 'hover:text-[#25D366]',
};

export function SocialWidget({ links, editable = false, profileId, widgetSettings }: SocialWidgetProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  if ((!links || links.length === 0) && !editable) return null;

  return (
    <>
      <Card className="w-full p-8 relative">
        {editable && widgetSettings && profileId && (
          <WidgetHeader
            profileId={profileId}
            widgetType={widgetSettings.widget_type}
            enabled={widgetSettings.enabled}
            onEdit={() => setIsEditDrawerOpen(true)}
          />
        )}
        
        <div className="pt-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect</h2>
          
          {links && links.length > 0 ? (
            <div className="flex flex-wrap gap-4 justify-center">
              {links.map((link) => {
                const Icon = socialIcons[link.platform as keyof typeof socialIcons];
                const colorClass = socialColors[link.platform as keyof typeof socialColors];
                
                return (
                  <a
                    key={link.id}
                    href={link.url.startsWith('+') ? `tel:${link.url}` : link.url}
                    target={link.url.startsWith('+') ? undefined : "_blank"}
                    rel={link.url.startsWith('+') ? undefined : "noopener noreferrer"}
                    className={`p-3 rounded-full bg-gray-100 text-gray-600 ${colorClass} transition-colors`}
                    aria-label={link.platform}
                  >
                    {Icon && <Icon className="w-6 h-6" />}
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No social links added yet. Click the edit button to add social links.
            </p>
          )}
        </div>
      </Card>
      
      {editable && profileId && (
        <WidgetEditDrawer
          widgetType="social"
          profile={{ id: profileId }}
          socialLinks={links}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}
    </>
  );
}
