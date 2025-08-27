import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/admin/',   //  Admin app serve ஆகும் path (CloudFront → /admin/)
  build: {
    outDir: 'dist',   // build output directory
    assetsDir: 'assets', // static assets (CSS/JS/images) folder
  }
})
