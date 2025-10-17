'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Database } from '@/lib/database.types';
import { Trash2, Plus } from 'lucide-react';
import { createCustomLink, updateCustomLink, deleteCustomLink } from '@/app/actions/widgets';

type CustomLink = Database['public']['Tables']['custom_links']['Row'];

interface LinksWidgetEditFormProps {
  links: CustomLink[];
  profileId: string;
  onClose: () => void;
}

export function LinksWidgetEditForm({ links, profileId, onClose }: LinksWidgetEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [editLinks, setEditLinks] = useState<CustomLink[]>(links);
  const [newLink, setNewLink] = useState({ 
    title: '', 
    url: '', 
    image_url: '', 
    enabled: true,
    order: links.length 
  });

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      toast.error('Please fill in title and URL');
      return;
    }

    setLoading(true);
    const result = await createCustomLink({
      profile_id: profileId,
      title: newLink.title,
      url: newLink.url,
      image_url: newLink.image_url || null,
      enabled: newLink.enabled,
      order: newLink.order,
    });

    if (result.success) {
      toast.success('Featured link added successfully!');
      setNewLink({ title: '', url: '', image_url: '', enabled: true, order: links.length + 1 });
      // Refresh the page to show the new link
      window.location.reload();
    } else {
      toast.error(result.error || 'Failed to add featured link');
    }
    setLoading(false);
  };

  const handleUpdateLink = async (link: CustomLink) => {
    setLoading(true);
    const result = await updateCustomLink(link.id, {
      title: link.title,
      url: link.url,
      image_url: link.image_url,
      enabled: link.enabled,
      order: link.order,
    });

    if (result.success) {
      toast.success('Featured link updated successfully!');
    } else {
      toast.error(result.error || 'Failed to update featured link');
    }
    setLoading(false);
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this featured link?')) return;

    setLoading(true);
    const result = await deleteCustomLink(id);

    if (result.success) {
      toast.success('Featured link deleted successfully!');
      setEditLinks(editLinks.filter(l => l.id !== id));
    } else {
      toast.error(result.error || 'Failed to delete featured link');
    }
    setLoading(false);
  };

  const updateEditLink = (id: string, field: keyof CustomLink, value: string | boolean | number) => {
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
                    <Label>Title</Label>
                    <Input
                      value={link.title}
                      onChange={(e) => updateEditLink(link.id, 'title', e.target.value)}
                      placeholder="Link title"
                    />
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

                  <div>
                    <Label>Image URL (optional)</Label>
                    <Input
                      type="url"
                      value={link.image_url || ''}
                      onChange={(e) => updateEditLink(link.id, 'image_url', e.target.value)}
                      placeholder="https://... (optional)"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor={`enabled-${link.id}`}>Enabled</Label>
                    <Switch
                      id={`enabled-${link.id}`}
                      checked={link.enabled}
                      onCheckedChange={(checked) => updateEditLink(link.id, 'enabled', checked)}
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
            Add New Featured Link
          </h3>

          <div>
            <Label>Title</Label>
            <Input
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              placeholder="Link title"
            />
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

          <div>
            <Label>Image URL (optional)</Label>
            <Input
              type="url"
              value={newLink.image_url}
              onChange={(e) => setNewLink({ ...newLink, image_url: e.target.value })}
              placeholder="https://... (optional)"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="new-enabled">Enabled</Label>
            <Switch
              id="new-enabled"
              checked={newLink.enabled}
              onCheckedChange={(checked) => setNewLink({ ...newLink, enabled: checked })}
            />
          </div>

          <Button
            type="button"
            onClick={handleAddLink}
            disabled={loading || !newLink.title || !newLink.url}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Featured Link
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

