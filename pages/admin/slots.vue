<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900 mb-4">
      Slots konfigurieren
    </h1>

    <!-- Draggable Grid Layout -->
    <Draggable
      v-model="slots"
      :item-key="itemKey"
      @end="onDragEnd"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <template #item="{ element, index }">
        <div class="relative border border-gray-200 p-4 bg-white shadow-md rounded-md cursor-grab">
          <!-- Image with Overlay -->
          <div class="relative h-48 w-full">
            <img
              v-if="element.imageUrl"
              :src="element.imageUrl"
              alt="Slot Bild"
              class="absolute inset-0 w-full h-full object-cover rounded-md"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500"
            >
              Kein Bild
            </div>
            <div
              class="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-3 py-1 rounded-md text-sm font-semibold"
            >
              {{ element.displayName || "Kein Titel" }}
            </div>
          </div>

          <!-- Slot Settings -->
          <div class="mt-4 p-2 bg-gray-100 rounded-md">
            <div class="text-sm font-medium text-gray-700">
              App Anzeige Titel: {{ index + 1 }}
            </div>
            <input
              v-model="element.displayName"
              placeholder="Titel eingeben"
              class="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />

            <div class="mt-2 text-sm font-medium text-gray-700">
              Slot-Typ:
            </div>
            <select
              v-model="element.type"
              @change="resetSlotData(element)"
              class="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">-- Bitte wählen --</option>
              <option value="quiz">Quiz</option>
              <option value="marken">Marken-Attribute</option>
              <option value="buchcover">Buchcover</option>
              <option value="feedback">Feedback</option>
              <option value="newsletter">Newsletter</option>
            </select>

            <!-- Slot-Bild Upload -->
            <div class="mt-4">
              <label class="text-sm font-medium text-gray-700">Slot-Bild hochladen:</label>
              <input
                type="file"
                @change="uploadSlotImage($event, index)"
                class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-500 mt-1"
              />
            </div>
          </div>
        </div>
      </template>
    </Draggable>

    <!-- Speichern-Button -->
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
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { useFirestore } from "#imports";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// Firestore & Storage
const db = useFirestore();
const storage = getStorage();

// Slot Interface
interface SlotItem {
  displayName: string;
  type: "quiz" | "marken" | "buchcover" | "feedback" | "newsletter" | "keine-auswahl";
  imageUrl?: string;
}

// Slots
const slots = ref<SlotItem[]>([]);

// Unique key for draggable items
function itemKey(item: SlotItem) {
  return item.displayName || Math.random().toString();
}

// Load slots from Firestore
onMounted(async () => {
  const docRef = doc(db, "config", "homeSlots");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    slots.value = snap.data().slots || [];
  } else {
    slots.value = [
      { displayName: "Slot 1", type: "", imageUrl: "" },
      { displayName: "Slot 2", type: "", imageUrl: "" },
      { displayName: "Slot 3", type: "", imageUrl: "" },
    ];
    await setDoc(docRef, { slots: slots.value });
  }
});

// Save Slots
async function saveSlots() {
  const docRef = doc(db, "config", "homeSlots");
  try {
    await updateDoc(docRef, { slots: slots.value });
  } catch (err) {
    await setDoc(docRef, { slots: slots.value });
  }
  alert("Slots gespeichert!");
}

// Reset Slot Data on Type Change
function resetSlotData(slot: SlotItem) {
  slot.imageUrl = "";
}

// Upload Slot Image
async function uploadSlotImage(event: any, index: number) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const filePath = `slot-images/${Date.now()}_${file.name}`;
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
/* Draggable Item Hover */
.grid div {
  transition: transform 0.2s;
}
</style>