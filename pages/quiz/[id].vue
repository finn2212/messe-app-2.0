<template>
    <div v-if="quiz">
      <h1>{{ quiz.title }}</h1>
      <div v-if="currentQuestion < quiz.questions.length">
        <h2>{{ quiz.questions[currentQuestion].question }}</h2>
        <div class="answer-grid">
          <div 
            v-for="(option, i) in quiz.questions[currentQuestion].options" 
            :key="i"
            class="answer-box"
            :class="{ correct: selectedAnswer === i && option.correct, wrong: selectedAnswer === i && !option.correct }"
            @click="chooseAnswer(i)"
          >
            {{ option.text }}
          </div>
        </div>
        <div v-if="selectedAnswer !== null">
          <p v-if="quiz.questions[currentQuestion].options[selectedAnswer].correct">
            Richtig!
          </p>
          <p v-else>
            Falsch!
          </p>
          <button @click="nextQuestion">Nächste Frage</button>
        </div>
      </div>
      <div v-else>
        <h2>Quiz beendet!</h2>
        <button @click="navigateTo('/home')">Zurück zum Hauptscreen</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'nuxt/app'
  import { doc, getDoc } from 'firebase/firestore'
  
  const route = useRoute()
  const { $db } = useNuxtApp()
  
  const quizId = route.params.id as string
  const quiz = ref<any>(null)
  const currentQuestion = ref<number>(0)
  const selectedAnswer = ref<number|null>(null)
  
  onMounted(async () => {
    const docRef = doc($db, 'quizzes', quizId)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      quiz.value = snap.data()
    }
  })
  
  function chooseAnswer(i: number) {
    selectedAnswer.value = i
  }
  
  function nextQuestion() {
    selectedAnswer.value = null
    currentQuestion.value++
  }
  
  </script>
  
  <style scoped>
  .answer-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .answer-box {
    border: 1px solid #ccc;
    padding: 1rem;
    cursor: pointer;
  }
  .correct {
    background-color: #cfc;
  }
  .wrong {
    background-color: #fcc;
  }
  </style>