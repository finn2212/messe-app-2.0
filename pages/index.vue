<template>
  <div class="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        class="mx-auto h-10 w-auto"
        src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
        alt="Your Company"
      />
      <!-- Updated Heading -->
      <h2 class="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        In messe App anmelden
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
        <!-- Display error message if any -->
        <div
          v-if="errorMessage"
          class="mb-4 rounded-md bg-red-50 p-4 text-red-700"
        >
          {{ errorMessage }}
        </div>

        <!-- Use Vue form submission instead of action/method -->
        <form class="space-y-6" @submit.prevent="loginUser">
          <!-- Email Address -->
          <div>
            <label for="email" class="block text-sm/6 font-medium text-gray-900">
              Email address
            </label>
            <div class="mt-2">
              <input
                v-model="email"
                type="email"
                id="email"
                autocomplete="email"
                required
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 
                       outline outline-1 -outline-offset-1 outline-gray-300 
                       placeholder:text-gray-400 
                       focus:outline focus:outline-2 focus:-outline-offset-2 
                       focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm/6 font-medium text-gray-900">
              Password
            </label>
            <div class="mt-2">
              <input
                v-model="password"
                type="password"
                id="password"
                autocomplete="current-password"
                required
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 
                       outline outline-1 -outline-offset-1 outline-gray-300 
                       placeholder:text-gray-400 
                       focus:outline focus:outline-2 focus:-outline-offset-2 
                       focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <!-- Sign In Button -->
          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 
                     text-sm/6 font-semibold text-white shadow-sm 
                     hover:bg-indigo-500 
                     focus-visible:outline focus-visible:outline-2 
                     focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
      <!-- Registration call-to-action removed -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { navigateTo } from '#imports' // Nuxt 3 composable for navigation

// Get Firebase app and auth
const app = useFirebaseApp()
const auth = getAuth(app)

// Reactive state
const email = ref('')
const password = ref('')
const errorMessage = ref('')

// Login function
async function loginUser() {
  errorMessage.value = ''
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    // Navigate to /home (Nuxt 3)
    navigateTo('/home')
  } catch (err: any) {
    errorMessage.value = err.message || 'Login failed. Please try again.'
  }
}
</script>