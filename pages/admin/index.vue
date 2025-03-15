<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900 mb-4">
      Kacheln konfigurieren
    </h1>

    <!-- ===================== -->
    <!-- 1) Brand Page Tabs -->
    <!-- ===================== -->
    <div class="mt-4 border-b border-gray-300 flex justify-between mb-4">
      <nav class="flex space-x-4 flex-1">
        <!-- Iterate over all Brand Page -->
        <button v-for="slotPage in slotPages" :key="slotPage.id" @click="handlePageChange(slotPage)" :class="[
          'py-2 px-4 text-sm font-medium flex items-center flex-row gap-1 group',
          activeSlotPageId === slotPage.id
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-600 hover:text-gray-900',
        ]">
          <span>{{ slotPage.name }}</span>
          <div class="flex gap-1">
            <TrashIcon @click="deleteSlotPage(slotPage?.id)" class="-ml-2 group-hover:ml-0 opacity-0 group-hover:opacity-100 transition-all ease duration-300 text-orange-600 w-4 h-4 hover:text-gray-900" />
            <PencilSquareIcon @click="editSlotPage(slotPage)" class="-ml-2 group-hover:ml-0 opacity-0 group-hover:opacity-100 transition-all ease duration-300 text-indigo-600 w-4 h-4 hover:text-gray-900" />
          </div>
        </button>
      </nav>
      <button @click="setIsOpen(true)"
        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 mb-4">
      Neue Seite
      </button>
      <Modal :isOpen="isOpen" @close="setIsOpen(false)" title="Neue Slot Page" @save="handleSlotPageSave">
        <div class="py-4">
           <!-- Internal Title -->
           <div class="flex flex-col gap-2">
            <label class="block text-xs font-medium text-gray-500 mr-1">
              Titel:
            </label>
            <input v-model="slotPageFormData.name" placeholder="Interner Titel"
              class="rounded-md border border-gray-300 px-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
        </div>
      </Modal>
    </div>

    <!-- Draggable Grid with 3 columns -->
    <Draggable
      v-model="slots"
      :item-key="itemKey"
      @end="onDragEnd"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <!-- Exactly one root <div> for each slot item -->
      <template #item="{ element, index }" :key="index">
        <div
          class="group relative flex flex-col gap-2 cursor-grab border border-gray-200 p-4 hover:bg-gray-50 focus:outline-none rounded-md"
        >
          <!-- Slot Index & Display Name -->
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-sm text-gray-700">
              Kachel # {{ index + 1 }}
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
            <label class="text-sm font-medium text-gray-700">Kachel-Typ:</label>
            <select
              v-model="element.type"
              @change="resetSlotData(element)"
              class="rounded-md border-gray-300 text-sm shadow-sm mt-1 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option
                v-for="type in slotTypes"
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
              Bild (5333 × 3847):
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
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useFirebaseApp, useFirestore } from "#imports";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import Modal from "~/components/Modal.vue";
import { PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
import type { SlotPage, SlotItem } from "~/types";

definePageMeta({
  layout: "admin"
});


// Firestore & Storage
const db = useFirestore();
const firebaseApp = useFirebaseApp();
const storage = getStorage(firebaseApp);
const slotTypes = ref<Array<{ value: string; label: string }>>([]);

const slotPages = ref<SlotPage[]>([]);
const slotPagesLoaded = ref(false);
const activeSlotPageId = ref<string | null>(null);

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


// Formular-Daten
const slotPageFormData = ref<SlotPage>({
  name: "",
  id: "",
});

// The draggable slots array
const slots = ref<SlotItem[]>([]);
const allSlots = ref<SlotItem[]>([]);

// Quizzes from Firestore
const quizzes = ref<Array<{ id: string; data: any }>>([]);

const isOpen = ref(false);

/**
 * For each item, we must give a stable unique key
 */
function itemKey(item: SlotItem) {
  return (item.title || "slot") + ":" + (item.dataId || "");
}

const setIsOpen = (value: boolean) => {
  isOpen.value = value;
};

/**
 * onMounted -> Load Firestore data & quiz docs
 */
onMounted(async () => {
  await fetchSlotPages();
  if (slotPages.value.length > 0) {
    setActivePageId(slotPages.value[0].id);
    loadSlots();
  }
  await loadQuizzes();
  await loadCoverSelections();
  await loadSlotTypes();
});

const handlePageChange = (page: SlotPage | null) => {
  setActivePageId(page?.id || null);
  loadSlots();
  slotPageFormData.value.id = page ? page.id : "";
  slotPageFormData.value.name = page ? page.name : "";
};

const cancelEditPage = () => {
  slotPageFormData.value.id = "";
  slotPageFormData.value.name = "";
};

async function fetchSlotPages() {
  const pageSnap = await getDocs(collection(db, "slotPages"));
  slotPages.value = pageSnap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
    };
  });
  slotPagesLoaded.value = true;
}

