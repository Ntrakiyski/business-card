'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function CreateCardButton() {
  const router = useRouter();

  const handleCreateCard = () => {
    router.push('/onboarding');
  };

  return (
    <Button size="lg" className="gap-2" onClick={handleCreateCard}>
      <Plus className="w-5 h-5" />
      Create New Card
    </Button>
  );
}

