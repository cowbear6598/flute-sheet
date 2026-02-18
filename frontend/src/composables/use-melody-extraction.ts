import { reactive } from 'vue'
import { BasicPitch, outputToNotesPoly, noteFramesToTime } from '@spotify/basic-pitch'
import type { NoteEventTime } from '@spotify/basic-pitch'
import { File as MidiFile, Track as MidiTrack } from 'jsmidgen'

const BASIC_PITCH_MODEL_URL = 'https://unpkg.com/@spotify/basic-pitch@1.0.1/model/model.json'

const TICKS_PER_BEAT = 128
const ESTIMATED_TEMPO = 120
const TICKS_PER_SECOND = TICKS_PER_BEAT * (ESTIMATED_TEMPO / 60) // = 256

export interface MidiInfo {
  noteCount: number
  duration: string
  estimatedTempo: number
  notes: NoteEventTime[]
  midiBlob: Blob
}

export interface ExtractionState {
  status: 'idle' | 'connecting' | 'processing' | 'done' | 'error'
  progress: number
  message: string
  midiInfo: MidiInfo | null
  error: string | null
}

function createInitialState(): ExtractionState {
  return {
    status: 'idle',
    progress: 0,
    message: '',
    midiInfo: null,
    error: null,
  }
}

/**
 * 將多聲道 AudioBuffer 轉換為單聲道
 * 方法：取所有聲道的平均值
 */
function toMono(audioBuffer: AudioBuffer, audioContext: AudioContext): AudioBuffer {
  if (audioBuffer.numberOfChannels === 1) return audioBuffer

  const length = audioBuffer.length
  const monoBuffer = audioContext.createBuffer(1, length, audioBuffer.sampleRate)
  const monoData = monoBuffer.getChannelData(0)

  // 取所有聲道的平均值
  const numChannels = audioBuffer.numberOfChannels
  const channelDataArrays: Float32Array[] = []
  for (let ch = 0; ch < numChannels; ch++) {
    channelDataArrays.push(audioBuffer.getChannelData(ch))
  }
  for (let i = 0; i < length; i++) {
    let sum = 0
    for (let ch = 0; ch < numChannels; ch++) {
      sum += channelDataArrays[ch]?.[i] ?? 0
    }
    monoData[i] = sum / numChannels
  }

  return monoBuffer
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const MIN_PITCH = 40 // E2
const MAX_PITCH = 96 // C7

function postProcessNotes(notes: NoteEventTime[]): NoteEventTime[] {
  // Step 1: Filter extremely short notes (< 0.08s, roughly shorter than 64th note)
  let result = notes.filter((n) => n.durationSeconds >= 0.08)

  // Step 2: Filter low-amplitude noise
  result = result.filter((n) => n.amplitude >= 0.15)

  // Step 3: Filter pitches outside the valid range (MIDI 40–96)
  result = result.filter((n) => n.pitchMidi >= MIN_PITCH && n.pitchMidi <= MAX_PITCH)

  // Step 4: Merge adjacent notes with the same pitch and a short gap
  // Sort by start time first
  result = [...result].sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)

  let changed = true
  while (changed) {
    changed = false
    const merged: NoteEventTime[] = []
    let i = 0
    while (i < result.length) {
      const current = result[i]!
      const next = result[i + 1]
      if (
        next !== undefined &&
        current.pitchMidi === next.pitchMidi &&
        next.startTimeSeconds - (current.startTimeSeconds + current.durationSeconds) < 0.05
      ) {
        // Merge current and next into one note
        const newDuration =
          next.startTimeSeconds + next.durationSeconds - current.startTimeSeconds
        merged.push({
          startTimeSeconds: current.startTimeSeconds,
          durationSeconds: newDuration,
          pitchMidi: current.pitchMidi,
          amplitude: (current.amplitude + next.amplitude) / 2,
        })
        changed = true
        i += 2
      } else {
        merged.push(current)
        i += 1
      }
    }
    result = merged
  }

  // Step 5: Filter again after merging (< 0.05s)
  result = result.filter((n) => n.durationSeconds >= 0.05)

  return result
}

function buildMidiBlob(notes: NoteEventTime[]): Blob {
  const midiFile = new MidiFile({ ticks: TICKS_PER_BEAT })
  const track = new MidiTrack()
  midiFile.addTrack(track)
  track.setTempo(ESTIMATED_TEMPO)

  // Sort notes by start time to ensure correct ordering
  const sorted = [...notes].sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)

  let lastEventEndTime = 0

  for (const note of sorted) {
    const delayInTicks = Math.max(0, Math.round((note.startTimeSeconds - lastEventEndTime) * TICKS_PER_SECOND))
    const durationInTicks = Math.max(1, Math.round(note.durationSeconds * TICKS_PER_SECOND))
    const velocity = Math.max(1, Math.min(127, Math.round(note.amplitude * 127)))

    track.addNote(0, note.pitchMidi, durationInTicks, delayInTicks, velocity)
    lastEventEndTime = note.startTimeSeconds + note.durationSeconds
  }

  // jsmidgen toBytes() returns a binary string — must convert byte-by-byte
  // to avoid UTF-8 encoding corruption of the MIDI header (MThd)
  const byteString = midiFile.toBytes()
  const buffer = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    buffer[i] = byteString.charCodeAt(i) & 0xff
  }
  return new Blob([buffer], { type: 'audio/midi' })
}

