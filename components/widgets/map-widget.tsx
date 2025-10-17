'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import { MapPin, ExternalLink, Edit3 } from 'lucide-react';
import { WidgetEditDrawer } from '@/components/edit/widget-edit-drawer';
import 'leaflet/dist/leaflet.css';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MapWidgetProps {
  profile: Profile;
  editable?: boolean;
}

// Type definitions for Leaflet components
interface LeafletIcon {
  Default: {
    prototype: Record<string, unknown>;
    mergeOptions: (options: Record<string, string>) => void;
  };
}

interface LeafletModule {
  Icon: LeafletIcon;
}

interface MapContainerProps {
  center: [number, number];
  zoom: number;
  style: React.CSSProperties;
  scrollWheelZoom: boolean;
  children?: React.ReactNode;
}

interface TileLayerProps {
  attribution: string;
  url: string;
}

interface MarkerProps {
  position: [number, number];
  children?: React.ReactNode;
}

interface PopupProps {
  children?: React.ReactNode;
}

interface LeafletComponents {
  MapContainer: React.ComponentType<MapContainerProps>;
  TileLayer: React.ComponentType<TileLayerProps>;
  Marker: React.ComponentType<MarkerProps>;
  Popup: React.ComponentType<PopupProps>;
}

export function MapWidget({ profile, editable = false }: MapWidgetProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [LeafletComponents, setLeafletComponents] = useState<LeafletComponents | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Run useEffect on mount to set up client-side only
  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import Leaflet components only on the client
    const loadLeaflet = async () => {
      const [leafletComponents, leaflet] = await Promise.all([
        import('react-leaflet'),
        import('leaflet'),
      ]);
      
      const leafletModule = leaflet as unknown as LeafletModule;
      
      // Fix for default marker icons in Leaflet with Next.js
      delete (leafletModule.Icon.Default.prototype as Record<string, unknown> & { _getIconUrl?: string })._getIconUrl;
      leafletModule.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      
      setLeafletComponents(leafletComponents as unknown as LeafletComponents);
    };
    
    loadLeaflet();
  }, []);

  const hasLocation = profile.address && profile.latitude && profile.longitude;
  
  if (!hasLocation && !editable) return null;

  // Google Maps URL as fallback or for external navigation
  const mapsUrl = hasLocation 
    ? `https://www.google.com/maps/search/?api=1&query=${profile.latitude},${profile.longitude}`
    : '';

  const MapDisplay = () => {
    if (!isClient || !LeafletComponents) {
      // Fallback for SSR or while loading
      return (
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
      );
    }
    
    const { MapContainer, TileLayer, Marker, Popup } = LeafletComponents;

    return (
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-3">
        <MapContainer
          center={[Number(profile.latitude), Number(profile.longitude)]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[Number(profile.latitude), Number(profile.longitude)]}>
            <Popup>{profile.address}</Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  };

  return (
    <>
      <Card className="w-full p-8 relative">
        {editable && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8"
            onClick={() => setIsEditDrawerOpen(true)}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
        
        <div className="pt-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          
          {hasLocation ? (
            <>
              {/* Address */}
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{profile.address}</p>
              </div>
              
              {/* Interactive Map */}
              <MapDisplay />
              
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
            </>
          ) : (
            <p className="text-gray-500 italic">
              No location added yet. Click the edit button to add location information.
            </p>
          )}
        </div>
      </Card>
      
      {editable && (
        <WidgetEditDrawer
          widgetType="map"
          profile={profile}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}
    </>
  );
}
