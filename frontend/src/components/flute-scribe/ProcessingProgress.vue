<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  status: 'idle' | 'connecting' | 'uploading' | 'processing' | 'done' | 'error'
  message: string
}>()

const isAnimating = computed(() =>
  props.status === 'connecting' || props.status === 'uploading' || props.status === 'processing'
)

const statusText = computed(() => {
  switch (props.status) {
    case 'connecting':
      return '正在連接 AI 模型...'
    case 'uploading':
      return '正在上傳音檔...'
    case 'processing':
      return 'AI 正在分離音軌，約需 30-60 秒...'
    default:
      return props.message
  }
})
</script>

<template>
  <div v-if="props.status !== 'idle'" class="sketch-border-light bg-card p-6">
    <div v-if="isAnimating" class="flex flex-col gap-4">
      <p class="text-foreground text-xl italic">{{ statusText }}</p>

      <div class="sketch-border-light overflow-hidden h-6 relative">
        <div
          class="absolute top-0 left-0 h-full w-[30%] bg-accent animate-pulse-slide"
        />
      </div>

      <p v-if="props.message && props.message !== statusText" class="text-muted-foreground text-base italic">
        {{ props.message }}
      </p>
    </div>

    <div v-else-if="props.status === 'done'" class="flex items-center gap-3">
      <CheckCircle class="w-6 h-6 text-accent" :stroke-width="1.5" />
      <p class="text-foreground text-xl">處理完成</p>
    </div>

    <div v-else-if="props.status === 'error'" class="flex items-center gap-3">
      <AlertCircle class="w-6 h-6 text-destructive" :stroke-width="1.5" />
      <p class="text-foreground text-xl">{{ props.message }}</p>
    </div>
  </div>
</template>
