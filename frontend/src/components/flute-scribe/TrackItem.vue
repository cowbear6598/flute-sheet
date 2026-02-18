<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Play, Pause, Download, Mic, Music } from 'lucide-vue-next'
import type { SeparatedTrack } from '@/composables/use-audio-separation'

const props = defineProps<{
  track: SeparatedTrack
}>()

const isPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)

onUnmounted(() => {
  audioRef.value?.pause()
  audioRef.value = null
})

function getIcon() {
  const name = props.track.name.toLowerCase()
  if (name.includes('vocal')) return Mic
  return Music
}

function togglePlay() {
  if (!props.track.url.startsWith('blob:')) {
    console.error('[TrackItem] Invalid audio URL scheme, expected blob:', props.track.url)
    return
  }

  if (!audioRef.value) {
    audioRef.value = new Audio(props.track.url)
    audioRef.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
    audioRef.value.addEventListener('pause', () => {
      isPlaying.value = false
    })
  }

  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play().catch((err) => {
      console.error('[TrackItem] Failed to play audio:', err)
      isPlaying.value = false
    })
    isPlaying.value = true
  }
}

function downloadTrack() {
  if (!props.track.url.startsWith('blob:')) {
    console.error('[TrackItem] Download rejected: URL is not a blob URL')
    return
  }
  const a = document.createElement('a')
  a.href = props.track.url
  a.download = `${props.track.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.wav`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>

<template>
  <div class="sketch-border-light bg-card p-4 flex items-center gap-4">
    <div class="sketch-border-light p-2 bg-secondary/50">
      <component
        :is="getIcon()"
        class="w-6 h-6 text-accent"
        :stroke-width="1.5"
      />
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-foreground text-xl">{{ props.track.name }}</p>
    </div>

    <div class="flex gap-2">
      <button
        class="sketch-border-light p-2 hover:bg-secondary/50 transition-colors"
        :aria-label="isPlaying ? `暫停 ${props.track.name}` : `播放 ${props.track.name}`"
        @click="togglePlay"
      >
        <Pause v-if="isPlaying" class="w-5 h-5" :stroke-width="1.5" />
        <Play v-else class="w-5 h-5" :stroke-width="1.5" />
      </button>

      <button
        class="sketch-border-light p-2 hover:bg-secondary/50 transition-colors"
        :aria-label="`下載 ${props.track.name}`"
        @click="downloadTrack"
      >
        <Download class="w-5 h-5" :stroke-width="1.5" />
      </button>
    </div>
  </div>
</template>
