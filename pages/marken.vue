<template>
    <div>
      <h1>Marken-Attribute</h1>
      <div>
        <label>
          <input type="radio" name="brand" value="Pons" v-model="selectedBrand" />
          Pons
        </label>
        <label>
          <input type="radio" name="brand" value="Langenscheidt" v-model="selectedBrand" />
          Langenscheidt
        </label>
        <label>
          <input type="radio" name="brand" value="Klett" v-model="selectedBrand" />
          Klett
        </label>
      </div>
  
      <div v-if="attributes && attributes.length">
        <h2>Attribute für {{ selectedBrand }}</h2>
        <div class="attribute-grid">
          <div 
            v-for="attribute in attributes" 
            :key="attribute.id" 
            class="attribute-box"
            @click="toggleSelection(attribute.id)"
            :class="{ selected: selectedAttributes.includes(attribute.id) }"
          >
            {{ attribute.title }}
          </div>
        </div>
      </div>
      <button @click="finishSelection">Abschicken</button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { doc, getDoc } from 'firebase/firestore'
  const { $db } = useNuxtApp()
  
  const selectedBrand = ref('Pons')
  const attributes = ref<Array<{id: string, title: string}>>([])
  const selectedAttributes = ref<string[]>([])
  
  watch(selectedBrand, async (newBrand) => {
    if (!newBrand) return
    // z.B. brandAttributes/pons, brandAttributes/langenscheidt, brandAttributes/klett
    const docRef = doc($db, 'brandAttributes', newBrand.toLowerCase())
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      attributes.value = snap.data().attributes
    }
    selectedAttributes.value = []
  }, { immediate: true })
  
  function toggleSelection(id: string) {
    if (selectedAttributes.value.includes(id)) {
      selectedAttributes.value = selectedAttributes.value.filter(attrId => attrId !== id)
    } else {
      selectedAttributes.value.push(id)
    }
  }
  
  function finishSelection() {
    // Daten speichern oder auswerten...
    // Dann zum Newsletter oder Hauptscreen navigieren
    navigateTo('/newsletter')
  }
  </script>
  
  <style scoped>
  .attribute-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  .attribute-box {
    border: 1px solid #ccc;
    padding: 1rem;
    cursor: pointer;
  }
  .attribute-box.selected {
    background-color: #cfc;
  }
  </style>