<template>
  <div>
    <h1 class="text-base font-semibold text-gray-900">Admin - App Settings</h1>
    <p class="mt-2 text-sm text-gray-700">
      Hier kannst du das Hintergrundbild, wichtige Logos und Newsletter-Bilder verwalten.
    </p>

    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
            <!-- Single table for both preview & upload -->
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Einstellung
                  </th>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                  >
                    Vorschau
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <!-- Loop through fields -->
                <tr
                  v-for="(field, idx) in fields"
                  :key="idx"
                >
                  <!-- Label column -->
                  <td
                    class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                  >
                    {{ field.label }}
                  </td>

                  <!-- Preview + Upload column -->
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <!-- Image Preview -->
                    <div
                      v-if="appSettings[field.key]"
                      class="mb-2 w-32 h-20 relative border rounded overflow-hidden"
                    >
                      <img
                        :src="appSettings[field.key]"
                        :alt="field.label"
                        class="absolute inset-0 w-full h-full object-contain bg-white"
                      />
                    </div>
                    <div v-else class="text-gray-400 mb-2">No Image</div>

                    <!-- Upload button -->
                    <input
                      type="file"
                      class="block w-full text-sm text-gray-500
                             file:mr-4 file:rounded-md file:border-0
                             file:bg-indigo-600 file:py-2 file:px-4 file:text-sm
                             file:font-semibold file:text-white hover:file:bg-indigo-500"
                      @change="uploadImage(field.key, $event)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Save settings button at the bottom -->
    <div class="mt-4">
      <button
        type="button"
        class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm
               hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2
               focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="saveAppSettings"
      >
        Einstellungen speichern
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout
definePageMeta({
  layout: "admin",
})

import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useFirebaseApp, useFirestore } from '#imports'

const db = useFirestore()
const firebaseApp = useFirebaseApp()
const storage = getStorage(firebaseApp)

// Firestore doc reference
const settingsDocId = "appSettings" // adjust as needed

// We define the shape of our settings with 8 image fields:
interface AppSettings {
  backgroundImageUrl: string
  ponsLogoUrl: string
  langenscheidtLogoUrl: string
  klettLogoUrl: string
  footerLogoUrl: string
  newsletterLanguageUrl: string
  newsletterSchoolUrl: string
  newsletterNoneUrl: string
}

// Default state
const appSettings = ref<AppSettings>({
  backgroundImageUrl: "",
  ponsLogoUrl: "",
  langenscheidtLogoUrl: "",
  klettLogoUrl: "",
  footerLogoUrl: "",
  newsletterLanguageUrl: "",
  newsletterSchoolUrl: "",
  newsletterNoneUrl: ""
})

// We'll just define an array to drive our v-for for the table rows
const fields = [
  { key: "backgroundImageUrl", label: "Hintergrundbild (Home)" },
  { key: "ponsLogoUrl", label: "Pons Logo" },
  { key: "langenscheidtLogoUrl", label: "Langenscheidt Logo" },
  { key: "klettLogoUrl", label: "Klett Logo" },
  { key: "footerLogoUrl", label: "Footer Logo" },
  { key: "newsletterLanguageUrl", label: "Newsletter-Sprache (Bild)" },
  { key: "newsletterSchoolUrl", label: "Newsletter-Schule (Bild)" },
  { key: "newsletterNoneUrl", label: "Newsletter-Keins (Bild)" }
]

// Load existing settings from Firestore on mount
onMounted(async () => {
  const docRef = doc(db, "config", settingsDocId)
  const snap = await getDoc(docRef)
  if (snap.exists()) {
    const data = snap.data() as Partial<AppSettings>
    Object.assign(appSettings.value, data)
  }
})

// Save updates
async function saveAppSettings() {
  const docRef = doc(db, "config", settingsDocId)
  await setDoc(docRef, { ...appSettings.value }, { merge: true })
  alert("Einstellungen wurden gespeichert!")
}

// Upload an image for a field
async function uploadImage(fieldKey: keyof AppSettings, event: any) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const filePath = `app-settings/${Date.now()}_${fieldKey}_${file.name}`
    const sRef = storageRef(storage, filePath)
    await uploadBytes(sRef, file)
    const downloadURL = await getDownloadURL(sRef)
    appSettings.value[fieldKey] = downloadURL
  } catch (err) {
    console.error("Fehler beim Image-Upload:", err)
  }
}
</script>

<style scoped>
/* Additional styles or spacing as needed */
</style>