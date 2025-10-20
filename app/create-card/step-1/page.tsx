import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LinkedInInputForm } from '@/components/create-card/linkedin-input-form';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function CreateCardStep1() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Card</h1>
              <p className="text-gray-600 mt-2">
                Step 1 of 2: Enter your LinkedIn URL (optional)
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="flex items-center text-blue-600">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white font-semibold">
                1
              </div>
              <div className="ml-3 text-sm font-medium">LinkedIn URL</div>
            </div>
            <div className="flex-1 mx-4 h-0.5 bg-gray-300"></div>
            <div className="flex items-center text-gray-400">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-white font-semibold">
                2
              </div>
              <div className="ml-3 text-sm font-medium">Card Details</div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-8">
          <LinkedInInputForm />
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Why LinkedIn?</h3>
          <p className="text-sm text-blue-800">
            Entering your LinkedIn URL helps us pre-fill your profile with your professional information. 
            You can skip this step and enter everything manually in the next screen.
          </p>
        </div>
      </div>
    </div>
  );
}

