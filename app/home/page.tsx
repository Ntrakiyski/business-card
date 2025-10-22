import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MyCardsSection } from '@/components/home/my-cards-section';
import { PublicDirectoryTable } from '@/components/home/public-directory-table';
import { AppLayout } from '@/components/layout/app-layout';
import { CreateCardDialog } from '@/components/home/create-card-dialog';

export default async function HomePage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch user's cards
  const { data: userCards } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  // Fetch all public cards for directory
  const { data: publicCards } = await supabase
    .from('profiles')
    .select('id, username, display_name, job_title, company, location, profile_image_url, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <AppLayout>
      <div className="min-h-full">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 space-y-12">
          {/* My Cards Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Cards</h2>
                <p className="text-gray-600 mt-1">
                  Manage your business cards and create new ones
                </p>
              </div>
              <CreateCardDialog />
            </div>
            <MyCardsSection cards={userCards || []} />
          </section>

          {/* Public Directory Section */}
          <section id="explore">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Public Directory</h2>
              <p className="text-gray-600 mt-1">
                Explore business cards from professionals around the world
              </p>
            </div>
            <PublicDirectoryTable cards={publicCards || []} />
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
