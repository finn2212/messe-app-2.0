<!-- pages/index.vue (Beispiel) -->
<template>
  <div>
    <h1>Pons Messe App</h1>
    <form @submit.prevent="loginUser">
      <input v-model="email" type="email" placeholder="E-Mail" />
      <input v-model="password" type="password" placeholder="Passwort" />
      <button type="submit">Einloggen</button>
    </form>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const app = useFirebaseApp() // aus nuxt-vuefire
const auth = getAuth(app)

// Reactive State
const email = ref('')
const password = ref('')
const errorMessage = ref('')

// Login-Funktion
async function loginUser() {
  errorMessage.value = ''
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    // Weiterleiten, z.B. auf /home
    navigateTo('/home')
  } catch (err: any) {
    errorMessage.value = err.message
  }
}
</script>