import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        const additions = '  <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n  <link rel="alternate icon" href="/favicon.svg" type="image/svg+xml">\n  <link rel="shortcut icon" href="/favicon.svg">\n  <title>Spotics</title>\n'
        return html.replace('</head>', additions + '</head>')
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
