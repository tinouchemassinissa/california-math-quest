import { defineConfig } from 'vite';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

function git(args){try{return execFileSync('git',args,{encoding:'utf8',timeout:5000}).trim();}catch{return 'unknown';}}
const release={schema:1,revision:git(['rev-parse','HEAD']),modified:git(['status','--porcelain','--untracked-files=no'])!=='',contentHash:createHash('sha256').update(readFileSync(new URL('./content/approved_questions.json',import.meta.url))).digest('hex'),builtAt:new Date().toISOString()};
export default defineConfig({
  define:{__BIP_RELEASE__:JSON.stringify(release)},
  plugins: [
    react(),
    {name:'bip-release',generateBundle(){this.emitFile({type:'asset',fileName:'release.json',source:JSON.stringify(release,null,2)});}},
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png', 'bip/*.mp4', 'bip/events/*.mp4', 'bip/gestures/*.mp4', 'bip/gestures-v2/*.mp4', 'bip/gestures-v3/*.mp4', 'bip/character/*', 'bip/gestures/*.webp'],
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: {
        name: 'Learn with Bip',
        short_name: 'Learn with Bip',
        description: 'Independent practice for selected California K–5 mathematics skills',
        theme_color: '#4f46e5',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
