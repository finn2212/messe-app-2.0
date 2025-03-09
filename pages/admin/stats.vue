<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900">
      Admin - Auswahlstatistiken
    </h1>
    <p class="mt-2 text-sm text-gray-700">
      Übersicht über die Auswahl der Attribute für jede Marke. Wähle eine Messe
      aus, um die Statistiken für den jeweiligen Zeitraum anzuzeigen.
    </p>

    <!-- ===================== -->
    <!-- 1) Messe Tabs -->
    <!-- ===================== -->
    <div class="mt-4 border-b border-gray-300">
      <nav class="flex space-x-4">
        <!-- Iterate over all Messen -->
        <button
          v-for="messe in messen"
          :key="messe.id"
          @click="setActiveMesse(messe)"
          :class="[
            'py-2 px-4 text-sm font-medium',
            activeMesseId === messe.id
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          {{ messe.name }}
        </button>

        <!-- "Alle Werte" -->
        <button
          @click="setActiveMesse(null)"
          :class="[
            'py-2 px-4 text-sm font-medium',
            activeMesseId === null
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          Alle Werte
        </button>
      </nav>
    </div>

    <!-- 2) Attribute Chart -->
    <AttributeChart
      v-if="messenLoaded"
      :messen="messen"
      :activeMesseId="activeMesseId"
    />

    <!-- 3) Cover Statistics -->
    <CoverStatistics
      v-if="messenLoaded"
      :messen="messen"
      :activeMesseId="activeMesseId"
    />

    <!-- 4) Quizzes Tabs -->
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
        <!-- Optional "Alle Quizzes" button -->
        <button
          @click="setActiveQuiz(null)"
          :class="[
            'py-2 px-4 text-sm font-medium',
            activeQuiz === null
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900',
          ]"
        ></button>
      </nav>
    </div>

    <!-- AdminStats.vue (parent) -->
    <QuizStatistics
      v-if="activeQuiz"
      :quizId="activeQuiz"
      :messen="messen"
      :activeMesseId="activeMesseId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useFirestore } from "#imports";
import { collection, getDocs } from "firebase/firestore";

import AttributeChart from "~/components/AttributeChart.vue";
import CoverStatistics from "~/components/CoverStatistics.vue";
import QuizStatistics from "~/components/QuizStatistics.vue";

// Layout
definePageMeta({ layout: "admin" });

interface Messe {
  id: string;
  name: string;
  startDate: string; // or Date, if stored that way
  endDate: string;
}

const db = useFirestore();

// Messen
const messen = ref<Messe[]>([]);
const messenLoaded = ref(false);

// Active Messen
const activeMesseId = ref<string | null>(null);

// Quizzes
const quizzes = ref<Array<{ id: string; title: string }>>([]);
const activeQuiz = ref<string | null>(null);

// ====================
// Lifecycle
// ====================
onMounted(async () => {
  await fetchMessen();
  await fetchQuizzes();
});

// ====================
// Methods
// ====================
async function fetchMessen() {
  const messeSnap = await getDocs(collection(db, "messen"));
  messen.value = messeSnap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  });
  messenLoaded.value = true;
}

function setActiveMesse(messe: Messe | null) {
  activeMesseId.value = messe ? messe.id : null;
}

/**
 * Quizzes
 */
async function fetchQuizzes() {
  const quizSnap = await getDocs(collection(db, "quizzes"));
  quizSnap.forEach((docSnap) => {
    const data = docSnap.data();
    quizzes.value.push({
      id: docSnap.id,
      title: data.title || "Untitled Quiz",
    });
  });

  // default pick first quiz if available
  if (quizzes.value.length > 0) {
    activeQuiz.value = quizzes.value[0].id;
  }
}
function setActiveQuiz(quizId: string | null) {
  activeQuiz.value = quizId;
}
</script>

<style scoped>
/* Optional styling */
</style>
