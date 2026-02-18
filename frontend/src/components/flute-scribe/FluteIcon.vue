<template>
  <svg
    viewBox="0 0 120 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- Hand-drawn flute body -->
    <path
      d="M12 22c2-1 8-2 14-1.5s12 0.5 18 0c6-0.5 12-0.8 18-0.5s12 1 18 0.8c6-0.2 12-0.5 18-0.3s12 1 16 1.2"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      style="filter: url(#sketchy)"
    />
    <path
      d="M12 18c2 1 8 2 14 1.5s12-0.5 18 0c6 0.5 12 0.8 18 0.5s12-1 18-0.8c6 0.2 12 0.5 18 0.3s12-1 16-1.2"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    <!-- Mouthpiece -->
    <path
      d="M8 16c-1 0.5-2 2-2.5 4s0.5 3 2.5 3c1 0 2-0.5 3-1"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      fill="none"
    />
    <!-- Tone holes -->
    <circle cx="40" cy="20" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none" />
    <circle cx="54" cy="19.8" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none" />
    <circle cx="68" cy="20.2" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none" />
    <circle cx="82" cy="19.5" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none" />
    <circle cx="96" cy="20" r="2.3" stroke="currentColor" stroke-width="1.5" fill="none" />
    <!-- End cap -->
    <path
      d="M112 17.5c2-0.2 4 1 4 2.5s-2 2.7-4 2.5"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      fill="none"
    />
    <!-- Musical note floating above -->
    <path
      d="M28 6c0 3-2.5 5-5 5s-3-1.5-3-3c0-2 2-3 4-3s4 0 4-3"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      fill="none"
    />
    <line x1="28" y1="2" x2="28" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <!-- Another small note -->
    <path
      d="M100 8c0 2-1.5 3.5-3.5 3.5s-2-1-2-2c0-1.5 1.5-2 3-2s2.5 0 2.5-2"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linecap="round"
      fill="none"
    />
    <line x1="100" y1="5" x2="100" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
    <defs>
      <filter id="sketchy">
        <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence" />
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
</template>
