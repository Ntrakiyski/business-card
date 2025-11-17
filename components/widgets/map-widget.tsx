'use client';

import { Card } from '@/components/ui/card';
import { Database } from '@/lib/database.types';
import { MapPin, ExternalLink } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MapWidgetProps {
  profile: Profile;
}

export function MapWidget({ profile }: MapWidgetProps) {
  const hasLocation = profile.address && profile.latitude && profile.longitude;
  
  if (!hasLocation) return null;

  // Google Maps URL
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${profile.latitude},${profile.longitude}`;

  return (
    <Card className="w-full p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
      
      {/* Address */}
      <div className="flex items-start gap-3 mb-4">
        <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <p className="text-gray-700">{profile.address}</p>
      </div>
      
      {/* Static Map Preview */}
      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${profile.latitude},${profile.longitude}&zoom=15`}
        />
      </div>
      
      {/* Open in Maps Button */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        <span>Open in Maps</span>
        <ExternalLink className="w-4 h-4" />
      </a>
    </Card>
  );
}

