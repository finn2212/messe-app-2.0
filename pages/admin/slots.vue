<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900 mb-4">
      Slots konfigurieren
    </h1>

    <!-- Draggable Grid with 3 columns -->
    <Draggable
      v-model="slots"
      :item-key="itemKey"
      @end="onDragEnd"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <!-- Exactly one root <div> for each slot item -->
      <template #item="{ element, index }">
        <div
          class="group relative flex flex-col gap-2 cursor-grab border border-gray-200 p-4 hover:bg-gray-50 focus:outline-none rounded-md"
        >
          <!-- Slot Index & Display Name -->
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-sm text-gray-700">
              Slot # {{ index + 1 }}
            </h2>
            <input
              v-model="element.displayName"
              placeholder="Anzeige-Titel"
              class="rounded-md border border-gray-300 px-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <!-- Internal Title -->
          <div class="flex items-center">
            <label class="block text-xs font-medium text-gray-500 mr-1">
              Titel:
            </label>
            <input
              v-model="element.title"
              placeholder="Interner Titel"
              class="flex-1 rounded-md border border-gray-300 px-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <!-- Slot Type (currently only "quiz") -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700">Slot-Typ:</label>
            <select
              v-model="element.type"
              @change="resetSlotData(element)"
              class="rounded-md border-gray-300 text-sm shadow-sm mt-1 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option
                v-for="type in uniqueSlotTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>

          <!-- QUIZ selection -->
          <div v-if="element.type === 'quiz'">
            <label class="text-xs text-gray-700">Quiz auswählen:</label>
            <select
              v-model="element.dataId"
              class="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mt-1"
            >
              <option value="">-- bitte wählen --</option>
              <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
                {{ quiz.data.title }}
              </option>
            </select>
          </div>
          <div v-if="element.type === 'buchcover'" class="flex flex-col">
            <label class="text-xs text-gray-700">Buchcover auswählen:</label>
            <select
              v-model="element.coverIds"
              multiple
              class="w-full rounded-md border-gray-300 text-sm shadow-sm mt-1 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option
                v-for="cover in coverSelections"
                :key="cover.id"
                :value="cover.id"
              >
                {{ cover.data.title }}
              </option>
            </select>
          </div>

          <!-- Optional Image Upload -->
          <div class="mt-2">
            <label class="block text-xs font-medium text-gray-700">
              Bild (optional):
            </label>
            <div v-if="element.imageUrl" class="mt-1 w-24 h-24 border rounded">
              <img
                :src="element.imageUrl"
                alt="Slot Bild"
                class="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              @change="uploadSlotImage($event, index)"
              class="mt-1 text-xs text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-indigo-600 file:py-1 file:px-3 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500"
            />
          </div>
        </div>
      </template>
    </Draggable>

    <!-- Save Button -->
    <div class="mt-6 flex justify-center">
      <button
        @click="saveSlots"
        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
      >
        Slots speichern
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Draggable from "vuedraggable";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { useFirebaseApp, useFirestore } from "#imports";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// This page layout is for your admin
definePageMeta({ layout: "admin" });

// Firestore & Storage
const db = useFirestore();
const firebaseApp = useFirebaseApp();
const storage = getStorage(firebaseApp);

// Reactive Variable für CoverSelections
const coverSelections = ref<Array<{ id: string; data: any }>>([]);

// Funktion, um CoverSelections aus Firestore zu laden
async function loadCoverSelections() {
  const coverSnap = await getDocs(collection(db, "coverSelections"));
  coverSnap.forEach((docSnap) => {
    coverSelections.value.push({ id: docSnap.id, data: docSnap.data() });
  });
}

// ---- SlotItem interface ----
interface SlotItem {
  displayName: string; // e.g. "Lehrerquiz"
  title: string; // internal label
  type: "" | "quiz" | "buchcover" | "newsletter" | "marken" | "feedback"; // only quiz for now
  dataId?: string; // single doc ID for the quiz
  imageUrl?: string;
  coverIds?: string[];
}

