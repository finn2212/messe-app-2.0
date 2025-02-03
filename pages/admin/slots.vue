<!-- /pages/admin/slots.vue -->
<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900 mb-4">
      Slots konfigurieren
    </h1>

    <Draggable v-model="slots" :item-key="itemKey" @end="onDragEnd">
      <!-- *Genau ein* Root-Element im #item-Slot -->
      <template #item="{ element, index }">
        <div
          class="group relative flex flex-col gap-2 cursor-grab border border-gray-200 p-4 first:rounded-tl-md first:rounded-tr-md last:rounded-bl-md last:rounded-br-md hover:bg-gray-50 focus:outline-none mb-2"
        >
          <!-- Slot Display Name -->
          <div class="flex items-center gap-2">
            <label class="block text-sm font-medium text-gray-700">
              App Anzeige Titel: {{ index + 1 }}
            </label>
            <input
              v-model="element.displayName"
              placeholder="Lehrer Quizz"
              class="ml-2 block w-1/2 rounded-md border-gray-300 text-sm
                     shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <!-- Position + Titel -->
          <div class="flex items-center gap-2">
            <label class="block text-sm font-medium text-gray-700">
              Position: {{ index + 1 }}
            </label>
            <input
              v-model="element.title"
              placeholder="Slot-Titel"
              class="ml-2 block w-1/2 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <!-- Slot-Typ -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <label class="text-sm font-medium text-gray-700">Slot-Typ:</label>
            <select
              v-model="element.type"
              @change="resetSlotData(element)"
              class="block w-1/2 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">-- Bitte wählen --</option>
              <option value="quiz">Quiz</option>
              <option value="marken">Marken-Attribute</option>
              <option value="buchcover">Buchcover</option>
              <option value="feedback">Feedback</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>

          <!-- Dynamische Auswahl je nach Type -->

          <!-- Quiz -->
          <div
            v-if="element.type === 'quiz'"
            class="flex flex-col sm:flex-row gap-2"
          >
            <label class="text-sm text-gray-700">Quiz auswählen:</label>
            <select
              v-model="element.dataId"
              class="block w-1/2 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">-- bitte wählen --</option>
              <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
                {{ quiz.data.title }}
              </option>
            </select>
          </div>

          <!-- Marken -->
          <div
            v-else-if="element.type === 'marken'"
            class="flex flex-col sm:flex-row gap-2"
          >
            <label class="text-sm text-gray-700">Marken-Dokument:</label>
            <select
              v-model="element.dataId"
              class="block w-1/2 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
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

          <!-- Buchcover: Mehrfachauswahl (Beispiel) -->
          <div
            v-else-if="element.type === 'buchcover'"
            class="flex flex-col gap-2"
          >
            <label class="text-sm text-gray-700"
              >Cover-Auswahl (mehrfach):</label
            >
            <select
              multiple
              v-model="element.coverIds"
              class="block rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-full sm:w-1/2"
            >
              <option
                v-for="coverDoc in coverDocs"
                :key="coverDoc.id"
                :value="coverDoc.id"
              >
                {{ coverDoc.data.title }}
              </option>
            </select>
          </div>

          <!-- Feedback -->
          <div
            v-else-if="element.type === 'feedback'"
            class="text-sm text-gray-700"
          >
            Keine zusätzliche Auswahl nötig.
          </div>

          <!-- Newsletter -->
          <div
            v-else-if="element.type === 'newsletter'"
            class="text-sm text-gray-700"
          >
            Keine zusätzliche Auswahl nötig.
          </div>

          <!-- Slot-Bild Upload (optional) -->
          <div class="mt-2">
            <label class="text-sm font-medium text-gray-700"
              >Slot-Bild (optional):</label
            >
            <div v-if="element.imageUrl" class="mt-1 w-24 h-24 overflow-hidden">
              <img
                :src="element.imageUrl"
                alt="Slot Bild"
                class="w-full h-full object-cover border rounded"
              />
            </div>
            <input
              type="file"
              @change="uploadSlotImage($event, index)"
              class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-500 mt-1"
            />
          </div>
        </div>
      </template>
    </Draggable>

    <!-- Speichern-Button -->
    <div class="mt-4">
      <button
        @click="saveSlots"
        class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
