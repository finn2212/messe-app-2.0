<template>

</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "#imports";

// We'll load the doc: "config/appSettings"
const db = useFirestore();
const appSettings = ref<any>(null);

onMounted(async () => {
  const docRef = doc(db, "config", "appSettings");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    appSettings.value = snap.data();
  }
});

// Compute the style object for background
const backgroundStyle = computed(() => {
  if (!appSettings.value || !appSettings.value.backgroundImageUrl) {
   console.log("bg =", backgroundStyle)
    // If we have no background image, return no style
    return {};
  }
  return {
    backgroundImage: `url(${appSettings.value.backgroundImageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
});
</script>

<style scoped>
/* Additional styling if needed */
</style>
