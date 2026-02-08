'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Capabilities } from '@/lib/env.server';

const defaultCaps: Capabilities = {
  ai: false,
  billing: false,
  email: false,
  imageSearch: false,
  maps: false,
  rateLimiting: false,
  githubAuth: false,
};

const CapabilitiesContext = createContext<Capabilities>(defaultCaps);

export function CapabilitiesProvider({ children }: { children: ReactNode }) {
  const [caps, setCaps] = useState<Capabilities>(defaultCaps);

  useEffect(() => {
    fetch('/api/capabilities')
      .then((r) => (r.ok ? r.json() : defaultCaps))
      .then(setCaps)
      .catch(() => setCaps(defaultCaps));
  }, []);

  return (
    <CapabilitiesContext.Provider value={caps}>
      {children}
    </CapabilitiesContext.Provider>
  );
}

/**
 * Hook to check which features are available.
 *
 * Usage:
 *   const caps = useCapabilities();
 *   if (!caps.ai) return <Banner>AI features unavailable</Banner>;
 */
export function useCapabilities() {
  return useContext(CapabilitiesContext);
}
