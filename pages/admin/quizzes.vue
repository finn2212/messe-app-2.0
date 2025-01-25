<template>
  <div>
    <h1>Admin - Quizzes</h1>

    <!-- Liste der vorhandenen Quizzes -->
    <div v-if="quizzes.length">
      <h2>Vorhandene Quizzes</h2>
      <ul>
        <li v-for="quiz in quizzes" :key="quiz.id">
          <strong>{{ quiz.data.title }}</strong>
          <button @click="editQuiz(quiz.id)">Bearbeiten</button>
          <button @click="deleteQuiz(quiz.id)">Löschen</button>
        </li>
      </ul>
    </div>
    <hr />

    <!-- Formular zum Erstellen/Bearbeiten eines Quizzes -->
    <div>
      <h2>{{ editId ? "Quiz bearbeiten" : "Neues Quiz erstellen" }}</h2>
      <form @submit.prevent="saveQuiz">
        <!-- Titel -->
        <div>
          <label>Titel</label>
          <input v-model="formData.title" required />
        </div>

        <!-- Fragen -->
        <div class="question-block">
          <h3>Fragen</h3>
          <div
            v-for="(question, qIndex) in formData.questions"
            :key="qIndex"
            class="question-item"
          >
            <label>Fragetext</label>
            <input v-model="question.question" />

            <div class="option-list">
              <h4>Antwort-Optionen</h4>
              <div
                v-for="(option, oIndex) in question.options"
                :key="oIndex"
                class="option-item"
              >
                <input v-model="option.text" placeholder="Antwort-Text" />
                <input type="checkbox" v-model="option.correct" />
                <span>Korrekt?</span>
                <button type="button" @click="removeOption(qIndex, oIndex)">
                  Option entfernen
                </button>
              </div>
              <button type="button" @click="addOption(qIndex)">
                Option hinzufügen
              </button>
            </div>
            <hr />
            <button type="button" @click="removeQuestion(qIndex)">
              Frage entfernen
            </button>
          </div>
          <button type="button" @click="addQuestion">Neue Frage</button>
        </div>

        <button type="submit">
          {{ editId ? "Änderungen speichern" : "Erstellen" }}
        </button>
        <button v-if="editId" type="button" @click="cancelEdit">
          Abbrechen
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout
definePageMeta({
  layout: "admin",
});
import { ref, onMounted } from "vue";

// Firestore Imports (aus dem Web SDK)
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// Nuxt-Vuefire Auto-Import für Firestore
const db = useFirestore();

// Quiz-List
const quizzes = ref<Array<{ id: string; data: any }>>([]);

// Formular
const editId = ref<string | null>(null);
const formData = ref({
  title: "",
  questions: [
    {
      question: "",
      options: [
        { text: "", correct: false },
        { text: "", correct: false },
      ],
    },
  ],
});

// Beim Laden: alle Quizzes holen
onMounted(async () => {
  await loadQuizzes();
});

async function loadQuizzes() {
  quizzes.value = [];
  const querySnap = await getDocs(collection(db, "quizzes"));
  querySnap.forEach((docSnap) => {
    quizzes.value.push({
      id: docSnap.id,
      data: docSnap.data(),
    });
  });
}

// Quiz zum Bearbeiten laden
async function editQuiz(id: string) {
  const docRef = doc(db, "quizzes", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  editId.value = id;
  formData.value = snap.data() as any;
}

// Neues Quiz oder bestehendes Quiz speichern
async function saveQuiz() {
  if (!formData.value.title) return;

  if (editId.value) {
    const docRef = doc(db, "quizzes", editId.value);
    await updateDoc(docRef, { ...formData.value });
  } else {
    await addDoc(collection(db, "quizzes"), { ...formData.value });
  }
  cancelEdit();
  await loadQuizzes();
}

// Quiz löschen
async function deleteQuiz(id: string) {
  if (!confirm("Wirklich löschen?")) return;
  await deleteDoc(doc(db, "quizzes", id));
  await loadQuizzes();
}

// Formular-Helfer
function cancelEdit() {
  editId.value = null;
  formData.value = {
    title: "",
    questions: [
      {
        question: "",
        options: [
          { text: "", correct: false },
          { text: "", correct: false },
        ],
      },
    ],
  };
}

function addQuestion() {
  formData.value.questions.push({
    question: "",
    options: [
      { text: "", correct: false },
      { text: "", correct: false },
    ],
  });
}
function removeQuestion(index: number) {
  formData.value.questions.splice(index, 1);
}
function addOption(qIndex: number) {
  formData.value.questions[qIndex].options.push({ text: "", correct: false });
}
function removeOption(qIndex: number, oIndex: number) {
  formData.value.questions[qIndex].options.splice(oIndex, 1);
}
</script>

<style scoped>
.question-block {
  margin-top: 1rem;
  border: 1px solid #ccc;
  padding: 1rem;
}
.question-item {
  border: 1px dashed #ccc;
  margin-bottom: 1rem;
  padding: 1rem;
}
.option-list {
  margin-top: 1rem;
}
.option-item {
  margin-bottom: 0.5rem;
}
</style>
