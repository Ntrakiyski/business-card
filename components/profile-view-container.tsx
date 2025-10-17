'use client';

import { useState } from 'react';
import { QrCode, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileViewContainerProps {
  children: React.ReactNode;
  profile: Profile;
}

export function ProfileViewContainer({ children, profile }: Omit<ProfileViewContainerProps, 'isOwner'>) {
  const [showQR, setShowQR] = useState(false);

  const qrUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="relative">
      {/* Toggle Button - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowQR(!showQR)}
          className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
        >
          {showQR ? (
            <User className="h-5 w-5" />
          ) : (
            <QrCode className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Content */}
      {showQR ? (
        <div className="flex items-center justify-center py-12 px-6">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.display_name || profile.username}
                </h2>
                {profile.job_title && (
                  <p className="text-sm text-gray-600">{profile.job_title}</p>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg border-2 border-gray-100 flex justify-center">
                <QRCodeSVG
                  value={qrUrl}
                  size={280}
                  level="H"
                  includeMargin
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Scan to save contact
                </p>
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="block text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
                  >
                    📞 {profile.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

