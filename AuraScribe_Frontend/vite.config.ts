import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';
  const appUrl = env.VITE_APP_URL || env.APP_URL || 'http://localhost:3000';
  const apiBaseUrl = env.VITE_API_BASE_URL || env.API_BASE_URL || 'https://api.aurascribe.ca';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      // Security headers for development server
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      proxy: {
        '/api': {
          target: 'https://api.aurascribe.ca',
          changeOrigin: true,
          secure: true
        }
      },
    },
    plugins: [react()],

    // SECURITY WARNING: Never expose API keys to the client bundle
    // API keys should be handled by your backend FastAPI server only
    define: {
      // Only define non-sensitive environment variables
      'import.meta.env.VITE_APP_URL': JSON.stringify(appUrl),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
      'import.meta.env.VITE_NODE_ENV': JSON.stringify(mode),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },

    build: {
      // Production optimizations
      minify: isProduction ? 'terser' : false,
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'lucide': ['lucide-react'],
          },
        },
      },
      // Security: prevent sensitive info in build
      chunkSizeWarningLimit: 1000,
    },
  };
});
