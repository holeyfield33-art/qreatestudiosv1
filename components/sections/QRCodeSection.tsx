'use client';

import Image from 'next/image';
import { Smartphone, Apple } from 'lucide-react';

export interface QRCodeSectionProps {
  title?: string;
  subtitle?: string;
  qrCodeUrl?: string; // URL to generated QR code image
  destinationUrl?: string; // Where the QR code points to
  qrStyle?: 'minimal' | 'framed' | 'branded';
  instructions?: (string | { text: string })[];
  showDeviceIcons?: boolean;
}

export function QRCodeSection({
  title = 'Scan to Order',
  subtitle,
  qrCodeUrl = '',
  destinationUrl = '',
  qrStyle = 'branded',
  instructions,
  showDeviceIcons = true,
}: QRCodeSectionProps) {
  const frameStyles = {
    minimal: {
      container: 'p-6 bg-white rounded-xl shadow-md',
      qr: 'bg-white',
      text: 'text-gray-700',
    },
    framed: {
      container: 'p-8 bg-white rounded-2xl shadow-xl border-4 border-black',
      qr: 'bg-white',
      text: 'text-gray-900',
    },
    branded: {
      container: 'p-8 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-2xl',
      qr: 'bg-white rounded-lg p-4',
      text: 'text-white',
    },
  };

  const styles = frameStyles[qrStyle];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        {/* QR Code Card */}
        <div className={`inline-block ${styles.container}`}>
          {/* QR Code Image */}
          <div className={`w-64 h-64 relative mx-auto ${styles.qr}`}>
            {qrCodeUrl && qrCodeUrl.trim() !== "" ? (
              <Image
                src={qrCodeUrl}
                alt={`QR code for ${destinationUrl}`}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-gray-500 text-sm">QR Code Preview</p>
                  <p className="text-gray-400 text-xs mt-1">Will generate on publish</p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 space-y-3">
            {instructions && instructions.length > 0 ? (
              instructions.map((instruction, idx) => {
                const text = typeof instruction === 'string' ? instruction : instruction.text;
                return (
                  <p key={`instruction-${idx}-${text}`} className={`text-sm font-medium ${styles.text}`}>
                    {text}
                  </p>
                );
              })
            ) : (
              <p className={`text-sm font-medium ${styles.text}`}>
                Point your camera to scan
              </p>
            )}

            {/* Device Icons */}
            {showDeviceIcons && (
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="flex items-center gap-2 opacity-70">
                  <Apple className={`w-5 h-5 ${styles.text}`} />
                  <span className={`text-xs ${styles.text}`}>iOS</span>
                </div>
                <div className="flex items-center gap-2 opacity-70">
                  <Smartphone className={`w-5 h-5 ${styles.text}`} />
                  <span className={`text-xs ${styles.text}`}>Android</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* URL Display (optional) */}
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Or visit:{' '}
            <a
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              {destinationUrl.replace(/^https?:\/\//, '')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

QRCodeSection.defaultProps = {
  title: 'Scan to Order',
  subtitle: 'View our menu and place orders directly from your phone',
  qrStyle: 'branded',
  instructions: ['Point your camera to scan', 'No app required'],
  showDeviceIcons: true,
};

/**
 * Table-specific QR Code variant
 * Shows table number prominently for restaurant use
 */
export function TableQRCodeSection({
  tableNumber,
  qrCodeUrl,
  destinationUrl,
  restaurantName,
}: {
  tableNumber: string;
  qrCodeUrl: string;
  destinationUrl: string;
  restaurantName?: string;
}) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-black to-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-white p-6 text-center">
            {restaurantName && (
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {restaurantName}
              </h3>
            )}
            <div className="inline-block bg-black text-white px-6 py-3 rounded-full">
              <span className="text-sm font-medium">Table</span>
              <span className="text-3xl font-bold ml-2">{tableNumber}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="p-8 bg-white m-6 rounded-2xl">
            <div className="w-full aspect-square relative">
              <Image
                src={qrCodeUrl}
                alt={`QR code for table ${tableNumber}`}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 text-center text-white space-y-2">
            <p className="text-lg font-semibold">Scan to View Menu & Order</p>
            <p className="text-sm text-gray-300">
              Your table number will be automatically included
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
