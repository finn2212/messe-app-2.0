<template>
  <div>
    <h1>Marken-Attribute</h1>

    <!-- Schritt 1: Marke auswählen -->
    <div v-if="!selectedBrand">
      <h2>Wähle deine Marke</h2>
      <div class="brand-grid">
        <div
          v-for="brandDoc in brandDocs"
          :key="brandDoc.id"
          class="brand-box"
          @click="chooseBrand(brandDoc)"
        >
          {{ brandDoc.data.brand }}
        </div>
      </div>
    </div>

    <!-- Schritt 2: Attribute der gewählten Marke anzeigen -->
    <div v-else>
      <h2>Attribute für {{ currentBrandName }}</h2>
      <div class="attribute-grid">
        <div
          v-for="attribute in currentAttributes"
          :key="attribute.title"
          class="attribute-box"
          :class="{ selected: selectedAttributes.includes(attribute.title) }"
          @click="toggleSelection(attribute.title)"
        >
          {{ attribute.title }}
        </div>
      </div>
      <button @click="finishSelection">Abschicken</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { navigateTo } from '#app'

// Firestore Composable aus nuxt-vuefire
const db = useFirestore()

// Datenstruktur aller Marken
// z.B. brandDocs = [ { id: 'pons', data: { brand: 'PONS', attributes: [...] } }, ... ]
const brandDocs = ref<Array<{
  id: string
  data: {
    brand: string
    attributes: Array<{ id: string; title: string }>
  }
}>>([])

// Ausgewählte Marke: hier speichern wir das *Dokumenten-ID* (z.B. 'pons') oder leer, falls noch nichts gewählt
const selectedBrand = ref<string>('')
// Ausgewählte Attribute (IDs)
const selectedAttributes = ref<string[]>([])

// 1) Beim Laden alle Marken-Dokumente holen
onMounted(async () => {
  const snap = await getDocs(collection(db, 'brandAttributes'))
  snap.forEach((docSnap) => {
    brandDocs.value.push({
      id: docSnap.id,
      data: docSnap.data() as {
        brand: string
        attributes: Array<{ id: string; title: string }>
      }
    })
  })
})

// 2) passendes Marken-Dokument aus brandDocs ermitteln
const currentBrandDoc = computed(() => {
  return brandDocs.value.find((b) => b.id === selectedBrand.value) || null
})

// 3) attributes der aktuell gewählten Marke
const currentAttributes = computed(() => {
  if (!currentBrandDoc.value) return []
  return currentBrandDoc.value.data.attributes
})

// 4) Anzeigename der aktuellen Marke
const currentBrandName = computed(() => {
  return currentBrandDoc.value?.data.brand || ''
})

// Schritt 1: Marke auswählen
function chooseBrand(brandDoc: {
  id: string
  data: { brand: string; attributes: Array<{ id: string; title: string }> }
}) {
  selectedBrand.value = brandDoc.id
  selectedAttributes.value = []
}

// Schritt 2: Attribute toggeln
function toggleSelection(attrId: string) {
  if (selectedAttributes.value.includes(attrId)) {
    // abwählen
    selectedAttributes.value = selectedAttributes.value.filter((id) => id !== attrId)
  } else {
    // hinzufügen
    selectedAttributes.value.push(attrId)
  }
}

// Abschließen
function finishSelection() {
  // z.B. Speichern, Loggen...
  console.log('Gewählte Marke:', currentBrandName.value)
  console.log('Gewählte Attribute:', selectedAttributes.value)
  
  // Weiterleitung
  navigateTo('/newsletter')
}
</script>

<style scoped>
.brand-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.brand-box {
  border: 1px solid #ccc;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
}

.attribute-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
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