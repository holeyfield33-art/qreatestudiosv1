'use client';

import { Render } from '@measured/puck';
import { puckRenderConfig } from '@/lib/puckConfig';

interface PublicLandingPageRenderProps {
  data: any;
}

export default function PublicLandingPageRender({ data }: PublicLandingPageRenderProps) {
  return <Render config={puckRenderConfig} data={data} />;
}
