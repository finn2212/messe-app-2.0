<template>
    <!-- Spinner while appSettings are loading -->
    <div v-if="!appSettingsLoaded" class="flex items-center justify-center min-h-screen">
      <p>Lade Einstellungen...</p>
    </div>
  
    <!-- Main feedback container -->
    <div v-else class="p-4 min-h-screen flex flex-col items-center justify-center">
      <h1 class="text-2xl font-bold text-center mb-6">Feedback</h1>
  
      <!-- If user hasn't selected a brand yet, show the brand grid -->
      <TransitionGroup v-if="!selectedBrand" tag="div" class="flex flex-wrap justify-center gap-4" name="fade">
        <div v-for="item in brandOptions" :key="item.name" @click="selectBrand(item)">
          <div class="h-96 w-64 relative flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-105">
            <img
              v-if="item.logoUrl"
              :src="item.logoUrl"
              class="absolute inset-0 w-full h-full object-cover"
              :alt="item.name"
            />
            <p v-else class="font-medium text-center px-2 absolute inset-0 flex items-center justify-center bg-gray-200">
              {{ item.name }}
            </p>
          </div>
        </div>
      </TransitionGroup>
  
      <!-- Once a brand is selected, show the feedback form with animation -->
      <Transition name="slide">
        <div v-if="selectedBrand" class="flex flex-col lg:flex-row items-center justify-center w-full max-w-4xl">
          <!-- Feedback Form on the Left -->
          <div class="w-full lg:w-1/2 p-4">
            <h2 class="text-xl font-semibold mb-4 text-center lg:text-left">
              Was willst du uns zu {{ selectedBrand }} sagen?
            </h2>
            <form @submit.prevent="submitFeedback" class="space-y-4">
              <!-- Feedback Text -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Dein Feedback</label>
                <textarea
                  v-model="feedbackMessage"
                  rows="4"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                ></textarea>
              </div>
  
              <!-- Submit button -->
              <div class="text-center lg:text-left">
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Abschicken
                </button>
              </div>
            </form>
          </div>
  
          <!-- Selected Image on the Right -->
          <div class="w-full lg:w-1/2 p-4 flex items-center justify-center">
            <img :src="selectedBrandLogo" class="h-96 w-64 object-cover transition-transform duration-700 transform translate-x-10 opacity-100" />
          </div>
        </div>
      </Transition>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from "vue";
  import { useFirestore } from "#imports";
  import { doc, getDoc, collection, addDoc } from "firebase/firestore";
  
  // Access Firestore
  const db = useFirestore();
  
  // Reactive states
  const appSettings = ref<any>(null);
  const appSettingsLoaded = ref(false);
  
  // Brand selection
  const selectedBrand = ref<string | null>(null);
  const selectedBrandLogo = ref<string>("");
  
  // Feedback form fields
  const feedbackMessage = ref("");
  
  // 1. Load brand logos (PONS, Langenscheidt, Klett) from Firestore
  onMounted(async () => {
    try {
      const docRef = doc(db, "config", "appSettings");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        appSettings.value = snap.data();
      }
    } catch (err) {
      console.error("Error loading appSettings:", err);
    } finally {
      appSettingsLoaded.value = true;
    }
  });
  
  // 2. Prepare items for our brand grid
  const brandOptions = computed(() => {
    if (!appSettings.value) return [];
    return [
      {
        name: "Langenscheidt",
        logoUrl: appSettings.value.langenscheidtLogoUrl || "",
      },
      {
        name: "PONS",
        logoUrl: appSettings.value.ponsLogoUrl || "",
      },
      {
        name: "Klett",
        logoUrl: appSettings.value.klettLogoUrl || "",
      },
    ];
  });
  
  // 3. Handle brand selection
  function selectBrand(item: any) {
    selectedBrand.value = item.name;
    selectedBrandLogo.value = item.logoUrl;
  }
  
  // 4. Submit feedback to Firestore
  async function submitFeedback() {
    try {
      await addDoc(collection(db, "feedback"), {
        brand: selectedBrand.value,
        message: feedbackMessage.value,
        timestamp: Date.now(),
      });
  
      alert("Vielen Dank für dein Feedback!");
  
      // Reset everything
      selectedBrand.value = null;
      selectedBrandLogo.value = "";
      feedbackMessage.value = "";
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Es gab einen Fehler beim Absenden des Feedbacks.");
    }
  }
  </script>
  
  <style scoped>
  /* Fade Transition for Brand Grid */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  
  /* Slide Transition for Form */
  .slide-enter-active {
    transition: transform 0.5s ease, opacity 0.5s ease;
  }
  .slide-enter-from {
    transform: translateX(50px);
    opacity: 0;
  }
  .slide-leave-to {
    transform: translateX(-50px);
    opacity: 0;
  }
  </style>