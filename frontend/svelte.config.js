import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV !== 'production';
const base = dev ? '' : '/portal';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // Emit built site into repo root /portal for Cloudflare Worker to proxy
      pages: '../portal',
      assets: '../portal',
      fallback: 'index.html',
      precompress: false
    }),
    paths: {
      base,
      
    },
    appDir: 'app'
  }
};

export default config;