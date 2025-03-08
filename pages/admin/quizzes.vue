<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900">Admin - Quizzes</h1>
    <p class="mt-2 text-sm text-gray-700">
      Hier findest du alle vorhandenen Quizzes. Du kannst neue hinzufügen,
      bearbeiten oder löschen.
    </p>

    <!-- Tabelle der vorhandenen Quizzes -->
    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <!-- Spalte 1: Quiz-Name -->
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Quiz-Name
                  </th>
                  <!-- Spalte 2: Anzahl Fragen -->
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Anzahl Fragen
                  </th>
                  <!-- Spalte 3: Aktionen -->
                  <th
                    scope="col"
                    class="relative py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
                  >
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="quizItem in quizzes" :key="quizItem.id">
                  <td
                    class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 font-medium sm:pl-6"
                  >
                    {{ quizItem.data.title }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <!-- Anzahl Fragen -->
                    {{ quizItem.data.questions?.length || 0 }}
                  </td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
                    <div class="flex gap-2">
                      <button
                        class="text-indigo-600 hover:text-indigo-900"
                        @click="editQuiz(quizItem.id)"
                      >
                        Bearbeiten
                      </button>
                      <button
                        class="text-red-600 hover:text-red-800"
                        @click="deleteQuiz(quizItem.id)"
                      >
                        Löschen
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

    <!-- Button zum Erstellen eines neuen Quizzes -->
    <div class="mt-4">
      <button
        type="button"
        class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="newQuiz"
      >
        Neues Quiz erstellen
      </button>
    </div>

    <hr class="my-8" />

    <!-- Formular zum Erstellen/Bearbeiten eines Quizzes -->
    <div class="bg-white shadow sm:rounded-lg p-4">
      <h2 class="text-base font-semibold text-gray-900 mb-4">
        {{ editId ? "Quiz bearbeiten" : "Neues Quiz erstellen" }}
      </h2>
      <form @submit.prevent="saveQuiz" class="space-y-4">
        <!-- Titel -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Titel</label>
          <input
            v-model="formData.title"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <!-- Fragen-Liste -->
        <div class="question-block border border-gray-200 p-4 rounded-md">
          <h3 class="text-sm font-semibold text-gray-800">Fragen</h3>
          <div
            v-for="(question, qIndex) in formData.questions"
            :key="qIndex"
            class="question-item my-2 p-2 border-b border-dashed border-gray-300"
          >
            <!-- Fragetext -->
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fragetext
            </label>
            <input
              v-model="question.question"
              class="mb-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <!-- Antwort-Optionen -->
            <div class="option-list mb-2">
              <h4 class="text-sm font-medium text-gray-800">
                Antwort-Optionen
              </h4>
              <div
                v-for="(option, oIndex) in question.options"
                :key="oIndex"
                class="option-item mb-1 flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <!-- Option-Text -->
                <input
                  v-model="option.text"
                  placeholder="Antwort-Text"
                  class="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <!-- Option-Bild -->
                <div>
                  <label class="block text-xs text-gray-700"
                    >Option-Bild (1920 × 1200)</label
                  >
                  <div
                    v-if="option.optionImageUrl"
                    class="mt-1 w-16 h-16 overflow-hidden"
                  >
                    <img
                      :src="option.optionImageUrl"
                      alt="Option-Bild"
                      class="w-full h-full object-cover border rounded"
                    />
                  </div>
                  <input
                    type="file"
                    @change="uploadOptionImage(qIndex, oIndex, $event)"
                    class="block w-full text-xs text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-indigo-600 file:py-1 file:px-2 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500 mt-1"
                  />
                </div>

                <!-- Korrekt? -->
                <label class="inline-flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    v-model="option.correct"
                    class="mr-1"
                  />
                  Korrekt?
                </label>

                <!-- Entfernen-Button -->
                <button
                  type="button"
                  class="text-red-600 hover:text-red-900 text-sm"
                  @click="removeOption(qIndex, oIndex)"
                >
                  Option entfernen
                </button>
              </div>
              <button
                type="button"
                class="mt-2 inline-flex items-center rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-300"
                @click="addOption(qIndex)"
              >
                Option hinzufügen
              </button>
            </div>

            <!-- Frage entfernen -->
            <button
              type="button"
              class="text-red-600 hover:text-red-900 text-sm"
              @click="removeQuestion(qIndex)"
            >
              Frage entfernen
            </button>
          </div>

          <!-- Neue Frage hinzufügen -->
          <button
            type="button"
            class="mt-2 inline-flex items-center rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-300"
            @click="addQuestion"
          >
            Neue Frage
          </button>
        </div>

        <!-- Speichern -->
        <div class="flex items-center gap-4 mt-4">
          <button
            type="submit"
            class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {{ editId ? "Änderungen speichern" : "Erstellen" }}
          </button>
          <button
            v-if="editId"
            type="button"
            class="text-sm text-gray-600 hover:text-gray-800"
            @click="cancelEdit"
          >
            Abbrechen
          </button>
        </div>
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
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useFirebaseApp } from "#imports";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// Aus nuxt-vuefire
const db = useFirestore();
const firebaseApp = useFirebaseApp();
const storage = getStorage(firebaseApp);