export function useMelodyExtraction() {
  const state = reactive<ExtractionState>(createInitialState())

  let currentBlobUrl: string | null = null

  async function extract(file: File): Promise<void> {
    state.status = 'connecting'
    state.progress = 0
    state.message = '正在載入 AI 模型...'
    state.midiInfo = null
    state.error = null

    // Revoke any previous blob URL
    if (currentBlobUrl !== null) {
      URL.revokeObjectURL(currentBlobUrl)
      currentBlobUrl = null
    }

    try {
      if (import.meta.env.DEV) {
        console.log('[MelodyExtraction] Decoding audio file:', file.name)
      }

      // Decode audio
      const arrayBuffer = await file.arrayBuffer()
      let audioContext: AudioContext
      try {
        audioContext = new AudioContext({ sampleRate: 22050 })
      } catch (ctxErr) {
        throw new Error('無法建立音訊上下文，請確認瀏覽器支援 Web Audio API')
      }

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      if (import.meta.env.DEV) {
        console.log('[MelodyExtraction] Audio decoded. Duration:', audioBuffer.duration, 'seconds, Channels:', audioBuffer.numberOfChannels)
      }

      // Convert to mono if necessary (Basic Pitch only accepts mono AudioBuffer)
      if (audioBuffer.numberOfChannels > 1) {
        console.log('[MelodyExtraction] 偵測到多聲道音訊（', audioBuffer.numberOfChannels, '聲道），正在轉換為單聲道...')
      }
      const monoBuffer = toMono(audioBuffer, audioContext)

      state.status = 'processing'
      state.message = 'AI 正在提取旋律...'

      if (import.meta.env.DEV) {
        console.log('[MelodyExtraction] Loading Basic Pitch model from', BASIC_PITCH_MODEL_URL)
      }

      const basicPitch = new BasicPitch(BASIC_PITCH_MODEL_URL)

      // Collect output from callbacks
      const allFrames: number[][][] = []
      const allOnsets: number[][][] = []

      await basicPitch.evaluateModel(
        monoBuffer,
        (frames, onsets, _contours) => {
          allFrames.push(frames)
          allOnsets.push(onsets)
          // 暫時不收集 contours，待 pitch bend 功能恢復時再啟用
          void _contours
        },
        (percent) => {
          state.progress = Math.round(percent * 100)
          if (import.meta.env.DEV) {
            console.log('[MelodyExtraction] Progress:', state.progress, '%')
          }
        },
      )

      if (import.meta.env.DEV) {
        console.log('[MelodyExtraction] Model evaluation complete. Processing notes...')
      }

      // Flatten the collected 3D arrays into 2D by concatenating along axis 0
      const frames2d = allFrames.flat()
      const onsets2d = allOnsets.flat()

      // Convert frames → note events → time-based notes
      // 暫時不加 pitch bend，先確保基本音符正確
      const rawNotes = outputToNotesPoly(frames2d, onsets2d, 0.5, 0.3, 11)
      const notes = noteFramesToTime(rawNotes)
      const cleanedNotes = postProcessNotes(notes)

      if (import.meta.env.DEV) {
        console.log('[MelodyExtraction] Notes extracted:', notes.length)
        console.log(`[MelodyExtraction] Post-processing: ${notes.length} → ${cleanedNotes.length} notes`)
      }

      // Build MIDI blob
      const midiBlob = buildMidiBlob(cleanedNotes)

      // Calculate total duration from last note end
      const totalDurationSeconds = cleanedNotes.reduce((max, n) => {
        return Math.max(max, n.startTimeSeconds + n.durationSeconds)
      }, 0)

      state.midiInfo = {
        noteCount: cleanedNotes.length,
        duration: formatDuration(totalDurationSeconds),
        estimatedTempo: ESTIMATED_TEMPO,
        notes: cleanedNotes,
        midiBlob,
      }

      state.status = 'done'
      state.message = '提取完成！'
      state.progress = 100

      if (import.meta.env.DEV) {
        console.log('[MelodyExtraction] Done. noteCount:', cleanedNotes.length, 'duration:', totalDurationSeconds)
      }

      // Close the AudioContext to free resources
      await audioContext.close()
    } catch (err) {
      console.error('[MelodyExtraction] Error:', err)
      state.status = 'error'
      state.error = err instanceof Error ? err.message : '未知錯誤，請稍後再試'
      state.message = state.error
    }
  }

  function downloadMidi(): void {
    if (state.midiInfo === null) return

    const blobUrl = URL.createObjectURL(state.midiInfo.midiBlob)
    currentBlobUrl = blobUrl

    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = 'melody.mid'
    anchor.click()

    // Revoke after a short delay to allow the download to start
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
      if (currentBlobUrl === blobUrl) {
        currentBlobUrl = null
      }
    }, 1000)
  }

  function reset(): void {
    if (currentBlobUrl !== null) {
      URL.revokeObjectURL(currentBlobUrl)
      currentBlobUrl = null
    }
    Object.assign(state, createInitialState())
  }

  return { state, extract, downloadMidi, reset }
}
