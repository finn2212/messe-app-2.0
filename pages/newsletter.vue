<template>
  <div class="p-4 flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold text-center mb-6">
      Kurz ein paar Fragen zu Dir: Welches Thema spricht Dich an?
    </h1>

    <div class="w-full max-w-md">
      <label class="block text-sm font-medium text-gray-700">Name</label>
      <input 
        v-model="name" 
        type="text" 
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" 
        @focus="showKeyboard('name')"
      />

      <label class="block text-sm font-medium text-gray-700 mt-4">Vorname</label>
      <input 
        v-model="firstName" 
        type="text" 
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" 
        @focus="showKeyboard('firstName')"
      />

      <label class="block text-sm font-medium text-gray-700 mt-4">E-Mail-Adresse</label>
      <input 
        v-model="email" 
        type="email" 
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" 
        @focus="showKeyboard('email')"
      />
    </div>

    <!-- Bildschirmtastatur -->
    <div v-if="keyboardVisible" class="fixed bottom-0 left-0 w-full bg-gray-200 p-4 shadow-lg">
      <div class="grid grid-cols-10 gap-2 text-center">
        <button v-for="key in keys" :key="key" class="p-2 bg-white border rounded" @click="addKey(key)">
          {{ key }}
        </button>
        <button v-if="activeField === 'email'" v-for="key in emailShortcuts" :key="key" class="p-2 bg-blue-500 text-white border rounded" @click="addKey(key)">
          {{ key }}
        </button>
        <button class="p-2 col-span-2 bg-red-500 text-white border rounded" @click="removeKey">⌫</button>
        <button class="p-2 col-span-2 bg-green-500 text-white border rounded" @click="keyboardVisible = false">✔</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const name = ref('');
const firstName = ref('');
const email = ref('');
const keyboardVisible = ref(false);
const activeField = ref(null);

const keys = ['1','2','3','4','5','6','7','8','9','0','Q','W','E','R','T','Z','U','I','O','P','Ü','A','S','D','F','G','H','J','K','L','Ö','Ä','Y','X','C','V','B','N','M'];
const emailShortcuts = ['@', '.com', '.de', '@gmail.com', '@yahoo.com', '@outlook.com'];

function showKeyboard(field) {
  activeField.value = field;
  keyboardVisible.value = true;
}

function addKey(key) {
  if (activeField.value === 'name') name.value += key;
  if (activeField.value === 'firstName') firstName.value += key;
  if (activeField.value === 'email') email.value += key;
}

function removeKey() {
  if (activeField.value === 'name') name.value = name.value.slice(0, -1);
  if (activeField.value === 'firstName') firstName.value = firstName.value.slice(0, -1);
  if (activeField.value === 'email') email.value = email.value.slice(0, -1);
}
</script>

<style scoped>
button {
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
}
</style>
