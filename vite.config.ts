import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Librerías en chunks propios: cambian poco, así el navegador las mantiene en caché entre despliegues
        codeSplitting: {
          groups: [
            { name: 'maplibre', test: /node_modules[\\/]maplibre-gl/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
    // maplibre-gl ocupa ~1 MB minificado por sí solo
    chunkSizeWarningLimit: 1100,
  },
})
