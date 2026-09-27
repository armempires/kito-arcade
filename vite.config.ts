import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function hostedRefererPlugin(): Plugin {
  return {
    name: 'hosted-referer-resolver',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url ? req.url.split('?')[0] : '';
        const referer = req.headers.referer || '';

        // If request is for /assets/node_modules/ or /assets/assets/ (legacy paths from Expo web)
        if (rawUrl.startsWith('/assets/node_modules/') || rawUrl.startsWith('/assets/assets/')) {
          let appId = 'gestor-os-web';
          const refererMatch = referer.match(/\/hosted\/([a-zA-Z0-9_-]+)/);
          if (refererMatch) appId = refererMatch[1];

          const relativeAsset = rawUrl.replace(/^\//, '');
          const candidatePath = path.join(__dirname, 'public/hosted', appId, relativeAsset);
          if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
            const query = req.url && req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
            req.url = `/hosted/${appId}/${relativeAsset}${query}`;
          }
        }

        // If request is not already scoped to /hosted/ and referer is an iframe inside /hosted/<appId>/
        const match = referer.match(/\/hosted\/([a-zA-Z0-9_-]+)/);
        if (match && !rawUrl.startsWith('/hosted/') && !rawUrl.startsWith('/@') && !rawUrl.startsWith('/src/')) {
          const appId = match[1];
          const relativeAsset = rawUrl.replace(/^\//, '');
          const candidatePath = path.join(__dirname, 'public/hosted', appId, relativeAsset);
          
          if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
            const query = req.url && req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
            req.url = `/hosted/${appId}/${relativeAsset}${query}`;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), hostedRefererPlugin()],
  server: {
    port: 5174,
    host: true,
    watch: {
      ignored: ['**/projetos/**', '**/Library/**', '**/node_modules/**'],
    }
  }
});
