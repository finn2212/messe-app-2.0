<template>
  <!-- Loading spinner or similar while not loaded -->
  <div v-if="!quizLoaded" class="flex items-center justify-center min-h-screen">
    <p>Loading quiz...</p>
  </div>

  <!-- Once loaded, show the quiz and use <GridCards> for answers -->
  <div v-else class="p-4 min-h-screen">
    <h1 class="text-2xl font-bold text-center mb-4">{{ quiz?.title }}</h1>

    <!-- if there are still questions left -->
    <div v-if="currentQuestion < quiz.questions?.length">
      <h2 class="text-xl font-semibold mb-2 text-center">
        {{ quiz.questions[currentQuestion].question }}
      </h2>

      <!-- Question image -->
      <div v-if="quiz.questions[currentQuestion].questionImageUrl" class="mb-4">
        <img
          :src="quiz.questions[currentQuestion].questionImageUrl"
          alt="Question Image"
          class="mx-auto w-full max-w-md object-cover rounded-lg shadow"
        />
      </div>

      <!-- Answer options using <GridCards> -->
      <GridCards
        :key="currentQuestion"
        :items="quiz.questions[currentQuestion].options"
        :onCardClick="chooseAnswer"
      >
        <template #cardContent="{ item: option }">
          <!-- Outer wrapper for each option (answer) -->
          <div
            class="h-60 w-96 relative flex items-center justify-center transition-all duration-300"
            :class="getOptionClasses(option)"
          >
            <!-- If there's an image, show it; else show text -->
            <img
              v-if="option.optionImageUrl"
              :src="option.optionImageUrl"
              alt="Option Image"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <p v-else class="font-medium text-center px-2">
              {{ option.text }}
            </p>
          </div>
        </template>
      </GridCards>

      <!-- Feedback + next button -->
      <div v-if="selectedAnswer !== null" class="mt-4 text-center">
        <p
          v-if="quiz.questions[currentQuestion].options[selectedAnswer].correct"
          class="text-green-600 font-semibold"
        >
          Richtig!
        </p>
        <p v-else class="text-red-600 font-semibold">Falsch!</p>
        <button
          @click="nextQuestion"
          class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
        >
          Nächste Frage
        </button>
      </div>
    </div>

    <!-- Quiz finished -->
    <div v-else class="text-center mt-8">
      <h2 class="text-xl font-semibold mb-4">Quiz beendet!</h2>
      <button
        @click="navigateTo('/home')"
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
      >
        Zurück zum Hauptscreen
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, navigateTo } from "#app";
import { doc, getDoc } from "firebase/firestore";
import GridCards from "~/components/GridCards.vue";

const db = useFirestore();
const route = useRoute();
const quizId = route.params.id as string;

// Quiz state
const quiz = ref<any>(null);
const quizLoaded = ref(false); // for showing "Loading..." vs. quiz
const currentQuestion = ref(0);
const selectedAnswer = ref<number | null>(null);

/** onMounted: Fetch data, then preload images */
onMounted(async () => {
  const docRef = doc(db, "quizzes", quizId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    quizLoaded.value = true;
    return;
  }

  quiz.value = snap.data();

  // Gather all question/option images into an array
  const imageUrls = collectQuizImages(quiz.value);

  // Preload them
  await preloadImages(imageUrls);

  // Now we can safely show the quiz
  quizLoaded.value = true;
});
function isSelectedWrong(option: any) {
  if (selectedAnswer.value === null) return false;

  const currentOptions = quiz.value.questions[currentQuestion.value].options;
  const index = currentOptions.indexOf(option);

  // If it's the chosen index AND it's not correct
  return index === selectedAnswer.value && !option.correct;
}

function getOptionClasses(option: any) {
  // If user hasn't selected anything yet, show no highlight
  if (selectedAnswer.value === null) {
    return "";
  }
  // If this option is correct
  if (option.correct) {
    return "border-4 border-green-500 animate-pulse";
  }
  // Otherwise it's wrong => red border + grey filter
  return "border-4 border-red-500 animate-pulse filter grayscale brightness-75";
}

/** Collect question & option images for preloading */
function collectQuizImages(quizData: any): string[] {
  // We'll push all questionImageUrls, and all optionImageUrls
  const urls: Array<string | undefined> = [];
  quizData.questions?.forEach((q: any) => {
    // question image
    if (q.questionImageUrl) {
      urls.push(q.questionImageUrl);
    }
    // option images
    q.options?.forEach((opt: any) => {
      if (opt.optionImageUrl) {
        urls.push(opt.optionImageUrl);
      }
    });
  });

  // Filter out undefined
  return urls.filter((url): url is string => typeof url === "string");
}

/** Preload each image with a Promise */
function preloadImages(urls: string[]) {
  const promises = urls.map((url) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => resolve(); // or reject() if you prefer
    });
  });
  return Promise.all(promises);
}

// Click on an answer
function chooseAnswer(option: any) {
  // find index
  const idx = quiz.value.questions[currentQuestion.value].options.findIndex(
    (o: any) => o === option
  );
  if (selectedAnswer.value === null) {
    selectedAnswer.value = idx;
  }
}

// Next question
function nextQuestion() {
  selectedAnswer.value = null;
  currentQuestion.value++;
}
</script>
