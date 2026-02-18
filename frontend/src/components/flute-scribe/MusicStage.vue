<script setup lang="ts">
import TrebleClef from './TrebleClef.vue'

/* Deterministic wobble offsets to give a hand-drawn feel */
const STAFF1_WOBBLE = [0.3, -0.4, 0.15, -0.25, 0.45]
const STAFF2_WOBBLE = [-0.35, 0.2, -0.5, 0.4, -0.15]

const staff1Lines = [60, 75, 90, 105, 120]
const staff2Lines = [180, 195, 210, 225, 240]
</script>

<template>
  <div class="sketch-border bg-card p-4 md:p-8 overflow-hidden">
    <div class="flex items-center gap-2 mb-4">
      <span class="text-muted-foreground text-xl">Stage</span>
      <span class="text-muted-foreground text-sm italic">(your transcribed music will appear here)</span>
    </div>

    <div class="relative min-h-[260px] md:min-h-[320px]">
      <!-- Musical staff SVG -->
      <svg
        class="w-full h-full absolute inset-0"
        viewBox="0 0 800 280"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <!-- First staff (5 lines) -->
        <line
          v-for="(y, i) in staff1Lines"
          :key="'staff1-' + i"
          x1="60"
          :y1="y"
          x2="790"
          :y2="y + (STAFF1_WOBBLE[i] ?? 0)"
          stroke="var(--foreground)"
          stroke-width="1.2"
          stroke-linecap="round"
          opacity="0.6"
        />
        <!-- Second staff (5 lines) -->
        <line
          v-for="(y, i) in staff2Lines"
          :key="'staff2-' + i"
          x1="60"
          :y1="y"
          x2="790"
          :y2="y + (STAFF2_WOBBLE[i] ?? 0)"
          stroke="var(--foreground)"
          stroke-width="1.2"
          stroke-linecap="round"
          opacity="0.6"
        />
        <!-- Barline at the end -->
        <line x1="789" y1="58" x2="789" y2="122" stroke="var(--foreground)" stroke-width="2" opacity="0.5" />
        <line x1="789" y1="178" x2="789" y2="242" stroke="var(--foreground)" stroke-width="2" opacity="0.5" />
        <!-- Double barline at start -->
        <line x1="61" y1="58" x2="61" y2="122" stroke="var(--foreground)" stroke-width="2" opacity="0.5" />
        <line x1="61" y1="178" x2="61" y2="242" stroke="var(--foreground)" stroke-width="2" opacity="0.5" />
      </svg>

      <!-- Treble clef on first staff -->
      <div class="absolute left-[6%] md:left-[7%]" :style="{ top: '4%', height: '40%' }">
        <TrebleClef class="h-full w-auto text-foreground opacity-70" />
      </div>
      <!-- Treble clef on second staff -->
      <div class="absolute left-[6%] md:left-[7%]" :style="{ top: '47%', height: '40%' }">
        <TrebleClef class="h-full w-auto text-foreground opacity-70" />
      </div>

      <!-- "Awaiting notes" doodle text -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="text-center">
          <p class="text-muted-foreground text-2xl md:text-3xl italic opacity-50">
            ~ awaiting your melody ~
          </p>
          <div class="flex justify-center gap-3 mt-3 opacity-30">
            <!-- Little doodled notes -->
            <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden="true">
              <ellipse cx="8" cy="18" rx="6" ry="4.5" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground" />
              <line x1="14" y1="4" x2="14" y2="18" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground" />
            </svg>
            <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden="true">
              <ellipse cx="8" cy="18" rx="6" ry="4.5" fill="currentColor" class="text-muted-foreground" />
              <line x1="14" y1="2" x2="14" y2="18" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground" />
              <path d="M14 2c3 2 6 5 5 9" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground" fill="none" />
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <ellipse cx="8" cy="18" rx="6" ry="4.5" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground" />
              <line x1="14" y1="4" x2="14" y2="18" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground" />
              <ellipse cx="18" cy="14" rx="4" ry="3" stroke="currentColor" stroke-width="1.2" class="text-muted-foreground" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
