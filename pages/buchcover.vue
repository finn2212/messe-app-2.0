<template>
  <!-- Loading state -->
  <div v-if="!coversLoaded || isLoading || !imagesLoaded" class="flex items-center justify-center min-h-screen">
    <Spinner></Spinner>
  </div>

  <!-- Main selection container -->
  <div v-else class="p-4 flex flex-col items-center justify-center">
    <Transition name="fade" appear>
      <h1 v-if="currentCoverIndex < coverDocs.length" class="text-2xl font-bold text-center mb-6">
        Wähle dein bevorzugtes Buchcover
      </h1>
    </Transition>

    <div v-if="currentCoverIndex < coverDocs.length">
      <Transition name="fade" appear>
        <h2 class="text-xl font-semibold mb-4 text-center">
          {{ coverDocs[currentCoverIndex].data.title }}
        </h2>
      </Transition>

      <!-- Cover selection grid -->
      <div class="flex flex-row justify-center gap-8">
        <Transition name="fade" appear>
          <div @click="selectCover(0)"
            class="cursor-pointer transform transition-all duration-300 bg-transparent hover:scale-105 rounded-lg"
            :class="getCoverClasses(0)">
            <img :src="coverOptions[0]"
              class="w-64 h-96 object-cover rounded-lg shadow-lg bg-transparent mix-blend-multiply" />
            <div v-if="showA" class="flex items-center justify-center bg-white p-2 mt-2 rounded-md text-center">
              <span class="text-black font-bold text-xl">{{ coverDocs[currentCoverIndex].data.counterCoverA }} „mal
                ausgewählt</span>
            </div>
          </div>
        </Transition>

        <Transition name="fade-delay" appear>
          <div @click="selectCover(1)"
            class="cursor-pointer transform transition-all duration-300 bg-transparent hover:scale-105 rounded-lg"
            :class="getCoverClasses(1)">
            <img :src="coverOptions[1]"
              class="w-64 h-96 object-cover rounded-lg shadow-lg bg-transparent mix-blend-multiply" />
            <div v-if="showB" class="flex items-center justify-center">
              <span class="text-white font-bold text-xl">{{ coverDocs[currentCoverIndex].data.counterCoverB }} „mal
                ausgewählt</span>
            </div>
          </div>
        </Transition>
      </div>

      <Transition name="slide" mode="out-in">
        <div v-if="(showA || showB) && total > 0 && currentNum < total" class="my-4 relative">
          <p v-if="currentNum % 2 === 0" key="x" class="text-5xl font-bold text-center">
            {{ currentNum }}
          </p>
          <p v-else key="y" class="text-5xl font-bold text-center">
            {{ currentNum }}
          </p>
        </div>
      </Transition> 

      <!-- Feedback + next button -->
      <Transition name="fade" appear>
        <div v-if="selectedCover !== null" class="mt-4 text-center">
          <button @click="nextCover" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">
            Weiter
          </button>
        </div>
      </Transition>
    </div>

    <!-- Selection finished -->
    <Transition name="fade">
      <div v-if="currentCoverIndex >= coverDocs.length" class="text-center mt-8">
        <h2 class="text-xl font-semibold mb-4">Danke für deine Auswahl!</h2>
        <button @click="navigateToNewsletter" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">
          Weiter zum Newsletter
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useFirestore } from "#imports";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "vue-router";
import Spinner from "~/components/Spinner.vue";

const db = useFirestore();
const router = useRouter();

const coverDocs = ref<Array<{ id: string; data: any }>>([]);
const coversLoaded = ref(false);
const currentCoverIndex = ref(0);
const selectedCover = ref<number | null>(null);
const isLoading = ref(false);
const imagesLoaded = ref(false);
const showA = ref(false);
const showB = ref(false);
const currentNum = ref(0);
const total = ref(0);
let interval = null

// Load covers on mount
onMounted(async () => {
  await loadCovers();
});

async function loadCovers() {
  coverDocs.value = [];
  const snap = await getDocs(collection(db, "coverSelections"));
  snap.forEach((docSnap) => {
    coverDocs.value.push({
      id: docSnap.id,
      data: docSnap.data(),
    });
  });
  coversLoaded.value = true;
  preloadImages();
}

