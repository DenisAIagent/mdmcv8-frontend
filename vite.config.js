import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import viteCompression from "vite-plugin-compression"
import path from "path"

// Force rebuild timestamp: 2025-07-22T10:00:00Z - SEO Optimizations
export default defineConfig({
  plugins: [
    react(),
    // Compression gzip pour améliorer les performances
    viteCompression({
      algorithm: "gzip",
      ext: ".gz"
    }),
    viteCompression({
      algorithm: "brotliCompress", 
      ext: ".br"
    })
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  
  build: {
    outDir: "dist",
    sourcemap: true,  // Activé pour debugging des erreurs DataGrid
    minify: "esbuild",
    // Code splitting optimisé pour SEO
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les dépendances pour un meilleur cache
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@mui/material", "@mui/icons-material"],
          utils: ["lodash", "date-fns"],
          forms: ["react-hook-form", "@hookform/resolvers"],
          i18n: ["i18next", "react-i18next"],
          analytics: ["@emailjs/browser"]
        }
      }
    },
    // Optimisation des assets
    assetsDir: "assets",
    chunkSizeWarningLimit: 1000
  },
  
  server: {
    port: 3000,
    host: "localhost",
    // Support des routes SPA avec fallback
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    },
    cors: true,
    open: true
  },
  
  preview: {
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
    allowedHosts: [
      "healthcheck.railway.app",
      ".railway.app",
      "localhost",
      "www.mdmcmusicads.com",
      "mdmcmusicads.com",
      ".mdmcmusicads.com",
      "blog.mdmcmusicads.com"
    ]
  }
})