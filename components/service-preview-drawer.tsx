'use client';

import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import { Briefcase, Code, Cpu, Zap } from 'lucide-react';

type Service = Database['public']['Tables']['services']['Row'];

interface ServicePreviewDrawerProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  default: Briefcase,
  automation: Zap,
  ai: Cpu,
  code: Code,
  web: Code,
};

export function ServicePreviewDrawer({ service, open, onOpenChange }: ServicePreviewDrawerProps) {
  if (!service) return null;

  // Check if the icon is an emoji
  const isEmoji = service.icon && !iconMap[service.icon];
  const IconComponent = !isEmoji && service.icon && iconMap[service.icon] 
    ? iconMap[service.icon] 
    : iconMap['default'];

  // Use bullet points from the bullets column if available, otherwise fallback to description
  let bulletPoints: string[] = [];
  
  if (service.bullets && Array.isArray(service.bullets)) {
    bulletPoints = service.bullets.map(bullet => String(bullet)).filter(Boolean);
  } else if (service.description) {
    try {
      // Try parsing as JSON array first
      const parsed = JSON.parse(service.description);
      if (Array.isArray(parsed)) {
        bulletPoints = parsed;
      }
    } catch {
      // If not JSON, split by bullet points or newlines
      bulletPoints = service.description
        .split(/[•\n]/)
        .map(point => point.trim())
        .filter(point => point.length > 0)
        .slice(0, 3); // Only take first 3
    }
  }

  // Ensure we always have exactly 3 bullet points
  while (bulletPoints.length < 3) {
    bulletPoints.push('');
  }
  bulletPoints = bulletPoints.slice(0, 3);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {isEmoji ? (
                  <span className="text-3xl">{service.icon}</span>
                ) : (
                  <IconComponent className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <DrawerTitle className="text-left">{service.title}</DrawerTitle>
                <DrawerDescription className="text-left">Service Details</DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="px-4 pb-4">
            <ul className="space-y-4">
              {bulletPoints.map((point, index) => (
                point && (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-black mt-2">
                    </span>
                    <span className="text-gray-700 flex-1">{point}</span>
                  </li>
                )
              ))}
            </ul>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
