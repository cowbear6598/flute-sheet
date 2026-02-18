<script setup lang="ts">
import AppHeader from './components/flute-scribe/AppHeader.vue'
import MusicStage from './components/flute-scribe/MusicStage.vue'
import UploadDropZone from './components/flute-scribe/UploadDropZone.vue'
import SimpleModeToggle from './components/flute-scribe/SimpleModeToggle.vue'
import AppToolbar from './components/flute-scribe/AppToolbar.vue'
</script>

<template>
  <div class="manuscript-bg min-h-screen relative">
    <!-- Faint staff lines as background texture -->
    <div class="staff-lines absolute inset-0 pointer-events-none" aria-hidden="true" />

    <main class="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
      <!-- Header -->
      <AppHeader />

      <!-- Mode toggle + Toolbar row -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <SimpleModeToggle />
        <AppToolbar />
      </div>

      <!-- Music Stage -->
      <section aria-label="Music sheet stage">
        <MusicStage />
      </section>

      <!-- Upload Drop Zone -->
      <section aria-label="Audio file upload">
        <UploadDropZone />
      </section>

      <!-- Footer note -->
      <footer class="text-center text-muted-foreground text-base pt-4 pb-2">
        <p class="italic">
          FluteScribe is free &amp; open-source. Made for musicians, by musicians.
        </p>
      </footer>
    </main>
  </div>
</template>
