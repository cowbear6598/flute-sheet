<script setup lang="ts">
import { DownloadCloud } from 'lucide-vue-next'
import TrackItem from './TrackItem.vue'
import type { SeparatedTrack } from '@/composables/use-audio-separation'

const props = defineProps<{
  tracks: SeparatedTrack[]
}>()

function downloadAll() {
  for (const track of props.tracks) {
    if (!track.url.startsWith('blob:')) {
      console.error('[TrackList] Download skipped: URL is not a blob URL for track:', track.name)
      continue
    }
    const a = document.createElement('a')
    a.href = track.url
    a.download = `${track.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.wav`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
</script>

<template>
  <div>
    <p class="text-2xl text-foreground mb-4">分離結果</p>

    <div class="flex flex-col gap-3">
      <TrackItem
        v-for="track in props.tracks"
        :key="track.name"
        :track="track"
      />
    </div>

    <div class="mt-4">
      <button
        class="sketch-border px-6 py-3 bg-primary text-primary-foreground text-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
        @click="downloadAll"
      >
        <DownloadCloud class="w-5 h-5" :stroke-width="1.5" />
        全部下載
      </button>
    </div>
  </div>
</template>
