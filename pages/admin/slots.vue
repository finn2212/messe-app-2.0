<!-- pages/admin/slots.vue -->
<template>
  <h1>Slots konfigurieren</h1>

  <Draggable
    v-model="slots"
    :item-key="itemKey"
    @end="onDragEnd"
  >
    <template #item="{ element, index }">
      <div class="slot-item">
        <!-- Fixer, automatischer Slot-Name (wird bei onDragEnd aktualisiert) -->
        <label>Position: {{ index + 1 }}</label>
        <input v-model="element.title" placeholder="Slot-Titel" />

        <!-- Slot-Typ auswählen -->
        <select v-model="element.type" @change="element.dataId = ''">
          <option value="">-- Bitte wählen --</option>
          <option value="quiz">Quiz</option>
          <option value="marken">Marken-Attribute</option>
          <option value="buchcover">Buchcover</option>
          <option value="feedback">Feedback</option>
          <option value="newsletter">Newsletter</option>
        </select>

        <!-- Dynamische Auswahl je nach Typ -->
        <div v-if="element.type === 'quiz'">
          <label>Quiz auswählen:</label>
          <select v-model="element.dataId">
            <option value="">-- bitte wählen --</option>
            <option
              v-for="quiz in quizzes"
              :key="quiz.id"
              :value="quiz.id"
            >
              {{ quiz.data.title }}
            </option>
          </select>
        </div>

        <div v-else-if="element.type === 'marken'">
          <label>Marken-Dokument:</label>
          <select v-model="element.dataId">
            <option value="">-- bitte wählen --</option>
            <option
              v-for="brandDoc in brandDocs"
              :key="brandDoc.id"
              :value="brandDoc.id"
            >
              {{ brandDoc.data.brand }}
            </option>
          </select>
        </div>

        <div v-else-if="element.type === 'buchcover'">
          <label>Cover-Auswahl:</label>
          <select v-model="element.dataId">
            <option value="">-- bitte wählen --</option>
            <option
              v-for="coverDoc in coverDocs"
              :key="coverDoc.id"
              :value="coverDoc.id"
            >
              {{ coverDoc.data.title }}
            </option>
          </select>
        </div>

        <!-- Feedback & Newsletter brauchen evtl. keine dataId -->
        <div v-else-if="element.type === 'feedback'">
          <p>Keine zusätzliche Auswahl nötig.</p>
        </div>
        <div v-else-if="element.type === 'newsletter'">
          <p>Keine zusätzliche Auswahl nötig.</p>
        </div>
         <!-- Neuer Button: Details-Seite -->
        <button @click="goToDetails(index)">Details</button>
      </div>
    </template>
  </Draggable>

  <!-- Manueller Button zum Speichern -->
  <button @click="saveSlots">Speichern</button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Draggable from 'vuedraggable'
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  getDocs
} from 'firebase/firestore'

// Aus nuxt-vuefire:
const db = useFirestore()

// Typ für ein Slot-Element
interface SlotItem {
  title: string
  type: string    // 'quiz' | 'marken' | 'buchcover' | 'feedback' | 'newsletter'
  dataId: string
}

// Unsere Slots
const slots = ref<SlotItem[]>([])

// Referenzen zu den Admin-Collections:
const quizzes = ref<Array<{ id: string; data: any }>>([])
const brandDocs = ref<Array<{ id: string; data: any }>>([])
const coverDocs = ref<Array<{ id: string; data: any }>>([])

// Eindeutiger Schlüssel pro Slot:
function itemKey(item: SlotItem) {
  return item.dataId || item.title
}

// Beim Laden
onMounted(async () => {
  // 1. slots (homeSlots) laden
  const docRef = doc(db, 'config', 'homeSlots')
  const snap = await getDoc(docRef)
  if (snap.exists()) {
    slots.value = snap.data().slots || []
  } else {
    // Standardwerte anlegen
    const defaultSlots: SlotItem[] = [
      { title: 'Slot 1', type: '', dataId: '' },
      { title: 'Slot 2', type: '', dataId: '' },
      { title: 'Slot 3', type: '', dataId: '' },
      { title: 'Slot 4', type: '', dataId: '' },
      { title: 'Slot 5', type: '', dataId: '' },
      { title: 'Slot 6', type: '', dataId: '' }
    ]
    await setDoc(docRef, { slots: defaultSlots })
    slots.value = defaultSlots
  }

  // 2. Quizzes laden
  const quizSnap = await getDocs(collection(db, 'quizzes'))
  quizSnap.forEach(docSnap => {
    quizzes.value.push({ id: docSnap.id, data: docSnap.data() })
  })

  // 3. Marken-Attribute
  const brandSnap = await getDocs(collection(db, 'brandAttributes'))
  brandSnap.forEach(docSnap => {
    brandDocs.value.push({ id: docSnap.id, data: docSnap.data() })
  })

  // 4. Cover Selections
  const coverSnap = await getDocs(collection(db, 'coverSelections'))
  coverSnap.forEach(docSnap => {
    coverDocs.value.push({ id: docSnap.id, data: docSnap.data() })
  })
})

// Beim Drag-Ende die Slot-Titel aktualisieren (Index-basiert)
function onDragEnd() {
  slots.value.forEach((slot, i) => {
    slot.title = `Slot ${i + 1}`
  })
}

// Manueller Button -> Speichern
async function saveSlots() {
  const docRef = doc(db, 'config', 'homeSlots')
  try {
    await updateDoc(docRef, { slots: slots.value })
  } catch (e) {
    await setDoc(docRef, { slots: slots.value })
  }
  alert('Slots gespeichert!')
}

// Layout
definePageMeta({ layout: 'admin' })
</script>

<style scoped>
.slot-item {
  border: 1px solid #ccc;
  margin-bottom: 1rem;
  padding: 1rem;
}
</style>