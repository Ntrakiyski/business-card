'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout API directly with fetch
        const response = await fetch('/api/auth/logout', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok || response.redirected) {
          // Wait a moment for cookies to clear, then redirect
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 100);
        } else {
          setError('Failed to log out. Please try again.');
        }
      } catch (err) {
        console.error('Logout error:', err);
        setError('An error occurred. Please try again.');
      }
    };

    performLogout();

    // Fallback timeout - force redirect after 5 seconds
    const timeout = setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.href = '/'} 
              className="text-blue-600 underline"
            >
              Return to home
            </button>
          </>
        ) : (
          <p>Logging out...</p>
        )}
      </div>
    </div>
  );
}
