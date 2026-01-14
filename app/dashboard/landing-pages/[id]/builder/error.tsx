'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Builder page error:', error);
  }, [error]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-lg text-center p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to load the editor
          </h1>
          <p className="text-gray-600 mb-4">
            We encountered an issue loading your landing page builder. This might be a temporary problem.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 font-mono mb-4">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard/landing-pages'}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          If this problem persists, please contact support with the error ID above.
        </p>
      </div>
    </div>
  );
}
