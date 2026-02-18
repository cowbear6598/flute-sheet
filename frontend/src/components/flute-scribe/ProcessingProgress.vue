<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  status: 'idle' | 'connecting' | 'uploading' | 'processing' | 'done' | 'error'
  message: string
  progress?: number
}>()

const isAnimating = computed(() =>
  props.status === 'connecting' || props.status === 'uploading' || props.status === 'processing'
)

const hasRealProgress = computed(() => props.progress !== undefined)
</script>

<template>
  <div v-if="props.status !== 'idle'" class="sketch-border-light bg-card p-6">
    <div v-if="isAnimating" class="flex flex-col gap-4">
      <p class="text-foreground text-xl italic">{{ props.message }}</p>

      <!-- 模式 B：真實進度條（progress prop 有值） -->
      <div v-if="hasRealProgress" class="flex items-center gap-3">
        <div class="sketch-border-light overflow-hidden h-6 relative flex-1">
          <div
            class="absolute top-0 left-0 h-full bg-accent transition-[width] duration-300"
            :style="{ width: `${props.progress}%` }"
          />
        </div>
        <span class="text-muted-foreground text-base tabular-nums w-12 text-right">
          {{ props.progress }}%
        </span>
      </div>

      <!-- 模式 A：脈衝動畫（progress prop 未定義） -->
      <div v-else class="sketch-border-light overflow-hidden h-6 relative">
        <div
          class="absolute top-0 left-0 h-full w-[30%] bg-accent animate-pulse-slide"
        />
      </div>
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
