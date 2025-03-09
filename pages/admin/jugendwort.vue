<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900 mb-4">
      JugendWort
    </h1>
    <p class="mb-4 text-sm text-gray-700">
      Hier kannst du bis zu 20 Wörter hinzufügen, die später im Frontend zur Abstimmung stehen.
      Für jedes Wort werden auch die abgegebenen Stimmen gespeichert. Du kannst Wörter löschen und
      die Stimmen zurücksetzen.
    </p>

    <!-- Formular zum Hinzufügen eines neuen Wortes -->
    <div class="bg-white shadow sm:rounded-lg p-4 mb-6">
      <h2 class="text-base font-semibold text-gray-900 mb-2">
        Neues Wort hinzufügen
      </h2>
      <form @submit.prevent="addWord" class="flex items-center gap-2">
        <input
          v-model="newWord"
          type="text"
          placeholder="Neues Wort"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <button
          type="submit"
          class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          :disabled="words.length >= 20 || !newWord.trim()"
        >
          Hinzufügen
        </button>
      </form>
      <p v-if="words.length >= 20" class="mt-2 text-sm text-red-600">
        Maximal 20 Wörter erlaubt.
      </p>
    </div>

    <!-- Tabelle der vorhandenen Wörter -->
    <div class="mt-8 flow-root" v-if="words.length">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Wort
                  </th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Stimmen
                  </th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="word in words" :key="word.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {{ word.data.word }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ word.data.votes }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div class="flex gap-2">
                      <button
                        @click="deleteWord(word.id)"
                        class="text-red-600 hover:text-red-800"
                      >
                        Löschen
                      </button>
                      <button
                        @click="resetVotes(word.id)"
                        class="text-indigo-600 hover:text-indigo-800"
                      >
                        Stimmen zurücksetzen
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- CSV Export Button -->
    <div class="mt-6 flex justify-end">
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
import { ref, onMounted } from "vue";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { useFirestore } from "#imports";
import CsvExportHelper from "~/helpers/csvExportHelper";

// Admin Layout verwenden
definePageMeta({ layout: "admin" });

const db = useFirestore();
const words = ref<Array<{ id: string; data: any }>>([]);
const newWord = ref("");

// Beim Mounten alle JugendWörter laden
onMounted(async () => {
  await loadWords();
});

// Jugendwörter aus der Collection "jugendwort" laden
async function loadWords() {
  words.value = [];
  const querySnap = await getDocs(collection(db, "jugendwort"));
  querySnap.forEach((docSnap) => {
    words.value.push({ id: docSnap.id, data: docSnap.data() });
  });
}

// Neues Wort hinzufügen (initial mit 0 Stimmen)
async function addWord() {
  if (!newWord.value.trim() || words.value.length >= 20) return;
  const wordObj = {
    word: newWord.value.trim(),
    votes: 0,
  };
  const docRef = await addDoc(collection(db, "jugendwort"), wordObj);
  words.value.push({ id: docRef.id, data: wordObj });
  newWord.value = "";
}

// Wort löschen
async function deleteWord(id: string) {
  if (!confirm("Wort wirklich löschen?")) return;
  await deleteDoc(doc(db, "jugendwort", id));
  words.value = words.value.filter((word) => word.id !== id);
}

// Stimmen zurücksetzen (auf 0 setzen)
async function resetVotes(id: string) {
  await updateDoc(doc(db, "jugendwort", id), { votes: 0 });
  const word = words.value.find((word) => word.id === id);
  if (word) {
    word.data.votes = 0;
  }
}

// CSV Export: Bereite die Daten vor und rufe den Helper auf
function exportCsv() {
  const csvData = words.value.map((word) => ({
    Wort: word.data.word,
    Stimmen: word.data.votes,
  }));
  CsvExportHelper.exportToCsv(csvData, "jugendwort_export.csv");
}
</script>

<style scoped>
/* Zusätzliche Styles können hier eingefügt werden */
</style>