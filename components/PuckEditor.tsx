'use client';

import dynamic from 'next/dynamic';

// Lazy load Puck to avoid compilation timeout
const Puck = dynamic(
  () => import('@measured/puck').then((mod) => mod.Puck),
  {
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
