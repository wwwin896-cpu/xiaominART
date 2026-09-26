import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

const keystaticEnabled = process.env.KEYSTATIC_ENABLED === 'true' || process.env.VERCEL === '1';

export default defineConfig({
  site: 'https://www.xiaominart.com',
  output: keystaticEnabled ? 'server' : 'static',
  ...(keystaticEnabled ? {
    adapter: vercel(),
    integrations: [react(), markdoc(), keystatic()],
  } : {}),
  trailingSlash: 'always',
});
