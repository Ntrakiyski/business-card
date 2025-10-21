'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { createCard, updateCard } from '@/app/actions/cards';
import { cardFormSchema, type CardFormData } from '@/lib/validations/card';
import Image from 'next/image';
import { 
  User, Phone,
  FileText, Link as LinkIcon, Share2, Wrench, Map as MapIcon 
} from 'lucide-react';
import { Database } from '@/lib/database.types';

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

  // Form with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      card_name: 'My Card',
      username: '',
      is_public: true,
      is_primary: false,
      display_name: '',
      job_title: '',
      company: '',
      location: '',
      bio: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      profile_image_url: '',
    },
  });

  const profileImageUrl = watch('profile_image_url');
  const isPublic = watch('is_public');
  const isPrimary = watch('is_primary');

  // Load data on mount
  useEffect(() => {
    if (isEditMode && profile) {
      // Pre-populate form with existing profile data
      reset({
        // @ts-expect-error - Database types not yet updated
        card_name: profile.card_name || 'My Card',
        username: profile.username,
        // @ts-expect-error - Database types not yet updated
        is_public: profile.is_public ?? true,
        // @ts-expect-error - Database types not yet updated
        is_primary: profile.is_primary ?? false,
        display_name: profile.display_name || '',
        job_title: profile.job_title || '',
        company: profile.company || '',
        location: profile.location || '',
        bio: profile.bio || '',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        address: profile.address || '',
        profile_image_url: profile.profile_image_url || '',
      });
      
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
        setValue('username', storedLinkedinUsername);
      }
    }
  }, [isEditMode, profile, widgetSettings, reset, setValue]);

  const onSubmit = async (data: CardFormData) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      
      // Add profile_id for edit mode
      if (isEditMode && profile) {
        formData.append('profile_id', profile.id);
      }
      
      formData.append('card_name', data.card_name);
      formData.append('username', data.username);
      formData.append('is_public', data.is_public.toString());
      formData.append('is_primary', data.is_primary.toString());
      formData.append('display_name', data.display_name || '');
      formData.append('job_title', data.job_title || '');
      formData.append('company', data.company || '');
      formData.append('location', data.location || '');
      formData.append('bio', data.bio || '');
      formData.append('email', data.email || '');
      formData.append('phone', data.phone || '');
      formData.append('website', data.website || '');
      formData.append('address', data.address || '');
      formData.append('profile_image_url', data.profile_image_url || '');
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
        if (result.errors) {
          // Display field-specific errors
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach(msg => toast.error(`${field}: ${msg}`));
            }
          });
        } else {
          toast.error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} card`);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Create'} card error:`, error);
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const toggleWidget = (widget: keyof typeof widgets) => {
    setWidgets(prev => ({ ...prev, [widget]: !prev[widget] }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                {...register('card_name')}
                placeholder="My Professional Card"
              />
              {errors.card_name && (
                <p className="text-red-500 text-sm mt-1">{errors.card_name.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">For your reference only</p>
            </div>
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                {...register('username')}
                placeholder="johndoe"
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setValue('username', value);
                }}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
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
                onCheckedChange={(checked) => setValue('is_public', checked)}
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
                onCheckedChange={(checked) => setValue('is_primary', checked)}
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
            <div className="space-y-6">
              {/* Profile Image URL */}
              <div>
                <Label htmlFor="profile_image_url">Profile Image URL</Label>
                <Input
                  id="profile_image_url"
                  {...register('profile_image_url')}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.profile_image_url && (
                  <p className="text-red-500 text-sm mt-1">{errors.profile_image_url.message}</p>
                )}
                
                {/* Image Preview */}
                {profileImageUrl && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={profileImageUrl}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="display_name">Full Name</Label>
                  <Input
                    id="display_name"
                    {...register('display_name')}
                    placeholder="John Doe"
                  />
                  {errors.display_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.display_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    {...register('job_title')}
                    placeholder="Senior Software Engineer"
                  />
                  {errors.job_title && (
                    <p className="text-red-500 text-sm mt-1">{errors.job_title.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="Tech Corp"
                  />
                  {errors.company && (
                    <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="San Francisco, CA"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                  )}
                </div>
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
                {...register('bio')}
                placeholder="Tell people about yourself, your experience, and what you do..."
                rows={5}
              />
              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
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
                  {...register('email')}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  {...register('website')}
                  placeholder="https://yourwebsite.com"
                />
                {errors.website && (
                  <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="123 Main St, City, State"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
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

