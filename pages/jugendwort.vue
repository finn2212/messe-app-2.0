<template>
  <div class="p-4 flex flex-col items-center justify-center">
    <!-- Falls noch kein Wort ausgewählt wurde: Wörter anzeigen (2-spaltiges Grid) -->
    <TransitionGroup
      v-if="!selectedWord"
      tag="div"
      name="fade"
      class="grid grid-cols-2 gap-4 w-full max-w-4xl text-center"
    >
      <h1 class="col-span-2 text-2xl font-bold text-center mb-6">
        Welches JugendWort findest du am besten?
      </h1>

      <button
        v-for="word in tWords"
        :key="word.id"
        @click="vote(word)"
        class="px-4 py-2 w-full rounded-full bg-gray-200 hover:bg-indigo-500 hover:text-white transition"
      >
        {{ word.data.word }}
      </button>
    </TransitionGroup>

    <!-- Sobald ein Wort gewählt wurde: Statistik anzeigen -->
    <!-- Final Step: Display Statistics -->
    <div v-if="selectedWord" class="mt-6 w-full max-w-5xl text-center">
      <div class="text-lg text-gray-800 items-center text-center sm:text-left">
        <h3 class="text-5xl font-bold text-center mb-20">
          Super, Deine Meinung zählt!
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[10vw] p-4">
          <div class="blob-shape">
            {{ selectedWordPercentage.toFixed(0) }}%
            {{ selectedWord.data.word }}
          </div>

          <div class="p-6">
            <span class="text-5xl"
              >{{ selectedWordPercentage.toFixed(0) }}%</span
            >
            <p class="mt-2">haben sich ebenso für dieses Wort entschieden.</p>
          </div>
        </div>
      </div>

      <div
        class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full text-sm text-gray-600"
      >
        <span
          v-for="(pct, wordKey) in allPercentages"
          :key="wordKey"
          class="px-3 py-1 bg-gray-100 rounded-full"
        >
          {{ pct.toFixed(0) }}% {{ wordKey }}
        </span>
      </div>

      <div class="mt-4 text-center">
        <button
          @click="navigateTo('/newsletter')"
          class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
        >
          Weiter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useFirestore } from "#imports";

const db = useFirestore();

// JugendWörter aus der Collection "JugendWort" laden
const tWords = ref<Array<{ id: string; data: { word: string } }>>([]);
const selectedWord = ref<{ id: string; data: { word: string } } | null>(null);

// Statistik: Stimmen werden über die Collection "JugendWortSelections" aggregiert
const stats = ref<{ [key: string]: number }>({});
const totalSelections = ref(0);

/**
 * JugendWörter laden (Admin legt diese über eine separate Seite an).
 * Beachte, dass wir jetzt die Collection "JugendWort" ansprechen.
 */
async function loadWords() {
  tWords.value = [];
  const qSnap = await getDocs(collection(db, "jugendwort"));
  qSnap.forEach((docSnap) => {
    tWords.value.push({
      id: docSnap.id,
      data: docSnap.data() as { word: string },
    });
  });
}

async function updateStats() {
  const statsTemp: { [key: string]: number } = {};
  totalSelections.value = 0;

  // Lies alle Abstimmungen aus "JugendWortSelections"
  const qSnap = await getDocs(collection(db, "JugendWortSelections"));
  qSnap.forEach((docSnap) => {
    const data = docSnap.data();
    const w = data.word;
    statsTemp[w] = (statsTemp[w] || 0) + 1;
    totalSelections.value++;
  });
  stats.value = statsTemp;

  // Aktualisiere in jedem Dokument der Collection "jugendwort" das Feld "votes"
  const wordsSnap = await getDocs(collection(db, "jugendwort"));
  wordsSnap.forEach(async (docSnap) => {
    const data = docSnap.data();
    const word = data.word;
    const count = statsTemp[word] || 0;
    await updateDoc(doc(db, "jugendwort", docSnap.id), { votes: count });
  });
}

/**
 * Wenn ein User ein JugendWort auswählt, wird die Abstimmung in Firestore erfasst
 * und die Statistik aktualisiert.
 */
async function vote(word: { id: string; data: { word: string } }) {
  if (!word) return;
  try {
    await addDoc(collection(db, "JugendWortSelections"), {
      word: word.data.word,
      timestamp: serverTimestamp(),
    });
    selectedWord.value = word;
    await updateStats();
  } catch (err) {
    console.error("Fehler beim Abstimmen:", err);
  }
}

/**
 * Berechnung des Prozentsatzes für das ausgewählte JugendWort
 */
const selectedWordPercentage = computed(() => {
  if (!selectedWord.value || totalSelections.value === 0) return 0;
  return (
    ((stats.value[selectedWord.value.data.word] || 0) / totalSelections.value) *
    100
  );
});

/**
 * Prozentsätze für alle Wörter berechnen
 */
const allPercentages = computed(() => {
  const percentages: { [key: string]: number } = {};
  for (const w of tWords.value) {
    const count = stats.value[w.data.word] || 0;
    percentages[w.data.word] = totalSelections.value
      ? (count / totalSelections.value) * 100
      : 0;
  }
  return percentages;
});

/**
 * Reset: Ermöglicht eine neue Abstimmung
 */
function resetVote() {
  selectedWord.value = null;
}

/**
 * Beim Mounten: JugendWörter laden
 */
onMounted(async () => {
  await loadWords();
});
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
