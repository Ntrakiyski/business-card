'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Database } from '@/lib/database.types';
import { Trash2, Plus } from 'lucide-react';
import { createService, updateService, deleteService } from '@/app/actions/widgets';

type Service = Database['public']['Tables']['services']['Row'];

interface ServicesWidgetEditFormProps {
  services: Service[];
  profileId: string;
  onClose: () => void;
}

export function ServicesWidgetEditForm({ services, profileId, onClose }: ServicesWidgetEditFormProps) {
  const [loading, setLoading] = useState(false);
  // Define a type for editing services that properly handles bullets as string array
  type EditableService = Omit<Service, 'bullets'> & { 
    bullets: string[] | null;
  };

  const [editServices, setEditServices] = useState<EditableService[]>(services.map(service => ({
    ...service,
    bullets: Array.isArray(service.bullets) ? 
      service.bullets.map(bullet => typeof bullet === 'string' ? bullet : '') 
      : null
  })));
  const [newService, setNewService] = useState({ 
    title: '', 
    description: '', 
    icon: '', 
    bullets: ['', '', ''],
    enabled: true,
    order: services.length 
  });

  const handleAddService = async () => {
    if (!newService.title) {
      toast.error('Please fill in the service title');
      return;
    }

    setLoading(true);
    const result = await createService({
      profile_id: profileId,
      title: newService.title,
      description: newService.description || null,
      icon: newService.icon || null,
      bullets: newService.bullets || null,
      enabled: newService.enabled,
      order: newService.order,
    });

    if (result.success) {
      toast.success('Service added successfully!');
      setNewService({ title: '', description: '', icon: '', bullets: ['', '', ''], enabled: true, order: services.length + 1 });
      // Refresh the page to show the new service
      window.location.reload();
    } else {
      toast.error(result.error || 'Failed to add service');
    }
    setLoading(false);
  };

  const handleUpdateService = async (service: Service) => {
    setLoading(true);
    const result = await updateService(service.id, {
      title: service.title,
      description: service.description,
      icon: service.icon,
      bullets: service.bullets,
      enabled: service.enabled,
      order: service.order,
    });

    if (result.success) {
      toast.success('Service updated successfully!');
    } else {
      toast.error(result.error || 'Failed to update service');
    }
    setLoading(false);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setLoading(true);
    const result = await deleteService(id);

    if (result.success) {
      toast.success('Service deleted successfully!');
      setEditServices(editServices.filter(s => s.id !== id));
    } else {
      toast.error(result.error || 'Failed to delete service');
    }
    setLoading(false);
  };

  const updateEditService = (id: string, field: keyof Service, value: string | boolean | number | null | string[]) => {
    setEditServices(editServices.map(service =>
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  return (
    <div className="space-y-4">
      {/* Existing Services */}
      <div className="space-y-3">
        {editServices.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={service.title}
                      onChange={(e) => updateEditService(service.id, 'title', e.target.value)}
                      placeholder="Service title"
                    />
                  </div>

                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={service.description || ''}
                      onChange={(e) => updateEditService(service.id, 'description', e.target.value)}
                      placeholder="Service description..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bullet Points</Label>
                    <div className="space-y-2">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500 w-6">•</span>
                          <Input
                            value={service.bullets?.[i] || ''}
                            onChange={(e) => {
                              const newBullets = [...(service.bullets || ['', '', ''])];
                              newBullets[i] = e.target.value;
                              updateEditService(service.id, 'bullets', newBullets);
                            }}
                            placeholder={`Bullet point ${i + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Icon Emoji (optional)</Label>
                    <Input
                      value={service.icon || ''}
                      onChange={(e) => updateEditService(service.id, 'icon', e.target.value)}
                      placeholder="🚀 (emoji)"
                      maxLength={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor={`enabled-${service.id}`}>Enabled</Label>
                    <Switch
                      id={`enabled-${service.id}`}
                      checked={service.enabled}
                      onCheckedChange={(checked) => updateEditService(service.id, 'enabled', checked)}
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleUpdateService(service)}
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
                  onClick={() => handleDeleteService(service.id)}
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

      {/* Add New Service */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Service
          </h3>

          <div>
            <Label>Title</Label>
            <Input
              value={newService.title}
              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              placeholder="Service title"
            />
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              placeholder="Service description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Bullet Points</Label>
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-6">•</span>
                  <Input
                    value={newService.bullets?.[i] || ''}
                    onChange={(e) => {
                      const newBullets = [...(newService.bullets || ['', '', ''])];
                      newBullets[i] = e.target.value;
                      setNewService({ ...newService, bullets: newBullets });
                    }}
                    placeholder={`Bullet point ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Icon Emoji (optional)</Label>
            <Input
              value={newService.icon}
              onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
              placeholder="🚀 (emoji)"
              maxLength={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="new-enabled">Enabled</Label>
            <Switch
              id="new-enabled"
              checked={newService.enabled}
              onCheckedChange={(checked) => setNewService({ ...newService, enabled: checked })}
            />
          </div>

          <Button
            type="button"
            onClick={handleAddService}
            disabled={loading || !newService.title}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
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

