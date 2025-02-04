<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900">
      Admin - Auswahlstatistiken
    </h1>
    <p class="mt-2 text-sm text-gray-700">
      Übersicht über die Auswahl der Attribute für jede Marke. Wähle eine Messe
      aus, um die Statistiken für den jeweiligen Zeitraum anzuzeigen.
    </p>

    <!-- Tabs für Messen -->
    <div class="mt-4 border-b border-gray-300">
      <nav class="flex space-x-4">
        <button
          v-for="messe in messen"
          :key="messe.id"
          @click="setActiveMesse(messe)"
          :class="[
            'py-2 px-4 text-sm font-medium',
            activeMesse === messe.id
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          {{ messe.name }}
        </button>
        <button
          @click="setActiveMesse(null)"
          :class="[
            'py-2 px-4 text-sm font-medium',
            activeMesse === null
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          Alle Werte
        </button>
      </nav>
    </div>

    <!-- Spinner while stats are loading -->
    <div
      v-if="!statsLoaded"
      class="flex items-center justify-center min-h-screen"
    >
      <Spinner />
    </div>

    <!-- Chart Container -->
    <div v-else class="mt-8 bg-white shadow sm:rounded-lg p-4">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        Attribut-Auswahl nach Marke ({{
          activeMesse
            ? messen.find((m) => m.id === activeMesse)?.name
            : "Alle Werte"
        }})
      </h2>

      <div class="w-full max-w-4xl mx-auto">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
    <!-- Cover Selection Statistics -->
    <div v-if="coversLoaded" class="mt-12 bg-white shadow sm:rounded-lg p-4">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        Buchcover Auswahl Statistik
      </h2>

      <div
        v-for="cover in coverStats"
        :key="cover.coverId"
        class="mb-6 p-4 bg-gray-100 rounded-lg"
      >
        <h3 class="text-md font-medium text-gray-800 text-center mb-4">
          {{ cover.title }}
        </h3>

        <div class="flex justify-center gap-8">
          <!-- Cover A -->
          <div class="text-center">
            <img
              :src="cover.coverA"
              class="w-40 h-60 object-cover rounded-lg shadow-md"
            />
            <p class="mt-2 text-lg font-semibold">{{ cover.countA }} Stimmen</p>
          </div>

          <!-- Cover B -->
          <div class="text-center">
            <img
              :src="cover.coverB"
              class="w-40 h-60 object-cover rounded-lg shadow-md"
            />
            <p class="mt-2 text-lg font-semibold">{{ cover.countB }} Stimmen</p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <!-- Quizzes Tabs -->
      <div class="mt-8 border-b border-gray-300">
        <nav class="flex space-x-4">
          <button
            v-for="quiz in quizzes"
            :key="quiz.id"
            @click="setActiveQuiz(quiz.id)"
            :class="[
              'py-2 px-4 text-sm font-medium',
              activeQuiz === quiz.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            {{ quiz.title }}
          </button>
          <button
            @click="setActiveQuiz(null)"
            :class="[
              'py-2 px-4 text-sm font-medium',
              activeQuiz === null
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
          </button>
        </nav>
      </div>

      <!-- Some other content... -->
      <QuizStatistics v-if="activeQuiz" :quizId="activeQuiz" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useFirestore } from "#imports";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

import Spinner from "~/components/Spinner.vue";
import { Chart } from "chart.js/auto";
import QuizStatistics from "~/components/QuizStatistics.vue";

const quizzes = ref<Array<{ id: string; title: string }>>([]);
const activeQuiz = ref<string | null>(null);

// **Define Admin Layout**
definePageMeta({ layout: "admin" });

// Firestore instance
const db = useFirestore();
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const statsLoaded = ref(false);
const coversLoaded = ref(false);
const coverStats = ref<
  Array<{
    coverId: string;
    title: string;
    coverA: string;
    coverB: string;
    countA: number;
    countB: number;
  }>
>([]);

// Data storage
const brandData = ref<{ [brand: string]: { [attribute: string]: number } }>({});
const allAttributes = ref<Set<string>>(new Set());
const brandNames = ref<string[]>([]);
const messen = ref<
  Array<{ id: string; name: string; startDate: string; endDate: string }>
>([]);
const activeMesse = ref<string | null>(null); // Current active Messe ID or null for all data

// 🎨 **Define custom colors for brands**
const brandColors = [
  "rgba(5,174,48,255)", // Green
  "rgba(255,153,0,255)", // Orange
  "rgba(255,204,2,255)", // Yellow
];

// **Fetch Messen and Brand Stats**
onMounted(async () => {
  await fetchMessen();
  await fetchBrandStats();
  await fetchCoverStats();
  await fetchQuizzes();
});

