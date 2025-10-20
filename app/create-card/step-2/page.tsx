import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CardEditorForm } from '@/components/create-card/card-editor-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function CreateCardStep2() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/create-card/step-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Your Card</h1>
            <p className="text-gray-600 mt-2">
              Step 2 of 2: Fill in your information and customize your card
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="flex items-center text-green-600">
              <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full text-white font-semibold">
                ✓
              </div>
              <div className="ml-3 text-sm font-medium">LinkedIn URL</div>
            </div>
            <div className="flex-1 mx-4 h-0.5 bg-blue-600"></div>
            <div className="flex items-center text-blue-600">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white font-semibold">
                2
              </div>
              <div className="ml-3 text-sm font-medium">Card Details</div>
            </div>
          </div>
        </div>

        {/* Card Editor Form */}
        <CardEditorForm />
      </div>
    </div>
  );
}

