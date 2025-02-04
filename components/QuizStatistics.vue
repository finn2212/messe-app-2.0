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
          <!-- Optional: Show which Messe is active -->
          <span v-if="activeMesseId">
            ({{ getMesseName() }})
          </span>
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
                'bg-green-100 font-medium': isCorrectAnswer(question, answerText),
                'bg-white': !isCorrectAnswer(question, answerText),
              }"
            >
              <!-- If the answer has an option image, display it -->
              <div
                v-if="getOptionImageUrl(question, answerText)"
                class="flex items-center gap-2"
              >
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
   *  1) Fetches quiz questions from "quizzes/{quizId}".
   *  2) Fetches user choices from "quizSelectionsTracking" (for quizId).
   *  3) Filters answers by the chosen Messe date range if activeMesseId != null.
   *  4) Displays each question with all possible answers, even if zero clicks.
   *  5) Marks correct answers with a highlight.
   */
  
  import { ref, watch, computed } from "vue";
  import { useFirestore } from "#imports";
  import {
    doc,
    getDoc,
    collection,
    getDocs,
    DocumentData,
  } from "firebase/firestore";
  
  interface Option {
    text: string;
    correct: boolean;
    optionImageUrl?: string;
  }
  interface Question {
    question: string;
    questionImageUrl?: string;
    options: Option[];
  }
  interface QuizStats {
    [question: string]: {
      [answer: string]: number;
    };
  }
  interface Messe {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  }
  
  // ---------------------------------
  // Props from parent
  // ---------------------------------
  const props = defineProps<{
    quizId: string;
    messen: Messe[];
    activeMesseId: string | null;
  }>();
  
  // ---------------------------------
  // State
  // ---------------------------------
  const db = useFirestore();
  const questions = ref<Question[]>([]);
  const quizStats = ref<QuizStats>({});
  const quizStatsLoaded = ref(false);
  
  // ---------------------------------
  // Watchers
  // ---------------------------------
  watch(
    () => [props.quizId, props.activeMesseId],
    async () => {
      if (props.quizId) {
        await fetchQuizAndAnswers(props.quizId);
      }
    },
    { immediate: true }
  );
  
  // ---------------------------------
  // Methods
  // ---------------------------------
  async function fetchQuizAndAnswers(quizId: string) {
    quizStatsLoaded.value = false;
  
    // 1) Retrieve the quiz doc => "quizzes/{quizId}"
    const quizRef = doc(db, "quizzes", quizId);
    const quizDocSnap = await getDoc(quizRef);
  
    if (!quizDocSnap.exists()) {
      console.error(`Quiz with ID ${quizId} not found!`);
      quizStatsLoaded.value = true;
      return;
    }
  
    // We expect an object with { questions: [...] } in the doc
    const quizData = quizDocSnap.data() as DocumentData;
    questions.value = quizData.questions ?? [];
  
    // 2) Retrieve user-selected answers => "quizSelectionsTracking"
    const trackingSnap = await getDocs(collection(db, "quizSelectionsTracking"));
  
    // We'll store counts here
    const stats: QuizStats = {};
  
    // (A) Determine date range if there's an active messe
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (props.activeMesseId) {
      const messe = props.messen.find(m => m.id === props.activeMesseId);
      if (messe) {
        startDate = new Date(messe.startDate);
        endDate = new Date(messe.endDate);
        endDate.setHours(23, 59, 59, 999);
      }
    }
  
    // (B) Process each tracking doc
    trackingSnap.forEach(docSnap => {
      const data = docSnap.data() as {
        quizId: string;
        question: string;
        selectedAnswer: string;
        timestamp?: any; // optional if you store it
      };
  
      // Skip if not this quiz
      if (data.quizId !== quizId) return;
  
      // Date filtering
      if (startDate && endDate && data.timestamp) {
        const selectionDate = data.timestamp.toDate();
        if (selectionDate < startDate || selectionDate > endDate) {
          return;
        }
      }
  
      const question = data.question;
      const selectedAnswer = data.selectedAnswer;
  
      if (!stats[question]) {
        stats[question] = {};
      }
      if (!stats[question][selectedAnswer]) {
        stats[question][selectedAnswer] = 0;
      }
      stats[question][selectedAnswer]++;
    });
  
    // 3) Pre-populate zero counts for all possible answers
    questions.value.forEach(q => {
      if (!stats[q.question]) {
        stats[q.question] = {};
      }
      q.options.forEach(opt => {
        if (!(opt.text in stats[q.question])) {
          stats[q.question][opt.text] = 0;
        }
      });
    });
  
    quizStats.value = stats;
    quizStatsLoaded.value = true;
  }
  
  // ---------------------------------
  // Helper: Check if an answer is correct
  // ---------------------------------
  function isCorrectAnswer(questionText: string, answerText: string): boolean {
    const questionObj = questions.value.find((q) => q.question === questionText);
    if (!questionObj) return false;
  
    const matchedOption = questionObj.options.find(
      (opt) => opt.text === answerText
    );
    return matchedOption?.correct === true;
  }
  
  // Return the question image
  function getQuestionImageUrl(questionText: string): string | null {
    const questionObj = questions.value.find(
      (q) => q.question === questionText
    );
    return questionObj?.questionImageUrl || null;
  }
  
  // Return the option image if any
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
  
  // Show the currently selected Messe name (optional)
  function getMesseName() {
    const messe = props.messen.find(m => m.id === props.activeMesseId);
    return messe?.name
  }
  </script>
  
  <style scoped>
  .correct-answer {
    background-color: #c8f7c5; /* greenish highlight */
  }
  </style>