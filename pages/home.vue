<template>
  <div class="pt-20">
    <div v-if="itemsLoaded">
      <Transition name="fade">
        <h1 class="text-2xl font-bold text-center mb-12">
          Mach mit und sag uns Deine Meinung.
        </h1>
      </Transition>
      <!-- Only render <GridCards> if we have itemsLoaded = true -->
      <GridCards
        :items="slots"
        :onCardClick="(item) => handleClick(item as HomeSlot)"
      >
        <template #cardContent="{ item }">
          <div class="h-60 w-96 relative">
            <div v-if="item.imageUrl">
              <img
                :src="item.imageUrl"
                alt="Slot image"
                class="absolute inset-0 w-full h-full object-cover"
              />
              <div
                class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 p-2 rounded-md text-center text-black font-semibold"
              >
                {{ item.displayName }}
              </div>
            </div>

            <div
              v-else
              class="absolute inset-0 flex items-center justify-center"
            >
              <span class="text-gray-400">No Image</span>
            </div>
          </div>
        </template>
      </GridCards>
    </div>

    <!-- Optional: a loading spinner or placeholder until items are ready -->
    <div v-if="!itemsLoaded" class="flex justify-center min-h-screen">
      <Spinner></Spinner>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { navigateTo } from "#app";
import GridCards from "~/components/GridCards.vue";
import Spinner from "~/components/Spinner.vue";

const db = useFirestore();

interface HomeSlot {
  title: string;
  type: string;
  dataId?: string;
  imageUrl?: string;
}

const slots = ref<HomeSlot[]>([]);
const itemsLoaded = ref(false);

onMounted(async () => {
  // 1) Fetch Firestore data
  const docRef = doc(db, "config", "homeSlots");
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    itemsLoaded.value = true;
    return;
  }

  // 2) We have the data
  const data = snap.data();
  slots.value = data.slots || [];

  function isString(value: string | undefined): value is string {
    return typeof value === "string";
  }

  // ...
  const imageUrls = slots.value
    .map((s: HomeSlot) => s.imageUrl)
    .filter(isString); // now it's guaranteed to be string[]

  await preloadImages(imageUrls);

  // 4) Now that images are preloaded, show <GridCards>
  itemsLoaded.value = true;
});

// Preload each image with a Promise
function preloadImages(urls: string[]) {
  const promises = urls.map((url) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => resolve(); // or reject if you prefer
    });
  });
  return Promise.all(promises);
}

// Klick-Aktionen
function handleClick(slot: HomeSlot) {
  switch (slot.type) {
    case "quiz":
      navigateTo(`/quiz/${slot.dataId}`);
      break;
    case "marken":
      navigateTo("/marken");
      break;
    case "buchcover":
      navigateTo(`/buchcover/${slot.dataId}`);
      break;
    case "feedback":
      navigateTo("/feedback");
      break;
    case "newsletter":
      navigateTo("/newsletter");
      break;
    default:
      alert("Slot-Typ nicht definiert");
  }
}
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
