import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            Profile Not Found
          </h2>
          <p className="text-gray-600">
            Sorry, we couldn&apos;t find the profile you&apos;re looking for. 
            The username may not exist or the link might be incorrect.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/">
            Go to Homepage
          </Link>
        </Button>
      </div>
    </div>
  )
}
