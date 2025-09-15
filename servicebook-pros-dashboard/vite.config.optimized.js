import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
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
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            return 'js/[name]-[hash].js'
          }
          return 'js/chunk-[hash].js'
        },
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    // Enable source maps for debugging (can be disabled for smaller builds)
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false
    }
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'recharts'
    ],
    exclude: []
  }
})

