<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900">Admin - Cover Selections</h1>
    <p class="mt-2 text-sm text-gray-700">
      Hier kannst du Buchcover-Auswahlen erstellen, bearbeiten oder löschen.
    </p>

    <!-- Tabelle -->
    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <!-- Spalte 1: Titel -->
                  <th scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Titel
                  </th>
                  <!-- Spalte 2: Cover A -->
                  <th scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Cover A
                  </th>
                  <!-- Spalte 3: Cover B -->
                  <th scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Cover B
                  </th>
                  <!-- Spalte 4: Cover A Count -->
                  <th scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Cover A Selected
                  </th>
                  <!-- Spalte 5: Cover B Count -->
                  <th scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Cover B Selected
                  </th>
                  <!-- Spalte 6: Aktionen -->
                  <th scope="col"
                      class="relative py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr
                  v-for="coverDoc in coverDocs"
                  :key="coverDoc.id"
                >
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 font-medium sm:pl-6">
                    {{ coverDoc.data.title }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div v-if="coverDoc.data.coverA" class="w-20 h-20 overflow-hidden">
                      <img
                        :src="coverDoc.data.coverA"
                        alt="Cover A"
                        class="w-full h-full object-cover border rounded"
                      />
                    </div>
                    <div v-else class="text-gray-400">–</div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <div v-if="coverDoc.data.coverB" class="w-20 h-20 overflow-hidden">
                      <img
                        :src="coverDoc.data.coverB"
                        alt="Cover B"
                        class="w-full h-full object-cover border rounded"
                      />
                    </div>
                    <div v-else class="text-gray-400">–</div>
                  </td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
                    {{ coverDoc.data.counterCoverA }}
                  </td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
                    {{ coverDoc.data.counterCoverB }}
                  </td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
                    <div class="flex gap-2">
                      <button
                        class="text-indigo-600 hover:text-indigo-900 border rounded border-indigo-600 p-1 flex items-center gap-1 text-sm"
                        @click="editCoverDoc(coverDoc.id)"
                      >
                        <PencilSquareIcon class="w-3.5 h-3.5" />
                        Bearbeiten
                      </button>
                      <button
                        class="text-yellow-600 hover:text-yellow-800 border rounded border-yellow-600 p-1 flex items-center gap-1 text-sm"
                        @click="resetCounter(coverDoc)"
                      >
                        <ArrowUturnDownIcon class="w-3.5 h-3.5" />
                        Zählen zurücksetzen
                      </button>
                      <button
                        class="text-red-600 hover:text-red-800 border rounded border-red-600 p-1 flex items-center gap-1 text-sm"
                        @click="deleteCoverDoc(coverDoc.id)"
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

    <!-- Formular -->
    <div class="bg-white shadow sm:rounded-lg p-4">
      <h2 class="text-base font-semibold text-gray-900 mb-4">
        {{ editId ? "Cover-Auswahl bearbeiten" : "Neue Cover-Auswahl erstellen" }}
      </h2>
      <form @submit.prevent="saveCoverDoc" class="space-y-4">
        <!-- Titel -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Titel</label>
          <input
            v-model="formData.title"
            placeholder="z.B. 'Buchcover Test #1'"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                   focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <!-- Cover A & B nebeneinander -->
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Cover A -->
          <div>
            <p class="font-medium text-gray-700 mb-1">Cover A:</p>
            <div v-if="formData.coverA" class="my-2 w-32 h-32 overflow-hidden">
              <img
                :src="formData.coverA"
                alt="Cover A"
                class="w-full h-full object-cover border rounded"
              />
            </div>
            <input
              type="file"
              @change="uploadFile($event, 'A')"
              class="block w-full text-sm text-gray-500
                     file:mr-4 file:rounded-md file:border-0
                     file:bg-indigo-600 file:py-2 file:px-4 file:text-sm
                     file:font-semibold file:text-white hover:file:bg-indigo-500"
            />
          </div>

          <!-- Cover B -->
          <div>
            <p class="font-medium text-gray-700 mb-1">Cover B:</p>
            <div v-if="formData.coverB" class="my-2 w-32 h-32 overflow-hidden">
              <img
                :src="formData.coverB"
                alt="Cover B"
                class="w-full h-full object-cover border rounded"
              />
            </div>
            <input
              type="file"
              @change="uploadFile($event, 'B')"
              class="block w-full text-sm text-gray-500
                     file:mr-4 file:rounded-md file:border-0
                     file:bg-indigo-600 file:py-2 file:px-4 file:text-sm
                     file:font-semibold file:text-white hover:file:bg-indigo-500"
            />
          </div>
        </div>

        <div class="flex gap-4 mt-4">
          <button
            type="submit"
            class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold
                   text-white shadow-sm hover:bg-indigo-500
                   focus-visible:outline focus-visible:outline-2
                   focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
import { ref, onMounted } from 'vue'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { useFirebaseApp } from '#imports'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ArrowUturnDownIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'admin'
})

