import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3011,
    host: true,
    cors: true,
  },

  preview: {
    port: 3011,
    host: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['lucide-react'],
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  define: {
    'import.meta.env.VITE_APP_NAME': JSON.stringify('IncidentResponse'),
    'import.meta.env.VITE_API_URL': JSON.stringify('https://cshield.fyzo.xyz/api/v1/incidentresponse'),
    'import.meta.env.VITE_WS_URL': JSON.stringify('wss://cshield.fyzo.xyz/ws'),
    'import.meta.env.VITE_ML_URL': JSON.stringify('https://cshield.fyzo.xyz/ml'),
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'lucide-react', 'date-fns'],
  },
});
