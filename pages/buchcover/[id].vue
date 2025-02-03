<template>
  <!-- Loading state -->
  <div v-if="!coversLoaded || isLoading" class="flex items-center justify-center min-h-screen">
   <Spinner></Spinner>
  </div>

  <!-- Main selection container -->
  <div v-else class="p-4 flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold text-center mb-6">
      Wähle dein bevorzugtes Buchcover
    </h1>

    <div v-if="currentCoverIndex < coverDocs.length">
      <h2 class="text-xl font-semibold mb-4 text-center">
        {{ coverDocs[currentCoverIndex].data.title }}
      </h2>

      <!-- Cover selection grid -->
      <div class="flex flex-row justify-center gap-8">
        <div
          v-for="(cover, index) in coverOptions"
          :key="index"
          @click="selectCover(index)"
          class="cursor-pointer transform transition-all duration-300 bg-transparent hover:scale-105 rounded-lg"
          :class="getCoverClasses(index)"
        >
          <img
            :src="cover"
            class="w-64 h-96 object-cover rounded-lg shadow-lg bg-transparent mix-blend-multiply"
          />
        </div>
      </div>

      <!-- Feedback + next button -->
      <div v-if="selectedCover !== null" class="mt-4 text-center">
        <button
          @click="nextCover"
          class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
        >
          Weiter
        </button>
      </div>
    </div>

    <!-- Selection finished -->
    <div v-else class="text-center mt-8">
      <h2 class="text-xl font-semibold mb-4">Danke für deine Auswahl!</h2>
      <button
        @click="navigateToNewsletter"
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
      >
        Weiter zum Newsletter
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useFirestore } from "#imports";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "vue-router";
import Spinner from "~/components/Spinner.vue";

const db = useFirestore();
const router = useRouter();

const coverDocs = ref<Array<{ id: string; data: any }>>([]);
const coversLoaded = ref(false);
const currentCoverIndex = ref(0);
const selectedCover = ref<number | null>(null);
const isLoading = ref(false);

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
}

const coverOptions = computed(() => {
  if (coverDocs.value.length === 0) return [];
  return [
    coverDocs.value[currentCoverIndex.value].data.coverA,
    coverDocs.value[currentCoverIndex.value].data.coverB,
  ];
});

function selectCover(index: number) {
  if (selectedCover.value === null) {
    selectedCover.value = index;
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
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulating loading delay
  isLoading.value = false;

  if (currentCoverIndex.value >= coverDocs.value.length) {
    navigateToNewsletter();
  }
}

function navigateToNewsletter() {
  router.push("/newsletter");
}
</script>

<style scoped>
.border-4 {
  border-width: 4px;
}
</style>
