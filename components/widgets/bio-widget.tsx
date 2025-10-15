import { Card } from '@/components/ui/card';

interface BioWidgetProps {
  bio: string;
}

export function BioWidget({ bio }: BioWidgetProps) {
  if (!bio) return null;

  return (
    <Card className="w-full p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
        {bio}
      </p>
    </Card>
  );
}

