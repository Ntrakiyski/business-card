import { Card } from '@/components/ui/card';
import { Database } from '@/lib/database.types';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

type CustomLink = Database['public']['Tables']['custom_links']['Row'];

interface LinksWidgetProps {
  links: CustomLink[];
}

export function LinksWidget({ links }: LinksWidgetProps) {
  if (!links || links.length === 0) return null;

  return (
    <Card className="w-full p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Links</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-64 snap-start"
          >
            <div className="group relative overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              {/* Image */}
              {link.image_url && (
                <div className="relative w-full h-36 bg-gray-100">
                  <Image
                    src={link.image_url}
                    alt={link.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="p-4 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">
                    {link.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}

