<template>
    <div v-if="coverData">
      <h1>{{ coverData.title }}</h1>
      <div class="covers">
        <div class="cover" @click="chooseCover('A')">
          <img :src="coverData.coverA" alt="Cover A" />
        </div>
        <div class="cover" @click="chooseCover('B')">
          <img :src="coverData.coverB" alt="Cover B" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'nuxt/app'
  import { doc, getDoc } from 'firebase/firestore'
  const { $db } = useNuxtApp()
  
  const route = useRoute()
  const id = route.params.id as string
  const coverData = ref<any>(null)
  
  onMounted(async () => {
    const docRef = doc($db, 'coverSelections', id)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      coverData.value = snap.data()
    }
  })
  
  async function chooseCover(choice: 'A' | 'B') {
    // Wahl auswerten, speichern (optional)
    // Anschließend auf das "next" Dokument wechseln, falls definiert
    if (coverData.value.next) {
      navigateTo(`/buchcover/${coverData.value.next}`)
    } else {
      // Falls kein "next", dann z.B. zum Newsletter oder Hauptscreen
      navigateTo('/newsletter')
    }
  }
  </script>
  
  <style scoped>
  .covers {
    display: flex;
    gap: 2rem;
  }
  .cover {
    cursor: pointer;
    border: 1px solid #ccc;
    padding: 1rem;
  }
  .cover img {
    max-width: 200px;
    height: auto;
  }
  </style>