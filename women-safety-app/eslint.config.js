// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');


export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    proxy: {
      '/chat': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
