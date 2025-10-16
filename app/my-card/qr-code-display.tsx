'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
}

export function QRCodeDisplay({ value }: QRCodeDisplayProps) {
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

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <QRCodeSVG
          id="qr-code-svg"
          value={value}
          size={256}
          level="H"
          includeMargin
        />
      </div>
      <Button
        onClick={handleDownload}
        variant="outline"
        className="w-full"
      >
        <Download className="w-4 h-4 mr-2" />
        Download QR Code
      </Button>
    </div>
  );
}

