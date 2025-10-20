'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Linkedin, ArrowRight } from 'lucide-react';

export function LinkedInInputForm() {
  const router = useRouter();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate LinkedIn URL format if provided
      if (linkedinUrl) {
        const isValidLinkedIn = linkedinUrl.includes('linkedin.com/in/') || 
                                linkedinUrl.includes('linkedin.com/pub/');
        
        if (!isValidLinkedIn) {
          toast.error('Please enter a valid LinkedIn profile URL');
          setIsLoading(false);
          return;
        }

        // Extract username from LinkedIn URL
        const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
        const linkedinUsername = match ? match[1] : '';
        
        // Store in sessionStorage to pass to step 2
        sessionStorage.setItem('linkedinUrl', linkedinUrl);
        sessionStorage.setItem('linkedinUsername', linkedinUsername);
      } else {
        // Clear any previous data
        sessionStorage.removeItem('linkedinUrl');
        sessionStorage.removeItem('linkedinUsername');
      }

      // Proceed to step 2
      router.push('/create-card/step-2');
    } catch {
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Clear any stored data
    sessionStorage.removeItem('linkedinUrl');
    sessionStorage.removeItem('linkedinUsername');
    
    // Go directly to step 2
    router.push('/create-card/step-2');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Linkedin className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div>
          <Label htmlFor="linkedin-url" className="text-base">
            LinkedIn Profile URL
          </Label>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Example: https://www.linkedin.com/in/yourname
          </p>
          <Input
            id="linkedin-url"
            type="url"
            placeholder="https://www.linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="text-lg"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleSkip}
          disabled={isLoading}
        >
          Skip
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500">
        We don&apos;t automatically scrape LinkedIn. You&apos;ll enter your information manually in the next step.
      </p>
    </form>
  );
}
