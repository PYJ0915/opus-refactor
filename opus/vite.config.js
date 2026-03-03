import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server : {
    proxy : {
      // '/kcisa' : {
      //   target : 'https://api.kcisa.kr',
      //   changeOrigin : true,
      //   rewrite: (path) => path.replace(/^\/kcisa/, ''),
      //   timeout: 30000,      
      //   proxyTimeout: 30000, 
      // },

      // '/kopis': {
      //   target: 'http://www.kopis.or.kr',
      //   changeOrigin: true,
      //   rewrite: path => path.replace(/^\/kopis/, ''),
      // },

      "/api": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      
      "/auth": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
    }
  }
})