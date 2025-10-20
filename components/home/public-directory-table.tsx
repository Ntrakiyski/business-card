'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import Image from 'next/image';
import { User, MapPin, Briefcase, ExternalLink } from 'lucide-react';

type PublicCard = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'username' | 'display_name' | 'job_title' | 'company' | 'location' | 'profile_image_url' | 'created_at'
>;

interface PublicDirectoryTableProps {
  cards: PublicCard[];
}

export function PublicDirectoryTable({ cards }: PublicDirectoryTableProps) {
  if (cards.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No public cards yet</h3>
          <p className="text-gray-600">
            Be the first to make your card public and appear in the directory
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cards.map((card) => (
                <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                          {card.profile_image_url ? (
                            <Image
                              src={card.profile_image_url}
                              alt={card.display_name || 'Profile'}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {card.display_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{card.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {card.job_title || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {card.company || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center">
                      {card.location ? (
                        <>
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          {card.location}
                        </>
                      ) : (
                        '—'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/${card.username}`}>
                        View Card
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {cards.map((card) => (
          <div key={card.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                  {card.profile_image_url ? (
                    <Image
                      src={card.profile_image_url}
                      alt={card.display_name || 'Profile'}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {card.display_name || 'No name'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      @{card.username}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="ml-2">
                    <Link href={`/${card.username}`}>
                      View
                    </Link>
                  </Button>
                </div>
                {card.job_title && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <Briefcase className="w-3 h-3 mr-1 text-gray-400" />
                    {card.job_title}
                  </p>
                )}
                {card.company && (
                  <p className="text-sm text-gray-600 mt-1">
                    {card.company}
                  </p>
                )}
                {card.location && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                    {card.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

