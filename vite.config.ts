import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.png", "**/*.mp3"],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: function (file) {
          return file.name?.endsWith(".mp3")
            ? `assets/[name].[ext]`
            : `assets/[name]-[hash].[ext]`;
        },
        manualChunks: {
          vendor: ['react', 'react-dom'],
          daily: ['@daily-co/daily-js', '@daily-co/daily-react'],
          ui: ['framer-motion', 'lucide-react', '@radix-ui/react-slot'],
        },
      },
    },
    sourcemap: false, // Disable in production for security
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
  },
  define: {
    // Remove development-only code in production
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
});