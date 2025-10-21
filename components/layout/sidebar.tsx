'use client';

import { useState, useEffect } from 'react';
import { X, Home, CreditCard, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SidebarProps {
  username?: string;
}

export function Sidebar({ username }: SidebarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mouseX, setMouseX] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      
      // Show sidebar if mouse is within 20px of left edge and not already visible
      if (e.clientX <= 20 && !isVisible) {
        setIsVisible(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isVisible]);

  // Hide sidebar if mouse moves away
  useEffect(() => {
    if (isVisible && mouseX > 300) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [mouseX, isVisible]);

  return (
    <>
      {/* Hover trigger area */}
      <div className="fixed left-0 top-0 w-5 h-full z-40" />
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r shadow-lg z-50 transition-transform duration-300 ease-in-out w-64",
          isVisible ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sidebar content */}
        <nav className="flex flex-col gap-2 p-6 pt-16">
          <Link href="/home">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-base"
              onClick={() => setIsVisible(false)}
            >
              <Home className="h-5 w-5" />
              Home
            </Button>
          </Link>

          {username && (
            <Link href={`/${username}`}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-base"
                onClick={() => setIsVisible(false)}
              >
                <CreditCard className="h-5 w-5" />
                My Card
              </Button>
            </Link>
          )}

          <Link href="/my-card">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-base"
              onClick={() => setIsVisible(false)}
            >
              <User className="h-5 w-5" />
              Profile Settings
            </Button>
          </Link>

          <div className="my-4 border-t" />

          <Link href="/logout">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsVisible(false)}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </Link>
        </nav>
      </div>

      {/* Backdrop */}
      {isVisible && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  );
}

