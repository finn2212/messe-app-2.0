<template>
  <!-- Spinner while appSettings are loading -->
  <div v-if="!appSettingsLoaded" class="flex items-center justify-center min-h-screen">
    <Spinner />
  </div>

  <!-- Main feedback container -->
  <div v-else class="p-4 flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold text-center mb-6">Welche wünsche hast du an uns?</h1>

    <!-- If user hasn't selected a brand yet, show the brand grid -->
    <TransitionGroup v-if="!selectedBrand" tag="div" class="w-full" name="fade">
      <GridCards
        :items="brandOptions"
        :onCardClick="selectBrand"
        :gridColumns="3"
        :imageWidth="256"
        :imageHeight="384"
      >
        <template #cardContent="{ item }">
          <div
            class="w-full md:h-40 lg:h-52 xl:h-60 md:w-56 lg:w-64 xl:w-96 relative flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105"
            @click="selectBrand(item)"
          >
            <img
              v-if="item.logoUrl"
              :src="item.logoUrl"
              class="absolute inset-0 w-full h-full object-cover rounded-lg"
              :alt="item.name"
            />
            <p
              v-else
              class="font-medium text-center px-2 absolute inset-0 flex items-center justify-center bg-gray-200"
            >
              {{ item.name }}
            </p>
          </div>
        </template>
      </GridCards>
    </TransitionGroup>

    <!-- Once a brand is selected, show the feedback form with animation -->
    <Transition name="slide">
      <div
        v-if="selectedBrand"
        class="flex flex-col lg:flex-row items-center justify-center w-full max-w-4xl"
      >
        <!-- Feedback Form on the Left -->
        <div class="w-full lg:w-1/2 p-4">
          <h2 class="text-xl font-semibold mb-4 text-center lg:text-left">
            Was willst du uns zu {{ selectedBrand }} sagen?
          </h2>
          <form @submit.prevent="submitFeedback" class="space-y-4">
            <!-- Feedback Textarea -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Dein Feedback</label>
              <textarea
                v-model="feedbackMessage"
                rows="4"
                required
                @focus="showKeyboard('feedback')"
                @click.stop
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <img
            :src="selectedBrandLogo"
            class="h-96 w-64 rounded-lg object-cover transition-transform duration-700 transform translate-x-10 opacity-100"
          />
        </div>
      </div>
    </Transition>
  </div>

  <!-- Externe Bildschirmtastatur -->
  <Keyboard
    v-if="keyboardVisible"
    :activeField="activeField"
    @key-press="handleKeyPress"
    @remove-key="handleRemoveKey"
    @close="keyboardVisible = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { navigateTo } from "#app";
import { useFirestore } from "#imports";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import GridCards from "~/components/GridCards.vue";
import Spinner from "~/components/Spinner.vue";
import Keyboard from "~/components/Keyboard.vue";

const db = useFirestore();

// App Settings und Brand Auswahl
const appSettings = ref<any>(null);
const appSettingsLoaded = ref(false);
const selectedBrand = ref<string | null>(null);
const selectedBrandLogo = ref<string>("");

// Feedback Formular
const feedbackMessage = ref("");

// Zustand für die Tastatur
const keyboardVisible = ref(false);
const activeField = ref<string | null>(null);

// Newsletter Options (Brand Auswahl)
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

// Laden der App Settings
onMounted(async () => {
  await loadAppSettings();
  preloadImages();
});

async function loadAppSettings() {
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
}

async function preloadImages() {
  // Hier laden wir die Bilder aus newsletterOptions
  const images = brandOptions.value.map((item) => item.logoUrl).filter((url) => url);
  if (images.length === 0) return;
  let loadedCount = 0;
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = img.onerror = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        // Optionale Logik, wenn alle Bilder geladen sind
      }
    };
  });
}

// Brand Auswahl
function selectBrand(item: any) {
  selectedBrand.value = item.name;
  selectedBrandLogo.value = item.logoUrl;
}

// Feedback abschicken
async function submitFeedback() {
  try {
    await addDoc(collection(db, "feedback"), {
      brand: selectedBrand.value,
      message: feedbackMessage.value,
      timestamp: Date.now(),
    });
    alert("Vielen Dank für dein Feedback!");
    // Zurücksetzen
    selectedBrand.value = null;
    selectedBrandLogo.value = "";
    feedbackMessage.value = "";
    navigateTo("/newsletter");
  } catch (error) {
    console.error("Error submitting feedback:", error);
    alert("Es gab einen Fehler beim Absenden des Feedbacks.");
  }
}

// Tastatur-Funktionen
function showKeyboard(field: string) {
  activeField.value = field;
  keyboardVisible.value = true;
}

function handleKeyPress(key: string) {
  if (activeField.value === "feedback") {
    feedbackMessage.value += key;
  }
}

function handleRemoveKey() {
  if (activeField.value === "feedback") {
    feedbackMessage.value = feedbackMessage.value.slice(0, -1);
  }
}

// Schließt die Tastatur, wenn außerhalb geklickt wird
function handleDocumentClick(e: MouseEvent) {
  const keyboardEl = document.querySelector(".keyboard-container");
  if (keyboardVisible.value && keyboardEl && !keyboardEl.contains(e.target as Node)) {
    keyboardVisible.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});
onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
});
</script>

<style scoped>
/* Transition Styles (wie in deinem Beispiel) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

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
