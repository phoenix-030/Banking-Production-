import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const blockedSourcePath =
  /^\/(?:src\/|server\/|scripts\/|\.env|package(?:-lock)?\.json$|tsconfig[^/]*\.json$)|(?:\.map|\.tsx?|\.jsx)(?:\?|$)/i;

function blockSourceExposure() {
  return {
    name: 'block-source-exposure',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url ?? '/').split('?')[0];
        if (blockedSourcePath.test(urlPath)) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.end('Not Found');
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), blockSourceExposure()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: false,
      },
    },
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()',
      'Cache-Control': 'no-store',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Never expose source maps or source code in DevTools
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app-[hash].js',
        chunkFileNames: 'assets/c-[hash].js',
        assetFileNames: 'assets/a-[hash][extname]',
      },
    },
  },
});
