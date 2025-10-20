import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QrCode, Zap, Shield, Globe } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // @ts-expect-error - Database types not yet updated
      if (profile?.username) {
        redirect('/home');
      } else {
        redirect('/onboarding');
      }
    }
  } catch (error) {
    // Continue to show landing page if there's an auth error
    console.warn('Auth error on landing page (likely expired session):', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-24 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4">
            <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full">
              ✨ The Modern Way to Network
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Your Digital Business Card
            <span className="block text-blue-600 mt-2">Powered by QR</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create stunning digital business cards in minutes. Share instantly with QR codes, custom URLs, and mobile-first design.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button asChild size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
              <Link href="/signup">
                Get Started Free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2">
              <Link href="/home">
                View Directory
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            No credit card required • Setup in under 2 minutes
          </p>
        </div>
      </div>

      {/* USP Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Digital Business Cards?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stand out from the crowd with modern, eco-friendly, and always up-to-date professional presence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 text-center hover:shadow-xl transition-all border-2 hover:border-blue-200">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Instant QR Sharing</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate unique QR codes for each card. Share instantly at events, meetings, or via social media.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all border-2 hover:border-green-200">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Create and share your card in under 2 minutes. Update information instantly without reprinting.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all border-2 hover:border-purple-200">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Privacy Control</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose what to share and who can see it. Make cards public or keep them private with full control.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all border-2 hover:border-orange-200">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Custom URLs</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your personalized URL that&apos;s easy to remember, share, and looks professional on any channel.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Highlight */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Everything You Need in One Place
                </h2>
                <ul className="space-y-4">
                  {[
                    'Profile photo, bio, and contact info',
                    'Custom links with images',
                    'Social media integration',
                    'Services and skills showcase',
                    'Interactive location maps',
                    'One-tap call, email, and directions',
                    'vCard export for contact saving'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-lg text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-2xl shadow-2xl mx-auto mb-6 flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-gray-800" />
                  </div>
                  <p className="text-gray-700 font-semibold text-lg">
                    Your Card, Your Way
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Go Digital?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join professionals worldwide who have already made the switch to smart, sustainable networking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6">
              <Link href="/signup">
                Create Your Card Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>© 2024 Digital Business Card. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
