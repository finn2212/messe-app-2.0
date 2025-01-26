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
import { navigateTo } from '#app' // Nuxt-Composable
// oder: import { useRouter } from '#app' und dann router.push('/...')

interface HomeSlot {
  title: string
  type: string
  dataId?: string
}

// Nuxt-Vuefire Composable
const db = useFirestore()

const slots = ref<HomeSlot[]>([])

onMounted(async () => {
  const docRef = doc(db, 'config', 'homeSlots')
  const snap = await getDoc(docRef)
  if (snap.exists()) {
    // Falls keine 'slots' vorhanden, nimm leeres Array
    slots.value = snap.data().slots || []
  }
})

function handleClick(slot: HomeSlot) {
  switch (slot.type) {
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