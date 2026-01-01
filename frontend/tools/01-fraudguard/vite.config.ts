import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    
    // Root path for subdomain deployment (fguard.maula.ai)
    base: '/',
    
    server: {
      port: 3001,
      host: true,
      cors: true,
      proxy: isProduction ? {} : {
        '/api': {
          target: 'https://api.maula.ai/fraudguard',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: true,
        },
        '/ws': {
          target: 'wss://ws.maula.ai/fraudguard',
          ws: true,
          changeOrigin: true,
          secure: true,
        },
      },
    },

    preview: {
      port: 3001,
      host: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: isProduction ? false : true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            ui: ['lucide-react'],
            utils: ['date-fns', 'jspdf'],
            ai: ['@google/genai'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@types': path.resolve(__dirname, './src/types'),
      },
    },

    define: {
      'import.meta.env.VITE_APP_NAME': JSON.stringify('FraudGuard'),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify('2.0.0'),
      'import.meta.env.VITE_API_URL': JSON.stringify('https://api.maula.ai/fraudguard'),
      'import.meta.env.VITE_WS_URL': JSON.stringify('wss://ws.maula.ai/fraudguard'),
      'import.meta.env.VITE_ML_URL': JSON.stringify('https://ml.maula.ai/fraudguard'),
      'import.meta.env.VITE_AI_URL': JSON.stringify('https://ai.maula.ai/fraudguard'),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'recharts', 'lucide-react', 'date-fns', '@google/genai'],
    },

    // Production optimizations
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },
  };
});
