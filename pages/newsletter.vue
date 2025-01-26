<template>
    <div>
      <h1>Newsletter-Anmeldung</h1>
  
      <!-- Schritt 1: Topic-Auswahl -->
      <div v-if="!selectedTopic">
        <h2>Für welches Thema interessierst du dich?</h2>
        <div class="topic-grid">
          <div
            class="topic-box"
            @click="chooseTopic('Topic A')"
          >
            Topic A
          </div>
          <div
            class="topic-box"
            @click="chooseTopic('Topic B')"
          >
            Topic B
          </div>
        </div>
      </div>
  
      <!-- Schritt 2: Newsletter-Formular -->
      <div v-else>
        <p>Ausgewähltes Thema: <strong>{{ selectedTopic }}</strong></p>
        <h2>Melde dich jetzt an!</h2>
        <form @submit.prevent="submitNewsletter">
          <div>
            <label>Name:</label>
            <input v-model="userName" required />
          </div>
          <div>
            <label>Email:</label>
            <input v-model="userEmail" type="email" required />
          </div>
          <button type="submit">Anmelden</button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { navigateTo } from '#app'
  
  // State
  const selectedTopic = ref<string>('') // "" = kein Thema gewählt
  const userName = ref('')
  const userEmail = ref('')
  
  // Schritt 1: Topic auswählen
  function chooseTopic(topic: string) {
    selectedTopic.value = topic
  }
  
  // Schritt 2: Formular abschicken
  function submitNewsletter() {
    // Hier könntest du die Daten z.B. in Firestore speichern:
    // console.log('Topic:', selectedTopic.value, 'Name:', userName.value, 'Email:', userEmail.value)
  
    // Danach zum Beispiel den Nutzer wieder nach Hause schicken:
    navigateTo('/home')
  }
  </script>
  
  <style scoped>
  .topic-grid {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .topic-box {
    border: 1px solid #ccc;
    padding: 1rem;
    text-align: center;
    cursor: pointer;
    width: 100px;
  }
  .topic-box:hover {
    background-color: #f0f0f0;
  }
  </style>