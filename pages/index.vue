<template>
  <div
    class="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2
        class="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900"
      >
        In messe App anmelden
      </h2>
    </div>
    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
        <div
          v-if="errorMessage"
          class="mb-4 rounded-md bg-red-50 p-4 text-red-700"
        >
          {{ errorMessage }}
        </div>
        <form class="space-y-6" @submit.prevent="loginUser">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-900">
              Email address
            </label>
            <div class="mt-2">
              <input
                v-model="credentials.email"
                type="email"
                id="email"
                autocomplete="email"
                required
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <div class="mt-2">
              <input
                v-model="credentials.password"
                type="password"
                id="password"
                autocomplete="current-password"
                required
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { navigateTo } from "nuxt/app";

const credentials = reactive({
  email: '',
  password: ''
});
const errorMessage = ref('');

async function loginUser() {
  errorMessage.value = "";
  try {
    await $fetch("/api/login", {
      method: "POST",
      body: credentials,
    });
    debugger
    navigateTo("/marken");
  } catch (err: any) {
    errorMessage.value = err.message || "Login failed. Please try again.";
  }
}
</script>
