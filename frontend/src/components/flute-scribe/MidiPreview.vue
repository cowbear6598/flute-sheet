<script setup lang="ts">
import { Download } from 'lucide-vue-next'

const props = defineProps<{
  noteCount: number
  duration: string
  tempo: number
}>()

const emit = defineEmits<{
  download: []
}>()

const infoFields = [
  { label: '音符數量', getValue: () => String(props.noteCount) },
  { label: '時長', getValue: () => props.duration },
  { label: '節拍 BPM', getValue: () => String(props.tempo) },
]
</script>

<template>
  <div class="sketch-border bg-card p-6">
    <p class="text-2xl text-foreground mb-4">MIDI 預覽</p>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div v-for="field in infoFields" :key="field.label" class="flex flex-col gap-1">
        <p class="text-muted-foreground text-base">{{ field.label }}</p>
        <p class="text-foreground text-xl">{{ field.getValue() }}</p>
      </div>
    </div>

    <div class="mt-4">
      <button
        class="sketch-border px-6 py-3 bg-primary text-primary-foreground text-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
        @click="emit('download')"
      >
        <Download class="w-5 h-5" :stroke-width="1.5" />
        下載 MIDI 檔案
      </button>
    </div>
  </div>
</template>
