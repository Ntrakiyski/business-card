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
import { createCard, updateCard } from '@/app/actions/cards';
import { 
  User, Phone, Upload, X,
  FileText, Link as LinkIcon, Share2, Wrench, Map as MapIcon 
} from 'lucide-react';
import { Database } from '@/lib/database.types';
import Image from 'next/image';

type Profile = Database['public']['Tables']['profiles']['Row'];
type WidgetSettings = Database['public']['Tables']['widget_settings']['Row'];

interface CardEditorFormProps {
  isEditMode?: boolean;
  profile?: Profile;
  widgetSettings?: WidgetSettings[];
}

export function CardEditorForm({ isEditMode = false, profile, widgetSettings }: CardEditorFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
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
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
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

  // Load data on mount
  useEffect(() => {
    if (isEditMode && profile) {
      // Pre-populate form with existing profile data
      // @ts-expect-error - Database types not yet updated
      setCardName(profile.card_name || 'My Card');
      setUsername(profile.username);
      // @ts-expect-error - Database types not yet updated
      setIsPublic(profile.is_public ?? true);
      // @ts-expect-error - Database types not yet updated
      setIsPrimary(profile.is_primary ?? false);
      setDisplayName(profile.display_name || '');
      setJobTitle(profile.job_title || '');
      setCompany(profile.company || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setWebsite(profile.website || '');
      setAddress(profile.address || '');
      setProfileImageUrl(profile.profile_image_url || '');
      setImagePreview(profile.profile_image_url || null);
      
      // Load widget settings
      if (widgetSettings && widgetSettings.length > 0) {
        const widgetMap: Record<string, boolean> = {};
        widgetSettings.forEach(ws => {
          widgetMap[ws.widget_type] = ws.enabled;
        });
        setWidgets(prev => ({ ...prev, ...widgetMap }));
      }
    } else {
      // Load LinkedIn data from session storage for new cards
      const storedLinkedinUsername = sessionStorage.getItem('linkedinUsername');
      if (storedLinkedinUsername) {
        setUsername(storedLinkedinUsername);
      }
    }
  }, [isEditMode, profile, widgetSettings]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // In a real app, you would upload to Supabase Storage here
      // For now, we'll just use the preview URL
      // TODO: Implement actual file upload to Supabase Storage
      toast.info('Image selected. Note: Image upload to storage not yet implemented.');
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setProfileImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      const formData = new FormData();
      
      // Add profile_id for edit mode
      if (isEditMode && profile) {
        formData.append('profile_id', profile.id);
      }
      
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
      formData.append('profile_image_url', profileImageUrl);
      formData.append('enabledWidgets', JSON.stringify(widgets));

      const result = isEditMode 
        ? await updateCard(formData) 
        : await createCard(formData);

      if (result.success && result.data) {
        toast.success(isEditMode ? 'Card updated successfully!' : 'Card created successfully!');
        
        if (!isEditMode) {
          // Clear session storage only for new cards
          sessionStorage.removeItem('linkedinUrl');
          sessionStorage.removeItem('linkedinUsername');
        }
        
        // Redirect to the card
        router.push(`/${result.data.username}`);
      } else {
        toast.error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} card`);
        
        // Set field-specific errors if available
        if ('fieldErrors' in result && result.fieldErrors) {
          // @ts-expect-error - Type mismatch from server action
          setFieldErrors(result.fieldErrors);
        }
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Create'} card error:`, error);
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };
  
  const clearFieldError = (field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
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
                onChange={(e) => {
                  setCardName(e.target.value);
                  clearFieldError('card_name');
                }}
                placeholder="My Professional Card"
                required
                className={fieldErrors['card_name'] ? 'border-red-500' : ''}
              />
              {fieldErrors['card_name'] && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors['card_name']}</p>
              )}
              {!fieldErrors['card_name'] && (
                <p className="text-xs text-gray-500 mt-1">For your reference only</p>
              )}
            </div>
            <div>
              <Label htmlFor="username">Username * </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  clearFieldError('username');
                }}
                placeholder="johndoe"
                required
                className={fieldErrors['username'] ? 'border-red-500' : ''}
              />
              {fieldErrors['username'] && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors['username']}</p>
              )}
              {!fieldErrors['username'] && (
                <p className="text-xs text-gray-500 mt-1">Your card URL: /username</p>
              )}
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
            
            {/* Profile Image Upload */}
            <div className="mb-6">
              <Label>Profile Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                    <label htmlFor="profile_image" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Upload Image</span>
                      </div>
                      <input
                        id="profile_image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Recommended: Square image, at least 400x400px</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="display_name">Full Name</Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    clearFieldError('display_name');
                  }}
                  placeholder="John Doe"
                  className={fieldErrors['display_name'] ? 'border-red-500' : ''}
                />
                {fieldErrors['display_name'] && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors['display_name']}</p>
                )}
              </div>
              <div>
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    clearFieldError('job_title');
                  }}
                  placeholder="Senior Software Engineer"
                  className={fieldErrors['job_title'] ? 'border-red-500' : ''}
                />
                {fieldErrors['job_title'] && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors['job_title']}</p>
                )}
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    clearFieldError('company');
                  }}
                  placeholder="Tech Corp"
                  className={fieldErrors['company'] ? 'border-red-500' : ''}
                />
                {fieldErrors['company'] && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors['company']}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    clearFieldError('location');
                  }}
                  placeholder="San Francisco, CA"
                  className={fieldErrors['location'] ? 'border-red-500' : ''}
                />
                {fieldErrors['location'] && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors['location']}</p>
                )}
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
                onChange={(e) => {
                  setBio(e.target.value);
                  clearFieldError('bio');
                }}
                placeholder="Tell people about yourself, your experience, and what you do..."
                rows={5}
                className={fieldErrors['bio'] ? 'border-red-500' : ''}
              />
              {fieldErrors['bio'] && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors['bio']}</p>
              )}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  placeholder="john@example.com"
                  className={fieldErrors['email'] ? 'border-red-500' : ''}
                />
                {fieldErrors['email'] && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors['email']}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFieldError('phone');
                  }}
                  placeholder="+1 (555) 123-4567"
                  className={fieldErrors['phone'] ? 'border-red-500' : ''}
                />
                {fieldErrors['phone'] && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors['phone']}</p>
                )}
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    clearFieldError('website');
                  }}
                  placeholder="https://yourwebsite.com"
                  className={fieldErrors['website'] ? 'border-red-500' : ''}
                />
                {fieldErrors['website'] && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors['website']}</p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearFieldError('address');
                  }}
                  placeholder="123 Main St, City, State"
                  className={fieldErrors['address'] ? 'border-red-500' : ''}
                />
                {fieldErrors['address'] && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors['address']}</p>
                )}
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
            onClick={() => router.push(isEditMode ? `/${profile?.username}` : '/home')}
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
            {isLoading 
              ? (isEditMode ? 'Saving Changes...' : 'Creating Card...') 
              : (isEditMode ? 'Save Changes' : 'Create Card')
            }
          </Button>
        </div>
      </div>
    </form>
  );
}
