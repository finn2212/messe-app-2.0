<template>
  <!-- Spinner while appSettings are loading -->
  <div
    v-if="!appSettingsLoaded"
    class="flex items-center justify-center min-h-screen"
  >
    <Spinner></Spinner>
  </div>

  <!-- Main brand attribute container -->
  <div v-else class="p-4 flex flex-col items-center justify-center">
    <h1 v-if="!selectedAttribute" class="text-2xl font-bold text-center mb-6">
      Wähle eine Marke aus
    </h1>

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
            class="h-96 w-64 relative flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105"
          >
            <div v-if="item.brandImageUrl">
              <img
                :src="item.brandImageUrl"
                class="absolute inset-0 w-full h-full object-cover rounded-lg"
                :alt="item.brand"
              />
              <div
                class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 p-2 rounded-md text-center text-black font-semibold"
              >
                {{ item.brand }}
              </div>
            </div>
          </div>
        </template>
      </GridCards>
    </TransitionGroup>

    <!-- Once a brand is selected, show the attributes -->
    <Transition name="slide">
      <div
        v-if="selectedBrand"
        class="flex flex-col items-center w-full max-w-4xl"
      >
        <h2
          v-if="!selectedAttribute"
          class="text-xl font-semibold mb-4 text-center"
        >
          Wähle ein Attribut für {{ selectedBrand }}
        </h2>

        <!-- Attributes Grid -->
        <div
          v-if="!selectedAttribute"
          class="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full"
        >
          <button
            v-for="attribute in selectedBrandAttributes"
            :key="attribute"
            @click="selectAttribute(attribute)"
            class="px-4 py-2 rounded-full bg-gray-200 hover:bg-indigo-500 hover:text-white transition"
            :class="{
              'bg-indigo-600 text-white': attribute === selectedAttribute,
            }"
          >
            {{ attribute.title }}
          </button>
        </div>

        <!-- Selection Result -->
        <div v-if="selectedAttribute" class="mt-6 w-full max-w-5xl text-center">
          <!-- Selected Attribute Left Side -->
          <div
            class="text-9xl font-bold text-indigo-600 text-center sm:text-left"
          >
            {{ selectedAttribute.titel }}
          </div>

          <!-- Selection Text Right Side -->
          <div class="text-lg text-gray-800 items-center text-center sm:text-left">
            <h3 class="text-5xl font-bold text-center mb-20">Super, Deine Meinung zählt!</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-[10vw] p-4">
              <div class="blob-shape">100% {{ selectedAttribute.title }}</div>

              <div class="p-6">
                <span class="text-5xl">100% </span>
                <p class="mt-2">
                  haben sich ebenso für dieses Attribut entschieden.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-4 flex flex-col items-center"></div>

          <div
            class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full text-sm text-gray-600"
          >
            <span
              v-for="attr in remainingAttributes"
              :key="attr"
              class="px-3 py-1 bg-gray-100 rounded-full"
            >
              0% {{ attr.title }}
            </span>
          </div>
          <div class="mt-4 text-center">
            <button
              @click="navigateTo('/newsletter')"
              class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
            >
              Weiter
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useFirestore } from "#imports";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  type DocumentData,
} from "firebase/firestore";
import GridCards from "~/components/GridCards.vue";
import Spinner from "~/components/Spinner.vue";

const db = useFirestore();
const appSettingsLoaded = ref(false);
const selectedBrand = ref<string | null>(null);
const selectedBrandAttributes = ref<object[]>([]);
const selectedAttribute = ref<object | null>(null);
const brandDocs = ref<
  Array<{
    id: string;
    data: { brand: string; brandImageUrl?: string; attributes: object[] };
  }>
>([]);

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, "brandAttributes"));
    snap.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      if (data.brand && data.attributes) {
        brandDocs.value.push({
          id: docSnap.id,
          data: data as {
            brand: string;
            brandImageUrl?: string;
            attributes: object[];
          },
        });
      }
    });
  } catch (err) {
    console.error("Error loading brand attributes:", err);
  } finally {
    appSettingsLoaded.value = true;
  }
});

const brandOptions = computed(() => brandDocs.value.map((doc) => doc.data));
const remainingAttributes = computed(() =>
  selectedBrandAttributes.value.filter(
    (attr) => attr !== selectedAttribute.value
  )
);

function selectBrand(brand: any) {
  selectedBrand.value = brand.brand;
  selectedBrandAttributes.value = brand.attributes;
}

function selectAttribute(attribute: object) {
  selectedAttribute.value = attribute;
}
</script>

<style scoped>
.blob-shape {
  /* Size of the blob */
  width: 400px;
  height: 250px;

  /* Background color similar to the image */
  background-color: #ffd600;

  /* Large border-radius values to get a wavy/organic blob */
  border-radius: 40% 60% 40% 60% / 60% 40% 60% 40%;

  /* Center the text inside */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Optional text styling */
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  text-align: center;
}
</style>
