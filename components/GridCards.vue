<template>
  <client-only>
    <div class="flex items-center justify-center">
      <ul role="list" class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <li v-for="(item, index) in items" :key="index"
          class="relative overflow-hidden rounded-lg ease-in-out transition-all duration-200 cursor-pointer hover:scale-105 bg-transparent shadow transform"
          :class="[
            animateCards ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-10',
            isIdle ? 'animate-pulse' : ''
          ]" :style="{ 'transition-delay': index * 50 + 'ms' }" @click="() => onCardClick(item, index)">
          <slot name="cardContent" :item="item" :index="index"></slot>
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

const triggerAnimation = () => {
  animateCards.value = false;
  nextTick(() => {
    setTimeout(() => {
      animateCards.value = true;
    }, 1000);
  });
};

const isIdle = ref(false);
let idleTimer = null as any;

const startIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        isIdle.value = true; // Start animation after inactivity
    }, 20000); // 10 seconds
};

const resetIdleTimer = () => {
    isIdle.value = false; // Stop animation
    startIdleTimer();
};

onMounted(() => {
  startIdleTimer();
  window.addEventListener("mousemove", resetIdleTimer);
  window.addEventListener("keydown", resetIdleTimer);
  window.addEventListener("touchstart", resetIdleTimer);
  triggerAnimation();
});

onUnmounted(() => {
    clearTimeout(idleTimer);
    window.removeEventListener("mousemove", resetIdleTimer);
    window.removeEventListener("keydown", resetIdleTimer);
    window.removeEventListener("touchstart", resetIdleTimer);
});

// Watch for dynamically loaded items
watch(
  () => props.items,
  () => triggerAnimation(),
  {
    deep: true
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

.animate-pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}
</style>
