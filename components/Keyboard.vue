<template>
  <div
    class="keyboard-container fixed bottom-0 left-0 w-full bg-gray-200 p-4 shadow-lg"
    @click.stop
  >
    <div class="grid grid-cols-10 gap-2 text-center">
      <button
        v-for="key in keys"
        :key="key"
        class="p-2 bg-white border rounded"
        @click="handleKey(key)"
      >
        {{ key }}
      </button>
      <!-- Email-Shortcuts nur anzeigen, wenn activeField === 'email' -->
      <button
        v-if="activeField === 'email'"
        v-for="shortcut in emailShortcuts"
        :key="shortcut"
        class="p-2 bg-blue-500 text-white border rounded"
        @click="handleKey(shortcut)"
      >
        {{ shortcut }}
      </button>
      <button
        class="p-2 col-span-2 bg-red-500 text-white border rounded"
        @click="handleRemove"
      >
        ⌫
      </button>
      <button
        class="p-2 col-span-2 bg-green-500 text-white border rounded"
        @click="closeKeyboard"
      >
        ✔
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  activeField: {
    type: String as PropType<string | null>,
    default: null,
  },
});

const emits = defineEmits(["key-press", "remove-key", "close"]);

const keys = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Z",
  "U",
  "I",
  "O",
  "P",
  "Ü",
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "Ö",
  "Ä",
  "Y",
  "X",
  "C",
  "V",
  "B",
  "N",
  "M",
  " ",
];

const emailShortcuts = [
  "@",
  ".com",
  ".de",
  "@gmail.com",
  "@yahoo.com",
  "@outlook.com",
];

function handleKey(key: string) {
  emits("key-press", key);
}

function handleRemove() {
  emits("remove-key");
}

function closeKeyboard() {
  emits("close");
}
</script>

<style scoped>
.keyboard-container {
  z-index: 1000;
}
</style>
