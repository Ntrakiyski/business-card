'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  value: string;
  phone?: string | null;
}

export function QRCodeDisplay({ value, phone }: QRCodeDisplayProps) {
  const handleCopyPhone = async () => {
    if (!phone) return;
    
    try {
      await navigator.clipboard.writeText(phone);
      toast.success('Contact number copied to clipboard!');
    } catch {
      toast.error('Failed to copy contact number');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm flex justify-center">
        <QRCodeSVG
          id="qr-code-svg"
          value={value}
          size={256}
          level="H"
          includeMargin
        />
      </div>
      <div className="w-full space-y-2">
        {phone && (
          <Button
            onClick={handleCopyPhone}
            variant="default"
            className="w-full"
          >
            <Phone className="w-4 h-4 mr-2" />
            {phone}
          </Button>
        )}
        {/* Download functionality was removed */}
      </div>
    </div>
  );
}
