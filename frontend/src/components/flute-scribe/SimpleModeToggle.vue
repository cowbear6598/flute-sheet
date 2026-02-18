<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Zap } from 'lucide-vue-next'

const isSimple = ref(false)

function toggle() {
  isSimple.value = !isSimple.value
}
</script>

<template>
  <div class="flex items-center gap-4">
    <span :class="['text-lg transition-colors', !isSimple ? 'text-foreground' : 'text-muted-foreground']">
      Advanced
    </span>

    <!-- Hand-drawn toggle switch -->
    <button
      role="switch"
      :aria-checked="isSimple"
      :aria-label="`Toggle ${isSimple ? 'advanced' : 'simple'} mode`"
      @click="toggle"
      class="relative w-16 h-9 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      :style="{
        border: '2px solid var(--foreground)',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        backgroundColor: isSimple ? 'var(--accent)' : 'var(--secondary)',
        transition: 'background-color 0.3s ease',
      }"
    >
      <!-- The knob -->
      <span
        class="absolute top-[3px] w-6 h-6 flex items-center justify-center transition-all duration-300 ease-in-out"
        :style="{
          left: isSimple ? 'calc(100% - 27px)' : '3px',
          border: '1.5px solid var(--foreground)',
          borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
          backgroundColor: isSimple ? 'var(--primary-foreground)' : 'var(--card)',
        }"
      >
        <Sparkles v-if="isSimple" class="w-3.5 h-3.5 text-accent" :stroke-width="2" />
        <Zap v-else class="w-3.5 h-3.5 text-muted-foreground" :stroke-width="2" />
      </span>
    </button>

    <span :class="['text-lg transition-colors', isSimple ? 'text-foreground' : 'text-muted-foreground']">
      Simple
    </span>
  </div>
</template>
