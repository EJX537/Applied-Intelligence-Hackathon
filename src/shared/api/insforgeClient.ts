// InsForge backend client.
// Set VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY in .env.local
// (copy .env.example → .env.local and fill in the values).

import { createClient } from '@insforge/sdk';

const INSFORGE_URL =
  (import.meta.env.VITE_INSFORGE_URL as string | undefined) ??
  'https://axp58q2i.us-east.insforge.app';  // public, not sensitive

const INSFORGE_ANON_KEY =
  import.meta.env.VITE_INSFORGE_ANON_KEY as string | undefined;

if (!INSFORGE_ANON_KEY) {
  console.error(
    '[insforge] VITE_INSFORGE_ANON_KEY is not set. ' +
    'Copy .env.example → .env.local and run: npx @insforge/cli secrets get ANON_KEY'
  );
}

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY ?? '',
});

export function isInsforgeConfigured(): boolean {
  return Boolean(INSFORGE_URL && INSFORGE_ANON_KEY);
}
