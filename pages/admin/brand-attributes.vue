<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900">
      Admin - Marken-Attribute
    </h1>
    <p class="mt-2 text-sm text-gray-700">
      Hier findest du eine Liste aller Marken und die zugehörigen Attribute. Du
      kannst neue Marken erstellen, Attribute hinzufügen oder löschen. Außerdem
      kannst du optional ein Bild pro Marke hochladen.
    </p>

    <!-- Tabelle der vorhandenen Marken -->
    <div class="mt-8 flow-root" v-if="brandDocs.length">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <!-- Spalte 1: Markenname -->
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Marke
                  </th>
                  <!-- Spalte 2: Anzahl Attribute -->
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Anzahl Attribute
                  </th>
                  <!-- Spalte 3: Bildvorschau -->
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Bild
                  </th>
                  <!-- Spalte 4: Aktionen -->
                  <th
                    scope="col"
                    class="relative py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
                  >
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="brandDoc in brandDocs" :key="brandDoc.id">
                  <!-- Markenname -->
                  <td
                    class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                  >
                    {{ brandDoc.data.brand }}
                  </td>
                  <!-- Anzahl Attribute -->
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ brandDoc.data.attributes.length }} Attribute
                  </td>
                  <!-- Bildvorschau -->
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div
                      v-if="brandDoc.data.brandImageUrl"
                      class="w-16 h-16 overflow-hidden"
                    >
                      <img
                        :src="brandDoc.data.brandImageUrl"
                        alt="Marken-Bild (1920 × 2620)"
                        class="h-full w-full object-cover border rounded"
                      />
                    </div>
                    <div v-else class="text-gray-400">–</div>
                  </td>
                  <!-- Aktionen -->
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
                    <div class="flex gap-2">
                      <button
                        class="text-indigo-600 hover:text-indigo-900"
                        @click="editBrandDoc(brandDoc.id)"
                      >
                        Bearbeiten
                      </button>
                      <button
                        class="text-red-600 hover:text-red-800"
                        @click="deleteBrandDoc(brandDoc.id)"
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

    <hr class="my-8" />

    <!-- Formular zum Erstellen/Bearbeiten einer Marke -->
    <div class="bg-white shadow sm:rounded-lg p-4">
      <h2 class="text-base font-semibold text-gray-900 mb-4">
        {{ editId ? "Marke bearbeiten" : "Neue Marke erstellen" }}
      </h2>

      <form @submit.prevent="saveBrandDoc" class="space-y-4">
        <!-- Markenname -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Markenname</label
          >
          <input
            v-model="formData.brand"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <!-- Bild -->
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Marken-Bild (1920 × 2620)</label
          >
          <div
            v-if="formData.brandImageUrl"
            class="mt-1 w-20 h-20 overflow-hidden"
          >
            <img
              :src="formData.brandImageUrl"
              alt="Marken-Bild"
              class="w-full h-full object-cover border rounded"
            />
          </div>
          <input
            type="file"
            @change="uploadBrandImage"
            class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-500 mt-1"
          />
        </div>

        <!-- Attribute -->
        <div class="attribute-list border border-gray-200 rounded-md p-4">
          <h3 class="text-sm font-semibold text-gray-800 mb-2">Attribute</h3>
          <div
            v-for="(attr, index) in formData.attributes"
            :key="index"
            class="attribute-item mb-2 flex gap-2 items-center"
          >
            <input
              v-model="attr.title"
              placeholder="Titel (z.B. 'innovativ')"
              class="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              class="text-red-600 hover:text-red-900 text-sm"
              @click="removeAttribute(index)"
            >
              Entfernen
            </button>
          </div>
          <button
            type="button"
            class="mt-2 inline-flex items-center rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-300"
            @click="addAttribute"
          >
            Neues Attribut
          </button>
        </div>

        <div class="flex gap-4 mt-4">
          <button
            type="submit"
            class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {{ editId ? "Speichern" : "Erstellen" }}
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
import type { BrandData } from "~/types";

// Layout
definePageMeta({ layout: "admin" });

// Aus nuxt-vuefire
const db = useFirestore();
const firebaseApp = useFirebaseApp();
const storage = getStorage(firebaseApp);

// Datentypen

// Aus Firestore geladene Marken-Dokumente
const brandDocs = ref<
  Array<{
    id: string;
    data: BrandData;
  }>
>([]);

// ID des aktuell zu bearbeitenden Dokuments
const editId = ref<string | null>(null);

// Formular-Daten
const formData = ref<BrandData>({
  brand: "",
  brandImageUrl: "",
  attributes: [{ title: "" }],
});

// Beim Laden -> Marken laden
onMounted(async () => {
  await loadBrands();
});

async function loadBrands() {
  brandDocs.value = [];
  const qSnap = await getDocs(collection(db, "brandAttributes"));
  qSnap.forEach((d) => {
    brandDocs.value.push({
      id: d.id,
      data: d.data() as BrandData,
    });
  });
}

// Bearbeiten
async function editBrandDoc(id: string) {
  const docRef = doc(db, "brandAttributes", id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    editId.value = id;
    formData.value = snap.data() as BrandData;
    // Falls im Dokument kein Array existiert
    if (!formData.value.attributes) {
      formData.value.attributes = [];
    }
  }
}

// Speichern
async function saveBrandDoc() {
  if (!formData.value.brand) return;
  const payload = { ...formData.value };

  if (editId.value) {
    // Update existierendes Dok
    const docRef = doc(db, "brandAttributes", editId.value);
    await updateDoc(docRef, payload);
  } else {
    // Neues Dokument anlegen
    await addDoc(collection(db, "brandAttributes"), payload);
  }
  cancelEdit();
  await loadBrands();
}

// Löschen
async function deleteBrandDoc(id: string) {
  if (!confirm("Wirklich löschen?")) return;
  const docRef = doc(db, "brandAttributes", id);
  await deleteDoc(docRef);
  await loadBrands();
}

// Formular abbrechen/Zurücksetzen
function cancelEdit() {
  editId.value = null;
  formData.value = {
    brand: "",
    brandImageUrl: "",
    attributes: [{ title: "" }],
  };
}

// Attribute-Helfer
function addAttribute() {
  formData.value.attributes.push({ title: "" });
}
function removeAttribute(index: number) {
  formData.value.attributes.splice(index, 1);
}

// Bild-Upload
async function uploadBrandImage(event: Event) {
  const file = (event.target as HTMLInputElement)?.files?.[0];
  if (!file) return;

  try {
    const filePath = `brand-images/${Date.now()}_${file.name}`;
    const storageR = storageRef(storage, filePath);
    await uploadBytes(storageR, file);
    const downloadURL = await getDownloadURL(storageR);
    formData.value.brandImageUrl = downloadURL;
  } catch (err) {
    console.error("Fehler beim Bild-Upload:", err);
  }
}
</script>

<style scoped>
.attribute-list {
  margin-top: 1rem;
}

.attribute-item {
  margin-bottom: 0.5rem;
}
</style>
