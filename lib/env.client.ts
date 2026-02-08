/**
 * Client-side environment validation.
 *
 * Only NEXT_PUBLIC_* vars are available client-side.
 * Missing optional vars disable features in the UI.
 */
import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: z.string().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

function parseClientEnv() {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!result.success) {
    console.warn('⚠️ Client env validation warnings:', result.error.flatten().fieldErrors);
    return {} as z.infer<typeof clientEnvSchema>;
  }
  return result.data;
}

export const clientEnv = parseClientEnv();

/**
 * Client-side capability checks (based on public env vars only).
 * For full server-side capabilities, use the /api/capabilities endpoint.
 */
export const clientCapabilities = {
  imageSearch: !!clientEnv.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
  maps: !!clientEnv.NEXT_PUBLIC_MAPBOX_TOKEN,
};
