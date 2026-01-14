'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load Puck to avoid compilation timeout
const Puck = dynamic(
  () => import('@measured/puck').then((mod) => mod.Puck),
  {
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
    ssr: false,
  }
);

interface PuckEditorProps {
  config: any;
  data: any;
  onPublish: (data: any) => void;
}

export function PuckEditor({ config, data, onPublish }: PuckEditorProps) {
  return <Puck config={config} data={data} onPublish={onPublish} />;
}
