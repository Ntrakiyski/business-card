'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Phone, Copy } from 'lucide-react';
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
          <div className="flex gap-3">
            {/* Primary action: Call */}
            <Button
              variant="default"
              className="flex-1 gap-2"
              size="lg"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  // Show a message to user about how to call
                  toast.info('Tap and hold the number to call, or copy and paste it');
                }
              }}
            >
              <Phone className="w-5 h-5" />
              <span className="font-medium">Call: {phone}</span>
            </Button>
            
            {/* Secondary action: Copy */}
            <Button
              onClick={handleCopyPhone}
              variant="outline"
              size="lg"
              className="px-4"
              title="Copy phone number"
            >
              <Copy className="w-5 h-5" />
            </Button>
          </div>
        )}
        {/* Download functionality was removed */}
      </div>
    </div>
  );
}
