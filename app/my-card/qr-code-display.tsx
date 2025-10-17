'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  phone?: string | null;
}

export function QRCodeDisplay({ value, phone }: QRCodeDisplayProps) {

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-lg shadow-sm flex justify-center">
        <QRCodeSVG
          id="qr-code-svg"
          value={value}
          size={256}
          level="H"
          includeMargin
        />
      </div>
      <div className="w-full space-y-3">
        {phone && (
          <Button
            variant="outline"
            className="w-full gap-2"
            size="lg"
            disabled
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium">{phone}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
