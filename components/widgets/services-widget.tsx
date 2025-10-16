'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import { Briefcase, Code, Cpu, Zap, Edit3 } from 'lucide-react';
import { WidgetEditDrawer } from '@/components/edit/widget-edit-drawer';

type Service = Database['public']['Tables']['services']['Row'];

interface ServicesWidgetProps {
  services: Service[];
  editable?: boolean;
  profileId?: string;
}

// Default icon mapping for common service types
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  default: Briefcase,
  automation: Zap,
  ai: Cpu,
  code: Code,
  web: Code,
};

export function ServicesWidget({ services, editable = false, profileId }: ServicesWidgetProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  if ((!services || services.length === 0) && !editable) return null;

  return (
    <>
      <Card className="w-full p-6 relative">
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
          
          {services && services.length > 0 ? (
            <div className="space-y-3">
              {services.map((service) => {
                // Try to get icon from iconMap, default to Briefcase
                const IconComponent = iconMap[service.icon || 'default'] || Briefcase;
                
                return (
                  <div 
                    key={service.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{service.title}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No services added yet. Click the edit button to add services.
            </p>
          )}
        </div>
      </Card>
      
      {editable && profileId && (
        <WidgetEditDrawer
          widgetType="services"
          profile={{ id: profileId }}
          services={services}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}
    </>
  );
}