// The draggable slots array
const slots = ref<SlotItem[]>([]);

// Quizzes from Firestore
const quizzes = ref<Array<{ id: string; data: any }>>([]);

/**
 * For each item, we must give a stable unique key
 */
function itemKey(item: SlotItem) {
  return (item.title || "slot") + ":" + (item.dataId || "");
}

/**
 * onMounted -> Load Firestore data & quiz docs
 */
onMounted(async () => {
  await loadSlots();
  await loadQuizzes();
  await loadCoverSelections();
});

// Alle eindeutigen Typen aus den geladenen Slots extrahieren
const uniqueSlotTypes = computed(() => {
  const types = slots.value.map((s) => s.type);
  const uniqueTypes = Array.from(new Set(types));
  // Stelle sicher, dass auch ein Platzhalter vorhanden ist
  return [{ value: "", label: "-- Bitte wählen --" }].concat(
    uniqueTypes.map((t) => ({
      value: t,
      label: t.charAt(0).toUpperCase() + t.slice(1),
    }))
  );
});

/**
 * Load or init the "homeSlots" doc
 */
async function loadSlots() {
  const docRef = doc(db, "config", "homeSlots");
  const snap = await getDoc(docRef);
  debugger;

  if (snap.exists()) {
    const loadedSlots = snap.data().slots as SlotItem[];
    // Ensure imageUrl is defined
    loadedSlots.forEach((s) => {
      if (!s.imageUrl) s.imageUrl = "";
    });
    slots.value = loadedSlots;
  } else {
    // create default, e.g. 9 slots
    const defaultSlots: SlotItem[] = Array.from({ length: 9 }, (_, i) => ({
      title: `Slot ${i + 1}`,
      displayName: "",
      type: "",
      dataId: "",
      imageUrl: "",
    }));
    await setDoc(docRef, { slots: defaultSlots });
    slots.value = defaultSlots;
  }
}

/**
 * Draggable => rename slots if desired
 */
function onDragEnd() {
  slots.value.forEach((slot, i) => {
    slot.title = `Slot ${i + 1}`;
  });
}

/**
 * Save to Firestore
 */
async function saveSlots() {
  const docRef = doc(db, "config", "homeSlots");
  try {
    await updateDoc(docRef, { slots: slots.value });
  } catch (err) {
    await setDoc(docRef, { slots: slots.value });
  }
  alert("Slots gespeichert!");
}

/**
 * Upload slot image
 */
async function uploadSlotImage(event: Event, index: number) {
  const inputEl = event.target as HTMLInputElement;
  const file = inputEl.files?.[0];
  if (!file) return;

  try {
    const filePath = `slot-images/${Date.now()}_slot_${file.name}`;
    const storageReference = storageRef(storage, filePath);
    await uploadBytes(storageReference, file);
    const downloadURL = await getDownloadURL(storageReference);
    slots.value[index].imageUrl = downloadURL;
  } catch (err) {
    console.error("Fehler beim Hochladen des Slot-Bildes:", err);
  }
}

/**
 * Load quizzes for the dropdown
 */
async function loadQuizzes() {
  const quizSnap = await getDocs(collection(db, "quizzes"));
  quizSnap.forEach((docSnap) => {
    quizzes.value.push({ id: docSnap.id, data: docSnap.data() });
  });
}

/**
 * If slot type changes, reset data that doesn't apply
 */
function resetSlotData(slot: SlotItem) {
  // Wenn der Slot nicht vom Typ "quiz" ist, leere dataId
  if (slot.type !== "quiz") {
    slot.dataId = "";
  }
  // Wenn der Slot nicht vom Typ "buchcover" ist, leere coverIds
  if (slot.type !== "buchcover") {
    slot.coverIds = [];
  }
}
</script>

<style scoped>
/* Example styling; adjust as needed */
</style>
