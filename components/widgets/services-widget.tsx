import { Card } from '@/components/ui/card';
import { Database } from '@/lib/database.types';
import { Briefcase, Code, Cpu, Zap } from 'lucide-react';

type Service = Database['public']['Tables']['services']['Row'];

interface ServicesWidgetProps {
  services: Service[];
}

// Default icon mapping for common service types
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  default: Briefcase,
  automation: Zap,
  ai: Cpu,
  code: Code,
  web: Code,
};

export function ServicesWidget({ services }: ServicesWidgetProps) {
  if (!services || services.length === 0) return null;

  return (
    <Card className="w-full p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
      
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
    </Card>
  );
}
