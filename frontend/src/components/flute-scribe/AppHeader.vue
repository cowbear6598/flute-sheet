<script setup lang="ts">
import FluteIcon from './FluteIcon.vue'
import { Github, Info } from 'lucide-vue-next'
</script>

<template>
  <header class="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="sketch-border-light p-2 bg-card/60">
        <FluteIcon class="w-24 md:w-32 h-auto text-foreground" />
      </div>
      <div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-none">
          FluteScribe
        </h1>
        <p class="text-muted-foreground text-base md:text-lg mt-0.5 italic">
          audio to sheet music, sketched with care
        </p>
      </div>
    </div>

    <nav class="flex items-center gap-3" aria-label="Utility links">
      <a
        href="#about"
        class="sketch-border-light p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        aria-label="About FluteScribe"
      >
        <Info class="w-5 h-5" :stroke-width="1.5" />
      </a>
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        class="sketch-border-light p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        aria-label="View source on GitHub"
      >
        <Github class="w-5 h-5" :stroke-width="1.5" />
      </a>
    </nav>
  </header>
</template>
