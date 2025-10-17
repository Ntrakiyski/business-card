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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.map((service) => {
                // Check if the icon is an emoji (not in the iconMap)
                const isEmoji = service.icon && !iconMap[service.icon];
                // If it's an emoji, render it as text; otherwise, use the icon component
                const IconComponent = !isEmoji && service.icon && iconMap[service.icon] 
                  ? iconMap[service.icon] 
                  : iconMap['default'];
                
                return (
                  <div 
                    key={service.id}
                    className="flex flex-col items-center text-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      {isEmoji ? (
                        <span className="text-xl">{service.icon}</span>
                      ) : (
                        <IconComponent className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{service.title}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-600">
                        {service.description}
                      </p>
                    )}
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
