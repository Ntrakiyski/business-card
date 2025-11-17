import { Card } from '@/components/ui/card';
import { Database } from '@/lib/database.types';
import { Mail, Phone, Globe, MapPin } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ContactWidgetProps {
  profile: Profile;
}

export function ContactWidget({ profile }: ContactWidgetProps) {
  const hasContactInfo = profile.phone || profile.email || profile.website || profile.address;
  
  if (!hasContactInfo) return null;

  return (
    <Card className="w-full p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
      
      <div className="space-y-3">
        {/* Phone */}
        {profile.phone && (
          <a
            href={`tel:${profile.phone}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Mobile</p>
              <p className="font-medium text-gray-900">{profile.phone}</p>
            </div>
          </a>
        )}
        
        {/* Email */}
        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900 truncate">{profile.email}</p>
            </div>
          </a>
        )}
        
        {/* Website */}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Website</p>
              <p className="font-medium text-gray-900 truncate">{profile.website}</p>
            </div>
          </a>
        )}
        
        {/* Address */}
        {profile.address && (
          <div className="flex items-center gap-3 p-3 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-gray-900">{profile.address}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

