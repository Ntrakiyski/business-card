import { Card } from '@/components/ui/card';
import { Database } from '@/lib/database.types';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Music, Github } from 'lucide-react';

type SocialLink = Database['public']['Tables']['social_links']['Row'];

interface SocialWidgetProps {
  links: SocialLink[];
  profileId: string;
  isOwner: boolean;
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
};

export function SocialWidget({ links, profileId, isOwner }: SocialWidgetProps) {
  if (!links || links.length === 0) return null;

  return (
    <Card className="w-full p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect</h2>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {links.map((link) => {
          const Icon = socialIcons[link.platform as keyof typeof socialIcons];
          const colorClass = socialColors[link.platform as keyof typeof socialColors];
          
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-full bg-gray-100 text-gray-600 ${colorClass} transition-colors`}
              aria-label={link.platform}
            >
              {Icon && <Icon className="w-6 h-6" />}
            </a>
          );
        })}
      </div>
    </Card>
  );
}
