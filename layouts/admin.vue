<!-- layouts/admin.vue -->
<template>
    <div class="admin-layout">
      <!-- Seitenleiste mit Navigation -->
      <aside class="sidebar">
        <h2>Admin Menu</h2>
        <nav>
          <ul>
            <li><NuxtLink to="/admin/slots">Slots</NuxtLink></li>
            <li><NuxtLink to="/admin/quizzes">Quizzes</NuxtLink></li>
            <li><NuxtLink to="/admin/brand-attributes">Brand Attributes</NuxtLink></li>
            <li><NuxtLink to="/admin/cover-selections">Cover Selections</NuxtLink></li>
          </ul>
        </nav>
      </aside>
  
      <!-- Haupt-Inhalt wird hier (im Slot) gerendert -->
      <main class="content">
        <slot />
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  // Hier normalerweise kein spezieller Script-Code nötig,
  // da wir nur ein Layout-Template bereitstellen.
  </script>
  
  <style scoped>
  .admin-layout {
    display: flex;
    min-height: 100vh;
  }
  
  .sidebar {
    width: 250px;
    background-color: #f5f5f5;
    padding: 1rem;
  }
  
  .sidebar ul {
    list-style: none;
    padding: 0;
  }
  
  .sidebar li {
    margin-bottom: 0.5rem;
  }
  
  .content {
    flex: 1;
    padding: 1rem;
  }
  </style>