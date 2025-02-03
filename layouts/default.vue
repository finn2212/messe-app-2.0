<template>
  <!-- Root container applying background to the entire page -->
  <div class="min-h-screen flex flex-col" :style="backgroundStyle">
    <!-- Header with Home Icon Navigation -->
    <header class="p-4 flex items-center justify-end">
      <button v-if="!isHomePage" @click="navigateToHome" class="p-2">
        <HomeIcon class="w-12 h-12 text-gray-700" />
      </button>
    </header>

    <main class="flex-grow">
      <NuxtPage />
    </main>

    <!-- Footer with centered logo -->
    <footer class="flex items-center justify-center p-4">
      <div class="flex space-x-8">
        <img
          v-if="appSettings?.footerLogoUrl"
          :src="appSettings.footerLogoUrl"
          alt="Footer Logo"
          class="h-12 object-contain"
        />
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "#imports";
import { HomeIcon } from "@heroicons/vue/24/outline";

// Reference Firestore
const db = useFirestore();
const router = useRouter();
const route = useRoute();

// Reactive state for loaded settings
const appSettings = ref<any>(null);

const backgroundStyle = computed(() => ({
  backgroundImage:
    'url("https://firebasestorage.googleapis.com/v0/b/pons-messe-app2.firebasestorage.app/o/app-settings%2F1738417467083_backgroundImageUrl_background%20(1).jpg?alt=media&token=4215e937-7fc7-4570-8112-a7f774c92550")',
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

// Fetch the "appSettings" doc on mount
onMounted(async () => {
  try {
    const docRef = doc(db, "config", "appSettings");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      appSettings.value = snap.data();
      console.log("Loaded appSettings:", appSettings.value);
    } else {
      console.log("appSettings doc does not exist, using defaults.");
      appSettings.value = {};
    }
  } catch (err) {
    console.error("Error loading appSettings:", err);
    appSettings.value = {};
  }
});

const isHomePage = computed(() => route.path === "/home");

function navigateToHome() {
  router.push("/home");
}
</script>

<style scoped>
/* Ensuring full height background application */
html,
body {
  min-height: 100vh;
}
</style>