// Liste vorhandener Quizzes
const quizzes = ref<Array<{ id: string; data: any }>>([]);

// Aktuelles Quiz im Bearbeitungsmodus
const editId = ref<string | null>(null);

// Formular-State
const formData = ref({
  title: "",
  questions: [
    {
      question: "",
      questionImageUrl: "", // NEU: Bild pro Frage
      options: [
        {
          text: "",
          optionImageUrl: "", // NEU: Bild pro Option
          correct: false,
        },
        {
          text: "",
          optionImageUrl: "",
          correct: false,
        },
      ],
    },
  ],
});

// onMounted -> Quizzes laden
onMounted(async () => {
  await loadQuizzes();
});

// Quizzes laden
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

// Quiz bearbeiten
async function editQuiz(id: string) {
  editId.value = id;
  const docRef = doc(db, "quizzes", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const quizData = snap.data() as any;
  // Falls Felder fehlen, initialisieren
  quizData.questions?.forEach((q: any) => {
    if (!q.questionImageUrl) {
      q.questionImageUrl = "";
    }
    q.options?.forEach((opt: any) => {
      if (!opt.optionImageUrl) {
        opt.optionImageUrl = "";
      }
    });
  });

  formData.value = quizData;
}

// Neues Quiz
function newQuiz() {
  editId.value = null;
  resetForm();
}

// Speichern
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

// Löschen
async function deleteQuiz(id: string) {
  if (!confirm("Wirklich löschen?")) return;
  const docRef = doc(db, "quizzes", id);
  await deleteDoc(docRef);
  await loadQuizzes();
}

// Abbrechen
function cancelEdit() {
  editId.value = null;
  resetForm();
}

// Reset
function resetForm() {
  formData.value = {
    title: "",
    questions: [
      {
        question: "",
        questionImageUrl: "", // NEU
        options: [
          {
            text: "",
            optionImageUrl: "",
            correct: false,
          },
          {
            text: "",
            optionImageUrl: "",
            correct: false,
          },
        ],
      },
    ],
  };
}

// Hilfsfunktionen (Fragen/Optionen)
function addQuestion() {
  formData.value.questions.push({
    question: "",
    questionImageUrl: "",
    options: [
      { text: "", optionImageUrl: "", correct: false },
      { text: "", optionImageUrl: "", correct: false },
    ],
  });
}
function removeQuestion(index: number) {
  formData.value.questions.splice(index, 1);
}
function addOption(qIndex: number) {
  formData.value.questions[qIndex].options.push({
    text: "",
    optionImageUrl: "",
    correct: false,
  });
}
function removeOption(qIndex: number, oIndex: number) {
  formData.value.questions[qIndex].options.splice(oIndex, 1);
}

// Upload pro Frage
async function uploadQuestionImage(qIndex: number, event: any) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const filePath = `quiz-questions/${Date.now()}_question_${file.name}`;
    const sRef = storageRef(storage, filePath);
    await uploadBytes(sRef, file);
    const downloadURL = await getDownloadURL(sRef);
    formData.value.questions[qIndex].questionImageUrl = downloadURL;
  } catch (err) {
    console.error("Fehler beim Frage-Bild-Upload:", err);
  }
}

// Upload pro Antwort-Option
async function uploadOptionImage(qIndex: number, oIndex: number, event: any) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const filePath = `quiz-options/${Date.now()}_option_${file.name}`;
    const sRef = storageRef(storage, filePath);
    await uploadBytes(sRef, file);
    const downloadURL = await getDownloadURL(sRef);
    formData.value.questions[qIndex].options[oIndex].optionImageUrl =
      downloadURL;
  } catch (err) {
    console.error("Fehler beim Option-Bild-Upload:", err);
  }
}
</script>

<style scoped>
.question-block {
  margin-top: 1rem;
}
.question-item {
  margin-bottom: 1rem;
}
.option-list {
  margin-top: 1rem;
}
.option-item {
  margin-bottom: 0.5rem;
}
</style>
