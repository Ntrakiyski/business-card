import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CardPageClient } from '@/components/profile/card-page-client';
import { Database } from '@/lib/database.types';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Profile = Database['public']['Tables']['profiles']['Row'];
type CustomLink = Database['public']['Tables']['custom_links']['Row'];
type SocialLink = Database['public']['Tables']['social_links']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type WidgetSettings = Database['public']['Tables']['widget_settings']['Row'];

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
    console.warn('Auth error (likely expired session):', error);
    user = null;
  }

  // Fetch profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
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

  // Fetch social links
  const { data: socialLinks } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', profile.id);

  // Fetch services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('profile_id', profile.id)
    .order('order', { ascending: true });

  // Fetch widget settings
  const { data: widgetSettingsData } = await supabase
    .from('widget_settings')
    .select('*')
    .eq('profile_id', profile.id)
    .order('order', { ascending: true });

  return (
    <CardPageClient
      profile={profile}
      customLinks={(customLinks || []) as CustomLink[]}
      socialLinks={(socialLinks || []) as SocialLink[]}
      services={(services || []) as Service[]}
      widgetSettings={(widgetSettingsData || []) as WidgetSettings[]}
      isOwner={isOwner}
      currentUsername={user ? profile.username : undefined}
    />
  );
}

