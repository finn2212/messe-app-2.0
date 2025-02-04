<template>
    <div class="mt-8">
      <!-- Loading / Spinner State -->
      <div v-if="!quizStatsLoaded" class="text-center">
        <p class="text-sm text-gray-500">Lade Quiz-Statistiken...</p>
      </div>
  
      <!-- Render Stats -->
      <div v-else class="mt-4 bg-white shadow sm:rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Quiz Antwort Statistik
        </h2>
  
        <!-- Iterate over each question in quizStats -->
        <div
          v-for="(answers, question) in quizStats"
          :key="question"
          class="mt-8 p-4 bg-gray-100 rounded-lg"
        >
          <!-- Question Title -->
          <h3 class="text-md font-medium text-gray-800 text-center mb-4">
            {{ question }}
          </h3>
  
          <!-- If the question has an image, display it -->
          <div class="text-center mb-2" v-if="getQuestionImageUrl(question)">
            <img
              :src="getQuestionImageUrl(question)"
              alt="Question Image"
              class="inline-block w-64 h-auto rounded"
            />
          </div>
  
          <!-- List each answer and its count -->
          <ul>
            <li
              v-for="(count, answerText) in answers"
              :key="answerText"
              class="p-2 rounded-md text-sm mb-1"
              :class="{
                'bg-green-100 font-medium':
                  isCorrectAnswer(question, answerText),
                'bg-white': !isCorrectAnswer(question, answerText)
              }"
            >
              <!-- If the answer has an option image, display it -->
              <div v-if="getOptionImageUrl(question, answerText)" class="flex items-center gap-2">
                <img
                  :src="getOptionImageUrl(question, answerText)"
                  alt="Option Image"
                  class="w-20 h-auto rounded"
                />
                <span>{{ answerText }}: <strong>{{ count }}</strong> mal gewählt</span>
              </div>
              <!-- Else just the text -->
              <div v-else>
                {{ answerText }}: <strong>{{ count }}</strong> mal gewählt
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  /**
   * This component:
   *  1) Fetches quiz questions (quizzes/{quizId}).
   *  2) Fetches all user choices from quizSelectionsTracking (for quizId).
   *  3) Displays each question with all possible answers, even if zero clicks.
   *  4) Marks correct answers with a subtle highlight.
   */
  
  import { ref, onMounted } from "vue";
  import { useFirestore } from "#imports";
  import {
    doc,
    getDoc,
    collection,
    getDocs,
    DocumentData,
  } from "firebase/firestore";
  
  // ---------------
  // Types & Interfaces
  // ---------------
  interface Option {
    text: string;
    correct: boolean;
    optionImageUrl?: string;
  }
  
  interface Question {
    question: string;            // e.g. "Wie spät ist es?"
    questionImageUrl?: string;   // optional image
    options: Option[];
  }
  
  interface QuizStats {
    [question: string]: {
      [answer: string]: number;
    };
  }
  
  const props = defineProps<{
    quizId: string;
  }>();
  
  // ---------------
  // State
  // ---------------
  const db = useFirestore();
  const questions = ref<Question[]>([]);
  const quizStats = ref<QuizStats>({});
  const quizStatsLoaded = ref(false);
  
  // ---------------
  // Lifecycle
  // ---------------
  onMounted(async () => {
    await fetchQuizAndAnswers();
  });
  
  // ---------------
  // Methods
  // ---------------
  async function fetchQuizAndAnswers() {
    quizStatsLoaded.value = false;
  
    // 1) Retrieve the quiz doc => "quizzes/{quizId}"
    const quizRef = doc(db, "quizzes", props.quizId);
    const quizDocSnap = await getDoc(quizRef);
  
    if (!quizDocSnap.exists()) {
      console.error(`Quiz with ID ${props.quizId} not found!`);
      quizStatsLoaded.value = true;
      return;
    }
  
    // We expect an object with { questions: [...] } in the doc
    const quizData = quizDocSnap.data() as DocumentData;
    questions.value = quizData.questions ?? [];
  
    // 2) Retrieve user-selected answers => "quizSelectionsTracking"
    //    We'll filter only the ones that match our quizId
    const trackingCollection = collection(db, "quizSelectionsTracking");
    const trackingSnap = await getDocs(trackingCollection);
  
    // We'll store counts here
    const stats: QuizStats = {};
  
    trackingSnap.forEach((docSnap) => {
      const data = docSnap.data() as {
        quizId: string;
        question: string;
        selectedAnswer: string;
      };
  
      if (data.quizId === props.quizId) {
        const question = String(data.question);
        const selectedAnswer = String(data.selectedAnswer);
  
        if (!stats[question]) {
          stats[question] = {};
        }
        if (!stats[question][selectedAnswer]) {
          stats[question][selectedAnswer] = 0;
        }
        stats[question][selectedAnswer]++;
      }
    });
  
    // 3) Pre-populate zero counts for all possible answers
    //    So that they show up, even if nobody selected them.
    questions.value.forEach((q) => {
      if (!stats[q.question]) {
        stats[q.question] = {};
      }
      q.options.forEach((opt) => {
        if (!(opt.text in stats[q.question])) {
          stats[q.question][opt.text] = 0;
        }
      });
    });
  
    quizStats.value = stats;
    quizStatsLoaded.value = true;
  }
  
  // Check if an answer is correct for a given question
  function isCorrectAnswer(questionText: string, answerText: string): boolean {
    const questionObj = questions.value.find(
      (q) => q.question === questionText
    );
    if (!questionObj) return false;
  
    const matchedOption = questionObj.options.find(
      (opt) => opt.text === answerText
    );
    return matchedOption?.correct === true;
  }
  
  // Get question image if it exists
  function getQuestionImageUrl(questionText: string): string | null {
    const questionObj = questions.value.find(
      (q) => q.question === questionText
    );
    return questionObj?.questionImageUrl || null;
  }
  
  // Get image for a specific option if it exists
  function getOptionImageUrl(questionText: string, answerText: string): string | null {
    const questionObj = questions.value.find(
      (q) => q.question === questionText
    );
    if (!questionObj) return null;
  
    const matchedOption = questionObj.options.find(
      (opt) => opt.text === answerText
    );
    return matchedOption?.optionImageUrl || null;
  }
  </script>
  
  <style scoped>
  /* Example styling - adapt to your needs */
  .correct-answer {
    background-color: #c8f7c5; /* greenish highlight */
  }
  </style>