import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://vansh482.github.io',
  base: '/portfolio-website',
  integrations: [react()],
  output: 'static',
});
