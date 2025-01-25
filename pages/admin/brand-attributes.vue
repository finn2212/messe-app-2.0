<template>
    <div>
      <h1>Admin - Marken-Attribute</h1>
  
      <!-- Liste aller Brand-Docs -->
      <div v-if="brandDocs.length">
        <h2>Vorhandene Marken</h2>
        <ul>
          <li v-for="brandDoc in brandDocs" :key="brandDoc.id">
            <strong>{{ brandDoc.data.brand }}</strong>
            ({{ brandDoc.data.attributes.length }} Attribute)
            <button @click="editBrandDoc(brandDoc.id)">Bearbeiten</button>
            <button @click="deleteBrandDoc(brandDoc.id)">Löschen</button>
          </li>
        </ul>
      </div>
      <hr />
  
      <!-- Formular zum Erstellen/Bearbeiten -->
      <h2>{{ editId ? 'Marke bearbeiten' : 'Neue Marke erstellen' }}</h2>
      <form @submit.prevent="saveBrandDoc">
        <label>Markenname</label>
        <input v-model="formData.brand" required />
  
        <div class="attribute-list">
          <h3>Attribute</h3>
          <div
            v-for="(attr, index) in formData.attributes"
            :key="index"
            class="attribute-item"
          >
            <input v-model="attr.title" placeholder="Titel (z.B. innovativ)" />
            <button type="button" @click="removeAttribute(index)">Entfernen</button>
          </div>
          <button type="button" @click="addAttribute">Neues Attribut</button>
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

    
  // Layout
  definePageMeta({
    layout: 'admin'
  })
  
  // Aus nuxt-vuefire
  const db = useFirestore()
  
  // Liste aller Brand-Dokumente
  const brandDocs = ref<Array<{id:string, data:any}>>([])
  
  // Aktuelles Dokument zum Bearbeiten
  const editId = ref<string|null>(null)
  const formData = ref({
    brand: '',
    attributes: [
      { title: '' }
    ]
  })
  
  // Beim Laden
  onMounted(async () => {
    await loadBrands()
  })
  
  async function loadBrands() {
    brandDocs.value = []
    const qSnap = await getDocs(collection(db, 'brandAttributes'))
    qSnap.forEach(d => {
      brandDocs.value.push({
        id: d.id,
        data: d.data()
      })
    })
  }
  
  // Bearbeiten
  async function editBrandDoc(id: string) {
    const docRef = doc(db, 'brandAttributes', id)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      editId.value = id
      formData.value = snap.data() as any
    }
  }
  
  // Speichern
  async function saveBrandDoc() {
    if (!formData.value.brand) return
  
    if (editId.value) {
      // Update existierendes Dok
      const docRef = doc(db, 'brandAttributes', editId.value)
      await updateDoc(docRef, { ...formData.value })
    } else {
      // Neues Dokument anlegen
      await addDoc(collection(db, 'brandAttributes'), { ...formData.value })
    }
    cancelEdit()
    await loadBrands()
  }
  
  // Löschen
  async function deleteBrandDoc(id: string) {
    if (!confirm('Wirklich löschen?')) return
    await deleteDoc(doc(db, 'brandAttributes', id))
    await loadBrands()
  }
  
  // Abbrechen
  function cancelEdit() {
    editId.value = null
    formData.value = {
      brand: '',
      attributes: [
        { title: '' }
      ]
    }
  }
  
  // Attribute-Helfer
  function addAttribute() {
    formData.value.attributes.push({ title: '' })
  }
  function removeAttribute(index: number) {
    formData.value.attributes.splice(index, 1)
  }

  </script>
  
  <style scoped>
  .attribute-list {
    margin-top: 1rem;
    border: 1px solid #ccc;
    padding: 1rem;
  }
  .attribute-item {
    margin-bottom: 0.5rem;
  }
  </style>