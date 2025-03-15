<template>
  <!-- Spinner while appSettings are loading -->
  <div v-if="!appSettingsLoaded" class="flex items-center justify-center min-h-screen">
    <Spinner />
  </div>

  <!-- Main feedback container -->
  <div v-else class="p-4 flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold text-center mb-6">Welche wünsche hast du an uns?</h1>

    <!-- If user hasn't selected a brand yet, show the brand grid -->
    <TransitionGroup tag="div" class="w-full" name="fade">
      <GridCards :items="brandOptions" :onCardClick="handleCardClick" :gridColumns="3" :imageWidth="256"
        :imageHeight="384">
        <template #cardContent="{ item }">
          <div
            class="w-full md:h-40 lg:h-52 xl:h-60 md:w-56 lg:w-64 xl:w-96 relative flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105">
            <img v-if="item.logoUrl" :src="item.logoUrl" class="absolute inset-0 w-full h-full object-cover rounded-lg"
              :alt="item.name" />
            <p v-else
              class="font-medium text-center px-2 absolute inset-0 flex items-center justify-center bg-gray-200">
              {{ item.name }}
            </p>
          </div>
        </template>
      </GridCards>
    </TransitionGroup>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useFirestore } from "#imports";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import GridCards from "~/components/GridCards.vue";
import Spinner from "~/components/Spinner.vue";

const db = useFirestore();

// App Settings und Brand Auswahl
const appSettings = ref<any>(null);
const appSettingsLoaded = ref(false);

// Brand Mappings
const brandMappings = ref<any[]>([]);

// Newsletter Options (Brand Auswahl)
const brandOptions = computed(() => {
  if (!appSettings.value) return [];
  return [
    {
      name: "Langenscheidt",
      logoUrl: appSettings.value.langenscheidtLogoUrl || "",
    },
    {
      name: "PONS",
      logoUrl: appSettings.value.ponsLogoUrl || "",
    },
    {
      name: "Klett",
      logoUrl: appSettings.value.klettLogoUrl || "",
    },
  ];
});

// Laden der App Settings
onMounted(async () => {
  await loadAppSettings();
  preloadImages();
  await loadBrandMappings();
});

const handleCardClick = (item: any) => {
  const brandName = item.name.toLowerCase();
  console.log(brandMappings.value);
  if (!brandMappings.value || brandMappings.value.length === 0) {
    return;
  }
  const brandInfo = brandMappings.value[0]?.links.find((b: any) => b.provider.toLowerCase() === brandName);
  if (brandInfo) {
    if (brandInfo.newTab) {
      window.open(brandInfo.url, '_blank');
    } else {
      window.location.href = brandInfo.url;
    }
  }
};

async function loadAppSettings() {
  try {
    const docRef = doc(db, "config", "appSettings");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      appSettings.value = snap.data();
    }
  } catch (err) {
    console.error("Error loading appSettings:", err);
  } finally {
    appSettingsLoaded.value = true;
  }
}

async function preloadImages() {
  // Hier laden wir die Bilder aus newsletterOptions
  const images = brandOptions.value.map((item) => item.logoUrl).filter((url) => url);
  if (images.length === 0) return;
  let loadedCount = 0;
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = img.onerror = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        // Optionale Logik, wenn alle Bilder geladen sind
      }
    };
  });
}

async function loadBrandMappings() {
  try {
    const docRef = collection(db, "brandMappings");
    const snap = await getDocs(docRef);
    if (snap.docs.length > 0) {
      brandMappings.value = snap.docs.map((doc) => doc.data());
    }
  } catch (err) {
    console.error("Error loading brand mappings:", err);
  }
}

</script>

<style scoped>
/* Transition Styles (wie in deinem Beispiel) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
