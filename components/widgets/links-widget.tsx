'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import { ExternalLink, Edit3 } from 'lucide-react';
import { WidgetEditDrawer } from '@/components/edit/widget-edit-drawer';

type CustomLink = Database['public']['Tables']['custom_links']['Row'];

interface LinksWidgetProps {
  links: CustomLink[];
  editable?: boolean;
  profileId?: string;
}

export function LinksWidget({ links, editable = false, profileId }: LinksWidgetProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  if ((!links || links.length === 0) && !editable) return null;

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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Links</h2>
          
          {links && links.length > 0 ? (
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
                      <div className="w-full h-36 bg-gray-100 overflow-hidden relative">
                        <Image
                          src={link.image_url}
                          alt={link.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="256px"
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
          ) : (
            <p className="text-gray-500 italic">
              No custom links added yet. Click the edit button to add links.
            </p>
          )}
        </div>
      </Card>
      
      {editable && profileId && (
        <WidgetEditDrawer
          widgetType="links"
          profile={{ id: profileId }}
          customLinks={links}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}
    </>
  );
}
