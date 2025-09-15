import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable code splitting and chunk optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
          'chart-vendor': ['recharts'],
          
          // Feature-based chunks
          'dashboard': [
            './src/components/ComprehensiveDashboard.jsx',
            './src/components/FinancialCharts.jsx',
            './src/components/InteractiveMap.jsx'
          ],
          'customers': [
            './src/components/CustomersPage.jsx',
            './src/components/CreateCustomerModal.jsx',
            './src/components/CustomerInboxIntegrated.jsx'
          ],
          'schedule': [
            './src/components/ScheduleCalendar.jsx',
            './src/components/CalendarSettingsModal.jsx',
            './src/components/ScheduleMapView.jsx'
          ],
          'financials': [
            './src/components/MyMoneyPage.jsx',
            './src/components/ReportingPage.jsx'
          ],
          'jobs': [
            './src/components/JobsManagement.jsx',
            './src/components/EstimatesManagement.jsx',
            './src/components/PricingCatalog.jsx'
          ]
        },
        // Optimize chunk file names
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash].css'
          }
          return 'assets/[name]-[hash].[ext]'
        }
      }
    },
    // Optimize build settings
    target: 'esnext',
    minify: 'esbuild', // Use esbuild instead of terser
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: 'all',
    hmr: {
      overlay: false
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'recharts'
    ]
  }
})
