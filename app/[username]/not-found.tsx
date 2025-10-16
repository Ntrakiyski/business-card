import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Not Found</h1>
        <p className="text-gray-600">
          The profile you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Button asChild className="w-full">
          <Link href="/">
            Go to Homepage
          </Link>
        </Button>
      </Card>
    </div>
  );
}
