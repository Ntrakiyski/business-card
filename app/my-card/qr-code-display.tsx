'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  value: string;
  phone?: string | null;
}

export function QRCodeDisplay({ value, phone }: QRCodeDisplayProps) {
  const handleDownload = () => {
    // Get the SVG element
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'qr-code.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

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
        {/* Download button is hidden as requested */}
      </div>
    </div>
  );
}
