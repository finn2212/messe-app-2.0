<template>
  <!-- Loading Spinner -->
  <div v-if="!appSettingsLoaded || !imagesLoaded" class="flex items-center justify-center min-h-screen">
    <Spinner />
  </div>

  <!-- Main Brand Attribute Selection -->
  <div v-else class="p-4 flex flex-col items-center justify-center">
    <h1 v-if="!selectedAttribute && !selectedBrand" class="text-2xl font-bold text-center mb-6">
      Wähle eine Marke aus
    </h1>

    <!-- Brand Selection Grid -->
    <TransitionGroup v-if="!selectedBrand" tag="div" class="w-full" name="fade">
      <GridCards
        :items="brandOptions"
        :onCardClick="selectBrand"
        :gridColumns="3"
        :imageWidth="256"
        :imageHeight="384"
      >
        <template #cardContent="{ item }">
          <div class="h-96 w-64 relative flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105">
            <div v-if="item.brandImageUrl">
              <img :src="item.brandImageUrl" class="absolute inset-0 w-full h-full object-cover rounded-lg" :alt="item.brand" />
              <div class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 p-2 rounded-md text-center text-black font-semibold">
                {{ item.brand }}
              </div>
            </div>
          </div>
        </template>
      </GridCards>
    </TransitionGroup>

    <!-- Attribute Selection -->
    <Transition name="fade">
      <div v-if="selectedBrand && !selectedAttribute" class="flex flex-col items-center w-full max-w-4xl">
        <h1 class="text-2xl font-semibold mb-4 text-center">
          Welches Attribut findest Du am passendsten für {{ selectedBrand }}?
        </h1>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
          <button
            v-for="attribute in selectedBrandAttributes"
            :key="attribute.title"
            @click="selectAttribute(attribute)"
            class="px-4 py-2 rounded-full bg-gray-200 hover:bg-indigo-500 hover:text-white transition"
            :class="{ 'bg-indigo-600 text-white': attribute === selectedAttribute }"
          >
            {{ attribute.title }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Final Step: Display Statistics -->
    <Transition name="fade">
  <div v-if="selectedAttribute">
    <!-- Spinner while stats are loading -->
    <div v-if="!statsLoaded" class="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>

    <!-- Final Step: Display Statistics -->
    <div v-else class="mt-6 w-full max-w-5xl text-center">
      <div class="text-lg text-gray-800 items-center text-center sm:text-left">
        <h3 class="text-5xl font-bold text-center mb-20">Super, Deine Meinung zählt!</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[10vw] p-4">
          <div class="blob-shape">{{ selectedAttributePercentage.toFixed(0) }}% {{ selectedAttribute.title }}</div>

          <div class="p-6">
            <span class="text-5xl">{{ selectedAttributePercentage.toFixed(0) }}%</span>
            <p class="mt-2">haben sich ebenso für dieses Attribut entschieden.</p>
          </div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full text-sm text-gray-600">
        <span v-for="attr in remainingAttributesPercentages" :key="attr.title" class="px-3 py-1 bg-gray-100 rounded-full">
          {{ attr.percentage.toFixed(0) }}% {{ attr.title }}
        </span>
      </div>

      <div class="mt-4 text-center">
        <button @click="navigateTo('/newsletter')" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">
          Weiter
        </button>
      </div>
    </div>
  </div>
</Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from "vue";
import { useFirestore } from "#imports";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import GridCards from "~/components/GridCards.vue";
import Spinner from "~/components/Spinner.vue";
import { calculateSelectionStats } from "~/utils/selectionStatsHelper";

const db = useFirestore();
const appSettingsLoaded = ref(false);
const imagesLoaded = ref(false);
const statsLoaded = ref(false); // 🆕 Track if stats are loaded
const selectedBrand = ref<string | null>(null);
const selectedBrandAttributes = ref<Array<{ title: string }>>([]);
const selectedAttribute = ref<{ title: string } | null>(null);
const selectionStats = ref<{ [key: string]: number }>({});
const totalSelections = ref<number>(0);
const brandDocs = ref<Array<{ id: string; data: { brand: string; brandImageUrl?: string; attributes: Array<{ title: string }> } }>>([]);

onMounted(async () => {
  await loadBrandData();
  preloadImages();
});

// **Load stats only when brand is selected**
watchEffect(async () => {
  if (selectedBrand.value) {
    statsLoaded.value = false; // 🆕 Set loading state before fetching
    await updateSelectionStats();
    statsLoaded.value = true; // 🆕 Mark as loaded
  }
});

// **Fetch and update selection statistics**
async function updateSelectionStats() {
  if (!selectedBrand.value) return;
  const stats = await calculateSelectionStats(db, selectedBrand.value);
  selectionStats.value = stats.totalSelections;
  totalSelections.value = stats.totalCount;
}

// **Compute percentage for selected attribute**
const selectedAttributePercentage = computed(() => {
  if (!selectedAttribute.value || totalSelections.value === 0) return 0;
  return ((selectionStats.value[selectedAttribute.value.title] || 0) / totalSelections.value) * 100;
});

// **Compute percentages for all attributes (even with 0%)**
const remainingAttributesPercentages = computed(() => {
  return selectedBrandAttributes.value.map((attr) => ({
    title: attr.title,
    percentage: ((selectionStats.value[attr.title] || 0) / totalSelections.value) * 100,
  }));
});

// **Load brands from Firestore**
async function loadBrandData() {
  try {
    const snap = await getDocs(collection(db, "brandAttributes"));
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.brand && data.attributes) {
        brandDocs.value.push({
          id: docSnap.id,
          data: data as { brand: string; brandImageUrl?: string; attributes: Array<{ title: string }> },
        });
      }
    });
  } catch (err) {
    console.error("Error loading brand attributes:", err);
  } finally {
    appSettingsLoaded.value = true;
  }
}

// **Preload brand images**
async function preloadImages() {
  imagesLoaded.value = false;
 
  // Ensure brandImageUrl is always a string by filtering out undefined values
  const images = brandOptions.value
    .map((item) => item.brandImageUrl || "") // Replace undefined with an empty string
    .filter((url) => url !== ""); // Remove empty strings

  if (images.length === 0) {
    imagesLoaded.value = true;
    return;
  }

  let loadedCount = 0;
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = img.onerror = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        imagesLoaded.value = true;
      }
    };
  });
}

const brandOptions = computed(() => brandDocs.value.map((doc) => doc.data));

function selectBrand(brand: any) {
  selectedBrand.value = brand.brand;
  selectedBrandAttributes.value = brand.attributes;
  selectedAttribute.value = null;
}

async function selectAttribute(attribute: { title: string }) {
  selectedAttribute.value = attribute;
  statsLoaded.value = false; // 🆕 Mark stats as loading
  await trackSelection();
  await updateSelectionStats();
  statsLoaded.value = true; // 🆕 Mark stats as loaded
}

function navigateTo(route: string) {
  window.location.href = route;
}

// **Track selection in Firestore**
async function trackSelection() {
  if (!selectedBrand.value || !selectedAttribute.value) return;

  try {
    await addDoc(collection(db, "brandSelections"), {
      brand: selectedBrand.value,
      attribute: selectedAttribute.value.title,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Fehler beim Speichern der Auswahl:", err);
  }
}
</script>

<style scoped>
.blob-shape {
  width: 400px;
  height: 250px;
  background-color: #ffd600;
  border-radius: 40% 60% 40% 60% / 60% 40% 60% 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  text-align: center;
}
</style>