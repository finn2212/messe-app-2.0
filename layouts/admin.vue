<template>
  <div class="h-full bg-white">
    <!-- Mobile-Only Off-Canvas Sidebar -->
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog class="relative z-50 lg:hidden" @close="sidebarOpen = false">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-900/80" />
        </TransitionChild>

        <div class="fixed inset-0 flex">
          <TransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
              <TransitionChild
                as="template"
                enter="ease-in-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in-out duration-300"
                leave-from="opacity-100"
                leave-to="opacity-0"
              >
                <div
                  class="absolute left-full top-0 flex w-16 justify-center pt-5"
                >
                  <button
                    type="button"
                    class="-m-2.5 p-2.5 text-white"
                    @click="sidebarOpen = false"
                  >
                    <span class="sr-only">Close sidebar</span>
                    <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>
              <!-- Mobile Sidebar Content -->
              <div
                class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4"
              >
                <div class="flex h-16 shrink-0 items-center">
                  <!-- Logo oder Text -->
                  <h2 class="text-indigo-600 font-bold">Admin Menu</h2>
                </div>
                <!-- Unsere Navigation -->
                <nav class="flex flex-1 flex-col">
                  <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" class="-mx-2 space-y-1">
                        <li v-for="item in navigation" :key="item.name">
                          <!-- Aktiver Link? -->
                          <NuxtLink
                            :to="item.href"
                            class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold hover:bg-gray-50 hover:text-indigo-600 text-gray-700"
                          >
                            <component
                              :is="item.icon"
                              class="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                              aria-hidden="true"
                            />
                            {{ item.name }}
                          </NuxtLink>
                        </li>
                      </ul>
                    </li>

                    <!-- ggf. mehr Links oder Teams hier -->
                  </ul>
                </nav>
              </div>
              <!-- Ende Mobile Sidebar Content -->
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Desktop Sidebar -->
    <div
      class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col"
    >
      <div
        class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4"
      >
        <div class="flex h-16 shrink-0 items-center">
          <!-- Logo oder Text -->
          <h2 class="text-indigo-600 font-bold">Admin Menu</h2>
        </div>
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-1">
                <li v-for="item in navigation" :key="item.name">
                  <NuxtLink
                    :to="item.href"
                    class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold hover:bg-gray-50 hover:text-indigo-600 text-gray-700"
                  >
                    <component
                      :is="item.icon"
                      class="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                      aria-hidden="true"
                    />
                    {{ item.name }}
                  </NuxtLink>
                </li>
              </ul>
            </li>
            <!-- ggf. mehr ... -->
          </ul>
        </nav>
      </div>
    </div>

    <!-- Haupt-Bereich -->
    <div class="lg:pl-64">
      <!-- Obere Leiste -->
      <div
        class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8"
      >
        <!-- Hamburger Button nur mobil sichtbar -->
        <button
          type="button"
          class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>
        <!-- Trennlinie mobil -->
        <div class="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true"></div>

        <!-- Titel od. Suchleiste -->
        <h2 class="text-lg font-semibold leading-6 text-gray-900">
          App Konfiguration
        </h2>
      </div>
      <!-- Admin Page Content -->
      <main class="py-10">
        <div class="px-4 sm:px-6 lg:px-8">
          <NuxtPage />
          <!-- Replaces <slot /> -->
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
import { NuxtLink } from "#components";

// Deine Admin-Menü-Einträge
// Hier ersetzen wir die "Dashboard", "Team", etc. aus dem Tailwind-Beispiel
// mit deinen Admin-Routen:
import {
  Cog6ToothIcon,
  FolderIcon,
  AdjustmentsHorizontalIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  MegaphoneIcon
} from "@heroicons/vue/24/outline";

// Du kannst gerne unterschiedliche Heroicons importieren, z.B. Cog6ToothIcon
// oder TrashIcon etc. - Hier nur als Beispiel
const navigation = [
  { name: "Kachel Konfiguration", href: "/admin/slots", icon: FolderIcon },
  { name: "Quizzes", href: "/admin/quizzes", icon: QuestionMarkCircleIcon },
  {
    name: "Makern Eigenschaften",
    href: "/admin/brand-attributes",
    icon: Cog6ToothIcon,
  },
  {
    name: "Bild Cover Auswahl",
    href: "/admin/cover-selections",
    icon: BookOpenIcon,
  },
  { name: "Marken Feedback", href: "/admin/feedback", icon: MegaphoneIcon },
  { name: "Jugendwort", href: "/admin/jugendwort", icon: UserGroupIcon },
  { name: "Shop", href: "/admin/shop", icon: UserGroupIcon },
  { name: "Messe Termine", href: "/admin/messen", icon: CalendarIcon },
  { name: "Analyse", href: "/admin/stats", icon: ChartBarIcon },
  {
    name: "App Einstellungen",
    href: "/admin/app-settings",
    icon: AdjustmentsHorizontalIcon,
  },
];

const sidebarOpen = ref(false);
</script>

<style scoped>
/* Du kannst hier noch extra Styles hinzufügen.
   Tailwind-Klassen regeln das meiste. */
</style>
