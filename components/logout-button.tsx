'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { useTransition } from 'react';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout('/');
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}

