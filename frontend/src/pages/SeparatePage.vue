<script setup lang="ts">
import { ref, computed } from 'vue'
import UploadDropZone from '@/components/flute-scribe/UploadDropZone.vue'
import ProcessingProgress from '@/components/flute-scribe/ProcessingProgress.vue'
import TrackList from '@/components/flute-scribe/TrackList.vue'
import { useAudioSeparation } from '@/composables/use-audio-separation'

const file = ref<File | null>(null)
const { state, separate, reset: resetSeparation } = useAudioSeparation()

function handleFileUpdate(updatedFile: File | null) {
  file.value = updatedFile
  if (!updatedFile) {
    handleReset()
  }
}

async function startSeparation() {
  if (!file.value) return
  await separate(file.value)
}

function handleReset() {
  resetSeparation()
  file.value = null
}

const isIdle = computed(() => state.status === 'idle')
const isProcessing = computed(
  () =>
    state.status === 'connecting' ||
    state.status === 'uploading' ||
    state.status === 'processing',
)
const isDone = computed(() => state.status === 'done')
const isError = computed(() => state.status === 'error')
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <h2 class="text-3xl md:text-4xl text-foreground">音軌分離</h2>
      <p class="text-muted-foreground text-lg italic mt-2">
        使用 Demucs 將音訊分離成人聲與伴奏軌道。
      </p>
    </div>

    <template v-if="isIdle && !file">
      <section aria-label="音頻檔案上傳">
        <UploadDropZone
          accept="audio/*"
          description="拖曳音訊檔案到這裡進行分離"
          hint="支援 MP3、WAV、FLAC、OGG"
          @update:file="handleFileUpdate"
        />
      </section>
    </template>

    <template v-else-if="isIdle && file">
      <div class="sketch-border-light bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p class="text-foreground text-xl">{{ file.name }}</p>
        <button
          class="sketch-border px-6 py-3 bg-primary text-primary-foreground text-xl hover:bg-primary/90 transition-colors"
          @click="startSeparation"
        >
          開始分離
        </button>
      </div>
    </template>

    <template v-else-if="isProcessing || isError">
      <ProcessingProgress
        :status="state.status"
        :message="state.message"
      />
      <div v-if="isError">
        <button
          class="sketch-border-light px-6 py-3 text-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          @click="handleReset"
        >
          重新開始
        </button>
      </div>
    </template>

    <template v-else-if="isDone">
      <TrackList :tracks="state.tracks" />
      <div>
        <button
          class="sketch-border-light px-6 py-3 text-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          @click="handleReset"
        >
          重新開始
        </button>
      </div>
    </template>
  </div>
</template>
