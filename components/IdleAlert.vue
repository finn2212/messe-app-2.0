<template>
    <div class="flex items-center justify-center min-h-screen transition-all duration-700"
        :class="{ 'animate-pulse': isIdle }" @mousemove="resetIdleTimer" @keydown="resetIdleTimer"
        @touchstart="resetIdleTimer">
        <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-800">
                Welcome to the Exhibition!
            </h1>
            <p class="mt-4 text-lg text-gray-600">
                Interact with the tablet to explore.
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const isIdle = ref(false);
let idleTimer = null;

const startIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        isIdle.value = true; // Start animation after inactivity
    }, 10000); // 10 seconds
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
});

onUnmounted(() => {
    clearTimeout(idleTimer);
    window.removeEventListener("mousemove", resetIdleTimer);
    window.removeEventListener("keydown", resetIdleTimer);
    window.removeEventListener("touchstart", resetIdleTimer);
});
</script>

<style>
/* Additional animations */
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