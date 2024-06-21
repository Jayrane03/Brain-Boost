import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    rollupOptions: {
      external: ['/public/Images/contact_form.jpg']
    } // Change 'build' to the desired output directory name
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Change to your backend server's URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
  


})
// vite.config.js

