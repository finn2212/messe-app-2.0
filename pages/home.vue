<template>
    <div class="grid-container">
      <div 
        v-for="(slot, index) in slots" 
        :key="index" 
        class="grid-item"
        @click="handleClick(slot)"
      >
        <h3>{{ slot.title }}</h3>
        <!-- Evtl. ein Symbol oder ein Vorschaubild anzeigen -->
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { doc, getDoc } from 'firebase/firestore'
  const { $db } = useNuxtApp()
  
  // "slots" könnten aus Firestore geladen werden, z.B. aus einer Collection "adminConfig"
  const slots = ref<Array<{title: string, type: string, dataId?: string}>>([])
  
  onMounted(async () => {
    const docRef = doc($db, 'config', 'homeSlots')
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      slots.value = snap.data().slots
    }
  })
  
  function handleClick(slot) {
    switch(slot.type) {
      case 'quiz':
        navigateTo(`/quiz/${slot.dataId}`)
        break
      case 'marken':
        navigateTo('/marken')
        break
      case 'buchcover':
        navigateTo(`/buchcover/${slot.dataId}`)
        break
      case 'feedback':
        navigateTo('/feedback')
        break
      case 'newsletter':
        navigateTo('/newsletter')
        break
      default:
        // fallback
        alert('Slot-Typ nicht definiert')
    }
  }
  </script>
  
  <style scoped>
  .grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 Spalten */
    gap: 1rem;
  }
  .grid-item {
    border: 1px solid #ccc;
    padding: 1rem;
    cursor: pointer;
    text-align: center;
  }
  </style>