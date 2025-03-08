// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    'nuxt-vuefire',
    "@nuxtjs/tailwindcss",
    'nuxt-headlessui',
    '@vite-pwa/nuxt'
  ],
  vuefire: {
    config: {
      apiKey: "AIzaSyDwAqoQhZfHuENatg36PJA2LFgcBHSu-GM",
      authDomain: "pons-messe-app2.firebaseapp.com",
      projectId: "pons-messe-app2",
      storageBucket: "pons-messe-app2.firebasestorage.app",
      messagingSenderId: "312256346372",
      appId: "1:312256346372:web:803151de4fc22d61577851",
      measurementId: "G-GYNFZP6QJG"
    },
    auth: {
      enabled: false
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Meine App',
      short_name: 'App',
      theme_color: '#ffffff',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      runtimeCaching: [
        {
          // Regel für Firebase-Bilder: passt auf URLs, die von Firebase Storage kommen
          urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/pons-messe-app2\.firebasestorage\.app\/.*/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'firebase-images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400, // Cache-Einträge werden maximal 1 Tag gespeichert
            }
          }
        }
      ]
    }
  }
});