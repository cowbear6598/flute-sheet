<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Music, FileMusic, X } from 'lucide-vue-next'

const isDragging = ref(false)
const file = ref<File | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const fileSizeMB = computed(() => {
  if (!file.value) return ''
  return (file.value.size / (1024 * 1024)).toFixed(2)
})

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false

  const droppedFile = e.dataTransfer?.files[0]
  if (droppedFile && droppedFile.type.startsWith('audio/')) {
    file.value = droppedFile
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const selectedFile = target.files?.[0]
  if (selectedFile) {
    file.value = selectedFile
  }
}

function clearFile(e: Event) {
  e.stopPropagation()
  file.value = null
  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

function openFilePicker() {
  if (!file.value) {
    inputRef.value?.click()
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    openFilePicker()
  }
}

const dropZoneClass = computed(() => {
  if (isDragging.value) return 'bg-accent/20 scale-[1.01]'
  if (file.value) return 'bg-card'
  return 'bg-card/50 hover:bg-card/80'
})
</script>

<template>
  <div
    :class="['sketch-dashed transition-all duration-200 cursor-pointer', dropZoneClass]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="openFilePicker"
    role="button"
    tabindex="0"
    :aria-label="file ? `Selected file: ${file.name}. Click to change.` : 'Drop your audio here to transcribe or click to browse'"
    @keydown="handleKeyDown"
  >
    <input
      ref="inputRef"
      type="file"
      accept="audio/*"
      class="hidden"
      @change="handleFileChange"
      aria-hidden="true"
    />

    <!-- File selected state -->
    <div v-if="file" class="flex items-center gap-4 p-6 md:p-8">
      <div class="sketch-border-light p-3 bg-secondary/50">
        <FileMusic
          class="w-8 h-8 text-accent"
          :stroke-width="1.5"
          style="filter: url(#sketch-icons)"
        />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-foreground text-xl truncate">{{ file.name }}</p>
        <p class="text-muted-foreground text-base">{{ fileSizeMB }} MB</p>
      </div>
      <button
        @click="clearFile"
        class="sketch-border-light p-2 hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Remove file"
      >
        <X class="w-5 h-5" :stroke-width="1.5" />
      </button>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center gap-4 p-8 md:p-12">
      <div class="relative">
        <Upload
          :class="['w-10 h-10 text-muted-foreground transition-transform', isDragging ? 'scale-110 text-accent' : '']"
          :stroke-width="1.5"
        />
        <Music
          class="w-5 h-5 text-accent absolute -top-2 -right-3 rotate-12"
          :stroke-width="1.5"
        />
      </div>
      <div class="text-center">
        <p class="text-foreground text-2xl md:text-3xl">
          Drop your audio here to transcribe
        </p>
        <p class="text-muted-foreground text-lg mt-1">
          or click to browse your files
        </p>
        <p class="text-muted-foreground/60 text-base mt-2">
          Supports MP3, WAV, FLAC, OGG
        </p>
      </div>
    </div>

    <!-- SVG filter for sketchy icon effect -->
    <svg width="0" height="0" aria-hidden="true">
      <defs>
        <filter id="sketch-icons">
          <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" result="turbulence" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="0.8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  </div>
</template>
