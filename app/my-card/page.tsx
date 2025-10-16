import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QRCodeDisplay } from './qr-code-display';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Database } from '@/lib/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

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

  // Generate the full profile URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const profileUrl = `${baseUrl}/${profile.username}`;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                @{profile.username}
              </p>
            </div>

            {/* QR Code */}
            <QRCodeDisplay value={profileUrl} />

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

            {/* Bio */}
            {profile.bio && (
              <div className="pt-4 border-t border-gray-200 w-full">
                <p className="text-sm text-gray-600">{profile.bio}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
