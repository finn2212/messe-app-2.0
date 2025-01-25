// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Deine vorhandenen Einstellungen
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Hier binden wir das nuxt-vuefire Modul ein
  modules: [
    // weitere Module ...
    'nuxt-vuefire',
  ],

  // Hier kommt die Firebase-Konfiguration rein
  vuefire: {
    // Standard-Firebase-SDK-Konfiguration (Client-Seite)
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
  }
})