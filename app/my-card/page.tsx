import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QRCodeDisplay } from './qr-code-display';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink, Facebook, Instagram, Twitter, Linkedin, Youtube, Music, Github } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type SocialLink = Database['public']['Tables']['social_links']['Row'];

export default async function MyCardPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Get user's profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profileData) {
    redirect('/onboarding');
  }

  const profile = profileData as Profile;

  if (!profile.username) {
    redirect('/onboarding');
  }

  // Get social links
  const { data: socialLinks } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', user.id);

  // Generate the full profile URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const profileUrl = `${baseUrl}/${profile.username}`;

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    spotify: Music,
    github: Github,
    tiktok: Music,
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                @{profile.username}
              </p>
            </div>

            {/* QR Code */}
            <QRCodeDisplay value={profileUrl} phone={profile.phone} />

            {/* Instructions */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Scan or click to preview your digital business card
              </p>
              <Link
                href={`/${profile.username}`}
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <span>View your profile</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="pt-4 border-t border-gray-200 w-full">
                <div className="flex flex-wrap gap-4 justify-center">
                  {socialLinks.map((link) => {
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
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
