// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [/** @type {any} */ (tailwindcss())]
  },
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [icon()],
  image: {
    // Esborrem 'domains' i utilitzem només remotePatterns que és més precís
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9001', // <-- El port exacte del teu MinIO
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9001',
      }
    ]
  }
});