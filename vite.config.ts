import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Rarely-changing libraries and catalogue data get their own long-cached files,
        // so a site update only re-downloads the code that actually changed.
        manualChunks(id) {
          if (id.includes('/src/app/data/catalogue')) return 'catalogue';
          if (!id.includes('node_modules')) return undefined;
          if (/node_modules\/(\.pnpm\/)?(react|react-dom|scheduler|react-router)[@/]/.test(id)) return 'vendor-react';
          if (/node_modules\/(\.pnpm\/)?(motion|framer-motion|motion-dom|motion-utils)[@/]/.test(id)) return 'vendor-motion';
          if (/node_modules\/(\.pnpm\/)?gsap[@/]/.test(id)) return 'vendor-gsap';
          return undefined;
        },
      },
    },
  },
})
