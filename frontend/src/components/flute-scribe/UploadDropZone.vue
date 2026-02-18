<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Music, FileMusic, X } from 'lucide-vue-next'

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024 // 200 MB

const props = defineProps<{
  accept: string
  description: string
  hint: string
}>()

const emit = defineEmits<{
  'update:file': [file: File | null]
}>()

const isDragging = ref(false)
const file = ref<File | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const validationError = ref<string | null>(null)

const fileSizeMB = computed(() => {
  if (!file.value) return ''
  return (file.value.size / (1024 * 1024)).toFixed(2)
})

/**
 * Derive allowed extensions from the props.accept string.
 * e.g. "audio/*, .mid, .midi" -> ['.mp3', '.wav', '.flac', '.ogg', '.mid', '.midi', ...]
 * For "audio/*" we allow all common audio extensions as a whitelist.
 */
function getAllowedExtensions(): string[] {
  const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a', '.wma', '.opus']
  const parts = props.accept.split(',').map((s) => s.trim().toLowerCase())
  const extensions: string[] = []
  for (const part of parts) {
    if (part === 'audio/*') {
      extensions.push(...AUDIO_EXTENSIONS)
    } else if (part.startsWith('.')) {
      extensions.push(part)
    }
  }
  return extensions
}

function validateFile(candidate: File): string | null {
  const allowedExtensions = getAllowedExtensions()
  const fileName = candidate.name.toLowerCase()
  const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext))
  const hasValidMimeType = candidate.type.startsWith('audio/')

  if (!hasValidExtension && !hasValidMimeType) {
    return `不支援的檔案格式。支援格式：${allowedExtensions.join(', ')}`
  }
  if (candidate.size > MAX_FILE_SIZE_BYTES) {
    return `檔案過大（${(candidate.size / (1024 * 1024)).toFixed(1)} MB），上限為 200 MB`
  }
  return null
}

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
  if (!droppedFile) return

  const error = validateFile(droppedFile)
  if (error) {
    validationError.value = error
    return
  }
  validationError.value = null
  file.value = droppedFile
  emit('update:file', file.value)
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const selectedFile = target.files?.[0]
  if (!selectedFile) return

  const error = validateFile(selectedFile)
  if (error) {
    validationError.value = error
    target.value = ''
    return
  }
  validationError.value = null
  file.value = selectedFile
  emit('update:file', file.value)
}

function clearFile(e: Event) {
  e.stopPropagation()
  file.value = null
  validationError.value = null
  if (inputRef.value) {
    inputRef.value.value = ''
  }
  emit('update:file', null)
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
  <div class="flex flex-col gap-2">
  <div
    :class="['sketch-dashed transition-all duration-200 cursor-pointer', dropZoneClass, validationError ? 'border-destructive' : '']"
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
      :accept="props.accept"
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
          {{ props.description }}
        </p>
        <p class="text-muted-foreground text-lg mt-1">
          or click to browse your files
        </p>
        <p class="text-muted-foreground/60 text-base mt-2">
          {{ props.hint }}
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

  <!-- Validation error message -->
  <p v-if="validationError" class="text-destructive text-base px-1" role="alert">
    {{ validationError }}
  </p>
  </div>
</template>
