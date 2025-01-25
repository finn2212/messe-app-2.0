<template>
    <div>
      <h1>Admin - Cover Selections</h1>
  
      <!-- Liste aller vorhandenen CoverSelections -->
      <div v-if="coverDocs.length">
        <h2>Vorhandene Buchcover-Auswahlen</h2>
        <ul>
          <li v-for="coverDoc in coverDocs" :key="coverDoc.id">
            <strong>{{ coverDoc.data.title }}</strong>
            <div class="preview-covers">
              <img v-if="coverDoc.data.coverA" :src="coverDoc.data.coverA" alt="Cover A" />
              <img v-if="coverDoc.data.coverB" :src="coverDoc.data.coverB" alt="Cover B" />
            </div>
            <span v-if="coverDoc.data.next">Nächste ID: {{ coverDoc.data.next }}</span>
            <button @click="editCoverDoc(coverDoc.id)">Bearbeiten</button>
            <button @click="deleteCoverDoc(coverDoc.id)">Löschen</button>
          </li>
        </ul>
      </div>
      <hr />
  
      <!-- Formular zum Erstellen/Bearbeiten -->
      <h2>{{ editId ? 'Cover-Auswahl bearbeiten' : 'Neue Cover-Auswahl erstellen' }}</h2>
      <form @submit.prevent="saveCoverDoc">
        <label>Titel</label>
        <input v-model="formData.title" placeholder="z.B. 'Buchcover Test #1'" />
  
        <div>
          <p><strong>Cover A:</strong></p>
          <div v-if="formData.coverA">
            <img :src="formData.coverA" alt="Cover A Preview" style="max-width:100px;" />
          </div>
          <input type="file" @change="uploadFile($event, 'A')" />
        </div>
  
        <div>
          <p><strong>Cover B:</strong></p>
          <div v-if="formData.coverB">
            <img :src="formData.coverB" alt="Cover B Preview" style="max-width:100px;" />
          </div>
          <input type="file" @change="uploadFile($event, 'B')" />
        </div>
  
        <div>
          <label>Nächste Auswahl-ID (optional)</label>
          <input v-model="formData.next" placeholder="z.B. 'abcdef12345'" />
        </div>
  
        <button type="submit">{{ editId ? 'Speichern' : 'Erstellen' }}</button>
        <button v-if="editId" type="button" @click="cancelEdit">Abbrechen</button>
      </form>
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
  
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
  const firebaseApp = useFirebaseApp()

  // Layout
  definePageMeta({
    layout: 'admin'
  })
  
  // Aus nuxt-vuefire
  const db = useFirestore()
// Hole das Storage-Objekt
const storage = getStorage(firebaseApp)
  
  // Liste aller CoverSelections
  const coverDocs = ref<Array<{ id:string, data:any }>>([])
  
  // Aktuelles Dokument für Formular
  const editId = ref<string|null>(null)
  const formData = ref({
    title: '',
    coverA: '',
    coverB: '',
    next: ''
  })
  
  // Beim Laden
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
  
  // Bearbeiten laden
  async function editCoverDoc(id: string) {
    const docRef = doc(db, 'coverSelections', id)
    const snap = await getDoc(docRef)
    if (!snap.exists()) return
    editId.value = id
    formData.value = snap.data() as any
  }
  
  // Speichern (neu oder update)
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
    await deleteDoc(doc(db, 'coverSelections', id))
    await loadCovers()
  }
  
  // Abbrechen
  function cancelEdit() {
    editId.value = null
    formData.value = {
      title: '',
      coverA: '',
      coverB: '',
      next: ''
    }
  }
  
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
  .preview-covers {
    display: flex;
    gap: 1rem;
    margin: 0.5rem 0;
  }
  .preview-covers img {
    max-width: 50px;
  }
  </style>