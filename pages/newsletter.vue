<template>
  <!-- Spinner while appSettings are loading or images are not ready -->
  <div v-if="!appSettingsLoaded || !imagesLoaded" class="flex items-center justify-center min-h-screen">
    <Spinner></Spinner>
  </div>

  <!-- Main newsletter container -->
  <div v-else class="p-4 flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold text-center mb-6">
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
        <template #cardContent="{ item }">
          <div class="h-96 w-64 relative flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105">
            <div v-if="item.logoUrl">
              <img
                :src="item.logoUrl"
                class="absolute inset-0 w-full h-full object-cover rounded-lg"
                :alt="item.name"
              />
              <div class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 p-2 rounded-md text-center text-black font-semibold">
                {{ item.name }}
              </div>
            </div>
            <p v-else class="font-medium text-center px-2 absolute inset-0 flex items-center justify-center bg-gray-200">
              {{ item.name }}
            </p>
          </div>
        </template>
      </GridCards>
    </TransitionGroup>

    <!-- Once a topic is selected, show the signup form with animation -->
    <Transition name="slide">
      <div v-if="selectedTopic" class="flex flex-col lg:flex-row items-center justify-center w-full max-w-4xl">
        <!-- Signup Form on the Left -->
        <div class="w-full lg:w-1/2 p-4">
          <h2 class="text-xl font-semibold mb-4 text-center lg:text-left">
            Kurz ein paar Fragen zu Dir:
          </h2>
          <form @submit.prevent="submitNewsletter" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input v-model="name" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Vorname</label>
              <input v-model="firstName" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">E-Mail-Adresse</label>
              <input v-model="email" type="email" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>

            <div class="flex items-start">
              <input type="checkbox" id="consent" v-model="consent" required class="mr-2" />
              <label for="consent" class="text-sm text-gray-700">
                Ich akzeptiere, dass meine Daten für den Newsletterversand verarbeitet werden.
              </label>
            </div>

            <p class="text-xs text-gray-600">
              Ihre Daten werden ausschließlich zur Versendung des Newsletters verwendet. Sie können sich jederzeit abmelden.
            </p>

            <div class="text-center lg:text-left">
              <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                Anmelden
              </button>
            </div>
          </form>
        </div>

        <!-- Selected Image on the Right -->
        <div class="w-full lg:w-1/2 p-4 flex items-center justify-center">
          <img :src="selectedTopicLogo" class="h-96 w-64 rounded-lg object-cover transition-transform duration-700 transform translate-x-10 opacity-100" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useFirestore } from "#imports";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import GridCards from "~/components/GridCards.vue";
import Spinner from "~/components/Spinner.vue";

const db = useFirestore();
const appSettings = ref<any>(null);
const appSettingsLoaded = ref(false);
const imagesLoaded = ref(false);
const selectedTopic = ref<string | null>(null);
const selectedTopicLogo = ref<string>("");
const name = ref("");
const firstName = ref("");
const email = ref("");
const consent = ref(false);

onMounted(async () => {
  await loadAppSettings();
  preloadImages();
});

// Load app settings from Firestore
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

// Preload images before displaying UI
async function preloadImages() {
  imagesLoaded.value = false;
  const images = newsletterOptions.value.map((item) => item.logoUrl).filter((url) => url);

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
    { name: "Newsletter-Sprache", logoUrl: appSettings.value.newsletterLanguageUrl || "" },
    { name: "Newsletter-Schule", logoUrl: appSettings.value.newsletterSchoolUrl || "" },
    { name: "Keins der beiden Themen", logoUrl: appSettings.value.newsletterNoneUrl || "" },
  ];
});

function selectTopic(item: any) {
  selectedTopic.value = item.name;
  selectedTopicLogo.value = item.logoUrl;
}

async function submitNewsletter() {
  if (!consent.value) return;
  try {
    await addDoc(collection(db, "newsletter_subscriptions"), {
      topic: selectedTopic.value,
      name: name.value,
      firstName: firstName.value,
      email: email.value,
      timestamp: Date.now(),
    });
    alert("Danke für deine Anmeldung!");
    selectedTopic.value = null;
    selectedTopicLogo.value = "";
    name.value = "";
    firstName.value = "";
    email.value = "";
    consent.value = false;
  } catch (error) {
    console.error("Error submitting newsletter signup:", error);
  }
}
</script>

<style scoped>
/* Fade-in effect */
.fade-enter-active {
  transition: opacity 0.8s ease-in-out;
}
.fade-enter-from {
  opacity: 0;
}
.fade-enter-to {
  opacity: 1;
}
</style>