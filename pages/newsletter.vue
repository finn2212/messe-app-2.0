<template>
  <!-- Spinner while appSettings are loading or images are not ready -->
  <div
    v-if="!appSettingsLoaded || !imagesLoaded"
    class="flex items-center justify-center min-h-screen"
  >
    <Spinner></Spinner>
  </div>

  <!-- Main newsletter container -->
  <div v-else class="p-4 flex flex-col items-center justify-center">
    <h1 v-if="!selectedTopic" class="text-2xl font-bold text-center mb-6">
      Kurz ein paar Fragen zu Dir: Welches Thema spricht Dich an?
    </h1>

    <!-- If user hasn't selected a topic yet, show the topic grid -->
    <TransitionGroup v-if="!selectedTopic" tag="div" class="w-full" name="fade">
      <GridCards
        :items="newsletterOptions"
        :onCardClick="selectTopic"
        :gridColumns="3"
        :imageWidth="256"
        :imageHeight="384"
      >
        <template #cardContent="{ item, index }">
          <div
            class="h-96 w-64 relative flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105"
            @click="selectTopic(item, index)"
          >
            <div v-if="item.logoUrl">
              <img
                :src="item.logoUrl"
                class="absolute inset-0 w-full h-full object-cover rounded-lg"
                :alt="item.name"
              />
              <div
                class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 p-2 rounded-md text-center text-black font-semibold"
              >
                {{ item.name }}
              </div>
            </div>
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

    <!-- Once a topic is selected, show the signup form with animation -->
    <Transition name="slide">
      <div
        v-if="selectedTopic"
        class="flex flex-col lg:flex-row items-center justify-center w-full max-w-4xl"
      >
        <!-- Signup Form on the Left -->
        <div class="w-full lg:w-1/2 p-4">
          <div class="sib-container">
            <form
              @submit.prevent="submitForm"
              class="w-full max-w-md rounded-lg p-6"
            >
              <input type="hidden" v-model="form.LIST" />
              <input type="hidden" v-model="form.BRAND" />

              <h2 class="text-xl font-semibold text-gray-800 mb-2">
                Newsletter
              </h2>
              <p class="text-gray-600 mb-4">
                Melden Sie sich zu unserem Newsletter an, um auf dem Laufenden
                zu bleiben.
              </p>

              <label for="EMAIL" class="block text-gray-700 font-medium mb-2">
                Geben Sie Ihre E-Mail-Adresse ein
              </label>
              <input
                v-model="form.EMAIL"
                type="email"
                placeholder="E-Mail"
                required
                @focus="showKeyboard('email')"
                @click.stop
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />

              <p class="text-xs text-gray-500 mt-3">
                Sie können den Newsletter jederzeit über den Link in unserem
                Newsletter abbestellen.
              </p>

              <button
                type="submit"
                class="w-full bg-blue-600 text-white font-medium py-2 mt-4 rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                ANMELDEN
              </button>
            </form>
          </div>
        </div>

        <!-- Selected Image on the Right -->
        <div class="w-full lg:w-1/2 p-4 flex items-center justify-center">
          <img
            :src="selectedTopicLogo"
            class="h-96 w-64 rounded-lg object-cover transition-transform duration-700 transform translate-x-10 opacity-100"
          />
        </div>
      </div>
    </Transition>
  </div>
  <!-- Bildschirmtastatur -->
  <Keyboard
    v-if="keyboardVisible"
    :activeField="activeField"
    @key-press="addKey"
    @remove-key="removeKey"
    @close="keyboardVisible = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useFirestore } from "#imports";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import GridCards from "~/components/GridCards.vue";
import Spinner from "~/components/Spinner.vue";
import Keyboard from "~/components/Keyboard.vue";

const db = useFirestore();
const appSettings = ref<any>(null);
const appSettingsLoaded = ref(false);
const imagesLoaded = ref(false);
const selectedTopic = ref<string | null>(null);
const selectedTopicLogo = ref<string>("");
const email = ref("");
const isSubmitting = ref(false);
const successMessage = ref(false);
const errorMessage = ref(false);
const form = ref({
  EMAIL: "",
  LIST: "B2C",
  BRAND: "PONS",
  SPRACHINTERESSIERTE: false,
  LERNINTERESSIERTE: false,
  LEHRER: false,
});
const keyboardVisible = ref(false);
const activeField = ref<string | null>(null);

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
  imagesLoaded.value = false;
  const images = newsletterOptions.value
    .map((item) => item.logoUrl)
    .filter((url) => url);

  if (images.length === 0) {
    imagesLoaded.value = true;
    return;
  }

  let loadedCount = 0;
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        imagesLoaded.value = true;
      }
    };
    img.onerror = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        imagesLoaded.value = true;
      }
    };
  });
}

const newsletterOptions = computed(() => {
  if (!appSettings.value) return [];
  return [
    {
      name: "Alles rund um Sprache",
      logoUrl: appSettings.value.newsletterLanguageUrl || "",
    },
    {
      name: "Lernhilfen vom Kindergarten bis zum Abitur",
      logoUrl: appSettings.value.newsletterSchoolUrl || "",
    },
    {
      name: "Wissenswertes für Lehrkräfte",
      logoUrl: appSettings.value.newsletterNoneUrl || "",
    },
  ];
});

function selectTopic(item: any, index?: number) {
  selectedTopic.value = item.name;
  selectedTopicLogo.value = item.logoUrl;
  form.value.SPRACHINTERESSIERTE = index === 0;
  form.value.LERNINTERESSIERTE = index === 1;
  form.value.LEHRER = index === 2;
}

async function submitForm() {
  successMessage.value = false;
  errorMessage.value = false;
  isSubmitting.value = true;

  try {
    const { data, error } = await useFetch(
      "https://www.pons.de/newsletter/subscribe.php",
      {
        method: "POST",
        body: new URLSearchParams({
          EMAIL: form.value.EMAIL,
          LIST: form.value.LIST,
          BRAND: form.value.BRAND,
          SPRACHINTERESSIERTE: form.value.SPRACHINTERESSIERTE ? "1" : "",
          LERNINTERESSIERTE: form.value.LERNINTERESSIERTE ? "1" : "",
          LEHRER: form.value.LEHRER ? "1" : "",
        }),
      }
    );

    if (error.value) throw new Error();

    successMessage.value = true;
    isSubmitting.value = false;
    form.value.EMAIL = "";
  } catch (err) {
    errorMessage.value = true;
    isSubmitting.value = false;
  }
}

// Beispiel: Funktion, um die Tastatur anzuzeigen
function showKeyboard(field: string) {
  activeField.value = field;
  keyboardVisible.value = true;
}

// Beispiel-Funktionen, die auf Keyboard-Events reagieren:
function addKey(key: string) {
  if (activeField.value === "email") {
    form.value.EMAIL += key;
  }
}

function removeKey() {
  if (activeField.value === "email") {
    form.value.EMAIL = form.value.EMAIL.slice(0, -1);
  }
}

// Optional: Klick außerhalb des Keyboards, um es zu schließen
function handleDocumentClick(e: MouseEvent) {
  const keyboardEl = document.querySelector(".keyboard-container");
  if (
    keyboardVisible.value &&
    keyboardEl &&
    !keyboardEl.contains(e.target as Node)
  ) {
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
