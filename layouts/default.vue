<template>
  <!-- Root container applying background to the entire page -->
  <div class="min-h-screen flex flex-col" :style="backgroundStyle">
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
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "#imports";

// Reference Firestore
const db = useFirestore();

// Reactive state for loaded settings
const appSettings = ref<any>(null);

// // Compute background style if a backgroundImageUrl exists
// const backgroundStyle = computed(() => {
//   if (!appSettings.value?.backgroundImageUrl) {
//     return {}; // No background image
//   }
//   return {
//     backgroundImage: `url(${appSettings.value.backgroundImageUrl})`,
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//     backgroundRepeat: "no-repeat",
//     width: "100%",
//     minHeight: "100vh",
//   };
// });

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
watch(backgroundStyle, (newVal) => {
  console.log("backgroundStyle changed:", newVal);
});
</script>

<style scoped>
/* Ensuring full height background application */
html,
body {
  min-height: 100vh;
}
</style>