async function fetchCoverStats() {
  coversLoaded.value = false;
  coverStats.value = [];

  const coverSnap = await getDocs(collection(db, "coverSelections"));
  const coverTrackingSnap = await getDocs(
    collection(db, "coverSelectionsTracking")
  );

  const coverCounts: { [coverId: string]: { countA: number; countB: number } } =
    {};

  // Initialize coverStats
  coverSnap.forEach((doc) => {
    const data = doc.data();
    coverCounts[doc.id] = { countA: 0, countB: 0 };
    coverStats.value.push({
      coverId: doc.id,
      title: data.title,
      coverA: data.coverA,
      coverB: data.coverB,
      countA: 0,
      countB: 0,
    });
  });

  // Check if filtering by Messe
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  if (activeMesse.value) {
    const selectedMesse = messen.value.find((m) => m.id === activeMesse.value);
    if (selectedMesse) {
      startDate = new Date(selectedMesse.startDate); // Convert string to Date object
      endDate = new Date(selectedMesse.endDate);
      endDate.setHours(23, 59, 59, 999); // Ensure the entire day is included
    }
  }

  // Process selections with optional Messe filtering
  coverTrackingSnap.forEach((doc) => {
    const data = doc.data();
    const selectionDate = data.timestamp.toDate(); // Convert Firestore timestamp to Date

    // If a Messe is selected, filter by date range
    if (startDate && endDate) {
      if (selectionDate < startDate || selectionDate > endDate) return;
    }

    if (coverCounts[data.coverId]) {
      if (
        data.selectedCover ===
        coverStats.value.find((c) => c.coverId === data.coverId)?.coverA
      ) {
        coverCounts[data.coverId].countA++;
      } else {
        coverCounts[data.coverId].countB++;
      }
    }
  });

  // Update cover stats with counted votes
  coverStats.value.forEach((cover) => {
    cover.countA = coverCounts[cover.coverId]?.countA || 0;
    cover.countB = coverCounts[cover.coverId]?.countB || 0;
  });

  coversLoaded.value = true;
  await nextTick();
}

// **Fetch all Messen from Firestore**
async function fetchMessen() {
  messen.value = [];
  const messeSnap = await getDocs(collection(db, "messen"));
  messeSnap.forEach((doc) => {
    const data = doc.data();
    messen.value.push({
      id: doc.id,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
    });
  });
}

// **Set active Messe and refresh stats**
async function setActiveMesse(messe: any) {
  activeMesse.value = messe ? messe.id : null;
  await fetchBrandStats();
  await fetchCoverStats();
}

async function fetchBrandStats() {
  statsLoaded.value = false;

  const stats: Record<string, Record<string, number>> = {};
  allAttributes.value.clear();
  brandNames.value = [];

  // **Step 1: Fetch all brands and initialize attributes**
  const brandSnap = await getDocs(collection(db, "brandAttributes"));
  brandSnap.forEach((doc) => {
    const brand = doc.data().brand;
    const attributes = doc.data().attributes || [];

    if (!brandNames.value.includes(brand)) {
      brandNames.value.push(brand);
    }

    stats[brand] = {};

    attributes.forEach((attr: { title: string }) => {
      stats[brand][attr.title] = 0; // Initialize
      allAttributes.value.add(attr.title);
    });
  });

  // **Step 2: Fetch selections and filter by Messe timeframe**
  const selectionsSnap = await getDocs(collection(db, "brandSelections"));

  // Check if filtering by Messe
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  if (activeMesse.value) {
    const messe = messen.value.find((m) => m.id === activeMesse.value);
    if (messe) {
      startDate = new Date(messe.startDate); // Convert string to Date object
      endDate = new Date(messe.endDate);
      endDate.setHours(23, 59, 59, 999); // Ensure the full day is included
    }
  }

  selectionsSnap.forEach((doc) => {
    const { brand, attribute, timestamp } = doc.data() as {
      brand: string;
      attribute: string;
      timestamp: any;
    };

    // Convert Firestore timestamp to JavaScript Date object
    const selectionDate = timestamp.toDate();

    // **Apply Messe Date Filter**
    if (startDate && endDate) {
      if (selectionDate < startDate || selectionDate > endDate) return;
    }

    // Increment attribute count
    if (!stats[brand]) stats[brand] = {};
    stats[brand][attribute] = (stats[brand][attribute] || 0) + 1;
  });

  brandData.value = stats;
  statsLoaded.value = true;

  await nextTick();
  renderChart();
}

// **Render Chart.js Bar Chart**
function renderChart() {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  // **X-axis labels (All unique attributes)**
  const labels = Array.from(allAttributes.value);

  // **Build datasets for each brand (Ensuring separate bars for the same attributes)**
  const datasets = brandNames.value.map((brand, index) => ({
    label: brand,
    data: labels.map((attr) => brandData.value[brand]?.[attr] || 0),
    backgroundColor: brandColors[index % brandColors.length],
    borderColor: brandColors[index % brandColors.length].replace("0.7", "1"),
    borderWidth: 1,
  }));

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: false },
        y: { beginAtZero: true },
      },
      plugins: {
        legend: { display: true, position: "top" },
        tooltip: { mode: "index", intersect: false },
      },
    },
  });
}

async function fetchQuizzes() {
  const quizSnap = await getDocs(collection(db, "quizzes"));
  const allQuizzes: Array<{ id: string; title: string }> = [];

  quizSnap.forEach((docSnap) => {
    const data = docSnap.data();
    // Adjust field name if your quiz docs store a different key than "title"
    const quizTitle = data.title || "Untitled Quiz";
    allQuizzes.push({ id: docSnap.id, title: quizTitle });
  });

  quizzes.value = allQuizzes;

  // By default, pick the first quiz if available
  if (quizzes.value.length > 0) {
    activeQuiz.value = quizzes.value[0].id;
  }
}

function setActiveQuiz(quizId: string | null) {
  activeQuiz.value = quizId;
}
</script>

<style scoped>
/* Tabs Styling */
nav button {
  transition: all 0.2s ease-in-out;
}
</style>
