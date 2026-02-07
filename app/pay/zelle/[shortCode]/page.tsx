import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { randomUUID } from 'crypto';

interface ZellePaymentPageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function ZellePaymentPage({ params }: ZellePaymentPageProps) {
  const { shortCode } = await params;

  const qrCode = await prisma.qRCode.findUnique({
    where: { shortCode },
  });

  if (!qrCode || qrCode.paymentProvider !== 'ZELLE') {
    notFound();
  }

  // Track page view asynchronously
  prisma.analytics.create({
    data: {
      id: randomUUID(),
      qrCodeId: qrCode.id,
      deviceType: 'unknown',
    },
  }).catch(() => {}); // Ignore errors

  const _isEmail = qrCode.paymentHandle?.includes('@');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Badge className="bg-green-500">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified QR Code
            </Badge>
          </div>
          <h1 className="text-4xl font-bold">Pay with Zelle</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date(qrCode.updatedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Amount Card */}
        {qrCode.paymentAmount && (
          <Card className="p-8 text-center bg-blue-600 text-white">
            <p className="text-sm opacity-90 mb-2">Amount to Send</p>
            <p className="text-5xl font-bold" aria-label={`Amount: ${qrCode.paymentAmount.toFixed(2)} dollars`}>
              ${qrCode.paymentAmount.toFixed(2)}
            </p>
          </Card>
        )}

        {/* Recipient Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Send to:
              </p>
              <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg gap-2">
                <p className="text-lg font-mono break-all">{qrCode.paymentHandle}</p>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(qrCode.paymentHandle!);
                  }}
                  variant="outline"
                  size="sm"
                  className="min-w-[44px] min-h-[44px] shrink-0"
                  aria-label={`Copy recipient ${qrCode.paymentHandle} to clipboard`}
                >
                  <span aria-hidden="true">Copy</span>
                  <span className="sr-only">recipient to clipboard</span>
                </Button>
              </div>
            </div>

            {qrCode.paymentNote && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Payment note:
                </p>
                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg gap-2">
                  <p className="text-sm break-words">{qrCode.paymentNote}</p>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(qrCode.paymentNote!);
                    }}
                    variant="outline"
                    size="sm"
                    className="min-w-[44px] min-h-[44px] shrink-0"
                    aria-label={`Copy payment note to clipboard`}
                  >
                    <span aria-hidden="true">Copy</span>
                    <span className="sr-only">note to clipboard</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Instructions Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">How to Pay with Zelle</h2>
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-sm">
              <strong>Open your banking app</strong>
              <p className="text-muted-foreground ml-6">
                Most banks have Zelle built-in
              </p>
            </li>
            <li className="text-sm">
              <strong>Find Zelle</strong>
              <p className="text-muted-foreground ml-6">
                Usually under &quot;Send Money&quot; or &quot;Transfers&quot;
              </p>
            </li>
            <li className="text-sm">
              <strong>Select or add recipient</strong>
              <div className="ml-6 mt-2 flex items-center gap-2 flex-wrap">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                  {qrCode.paymentHandle}
                </code>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(qrCode.paymentHandle!);
                  }}
                  variant="ghost"
                  size="sm"
                  className="min-w-[44px] min-h-[44px]"
                  aria-label={`Copy recipient ${qrCode.paymentHandle}`}
                >
                  Copy
                </Button>
              </div>
            </li>
            {qrCode.paymentAmount && (
              <li className="text-sm">
                <strong>Enter amount</strong>
                <div className="ml-6 mt-2 flex items-center gap-2 flex-wrap">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    ${qrCode.paymentAmount.toFixed(2)}
                  </code>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(qrCode.paymentAmount!.toString());
                    }}
                    variant="ghost"
                    size="sm"
                    className="min-w-[44px] min-h-[44px]"
                    aria-label={`Copy amount ${qrCode.paymentAmount.toFixed(2)}`}
                  >
                    Copy
                  </Button>
                </div>
              </li>
            )}
            {qrCode.paymentNote && (
              <li className="text-sm">
                <strong>Add note (optional)</strong>
                <div className="ml-6 mt-2 flex items-center gap-2 flex-wrap">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs max-w-xs truncate">
                    {qrCode.paymentNote}
                  </code>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(qrCode.paymentNote!);
                    }}
                    variant="ghost"
                    size="sm"
                    className="min-w-[44px] min-h-[44px]"
                    aria-label="Copy payment note"
                  >
                    Copy
                  </Button>
                </div>
              </li>
            )}
            <li className="text-sm">
              <strong>Review and confirm payment</strong>
            </li>
          </ol>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            className="min-w-[44px] min-h-[44px]"
          >
            Report Suspicious Activity
          </Button>
          <p className="text-xs text-muted-foreground">
            This is a verified Qreate Studios QR code
          </p>
        </div>
      </div>
    </div>
  );
}
