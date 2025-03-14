<template>
    <div>
      <h1 class="text-base font-semibold text-gray-900">Admin - Marken Mapping</h1>
      <p class="mt-2 text-sm text-gray-700">
        Hier kannst du eine Link-Sammlung erstellen, die direkt mit Langenscheidt, Pons und Klett verknüpft ist. Vergib einen Titel und fülle die entsprechenden Links aus. Für jeden Link kannst du festlegen, ob er in einem neuen Tab geöffnet wird.
      </p>
  
      <!-- Tabelle der vorhandenen Mappings -->
      <div class="mt-8 flow-root" v-if="mappings.length">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Titel der Link-Sammlung
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Links
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="mapping in mappings" :key="mapping.id">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {{ mapping.data.collectionTitle }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div v-for="link in mapping.data.links" :key="link.provider" class="mb-1">
                        <span class="capitalize">{{ link.provider }}:</span>
                        <a :href="link.url" :target="link.newTab ? '_blank' : '_self'" class="text-indigo-600 hover:text-indigo-900">
                          {{ link.url }}
                        </a>
                      </div>
                    </td>
                    <td class="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
                      <div class="flex gap-2">
                        <button
                        class="text-indigo-600 hover:text-indigo-900 border rounded border-indigo-600 p-1 flex items-center gap-1 text-sm"
                        @click="editMapping(mapping.id)"
                      >
                        <PencilSquareIcon class="w-3.5 h-3.5" />
                        Bearbeiten
                      </button>
                      <button
                        class="text-red-600 hover:text-red-800 border rounded border-red-600 p-1 flex items-center gap-1 text-sm"
                        @click="deleteMapping(mapping.id)"
                      >
                        <TrashIcon class="w-3.5 h-3.5" />
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
  
      <!-- Formular zum Erstellen/Bearbeiten eines Mappings -->
      <div class="bg-white shadow sm:rounded-lg p-4">
        <h2 class="text-base font-semibold text-gray-900 mb-4">
          {{ editId ? "Mapping bearbeiten" : "Neues Mapping erstellen" }}
        </h2>
        <form @submit.prevent="saveMapping" class="space-y-4">
          <!-- Titel der Link-Sammlung -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Titel der Link-Sammlung
            </label>
            <input
              v-model="formData.collectionTitle"
              placeholder="Titel eingeben"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
  
          <!-- Feste Link-Mapping: Langenscheidt, Pons, Klett -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Links zu den Marken
            </label>
            <div class="mt-2 space-y-4">
              <div v-for="(link, index) in formData.links" :key="link.provider" class="flex flex-col gap-2 border p-2 rounded">
                <label class="text-sm font-medium text-gray-700 capitalize">
                  {{ link.provider }}
                </label>
                <input
                  v-model="link.url"
                  placeholder="Link einfügen (z.B. https://...)"
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="link.newTab"
                    :id="`newTab-${link.provider}`"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label :for="`newTab-${link.provider}`" class="text-sm text-gray-700">
                    In neuem Tab öffnen
                  </label>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Aktionen -->
          <div class="flex gap-4 mt-4">
            <button type="submit" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
              {{ editId ? "Speichern" : "Erstellen" }}
            </button>
            <button v-if="editId" type="button" class="text-sm text-gray-600 hover:text-gray-800" @click="cancelEdit">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  definePageMeta({ layout: "admin" });
  
  import { ref, onMounted } from "vue";
  import { useFirestore } from "#imports";
  import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
  
  // Firebase initialisieren
  const db = useFirestore();
  
  // Datentypen definieren
  interface LinkData {
    provider: "langenscheidt" | "pons" | "klett";
    url: string;
    newTab: boolean;
  }
  
  interface BrandMappingData {
    collectionTitle: string;
    links: LinkData[];
  }
  
  interface BrandMappingDoc {
    id: string;
    data: BrandMappingData;
  }
  
  // Brand Mappings aus Firestore
  const mappings = ref<BrandMappingDoc[]>([]);
  
  // ID des aktuell bearbeiteten Mappings
  const editId = ref<string | null>(null);
  
  // Formular-Daten
  const formData = ref<BrandMappingData>({
    collectionTitle: "",
    links: [
      { provider: "langenscheidt", url: "", newTab: false },
      { provider: "pons", url: "", newTab: false },
      { provider: "klett", url: "", newTab: false },
    ],
  });
  
  // Laden der Brand Mappings
  onMounted(async () => {
    await loadMappings();
  });
  
  async function loadMappings() {
    mappings.value = [];
    const querySnapshot = await getDocs(collection(db, "brandMappings"));
    querySnapshot.forEach((docSnap) => {
      mappings.value.push({
        id: docSnap.id,
        data: docSnap.data() as BrandMappingData,
      });
    });
  }
  
  async function saveMapping() {
    const payload = { ...formData.value };
    if (editId.value) {
      const docRef = doc(db, "brandMappings", editId.value);
      await updateDoc(docRef, payload);
    } else {
      await addDoc(collection(db, "brandMappings"), payload);
    }
    cancelEdit();
    await loadMappings();
  }
  
  async function editMapping(id: string) {
    const docRef = doc(db, "brandMappings", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      editId.value = id;
      formData.value = snap.data() as BrandMappingData;
      // Ensure links array exists
      if (!formData.value.links) {
        formData.value.links = [
          { provider: "langenscheidt", url: "", newTab: false },
          { provider: "pons", url: "", newTab: false },
          { provider: "klett", url: "", newTab: false },
        ];
      }
    }
  }
  
  async function deleteMapping(id: string) {
    if (!confirm("Wirklich dieses Mapping löschen?")) return;
    const docRef = doc(db, "brandMappings", id);
    await deleteDoc(docRef);
    await loadMappings();
  }
  
  function cancelEdit() {
    editId.value = null;
    formData.value = {
      collectionTitle: "",
      links: [
        { provider: "langenscheidt", url: "", newTab: false },
        { provider: "pons", url: "", newTab: false },
        { provider: "klett", url: "", newTab: false },
      ],
    };
  }
  </script>
  
  <style scoped>
  /* Zusätzliche Styles können hier ergänzt werden */
  </style>