'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { createCard } from '@/app/actions/cards';
import { 
  User, Phone,
  FileText, Link as LinkIcon, Share2, Wrench, Map as MapIcon 
} from 'lucide-react';

export function CardEditorForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [cardName, setCardName] = useState('My Card');
  const [username, setUsername] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isPrimary, setIsPrimary] = useState(false);
  
  // Profile data
  const [displayName, setDisplayName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  
  // Widget toggles
  const [widgets, setWidgets] = useState({
    profile: true,
    bio: true,
    links: true,
    social: true,
    services: true,
    contact: true,
    map: true,
  });

  // Load LinkedIn data from session storage
  useEffect(() => {
    const storedLinkedinUsername = sessionStorage.getItem('linkedinUsername');
    if (storedLinkedinUsername) {
      setUsername(storedLinkedinUsername);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('card_name', cardName);
      formData.append('username', username);
      formData.append('is_public', isPublic.toString());
      formData.append('is_primary', isPrimary.toString());
      formData.append('display_name', displayName);
      formData.append('job_title', jobTitle);
      formData.append('company', company);
      formData.append('location', location);
      formData.append('bio', bio);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('website', website);
      formData.append('address', address);
      formData.append('enabledWidgets', JSON.stringify(widgets));

      const result = await createCard(formData);

      if (result.success && result.data) {
        toast.success('Card created successfully!');
        
        // Clear session storage
        sessionStorage.removeItem('linkedinUrl');
        sessionStorage.removeItem('linkedinUsername');
        
        // Redirect to the new card
        router.push(`/${result.data.username}`);
      } else {
        toast.error(result.error || 'Failed to create card');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Create card error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const toggleWidget = (widget: keyof typeof widgets) => {
    setWidgets(prev => ({ ...prev, [widget]: !prev[widget] }));
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Sidebar - Widget Toggles */}
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-6">
          <h3 className="font-semibold text-gray-900 mb-4">Widgets</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enable or disable sections
          </p>
          <div className="space-y-4">
            {[
              { key: 'profile' as const, label: 'Profile', icon: User },
              { key: 'bio' as const, label: 'Bio', icon: FileText },
              { key: 'links' as const, label: 'Links', icon: LinkIcon },
              { key: 'social' as const, label: 'Social', icon: Share2 },
              { key: 'services' as const, label: 'Services', icon: Wrench },
              { key: 'contact' as const, label: 'Contact', icon: Phone },
              { key: 'map' as const, label: 'Map', icon: MapIcon },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <Switch
                  checked={widgets[key]}
                  onCheckedChange={() => toggleWidget(key)}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Form */}
      <div className="lg:col-span-3 space-y-8">
        {/* Card Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Card Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="card_name">Card Name *</Label>
              <Input
                id="card_name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="My Professional Card"
                required
              />
              <p className="text-xs text-gray-500 mt-1">For your reference only</p>
            </div>
            <div>
              <Label htmlFor="username">Username * </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="johndoe"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Your card URL: /username</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_public">Public Card</Label>
                <p className="text-xs text-gray-500">Show in directory</p>
              </div>
              <Switch
                id="is_public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_primary">Primary Card</Label>
                <p className="text-xs text-gray-500">Your default card</p>
              </div>
              <Switch
                id="is_primary"
                checked={isPrimary}
                onCheckedChange={setIsPrimary}
              />
            </div>
          </div>
        </Card>

        {/* Profile Section */}
        {widgets.profile && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="display_name">Full Name</Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Senior Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Tech Corp"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Bio Section */}
        {widgets.bio && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Bio</h3>
            </div>
            <div>
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself, your experience, and what you do..."
                rows={5}
              />
            </div>
          </Card>
        )}

        {/* Contact Section */}
        {widgets.contact && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Phone className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Info Cards for other widgets */}
        {widgets.links && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Custom Links</h3>
            </div>
            <p className="text-sm text-gray-600">
              You can add custom links after creating your card from the edit screen.
            </p>
          </Card>
        )}

        {widgets.social && (
          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>
            </div>
            <p className="text-sm text-gray-600">
              You can add social media links after creating your card from the edit screen.
            </p>
          </Card>
        )}

        {widgets.services && (
          <Card className="p-6 bg-orange-50 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Services</h3>
            </div>
            <p className="text-sm text-gray-600">
              You can add your services and skills after creating your card from the edit screen.
            </p>
          </Card>
        )}

        {widgets.map && (
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <MapIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Location Map</h3>
            </div>
            <p className="text-sm text-gray-600">
              You can set your location coordinates after creating your card from the edit screen.
            </p>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/home')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? 'Creating Card...' : 'Create Card'}
          </Button>
        </div>
      </div>
    </form>
  );
}
