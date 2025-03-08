<template>
    <div>
      <h1 class="text-base font-semibold text-gray-900 mb-4">
        Feedback anzeigen
      </h1>
  
      <!-- Bereich für Sortierung und CSV Export -->
      <div class="mt-4 flex justify-between items-center">
        <div>
          <label class="mr-2 text-sm font-medium text-gray-700">Sortierung:</label>
          <select
            v-model="sortOption"
            class="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <button
          @click="exportCsv"
          class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Export als CSV
        </button>
      </div>
  
      <!-- Tabelle der vorhandenen Feedbacks -->
      <div class="mt-8 flow-root" v-if="feedbacks.length">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Brand
                    </th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Nachricht
                    </th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Datum
                    </th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="fb in sortedFeedbacks" :key="fb.id">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {{ fb.data.brand }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ fb.data.message }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ formatDate(fb.data.timestamp) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <button
                        @click="deleteFeedback(fb.id)"
                        class="text-red-600 hover:text-red-800"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from "vue";
  import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
  import { useFirestore } from "#imports";
  import CsvExportHelper from "~/helpers/csvExportHelper";
  
  definePageMeta({
    layout: "admin",
  });
  
  const db = useFirestore();
  const feedbacks = ref<Array<{ id: string; data: any }>>([]);
  
  // Sortierungsoptionen: Brand (auf/ab) und Zeit (auf/ab)
  const sortOptions = [
    { value: "brandAsc", label: "Brand aufsteigend" },
    { value: "brandDesc", label: "Brand absteigend" },
    { value: "timeAsc", label: "Zeit aufsteigend" },
    { value: "timeDesc", label: "Zeit absteigend" },
  ];
  // Standard: Zeit absteigend, damit die neuesten zuerst angezeigt werden.
  const sortOption = ref("timeDesc");
  
  onMounted(async () => {
    await loadFeedback();
  });
  
  async function loadFeedback() {
    feedbacks.value = [];
    const querySnap = await getDocs(collection(db, "feedback"));
    querySnap.forEach((docSnap) => {
      feedbacks.value.push({ id: docSnap.id, data: docSnap.data() });
    });
  }
  
  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    return date.toLocaleString("de-DE");
  }
  
  const sortedFeedbacks = computed(() => {
    // Wir sortieren basierend auf der ausgewählten Option
    return [...feedbacks.value].sort((a, b) => {
      switch (sortOption.value) {
        case "brandAsc":
          return a.data.brand.localeCompare(b.data.brand);
        case "brandDesc":
          return b.data.brand.localeCompare(a.data.brand);
        case "timeAsc":
          return a.data.timestamp - b.data.timestamp;
        case "timeDesc":
        default:
          return b.data.timestamp - a.data.timestamp;
      }
    });
  });
  
  async function deleteFeedback(id: string) {
    if (!confirm("Feedback wirklich löschen?")) return;
    const docRef = doc(db, "feedback", id);
    await deleteDoc(docRef);
    feedbacks.value = feedbacks.value.filter((fb) => fb.id !== id);
  }
  
  function exportCsv() {
    const csvData = feedbacks.value.map((fb) => ({
      Brand: fb.data.brand,
      Nachricht: fb.data.message,
      Datum: formatDate(fb.data.timestamp),
    }));
    CsvExportHelper.exportToCsv(csvData, "feedback_export.csv");
  }
  </script>
  
  <style scoped>
  /* Passe die Styles nach Bedarf an */
  </style>