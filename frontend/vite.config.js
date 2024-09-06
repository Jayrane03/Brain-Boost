import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['/public/Images/contact_form.jpg'],
    },
  },
  
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:5001', // Change to your backend server's URL if in local
        target: 'https://brain-boost.onrender.com', // Backend server URL for production
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Define process.env.NODE_ENV depending on the build mode
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  },
}
));
