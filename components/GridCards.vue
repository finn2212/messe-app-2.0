    <template>
    <client-only>
        <div class="flex items-center justify-center">
        <ul
            role="list"
            class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
        >
            <li
            v-for="(item, index) in items"
            :key="index"
            class="relative overflow-hidden rounded-lg bg-transparent shadow cursor-pointer transform transition-all duration-1500 ease-in-out"
            :class="[
                animateCards ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
            ]"
            :style="{ 'transition-delay': index * 300 + 'ms' }"
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
    onCardClick: (item: GridItem) => void;
    }>();

    const animateCards = ref(false);

    onMounted(() => {
    animateCards.value = false
    setTimeout(() => {
        animateCards.value = true
    }, 100) // 100ms (or more) to ensure the user sees the transition
    })

    function toggleAnimate() {
    animateCards.value = !animateCards.value;
    }

    // If items arrive after mount (e.g. via Firestore), watch them:
    watch(
    () => props.items,
    (newVal, oldVal) => {
        if (oldVal.length === 0 && newVal.length > 0) {
        // Re-trigger the transition
        animateCards.value = false;
        nextTick(() => {
            animateCards.value = true;
        });
        }
    }
    );
    </script>

    <style scoped>
    /* You can tweak these transitions more if you'd like. */
    </style>
