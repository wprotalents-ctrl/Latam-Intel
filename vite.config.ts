import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// Hardcoded for this project to avoid cwd resolution issues
const PROJECT_ROOT = 'C:/Users/juanc/.mavis/sessions/mvs_a617516ad1764d609dae71b4aa0ae6c3/workspace/Latam-Intel';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, PROJECT_ROOT, '');
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: PROJECT_ROOT + '/index.html',
      },
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': PROJECT_ROOT,
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
