<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import UploadDropZone from '@/components/flute-scribe/UploadDropZone.vue'
import ProcessingProgress from '@/components/flute-scribe/ProcessingProgress.vue'
import MidiPreview from '@/components/flute-scribe/MidiPreview.vue'

type Status = 'idle' | 'processing' | 'done'

const file = ref<File | null>(null)
const status = ref<Status>('idle')
const progress = ref(0)
const message = ref('')

let activeTimer: ReturnType<typeof setInterval> | null = null

onUnmounted(() => {
  if (activeTimer !== null) {
    clearInterval(activeTimer)
    activeTimer = null
  }
})

const isIdle = computed(() => status.value === 'idle')
const isProcessing = computed(() => status.value === 'processing')
const isDone = computed(() => status.value === 'done')

const mockMidiData = {
  noteCount: 847,
  duration: '3:42',
  tempo: 120,
  timeSignature: '4/4',
  keySignature: 'C Major',
}

const progressMessages = [
  { threshold: 0, text: '分析音頻頻譜...' },
  { threshold: 33, text: '識別音高...' },
  { threshold: 66, text: '生成 MIDI...' },
]

function getProgressMessage(currentProgress: number): string {
  let result = progressMessages[0]!.text
  for (const entry of progressMessages) {
    if (currentProgress >= entry.threshold) {
      result = entry.text
    }
  }
  return result
}

function handleFileUpdate(updatedFile: File | null) {
  file.value = updatedFile
  if (!updatedFile) {
    reset()
  }
}

function startExtraction() {
  status.value = 'processing'
  progress.value = 0
  message.value = getProgressMessage(0)

  activeTimer = setInterval(() => {
    progress.value += 2
    message.value = getProgressMessage(progress.value)

    if (progress.value >= 100) {
      progress.value = 100
      status.value = 'done'
      if (activeTimer !== null) {
        clearInterval(activeTimer)
        activeTimer = null
      }
    }
  }, 100)
}

function reset() {
  if (activeTimer !== null) {
    clearInterval(activeTimer)
    activeTimer = null
  }
  file.value = null
  status.value = 'idle'
  progress.value = 0
  message.value = ''
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
        status="processing"
        :message="message"
      />
    </template>

    <template v-else-if="isDone">
      <MidiPreview
        :note-count="mockMidiData.noteCount"
        :duration="mockMidiData.duration"
        :tempo="mockMidiData.tempo"
        :time-signature="mockMidiData.timeSignature"
        :key-signature="mockMidiData.keySignature"
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
