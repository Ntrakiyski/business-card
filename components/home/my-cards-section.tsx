'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Edit, QrCode, User, Globe, Lock, Trash2 } from 'lucide-react';
import { deleteCard } from '@/app/actions/cards';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MyCardsSectionProps {
  cards: Profile[];
}

export function MyCardsSection({ cards }: MyCardsSectionProps) {
  const router = useRouter();
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const handleDeleteCard = async (cardId: string) => {
    setDeletingCardId(cardId);
    try {
      const result = await deleteCard(cardId);
      if (result.success) {
        toast.success('Card deleted successfully');
        router.refresh(); // Refresh to show updated card list
      } else {
        toast.error(result.error || 'Failed to delete card');
      }
    } catch {
      toast.error('An error occurred while deleting the card');
    } finally {
      setDeletingCardId(null);
    }
  };

  if (cards.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No cards found</h3>
          <p className="text-gray-600">
            Complete onboarding to create your first card
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Card key={card.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
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
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {/* @ts-expect-error - Database types not yet updated */}
                    {card.card_name || 'My Card'}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    /{card.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* @ts-expect-error - Database types not yet updated */}
                {card.is_primary && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Primary
                  </span>
                )}
                {/* @ts-expect-error - Database types not yet updated */}
                {card.is_public ? (
                  <Globe className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Card Info */}
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{card.display_name || 'No name'}</p>
              {card.job_title && (
                <p className="text-sm text-gray-600">{card.job_title}</p>
              )}
              {card.company && (
                <p className="text-sm text-gray-600">{card.company}</p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/${card.username}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/${card.username}?edit=true`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/my-card?cardId=${card.id}`}>
                    <QrCode className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              
              {/* Delete Card Button with Confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    disabled={deletingCardId === card.id}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {deletingCardId === card.id ? 'Deleting...' : 'Delete Card'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Card?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <strong>{card.display_name || card.username}</strong>&apos;s card (@{card.username})?
                      This action cannot be undone and will permanently delete all associated data including links, social profiles, and services.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteCard(card.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