import { useFirebaseApp } from "#imports";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const db = useFirestore();
const firebaseApp = useFirebaseApp();
const storage = getStorage(firebaseApp);

interface SlotItem {
  displayName: string;
  title: string;
  type: "quiz" | "marken" | "buchcover" | "feedback" | "newsletter" | "";
  dataId?: string; // single ID, falls quiz o.ä.
  coverIds?: string[]; // mehrere IDs für buchcover
  imageUrl?: string; // eigenes Bild pro Slot
}

// Slots
const slots = ref<SlotItem[]>([]);

// Collections
const quizzes = ref<Array<{ id: string; data: any }>>([]);
const brandDocs = ref<Array<{ id: string; data: any }>>([]);
const coverDocs = ref<Array<{ id: string; data: any }>>([]);

// Key-Funktion -> ein Root-Element, damit vuedraggable zufrieden ist
function itemKey(item: SlotItem) {
  // Eindeutiges Key, z.B. title + covers
  return (
    (item.title || "slot") + (item.coverIds?.join("-") || item.dataId || "")
  );
}

onMounted(async () => {
  // Slots laden
  const docRef = doc(db, "config", "homeSlots");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const loadedSlots = snap.data().slots as SlotItem[];
    // Standardwerte, falls needed
    loadedSlots.forEach((s) => {
      if (s.type === "buchcover" && !s.coverIds) {
        s.coverIds = [];
      }
      if (!s.imageUrl) {
        s.imageUrl = "";
      }
    });
    slots.value = loadedSlots;
  } else {
    // default
    const defaultSlots: SlotItem[] = [
      {
        title: "Slot 1", type: "", dataId: "", coverIds: [], imageUrl: "",
        displayName: ""
      },
      {
        title: "Slot 2", type: "", dataId: "", coverIds: [], imageUrl: "",
        displayName: ""
      },
      {
        title: "Slot 3", type: "", dataId: "", coverIds: [], imageUrl: "",
        displayName: ""
      },
      {
        title: "Slot 4", type: "", dataId: "", coverIds: [], imageUrl: "",
        displayName: ""
      },
      {
        title: "Slot 5", type: "", dataId: "", coverIds: [], imageUrl: "",
        displayName: ""
      },
      {
        title: "Slot 6", type: "", dataId: "", coverIds: [], imageUrl: "",
        displayName: ""
      },
    ];
    await setDoc(docRef, { slots: defaultSlots });
    slots.value = defaultSlots;
  }

  // Quizzes
  const quizSnap = await getDocs(collection(db, "quizzes"));
  quizSnap.forEach((docSnap) => {
    quizzes.value.push({ id: docSnap.id, data: docSnap.data() });
  });

  // Marken
  const brandSnap = await getDocs(collection(db, "brandAttributes"));
  brandSnap.forEach((docSnap) => {
    brandDocs.value.push({ id: docSnap.id, data: docSnap.data() });
  });

  // Cover
  const coverSnap = await getDocs(collection(db, "coverSelections"));
  coverSnap.forEach((docSnap) => {
    coverDocs.value.push({ id: docSnap.id, data: docSnap.data() });
  });
});

function onDragEnd() {
  // z.B. Slot-Titel aktualisieren
  slots.value.forEach((slot, i) => {
    slot.title = `Slot ${i + 1}`;
  });
}

async function saveSlots() {
  const docRef = doc(db, "config", "homeSlots");
  try {
    await updateDoc(docRef, { slots: slots.value });
  } catch (err) {
    await setDoc(docRef, { slots: slots.value });
  }
  alert("Slots gespeichert!");
}

// Typ-Wechsel -> reset Felder
function resetSlotData(slot: SlotItem) {
  slot.dataId = "";
  slot.coverIds = [];
  // Slot behält sein imageUrl
}

// Bild pro Slot hochladen
async function uploadSlotImage(event: any, index: number) {
  const file = event.target.files[0];
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

// Layout
definePageMeta({ layout: "admin" });
</script>

<style scoped>
/* Zusätzliche Styles optional */
</style>
