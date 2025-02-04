<template>
    <div>
      <h1 class="text-base font-semibold text-gray-900">Admin - Messen</h1>
      <p class="mt-2 text-sm text-gray-700">
        Hier findest du eine Liste aller Messen. Du kannst neue Messen erstellen,
        bearbeiten oder löschen.
      </p>
  
      <!-- Tabelle der vorhandenen Messen -->
      <div class="mt-8 flow-root" v-if="messen.length">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name der Messe
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Startdatum
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Enddatum
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="messe in messen" :key="messe.id">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {{ messe.data.name }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ formatDate(messe.data.startDate) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ formatDate(messe.data.endDate) }}
                    </td>
                    <td class="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
                      <div class="flex gap-2">
                        <button class="text-indigo-600 hover:text-indigo-900" @click="editMesse(messe.id)">
                          Bearbeiten
                        </button>
                        <button class="text-red-600 hover:text-red-800" @click="deleteMesse(messe.id)">
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
  
      <!-- Formular zum Erstellen/Bearbeiten einer Messe -->
      <div class="bg-white shadow sm:rounded-lg p-4">
        <h2 class="text-base font-semibold text-gray-900 mb-4">
          {{ editId ? "Messe bearbeiten" : "Neue Messe erstellen" }}
        </h2>
  
        <form @submit.prevent="saveMesse" class="space-y-4">
          <!-- Messe Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Messe Name</label>
            <input v-model="formData.name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
  
          <!-- Startdatum -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Startdatum</label>
            <input type="date" v-model="formData.startDate" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
  
          <!-- Enddatum -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Enddatum</label>
            <input type="date" v-model="formData.endDate" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
  
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
  import { ref, onMounted } from "vue";
  import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
  import { useFirestore } from "#imports";
  
  // **Admin Layout**
  definePageMeta({ layout: "admin" });
  
  // **Firebase Firestore**
  const db = useFirestore();
  const messen = ref<Array<{ id: string; data: any }>>([]);
  const editId = ref<string | null>(null);
  
  // **Formular State**
  const formData = ref({
    name: "",
    startDate: "",
    endDate: "",
  });
  
  // **Messen aus Firestore laden**
  onMounted(async () => {
    await loadMessen();
  });
  
  async function loadMessen() {
    messen.value = [];
    const querySnap = await getDocs(collection(db, "messen"));
    querySnap.forEach((docSnap) => {
      messen.value.push({ id: docSnap.id, data: docSnap.data() });
    });
  }
  
  // **Bearbeiten**
  async function editMesse(id: string) {
    editId.value = id;
    const docRef = doc(db, "messen", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
  
    formData.value = snap.data() as any;
  }
  
  // **Neue Messe speichern**
  async function saveMesse() {
    if (!formData.value.name || !formData.value.startDate || !formData.value.endDate) return;
  
    if (editId.value) {
      const docRef = doc(db, "messen", editId.value);
      await updateDoc(docRef, { ...formData.value });
    } else {
      await addDoc(collection(db, "messen"), { ...formData.value });
    }
  
    cancelEdit();
    await loadMessen();
  }
  
  // **Löschen**
  async function deleteMesse(id: string) {
    if (!confirm("Messe wirklich löschen?")) return;
    const docRef = doc(db, "messen", id);
    await deleteDoc(docRef);
    await loadMessen();
  }
  
  // **Abbrechen**
  function cancelEdit() {
    editId.value = null;
    formData.value = { name: "", startDate: "", endDate: "" };
  }
  
  // **Datum formatieren**
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("de-DE");
  }
  </script>
  
  <style scoped></style>