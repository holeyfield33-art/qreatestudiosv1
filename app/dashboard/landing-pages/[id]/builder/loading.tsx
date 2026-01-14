import { Loader2, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="relative mb-6">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <Sparkles className="h-5 w-5 text-primary/60 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Loading your workspace</h2>
        <p className="text-sm text-muted-foreground">Preparing the visual editor...</p>
      </div>
    </div>
  );
}
