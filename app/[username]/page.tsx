import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileWidget } from '@/components/widgets/profile-widget';
import { BioWidget } from '@/components/widgets/bio-widget';
import { LinksWidget } from '@/components/widgets/links-widget';
import { SocialWidget } from '@/components/widgets/social-widget';
import { ServicesWidget } from '@/components/widgets/services-widget';
import { ContactWidget } from '@/components/widgets/contact-widget';
import { MapWidget } from '@/components/widgets/map-widget';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params;
  const supabase = await createClient();

  // Get current user to check if they're the owner
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (profileError || !profileData) {
    notFound();
  }

  const profile = profileData as Profile;
  const isOwner = user?.id === profile.id;

  // Fetch custom links
  const { data: customLinks } = await supabase
    .from('custom_links')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('enabled', true)
    .order('order', { ascending: true });

  // Fetch social links
  const { data: socialLinks } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('enabled', true);

  // Fetch services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('enabled', true)
    .order('order', { ascending: true });

  // Fetch widget settings to determine order and visibility
  const { data: widgetSettingsData } = await supabase
    .from('widget_settings')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('enabled', true)
    .order('order', { ascending: true });

  const widgetSettings = (widgetSettingsData || []) as Database['public']['Tables']['widget_settings']['Row'][];

  // Create a map of widget type to order
  const widgetOrder: Record<string, number> = {};
  widgetSettings.forEach((setting) => {
    widgetOrder[setting.widget_type] = setting.order;
  });

  // Define all widgets with their components
  const allWidgets = [
    { 
      type: 'profile', 
      order: widgetOrder['profile'] ?? 1, 
      component: <ProfileWidget key="profile" profile={profile} isOwner={isOwner} /> 
    },
    { 
      type: 'bio', 
      order: widgetOrder['bio'] ?? 2, 
      component: profile.bio ? <BioWidget key="bio" bio={profile.bio} profileId={profile.id} isOwner={isOwner} /> : null 
    },
    { 
      type: 'links', 
      order: widgetOrder['links'] ?? 3, 
      component: customLinks && customLinks.length > 0 ? <LinksWidget key="links" links={customLinks} profileId={profile.id} isOwner={isOwner} /> : null 
    },
    { 
      type: 'social', 
      order: widgetOrder['social'] ?? 4, 
      component: socialLinks && socialLinks.length > 0 ? <SocialWidget key="social" links={socialLinks} profileId={profile.id} isOwner={isOwner} /> : null 
    },
    { 
      type: 'services', 
      order: widgetOrder['services'] ?? 5, 
      component: services && services.length > 0 ? <ServicesWidget key="services" services={services} profileId={profile.id} isOwner={isOwner} /> : null 
    },
    { 
      type: 'contact', 
      order: widgetOrder['contact'] ?? 6, 
      component: <ContactWidget key="contact" profile={profile} isOwner={isOwner} /> 
    },
    { 
      type: 'map', 
      order: widgetOrder['map'] ?? 7, 
      component: <MapWidget key="map" profile={profile} isOwner={isOwner} /> 
    },
  ];

  // Sort widgets by order and filter out null components
  const sortedWidgets = allWidgets
    .sort((a, b) => a.order - b.order)
    .map(w => w.component)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {sortedWidgets}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = params;
  const supabase = await createClient();

  const { data: profileData } = await supabase
    .from('profiles')
    .select('display_name, bio, job_title, company')
    .eq('username', username)
    .maybeSingle();

  if (!profileData) {
    return {
      title: 'Profile Not Found',
    };
  }

  const profile = profileData as Pick<Profile, 'display_name' | 'bio' | 'job_title' | 'company'>;

  const title = profile.display_name || username;
  const description = profile.bio || `${profile.job_title || ''} ${profile.company ? `at ${profile.company}` : ''}`.trim();

  return {
    title: `${title} - Digital Business Card`,
    description: description || `View ${title}'s digital business card`,
  };
}
