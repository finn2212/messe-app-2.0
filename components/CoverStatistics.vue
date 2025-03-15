<template>
  <div v-if="coversLoading" class="mt-12 bg-white shadow sm:rounded-lg p-4">
    <p class="text-sm text-gray-500">Lade Buchcover Statistik...</p>
  </div>

  <div v-else class="mt-12 bg-white shadow sm:rounded-lg p-4">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">
      Buchcover Auswahl Statistik ({{
        activeMesseId ? getMesseName() : "Alle Werte"
      }})
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
import { ref, watch, nextTick } from "vue";
import { useFirestore } from "#imports";
import { collection, getDocs } from "firebase/firestore";
import CsvExportHelper from "~/helpers/csvExportHelper";
import type { Messe, CoverInfo } from "~/types";

// The parent passes these
const props = defineProps<{
  messen: Messe[];
  activeMesseId: string | null;
}>();

const db = useFirestore();
const coversLoading = ref(false);

const coverStats = ref<CoverInfo[]>([]);

watch(
  () => props.activeMesseId,
  async () => {
    await fetchCoverStats();
  },
  { immediate: true }
);

async function fetchCoverStats() {
  coversLoading.value = true;
  coverStats.value = [];

  // 1) coverSelections => base data
  const coverSnap = await getDocs(collection(db, "coverSelections"));
  const coverTrackingSnap = await getDocs(
    collection(db, "coverSelectionsTracking")
  );

  const coverCounts: Record<string, { countA: number; countB: number }> = {};

  coverSnap.forEach((docSnap) => {
    const data = docSnap.data();
    coverCounts[docSnap.id] = { countA: 0, countB: 0 };
    coverStats.value.push({
      coverId: docSnap.id,
      title: data.title,
      coverA: data.coverA,
      coverB: data.coverB,
      countA: 0,
      countB: 0,
    });
  });

  // 2) filter by messe date range
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

  coverTrackingSnap.forEach((docSnap) => {
    const data = docSnap.data() as {
      coverId: string;
      selectedCover: string;
      timestamp: any;
    };

    const selectionDate = data.timestamp.toDate();
    if (startDate && endDate) {
      if (selectionDate < startDate || selectionDate > endDate) return;
    }

    // increment
    if (coverCounts[data.coverId]) {
      // find the actual covers from coverStats
      const c = coverStats.value.find((c) => c.coverId === data.coverId);
      if (!c) return;

      if (data.selectedCover === c.coverA) {
        coverCounts[data.coverId].countA++;
      } else {
        coverCounts[data.coverId].countB++;
      }
    }
  });

  // 3) update final array
  coverStats.value.forEach((cover) => {
    cover.countA = coverCounts[cover.coverId]?.countA || 0;
    cover.countB = coverCounts[cover.coverId]?.countB || 0;
  });

  coversLoading.value = false;
  await nextTick();
}

function getMesseName() {
  const messe = props.messen.find((m) => m.id === props.activeMesseId);
  return messe?.name || "";
}

function exportCsv() {
  // Bereite ein Array mit den exportierbaren Daten vor – ohne Cover ID
  const csvData = coverStats.value.map((cover) => ({
    Titel: cover.title,
    "Stimmen Cover A": cover.countA,
    "Stimmen Cover B": cover.countB,
  }));

  // Setze den Dateinamen, abhängig davon, ob eine aktive Messe vorliegt
  const filename = props.activeMesseId
    ? `Buchcover_Auswertung_${getMesseName()}.csv`
    : "Buchcover_Auswertung_Alle_Zeiträume.csv";

  CsvExportHelper.exportToCsv(csvData, filename);
}
</script>

<style scoped>
/* Example styling */
</style>
