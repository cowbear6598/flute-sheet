<script setup lang="ts">
import { ref, computed } from 'vue'
import UploadDropZone from '@/components/flute-scribe/UploadDropZone.vue'
import ProcessingProgress from '@/components/flute-scribe/ProcessingProgress.vue'
import MidiPreview from '@/components/flute-scribe/MidiPreview.vue'
import { useMelodyExtraction } from '@/composables/use-melody-extraction'

const file = ref<File | null>(null)
const { state, extract, downloadMidi, reset: resetExtraction } = useMelodyExtraction()

const isIdle = computed(() => state.status === 'idle')
const isProcessing = computed(
  () => state.status === 'connecting' || state.status === 'processing',
)
const isDone = computed(() => state.status === 'done')
const isError = computed(() => state.status === 'error')

function handleFileUpdate(updatedFile: File | null) {
  file.value = updatedFile
  if (!updatedFile) {
    resetExtraction()
  }
}

async function startExtraction() {
  if (!file.value) return
  await extract(file.value)
}

function reset() {
  file.value = null
  resetExtraction()
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <h2 class="text-3xl md:text-4xl text-foreground">旋律提取</h2>
      <p class="text-muted-foreground text-lg italic mt-2">
        使用 Basic Pitch 從音訊中提取旋律並轉換為 MIDI，支援多種樂器音色。
      </p>
    </div>

    <template v-if="isIdle && !file">
      <section aria-label="音頻檔案上傳">
        <UploadDropZone
          accept="audio/*"
          description="拖曳音訊檔案到這裡進行旋律提取"
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
          @click="startExtraction"
        >
          開始提取
        </button>
      </div>
    </template>

    <template v-else-if="isProcessing">
      <ProcessingProgress
        :status="state.status"
        :message="state.message"
        :progress="state.progress > 0 ? state.progress : undefined"
      />
    </template>

    <template v-else-if="isDone && state.midiInfo">
      <MidiPreview
        :note-count="state.midiInfo.noteCount"
        :duration="state.midiInfo.duration"
        :tempo="state.midiInfo.estimatedTempo"
        @download="downloadMidi"
      />
      <div>
        <button
          class="sketch-border-light px-6 py-3 text-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          @click="reset"
        >
          重新開始
        </button>
      </div>
    </template>

    <template v-else-if="isError">
      <ProcessingProgress
        status="error"
        :message="state.error ?? '未知錯誤'"
      />
      <div>
        <button
          class="sketch-border-light px-6 py-3 text-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          @click="reset"
        >
          重新開始
        </button>
      </div>
    </template>
  </div>
</template>
