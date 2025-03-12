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
      <keep-alive>
        <NuxtPage />
      </keep-alive>
    </main>

    <!-- Footer with centered logo -->
    <footer class="flex items-center justify-center p-4">
      <div class="flex space-x-8">
        <img
          v-if="appSettings?.footerLogoUrl"
          :src="appSettings.footerLogoUrl"
          alt="Footer Logo"
        class="h-12 object-contain" />
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

const backgroundImageUrl = ref("");

// Reactive state for loaded settings
const appSettings = ref<any>(null);

const backgroundStyle = computed(() => ({
  backgroundImage: `url("${backgroundImageUrl.value}")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

// Fetch the "appSettings" doc on mount
onMounted(async () => {
  const cachedImage = localStorage.getItem("backgroundImageUrl");
  if (cachedImage) {
    backgroundImageUrl.value = cachedImage;
  }
  try {
    const docRef = doc(db, "config", "appSettings");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      appSettings.value = snap.data();
      const newImageUrl = appSettings.value.backgroundImageUrl;
      if (newImageUrl !== cachedImage) {
        backgroundImageUrl.value = newImageUrl;
        localStorage.setItem("backgroundImageUrl", newImageUrl);
      }
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
