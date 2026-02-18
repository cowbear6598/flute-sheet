<script setup lang="ts">
import MusicStage from '@/components/flute-scribe/MusicStage.vue'
import UploadDropZone from '@/components/flute-scribe/UploadDropZone.vue'
import SimpleModeToggle from '@/components/flute-scribe/SimpleModeToggle.vue'
import AppToolbar from '@/components/flute-scribe/AppToolbar.vue'
</script>

<template>
  <div class="flex flex-col gap-8">
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
      <UploadDropZone
        accept="audio/*, .mid, .midi"
        description="Drop your audio here to transcribe"
        hint="Supports MP3, WAV, FLAC, OGG, MIDI"
        @update:file="() => { /* TODO: handle file upload for sheet transcription */ }"
      />
    </section>
  </div>
</template>
