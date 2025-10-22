'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, Globe, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarNavProps {
  className?: string;
  onNavigate?: () => void;
}

export function SidebarNav({ className, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/home',
      active: pathname === '/home',
    },
    {
      label: 'My Cards',
      icon: CreditCard,
      href: '/home',
      active: pathname === '/home',
    },
    {
      label: 'Explore',
      icon: Globe,
      href: '/home#explore',
      active: false,
    },
  ];

  return (
    <div className={cn('space-y-4 py-4', className)}>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Business Card
        </h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                route.active && 'bg-gray-100'
              )}
              asChild
              onClick={onNavigate}
            >
              <Link href={route.href}>
                <route.icon className="mr-2 h-4 w-4" />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
