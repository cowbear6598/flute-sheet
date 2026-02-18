<script setup lang="ts">
import AppHeader from './components/flute-scribe/AppHeader.vue'
</script>

<template>
  <div class="manuscript-bg min-h-screen relative">
    <!-- Faint staff lines as background texture -->
    <div class="staff-lines absolute inset-0 pointer-events-none" aria-hidden="true" />

    <main class="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
      <!-- Header -->
      <AppHeader />

      <!-- Page content -->
      <router-view />

      <!-- Footer note -->
      <footer class="text-center text-muted-foreground text-base pt-4 pb-2">
        <p class="italic">
          FluteScribe is free &amp; open-source. Made for musicians, by musicians.
        </p>
      </footer>
    </main>
  </div>
</template>
