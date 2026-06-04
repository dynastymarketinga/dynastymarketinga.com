import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dynastymarketinga.com',
  compressHTML: true,
  integrations: [sitemap()],
});