// Aus nuxt-vuefire
const db = useFirestore()
const firebaseApp = useFirebaseApp()
const storage = getStorage(firebaseApp)

// State
const coverDocs = ref<Array<{ id: string; data: any }>>([])
const editId = ref<string|null>(null)
const formData = ref({
  title: '',
  coverA: '',
  coverB: ''
})

// OnMounted -> laden
onMounted(async () => {
  await loadCovers()
})

async function loadCovers() {
  coverDocs.value = []
  const snap = await getDocs(collection(db, 'coverSelections'))
  snap.forEach((docSnap) => {
    coverDocs.value.push({
      id: docSnap.id,
      data: docSnap.data()
    })
  })
}

// Bearbeiten
async function editCoverDoc(id: string) {
  const docRef = doc(db, 'coverSelections', id)
  const snap = await getDoc(docRef)
  if (!snap.exists()) return
  editId.value = id
  formData.value = snap.data() as any
}

// Speichern
async function saveCoverDoc() {
  if (!formData.value.title) return

  if (editId.value) {
    const docRef = doc(db, 'coverSelections', editId.value)
    await updateDoc(docRef, { ...formData.value })
  } else {
    await addDoc(collection(db, 'coverSelections'), { ...formData.value })
  }
  cancelEdit()
  await loadCovers()
}

// Löschen
async function deleteCoverDoc(id: string) {
  if (!confirm('Wirklich löschen?')) return
  const docRef = doc(db, 'coverSelections', id)
  await deleteDoc(docRef)
  await loadCovers()
}

// Reset
async function resetCounter(coverDoc: any) {
  if (!confirm('Wirklich reset?')) return
  const docRef = doc(db, 'coverSelections', coverDoc.id)
  await updateDoc(docRef, { ...coverDoc.data, counterCoverA: 0, counterCoverB: 0 })
  await loadCovers()
}

// Abbrechen
function cancelEdit() {
  editId.value = null
  formData.value = {
    title: '',
    coverA: '',
    coverB: ''
  }
}

// Upload
async function uploadFile(event: any, coverType: 'A' | 'B') {
  const file = event.target.files[0]
  if (!file) return

  const filePath = `cover-selections/${Date.now()}_cover${coverType}_${file.name}`
  const storageReference = storageRef(storage, filePath)

  try {
    await uploadBytes(storageReference, file)
    const downloadURL = await getDownloadURL(storageReference)
    if (coverType === 'A') {
      formData.value.coverA = downloadURL
    } else {
      formData.value.coverB = downloadURL
    }
  } catch (err) {
    console.error('Fehler beim Hochladen:', err)
  }
}
</script>

<style scoped>
/* Beispiele, falls du den .preview-covers-Style noch brauchst:
.preview-covers {
  display: flex;
  gap: 1rem;
  margin: 0.5rem 0;
}
.preview-covers img {
  max-width: 50px;
}
*/
</style>