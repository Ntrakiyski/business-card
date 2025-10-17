'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  return (
    <>
      <div className="text-red-500">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Authentication Failed</h1>
        <p className="text-gray-600 mt-2">
          There was an issue with your authentication. Please try again.
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-left text-sm">
            <strong>Error details:</strong> {error}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link href="/login">Return to Login</Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </>
  );
}

function AuthCodeErrorFallback() {
  return (
    <>
      <div className="text-red-500">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        <p className="text-gray-600 mt-2">
          Please wait while we process your authentication error.
        </p>
      </div>
    </>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center space-y-6">
        <Suspense fallback={<AuthCodeErrorFallback />}>
          <AuthCodeErrorContent />
        </Suspense>
      </div>
    </div>
  );
}