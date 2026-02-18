<script setup lang="ts">
import { useRoute } from 'vue-router'
import FluteIcon from './FluteIcon.vue'
import { Github, Scissors, Music2, FileMusic } from 'lucide-vue-next'

const route = useRoute()

const navLinks = [
  { path: '/', label: '樂譜顯示', icon: FileMusic },
  { path: '/separate', label: '音軌分離', icon: Scissors },
  { path: '/extract', label: '旋律提取', icon: Music2 },
] as const
</script>

<template>
  <header class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="sketch-border-light p-2 bg-card/60">
          <FluteIcon class="w-24 md:w-32 h-auto text-foreground" />
        </div>
        <div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-none">
            FluteScribe
          </h1>
          <p class="text-muted-foreground text-base md:text-lg mt-0.5 italic">
            audio to sheet music, sketched with care
          </p>
        </div>
      </div>

      <nav class="flex items-center gap-3" aria-label="Utility links">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          class="sketch-border-light p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          aria-label="View source on GitHub"
        >
          <Github class="w-5 h-5" :stroke-width="1.5" />
        </a>
      </nav>
    </div>

    <nav class="flex flex-wrap items-center gap-2" aria-label="Main navigation">
      <router-link
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        :class="[
          'sketch-border-light px-4 py-2 flex items-center gap-2 text-lg transition-colors',
          route.path === link.path
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
        ]"
      >
        <component :is="link.icon" class="w-4 h-4" :stroke-width="1.5" />
        {{ link.label }}
      </router-link>
    </nav>
  </header>
</template>