// Preload images
async function preloadImages() {
  imagesLoaded.value = false;
  const covers = coverOptions.value;
  let loadedCount = 0;

  covers.forEach((cover) => {
    const img = new Image();
    img.src = cover;
    img.onload = img.onerror = () => {
      loadedCount++;
      if (loadedCount === covers.length) {
        imagesLoaded.value = true;
      }
    };
  });
}

const coverOptions = computed(() => {
  if (coverDocs.value.length === 0) return [];
  return [
    coverDocs.value[currentCoverIndex.value].data.coverA,
    coverDocs.value[currentCoverIndex.value].data.coverB,
  ];
});

const startCounter = () => {
  if (total.value > 0 && (showA.value || showB.value)) {
    interval = setInterval(() => {
      currentNum.value++;
    }, 1000);

    if (currentNum.value >= total.value) {
      clearInterval(interval);
      interval = null;
      total.value = 0;
      showA.value = false;
      showB.value = false;
    }
  }
};

async function selectCover(index: number) {
  if (selectedCover.value === null) {
    selectedCover.value = index;
    await trackCoverSelection(index);
    await incrementCoverSelection(index);

    if (index === 0) {
      showA.value = true;
    } else {
      showB.value = true;
    }

    startCounter();
  }
}

function getCoverClasses(index: number) {
  if (selectedCover.value === null) {
    return "border-gray-300";
  }
  return index === selectedCover.value
    ? "border-green-500"
    : "border-red-500 filter grayscale";
}

async function nextCover() {
  isLoading.value = true;
  selectedCover.value = null;
  currentCoverIndex.value++;

  if (currentCoverIndex.value >= coverDocs.value.length) {
    navigateToNewsletter();
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  await preloadImages();

  isLoading.value = false;
}

function navigateToNewsletter() {
  router.push("/newsletter");
}

// **Track Cover Selection in Firestore**
async function trackCoverSelection(selectedIndex: number) {
  if (currentCoverIndex.value >= coverDocs.value.length) return;

  const coverId = coverDocs.value[currentCoverIndex.value].id;
  const selectedCoverUrl = coverOptions.value[selectedIndex];

  try {
    await addDoc(collection(db, "coverSelectionsTracking"), {
      coverId: coverId,
      selectedCover: selectedCoverUrl,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Fehler beim Speichern der Cover-Auswahl:", err);
  }
}

// **Increment Cover Selection Counter**
async function incrementCoverSelection(selectedIndex: number) {
  if (currentCoverIndex.value >= coverDocs.value.length) return;
  const coverId = coverDocs.value[currentCoverIndex.value].id;
  const counterField = `counterCover${selectedIndex === 0 ? "A" : "B"}`;
  coverDocs.value[currentCoverIndex.value].data[counterField]++;
  total.value = coverDocs.value[currentCoverIndex.value].data.counterCoverA;

  try {
    await setDoc(doc(db, "coverSelections", coverId), {
      ...coverDocs.value[currentCoverIndex.value].data,
    });
  } catch (err) {
    console.error("Fehler beim Zählen der Cover-Auswahl:", err);
  }
}
</script>

<style scoped>
/* General Fade Animation */
.fade-enter-active {
  transition: opacity 0.8s ease-in-out;
}

.fade-enter-from {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
}

/* Delayed Fade Animation */
.fade-delay-enter-active {
  transition: opacity 0.8s ease-in-out;
  transition-delay: 0.4s;
  /* Delay for second image */
}

.fade-delay-enter-from {
  opacity: 0;
}

.fade-delay-enter-to {
  opacity: 1;
}

.slide-enter-from {
  top: 10px;
  opacity: 0.5;
}

.slide-enter-active, .slide-delay-enter-active {
  transition: all .15s;
}

.slide-enter-to {
  top: 0px;
  opacity: 1;
}

.slide-delay-enter-to {
  top: 0px;
  opacity: 1;
}

.slide-delay-enter-active {
  top: -30px;
  opacity: 0;
  transform: blur(8px);
}
</style>
