'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Database } from '@/lib/database.types';
import { Trash2, Plus } from 'lucide-react';
import { createSocialLink, updateSocialLink, deleteSocialLink } from '@/app/actions/widgets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SocialLink = Database['public']['Tables']['social_links']['Row'];

interface SocialWidgetEditFormProps {
  links: SocialLink[];
  profileId: string;
  onClose: () => void;
}

const SOCIAL_PLATFORMS = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'behance', label: 'Behance' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'website', label: 'Website' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export function SocialWidgetEditForm({ links, profileId, onClose }: SocialWidgetEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [editLinks, setEditLinks] = useState<SocialLink[]>(links);
  const [newLink, setNewLink] = useState({ platform: '', url: '', enabled: true });

  const handleAddLink = async () => {
    if (!newLink.platform || !newLink.url) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await createSocialLink({
      profile_id: profileId,
      platform: newLink.platform,
      url: newLink.url,
      enabled: newLink.enabled,
    });

    if (result.success) {
      toast.success('Social link added successfully!');
      setNewLink({ platform: '', url: '', enabled: true });
      // Refresh the page to show the new link
      window.location.reload();
    } else {
      toast.error(result.error || 'Failed to add social link');
    }
    setLoading(false);
  };

  const handleUpdateLink = async (link: SocialLink) => {
    setLoading(true);
    const result = await updateSocialLink(link.id, {
      platform: link.platform,
      url: link.url,
      enabled: link.enabled,
    });

    if (result.success) {
      toast.success('Social link updated successfully!');
    } else {
      toast.error(result.error || 'Failed to update social link');
    }
    setLoading(false);
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) return;

    setLoading(true);
    const result = await deleteSocialLink(id);

    if (result.success) {
      toast.success('Social link deleted successfully!');
      setEditLinks(editLinks.filter(l => l.id !== id));
    } else {
      toast.error(result.error || 'Failed to delete social link');
    }
    setLoading(false);
  };

  const updateEditLink = (id: string, field: keyof SocialLink, value: string | boolean) => {
    setEditLinks(editLinks.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  return (
    <div className="space-y-4">
      {/* Existing Links */}
      <div className="space-y-3">
        {editLinks.map((link) => (
          <Card key={link.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <div>
                    <Label>Platform</Label>
                    <Select
                      value={link.platform}
                      onValueChange={(value) => updateEditLink(link.id, 'platform', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SOCIAL_PLATFORMS.map(platform => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>URL</Label>
                    <Input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateEditLink(link.id, 'url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleUpdateLink(link)}
                    disabled={loading}
                    className="w-full"
                  >
                    Save Changes
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteLink(link.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Link */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Social Link
          </h3>

          <div>
            <Label>Platform</Label>
            <Select
              value={newLink.platform}
              onValueChange={(value) => setNewLink({ ...newLink, platform: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {SOCIAL_PLATFORMS.map(platform => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>URL</Label>
            <Input
              type="url"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <Button
            type="button"
            onClick={handleAddLink}
            disabled={loading || !newLink.platform || !newLink.url}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Social Link
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Close
        </Button>
      </div>
    </div>
  );
}
