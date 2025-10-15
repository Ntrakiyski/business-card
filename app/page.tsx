import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in, redirect to their card
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle();

    const profile = profileData as Pick<Profile, 'username'> | null;

    if (profile && profile.username) {
      redirect('/my-card');
    } else {
      redirect('/onboarding');
    }
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Your Digital Business Card
          </h1>
          <p className="text-xl text-gray-600">
            Share your professional profile with a simple QR code. 
            No app required, just scan and connect.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/signup">
              Get Started
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg px-8">
            <Link href="/login">
              Sign In
            </Link>
          </Button>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-2">
            <div className="text-4xl">📱</div>
            <h3 className="font-semibold text-lg">Mobile First</h3>
            <p className="text-gray-600 text-sm">
              Designed for smartphones. Perfect for networking events.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">⚡</div>
            <h3 className="font-semibold text-lg">Instant Updates</h3>
            <p className="text-gray-600 text-sm">
              Change your info once, it updates everywhere immediately.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">🌍</div>
            <h3 className="font-semibold text-lg">Universal</h3>
            <p className="text-gray-600 text-sm">
              Works on any device with a camera. No app download needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
