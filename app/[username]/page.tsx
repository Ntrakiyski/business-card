import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileWidget } from '@/components/widgets/profile-widget';
import { BioWidget } from '@/components/widgets/bio-widget';
import { LinksWidget } from '@/components/widgets/links-widget';
import { SocialWidget } from '@/components/widgets/social-widget';
import { ServicesWidget } from '@/components/widgets/services-widget';
import { ContactWidget } from '@/components/widgets/contact-widget';
import { MapWidget } from '@/components/widgets/map-widget';
import { LogoutButton } from '@/components/logout-button';
import { ProfileViewContainer } from '@/components/profile-view-container';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type CustomLink = Database['public']['Tables']['custom_links']['Row'];
type SocialLink = Database['public']['Tables']['social_links']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Check if current user is authenticated
  let user = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    user = userData.user;
  } catch (error) {
    // If there's an auth error (like invalid refresh token), continue without user
    // This allows public profiles to still be accessible
    console.warn('Auth error (likely expired session):', error);
    user = null;
  }

  // Fetch profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*, user_id')
    .eq('username', username)
    .maybeSingle();

  if (profileError || !profileData) {
    notFound();
  }

  const profile = profileData as Profile & { user_id: string };

  // Check if the current user is viewing their own profile
  const isOwner: boolean = !!(user && user.id === profile.user_id);

  // Fetch custom links
  const { data: customLinks } = await supabase
    .from('custom_links')
    .select('*')
    .eq('profile_id', profile.id)
    .order('order', { ascending: true });

  // Filter enabled links for public view, but show all for owner
  const typedCustomLinks = (customLinks || []) as CustomLink[];
  const enabledCustomLinks: CustomLink[] = isOwner 
    ? typedCustomLinks
    : typedCustomLinks.filter(link => link.enabled);

  // Fetch social links
  const { data: socialLinks } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', profile.id);

  // Filter enabled links for public view, but show all for owner
  const typedSocialLinks = (socialLinks || []) as SocialLink[];
  const enabledSocialLinks: SocialLink[] = isOwner 
    ? typedSocialLinks
    : typedSocialLinks.filter(link => link.enabled);

  // Fetch services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('profile_id', profile.id)
    .order('order', { ascending: true });

  // Filter enabled services for public view, but show all for owner
  const typedServices = (services || []) as Service[];
  const enabledServices: Service[] = isOwner 
    ? typedServices
    : typedServices.filter(service => service.enabled);

  // Fetch widget settings to determine order and visibility
  const { data: widgetSettingsData } = await supabase
    .from('widget_settings')
    .select('*')
    .eq('profile_id', profile.id)
    .order('order', { ascending: true });

  // Filter enabled widgets for public view, but show all for owner
  const allWidgetSettings = (widgetSettingsData || []) as Database['public']['Tables']['widget_settings']['Row'][];
  const enabledWidgetSettings = isOwner 
    ? allWidgetSettings 
    : allWidgetSettings.filter(setting => setting.enabled);

  // Create a map of widget type to order
  const widgetOrder: Record<string, number> = {};
  enabledWidgetSettings.forEach((setting) => {
    widgetOrder[setting.widget_type] = setting.order;
  });

  // Define all widgets with their components
  const allWidgets = [
    { 
      type: 'profile', 
      order: widgetOrder['profile'] ?? 1, 
      component: <ProfileWidget key="profile" profile={profile} editable={isOwner} /> 
    },
    { 
      type: 'bio', 
      order: widgetOrder['bio'] ?? 2, 
      component: <BioWidget key="bio" bio={profile.bio ?? undefined} profile={profile} editable={isOwner} /> 
    },
    { 
      type: 'links', 
      order: widgetOrder['links'] ?? 3, 
      component: <LinksWidget key="links" links={enabledCustomLinks || []} profileId={profile.id} editable={isOwner} /> 
    },
    { 
      type: 'social', 
      order: widgetOrder['social'] ?? 4, 
      component: <SocialWidget key="social" links={enabledSocialLinks || []} profileId={profile.id} editable={isOwner} /> 
    },
    { 
      type: 'services', 
      order: widgetOrder['services'] ?? 5, 
      component: <ServicesWidget key="services" services={enabledServices || []} profileId={profile.id} editable={isOwner} /> 
    },
    { 
      type: 'contact', 
      order: widgetOrder['contact'] ?? 6, 
      component: <ContactWidget key="contact" profile={profile} editable={isOwner} /> 
    },
    { 
      type: 'map', 
      order: widgetOrder['map'] ?? 7, 
      component: <MapWidget key="map" profile={profile} editable={isOwner} /> 
    },
  ];

  // Sort widgets by order and filter out null components for public view
  // For owner, show all widgets even if they have no data
  let sortedWidgets;
  if (isOwner) {
    // For owners, show all widgets in order (widgets will handle whether to show content or empty state)
    sortedWidgets = allWidgets
      .sort((a, b) => a.order - b.order)
      .map(w => w.component);
  } else {
    // For public view, filter out null components
    sortedWidgets = allWidgets
      .sort((a, b) => a.order - b.order)
      .map(w => w.component)
      .filter(Boolean);
  }

  return (
    <ProfileViewContainer profile={profile}>
      <div className="min-h-screen bg-gray-100 py-12 px-6 relative">
        {/* Logout button for profile owner */}
        {isOwner && (
          <div className="absolute top-6 right-6 z-10">
            <LogoutButton />
          </div>
        )}
        
        <div className="max-w-2xl mx-auto space-y-6">
          {sortedWidgets}
        </div>
      </div>
    </ProfileViewContainer>
  );
}

// Commenting out generateMetadata temporarily due to Next.js 15/Turbopack issue
// export async function generateMetadata({ params }: ProfilePageProps) {
//   const { username } = params;
//   const supabase = await createClient();

//   try {
//     const { data: profileData } = await supabase
//       .from('profiles')
//       .select('display_name, bio, job_title, company')
//       .eq('username', username)
//       .maybeSingle();

//     if (!profileData) {
//       return {
//         title: 'Profile Not Found',
//       };
//     }

//     const profile = profileData as Pick<Profile, 'display_name' | 'bio' | 'job_title' | 'company'>;

//     const title = profile.display_name || username;
//     const description = profile.bio || `${profile.job_title || ''} ${profile.company ? `at ${profile.company}` : ''}`.trim();

//     return {
//       title: `${title} - Digital Business Card`,
//       description: description || `View ${title}'s digital business card`,
//     };
//   } catch (error) {
//     console.error('Error generating metadata:', error);
//     return {
//       title: 'Profile Not Found',
//     };
//   }
// }
