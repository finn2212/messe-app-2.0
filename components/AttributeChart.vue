<template>
  <div class="mt-8 bg-white shadow sm:rounded-lg p-4">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">
      Attribut-Auswahl nach Marke ({{
        activeMesseId ? getMesseName() : "Alle Werte"
      }})
    </h2>

    <!-- Spinner while loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-[200px]">
      <p class="text-gray-500 text-sm">Lade Markenauswahl...</p>
    </div>

    <div v-else>
      <div class="w-full max-w-4xl mx-auto">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
    <!-- CSV Export Button -->
    <div class="mt-4 flex justify-end">
      <button
        @click="exportCsv"
        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
      >
        Export als CSV
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from "vue";
import { Chart } from "chart.js/auto";

// We also need Firestore for brand stats
import { useFirestore } from "#imports";
import { collection, getDocs } from "firebase/firestore";
import CsvExportHelper from "~/helpers/csvExportHelper";
import type { Messe } from "~/types";

const props = defineProps<{
  messen: Messe[];
  activeMesseId: string | null;
}>();

const db = useFirestore();

// Local state
const loading = ref(false);

// Chart references
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart<"bar"> | null = null;

// Data for brand stats
const brandData = ref<Record<string, Record<string, number>>>({});
const allAttributes = ref<Set<string>>(new Set());
const brandNames = ref<string[]>([]);

// Colors
const brandColors = [
  "rgba(5,174,48,255)", // Green
  "rgba(255,153,0,255)", // Orange
  "rgba(255,204,2,255)", // Yellow
];

// Watch for changes to activeMesseId => re-fetch brand stats
watch(
  () => props.activeMesseId,
  async () => {
    await fetchBrandStats();
  },
  { immediate: true }
);

async function fetchBrandStats() {
  loading.value = true;
  brandData.value = {};
  allAttributes.value.clear();
  brandNames.value = [];

  // 1) Fetch brand attributes
  const brandSnap = await getDocs(collection(db, "brandAttributes"));
  brandSnap.forEach((doc) => {
    const data = doc.data();
    const brand = data.brand as string;
    const attributes = data.attributes || [];

    if (!brandNames.value.includes(brand)) {
      brandNames.value.push(brand);
    }

    brandData.value[brand] = {};

    attributes.forEach((attr: { title: string }) => {
      brandData.value[brand][attr.title] = 0;
      allAttributes.value.add(attr.title);
    });
  });

  // 2) Fetch brandSelections
  const selectionsSnap = await getDocs(collection(db, "brandSelections"));

  // Filter by messe date if activeMesseId is set
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  if (props.activeMesseId) {
    const messe = props.messen.find((m) => m.id === props.activeMesseId);
    if (messe) {
      startDate = new Date(messe.startDate);
      endDate = new Date(messe.endDate);
      endDate.setHours(23, 59, 59, 999);
    }
  }

  selectionsSnap.forEach((docSnap) => {
    const data = docSnap.data() as {
      brand: string;
      attribute: string;
      timestamp: any;
    };

    // Convert to JS date
    const selectionDate = data.timestamp.toDate();

    // if we have a messe range, apply filter
    if (startDate && endDate) {
      if (selectionDate < startDate || selectionDate > endDate) return;
    }

    // increment
    const brand = data.brand;
    const attribute = data.attribute;
    if (!brandData.value[brand]) {
      brandData.value[brand] = {};
    }
    brandData.value[brand][attribute] =
      (brandData.value[brand][attribute] || 0) + 1;
  });

  // Done loading
  loading.value = false;

  // Next tick => render or update chart
  await nextTick();
  renderChart();
}

// Render Chart
function renderChart() {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  // If chart instance exists, destroy for re-render
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const labels = Array.from(allAttributes.value);
  const datasets = brandNames.value.map((brand, index) => ({
    label: brand,
    data: labels.map((attr) => brandData.value[brand]?.[attr] || 0),
    backgroundColor: brandColors[index % brandColors.length],
    borderWidth: 1,
  }));

  chartInstance = new Chart(ctx, {
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

// Helper to get the chosen Messe name
function getMesseName() {
  const messe = props.messen.find((m) => m.id === props.activeMesseId);
  return messe?.name || "";
}
function exportCsv() {
  // Erstelle einen Array mit Objekten, in dem jede Zeile einem Brand entspricht
  // Die Spalten sind: Brand und für jedes Attribut der zugehörige Wert
  const attributes = Array.from(allAttributes.value);
  const csvData = brandNames.value.map((brand) => {
    const row: Record<string, any> = { Brand: brand };
    attributes.forEach((attr) => {
      row[attr] = brandData.value[brand]?.[attr] || 0;
    });
    return row;
  });
  const filename = props.activeMesseId
    ? `Marken_Attribute${getMesseName()}.csv`
    : "Marken_Attribute_Alle_Werte.csv";
  CsvExportHelper.exportToCsv(csvData, filename);
}
</script>

<style scoped>
/* Additional styling as needed */
</style>
