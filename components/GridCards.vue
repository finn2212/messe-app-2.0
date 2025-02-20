<template>
    <client-only>
      <div class="flex items-center justify-center">
        <ul role="list" :class="`grid grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-${gridColumns}`">
          <li
            v-for="(item, index) in items"
            :key="index"
            class="relative overflow-hidden rounded-lg ease-in-out transition-all duration-200 cursor-pointer hover:scale-105 bg-transparent shadow transform"
            :class="[
              animateCards ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-10',
            ]"
            :style="{ 'transition-delay': index * 50 + 'ms' }"
            @click="() => onCardClick(item)"
          >
            <slot name="cardContent" :item="item"></slot>
          </li>
        </ul>
      </div>
    </client-only>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, defineProps, nextTick, watch } from "vue";
  
  interface GridItem {
    [key: string]: any;
  }
  
  const props = defineProps<{
    items: GridItem[];
    onCardClick: (item: GridItem, index?: number) => void;
    gridColumns?: number;
    imageWidth?: number;
    imageHeight?: number;
  }>();
  
  const animateCards = ref(false);
  
  onMounted(() => {
    animateCards.value = false;
    setTimeout(() => {
      animateCards.value = true;
    }, 100); // Delay to trigger animation
  });
  
  // Watch for dynamically loaded items
  watch(
    () => props.items,
    (newVal, oldVal) => {
      if (oldVal.length === 0 && newVal.length > 0) {
        animateCards.value = false;
        nextTick(() => {
          animateCards.value = true;
        });
      }
    }
  );
  </script>
  
  <style scoped>
  /* Add hover transition for better responsiveness */
  li {
    transition: transform 0.2s ease-out, opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
  }
  
  li:hover {
    transform: scale(1.05);
  }
  </style>