function setActivePageId(pageId: string | null) {
  activeSlotPageId.value = pageId;
}

const handleSlotPageSave = async () => {  
  if (!slotPageFormData.value.name) return;
  const payload = { name: slotPageFormData.value.name };
  if (slotPageFormData.value.id) {
    // Update existierendes Dok
    const docRef = doc(db, "slotPages", slotPageFormData.value.id);
    await updateDoc(docRef, payload);
    await fetchSlotPages();
    cancelEditPage();
  } else {
    // create new doc  and get the doc reference
    const docSlotPageRef = await addDoc(collection(db, "slotPages"), payload);

    // add new page to slotPages
    slotPages.value.push({ id: docSlotPageRef.id, name: payload.name });

    // set active page id
    setActivePageId(docSlotPageRef.id);

    // create new slots
    const newSlots = createFewDefaultSlots(6);
    const docRef = doc(db, "config", "homeSlots");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const loadedSlots = snap.data().slots as SlotItem[];
      // Ensure imageUrl is defined
      loadedSlots.forEach((s) => {
        if (!s.imageUrl) s.imageUrl = "";
      });
      await updateDoc(docRef, { slots: [...loadedSlots, ...newSlots] });
    } else {
      await setDoc(docRef, { slots: newSlots });
      allSlots.value = newSlots;
    }
    slots.value = newSlots;
    cancelEditPage();
  }
  setIsOpen(false);
};

const editSlotPage = (page: SlotPage | null) => {
  slotPageFormData.value.id = page ? page.id : "";
  slotPageFormData.value.name = page ? page.name : "";
  setIsOpen(true);
};

const deleteSlotPage = async (id: string | null) => {
  if (!confirm("Wirklich löschen?")) return;
  if (!id) return;
  const docRef = doc(db, "slotPages", id);
  await deleteDoc(docRef);
  fetchSlotPages().then(() => {
    const newSlots = allSlots.value.filter(s => s.slotPageId !== id);
    setDoc(doc(db, "config", "homeSlots"), { slots: newSlots });
    if (activeSlotPageId.value === id) {
      setActivePageId(slotPages.value[0].id);
      loadSlots();
    }
  });
  cancelEditPage();
};

async function loadSlotTypes() {
  const docRef = doc(db, "config", "slotTypes");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const configData = snap.data();
    // Konvertiere das Objekt in ein Array von { value, label } Objekten.
    slotTypes.value = Object.entries(configData).map(([key, label]) => ({
      value: key,
      label: label as string,
    }));
  } else {
    slotTypes.value = [];
  }
}

const createFewDefaultSlots = (count: number) => {
  const defaultSlots: SlotItem[] = Array.from({ length: count }, (_, i) => ({
    title: `Slot ${i + 1}`,
    displayName: "",
    type: "",
    dataId: "",
    imageUrl: "",
    slotPageId: activeSlotPageId.value
  }));
  return defaultSlots;
};
/**
 * Load or init the "homeSlots" doc
 */
 async function loadSlots() {
  const docRef = doc(db, "config", "homeSlots");
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const loadedSlots = snap.data().slots as SlotItem[];
    // Ensure imageUrl is defined
    loadedSlots.forEach((s) => {
      if (!s.imageUrl) s.imageUrl = "";
    });
    
    allSlots.value = loadedSlots;
    slots.value = loadedSlots.filter(s => s.slotPageId === activeSlotPageId.value);
  } else {
    // create default, e.g. 6 slots
    const defaultSlots: SlotItem[] = createFewDefaultSlots(6);
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
  const updatedSlots = [
    ...slots.value.map(s => ({
      ...s
    })),
    ...allSlots.value.filter(s => s.slotPageId !== activeSlotPageId.value).map(s => ({
      ...s
    }))
  ];
  
  try {
    await updateDoc(docRef, { slots: updatedSlots });
  } catch (err) {
    await setDoc(docRef, { slots: updatedSlots });
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
