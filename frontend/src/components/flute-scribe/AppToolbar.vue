<script setup lang="ts">
import { Play, RotateCcw, Download, Settings } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <button
      class="sketch-border flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-lg"
      aria-label="Transcribe audio"
    >
      <Play class="w-5 h-5" :stroke-width="1.5" />
      <span>Transcribe</span>
    </button>

    <button
      class="sketch-border-light flex items-center gap-2 px-4 py-2 bg-card text-foreground hover:bg-secondary transition-colors text-lg"
      aria-label="Reset stage"
    >
      <RotateCcw class="w-4 h-4" :stroke-width="1.5" />
      <span>Reset</span>
    </button>

    <button
      class="sketch-border-light flex items-center gap-2 px-4 py-2 bg-card text-foreground hover:bg-secondary transition-colors text-lg"
      aria-label="Export sheet music"
    >
      <Download class="w-4 h-4" :stroke-width="1.5" />
      <span>Export</span>
    </button>

    <button
      class="sketch-border-light flex items-center gap-2 px-3 py-2 bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-lg ml-auto"
      aria-label="Settings"
    >
      <Settings class="w-4 h-4" :stroke-width="1.5" />
    </button>
  </div>
</template>
