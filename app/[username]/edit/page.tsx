import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { CardEditorForm } from '@/components/create-card/card-editor-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type WidgetSettings = Database['public']['Tables']['widget_settings']['Row'];

interface EditPageProps {
  params: {
    username: string;
  };
}

export default async function EditCardPage({ params }: EditPageProps) {
  const { username } = await params;
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
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

  // Check if the current user is the owner
  if (user.id !== profile.user_id) {
    redirect(`/${username}`);
  }

  // Fetch widget settings
  const { data: widgetSettingsData } = await supabase
    .from('widget_settings')
    .select('*')
    .eq('profile_id', profile.id)
    .order('order', { ascending: true });

  const widgetSettings = (widgetSettingsData || []) as WidgetSettings[];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href={`/${username}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Card
            </Link>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Your Card</h1>
            <p className="text-gray-600 mt-2">
              Update your information and customize your card
            </p>
          </div>
        </div>

        {/* Card Editor Form in Edit Mode */}
        <CardEditorForm 
          isEditMode={true}
          profile={profile}
          widgetSettings={widgetSettings}
        />
      </div>
    </div>
  );
}

