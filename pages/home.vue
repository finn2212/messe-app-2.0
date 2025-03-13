<template>
  <div class="pt-20">
    <div v-if="itemsLoaded">
      <Transition name="fade">
        <div>
          <h1 class="text-2xl font-bold text-center">
            Mach mit und sag uns Deine Meinung.
          </h1>
          <div class="flex items-center justify-between w-full mb-12 md:px-12 lg:px-28 xl:32">
            <button type="button" @click.prevent="prevPage" :disabled="currentPageIndex === 0"
              :class="`border rounded-lg border-slate-300 p-2 ${currentPageIndex === 0 ? 'opacity-50 bg-slate-100' : ''}`">
              <ChevronDoubleLeftIcon class="md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </button>
            <h2>{{ slotPages[currentPageIndex].name }}</h2>
            <button type="button" @click.prevent="nextPage" :disabled="currentPageIndex === slotPages.length - 1"
              :class="`border rounded-lg border-slate-300 p-2 ${currentPageIndex === slotPages.length - 1 ? 'opacity-50 bg-slate-100' : ''}`">
              <ChevronDoubleRightIcon class="md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </button>
          </div>
        </div>
      </Transition>
      <!-- Only render <GridCards> if we have itemsLoaded = true -->
      <GridCards
        :items="slots"
        :onCardClick="(item) => handleClick(item as HomeSlot)"
      >
        <template #cardContent="{ item }">
          <div class="w-full md:h-40 lg:h-52 xl:h-60 md:w-56 lg:w-64 xl:w-96 relative">
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
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { navigateTo } from "#app";
import GridCards from "~/components/GridCards.vue";
import Spinner from "~/components/Spinner.vue";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/vue/24/outline";

const db = useFirestore();

interface HomeSlot {
  title: string;
  type: string;
  dataId?: string;
  imageUrl?: string;
  slotPageId: string;
}

interface SlotPage {
  id: string;
  name: string;
}

const slots = ref<HomeSlot[]>([]);
const slotPages = ref<SlotPage[]>([]);
const activeSlotPageId = ref<string | null>(null);
const currentPageIndex = ref(0);
const itemsLoaded = ref(false);

onMounted(async () => {
  const pageSnap = await getDocs(collection(db, "slotPages"));
  slotPages.value = pageSnap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
    };
  });
  if (slotPages.value.length > 0) {
    activeSlotPageId.value = slotPages.value[0].id;

    await loadSlots();
  }
});

const loadSlots = async () => {
  // 1) Fetch Firestore data
  const docRef = doc(db, "config", "homeSlots");
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    itemsLoaded.value = true;
    return;
  }

  // 2) We have the data
  const data = snap.data().slots as HomeSlot[];
  slots.value = data.filter(s => s.slotPageId === activeSlotPageId.value) || [];

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
}

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

// Pagination controls
function nextPage() {
  if (currentPageIndex.value < slotPages.value.length - 1) {
    currentPageIndex.value++;
    activeSlotPageId.value = slotPages.value[currentPageIndex.value].id;
    loadSlots();
  }
}

function prevPage() {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--;
    activeSlotPageId.value = slotPages.value[currentPageIndex.value].id;
    loadSlots();
  }
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
      navigateTo("/buchcover");
      break;
    case "feedback":
      navigateTo("/feedback");
      break;
    case "newsletter":
      navigateTo("/newsletter");
      break;
    case "jugendwort":
      navigateTo("/jugendwort");
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
