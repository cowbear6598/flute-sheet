import { reactive } from 'vue'
import { Client, handle_file } from '@gradio/client'
import type { StatusMessage } from '@gradio/client'

export interface SeparatedTrack {
  name: string
  url: string
  blob: Blob
}

export interface SeparationState {
  status: 'idle' | 'connecting' | 'uploading' | 'processing' | 'done' | 'error'
  message: string
  tracks: SeparatedTrack[]
  error: string | null
}

// Named constants for the two output tracks returned by abidlabs/music-separation
const TRACK_INDEX_VOCALS = 0
const TRACK_INDEX_INSTRUMENTAL = 1

const TRACK_NAMES: Record<number, string> = {
  [TRACK_INDEX_VOCALS]: 'Vocals',
  [TRACK_INDEX_INSTRUMENTAL]: 'No Vocals / Instrumental',
}

// Read Space ID from environment variable; fall back to the public demo space
const GRADIO_SPACE = import.meta.env.VITE_GRADIO_SPACE ?? 'abidlabs/music-separation'

function createInitialState(): SeparationState {
  return {
    status: 'idle',
    message: '',
    tracks: [],
    error: null,
  }
}

/**
 * Validate and sanitise a file path returned by Gradio in item.name.
 * Gradio sometimes returns a server-side temp path that we append to
 * `config.root` as `/file=<path>`. We must reject any path containing
 * path-traversal sequences to prevent open-redirect / SSRF issues.
 *
 * Returns null if the path looks suspicious.
 */
function sanitiseGradioFilePath(name: string): string | null {
  // Reject path traversal sequences
  if (name.includes('..')) {
    console.warn('[AudioSeparation] Rejecting suspicious file path (contains ".."):', name)
    return null
  }
  // Must look like a relative path or simple filename – no protocol or absolute path
  if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(name)) {
    console.warn('[AudioSeparation] Rejecting suspicious file path (contains protocol):', name)
    return null
  }
  return name
}

/**
 * Parse the raw Gradio result data array into a list of resolved track URLs.
 * Each element may be a string URL, an object with a `url` property, or an
 * object with a `name` property that needs to be appended to the space root.
 *
 * Returns an array of { index, url } pairs where url is the resolved string.
 */
function parseGradioResult(
  resultData: Array<{ url?: string; name?: string } | string | null>,
  spaceRoot: string | undefined,
): Array<{ index: number; trackUrl: string }> {
  const resolved: Array<{ index: number; trackUrl: string }> = []

  for (let i = 0; i < resultData.length; i++) {
    const item = resultData[i]
    if (!item) continue

    let trackUrl: string | null = null

    if (typeof item === 'string') {
      trackUrl = item
    } else if (typeof item === 'object' && 'url' in item && item.url) {
      trackUrl = item.url
    } else if (typeof item === 'object' && 'name' in item && item.name) {
      // Gradio sometimes returns only a server-side file path in `name`.
      // We construct the full URL as `<root>/file=<name>`, but first we
      // must validate the path to prevent path-traversal attacks.
      const safeName = sanitiseGradioFilePath(item.name)
      if (safeName !== null && spaceRoot) {
        trackUrl = `${spaceRoot}/file=${safeName}`
      } else if (safeName === null) {
        // sanitiseGradioFilePath already emitted a warning; skip this track
        continue
      }
    }

    if (trackUrl) {
      resolved.push({ index: i, trackUrl })
    }
  }

  return resolved
}

export function useAudioSeparation() {
  const state = reactive<SeparationState>(createInitialState())

  async function separate(file: File): Promise<void> {
    state.status = 'connecting'
    state.message = '正在連接 AI 模型...'
    state.tracks = []
    state.error = null

    try {
      if (import.meta.env.DEV) {
        console.log('[AudioSeparation] Connecting to', GRADIO_SPACE, '...')
      }

      const app = await Client.connect(GRADIO_SPACE, {
        status_callback: (spaceStatus) => {
          if (import.meta.env.DEV) {
            console.log('[AudioSeparation] Space status:', spaceStatus)
          }
          if (
            spaceStatus.status === 'sleeping' ||
            spaceStatus.status === 'building' ||
            spaceStatus.status === 'starting'
          ) {
            state.message = '正在喚醒 AI 模型，首次可能需要 1-2 分鐘...'
          }
        },
      })

      if (import.meta.env.DEV) {
        console.log('[AudioSeparation] Connected. Fetching API info...')
        const apiInfo = await app.view_api()
        console.log('[AudioSeparation] API info:', JSON.stringify(apiInfo, null, 2))
      }

      state.status = 'uploading'
      state.message = '正在上傳音檔...'

      if (import.meta.env.DEV) {
        console.log('[AudioSeparation] Submitting file for separation...')
      }

      const submission = app.submit('/predict', [handle_file(file)])

      for await (const msg of submission) {
        if (import.meta.env.DEV) {
          console.log('[AudioSeparation] Received message:', msg)
        }

        if (msg.type === 'status') {
          const statusMsg = msg as StatusMessage
          const stage = statusMsg.stage

          if (stage === 'pending') {
            state.status = 'uploading'
            state.message = '正在排隊等候處理...'
            if (statusMsg.position !== undefined && statusMsg.position > 0) {
              state.message = `正在排隊等候處理（第 ${statusMsg.position} 位）...`
            }
          } else if (stage === 'generating') {
            state.status = 'processing'
            state.message = 'AI 正在分離音軌，約需 30-60 秒...'
          } else if (stage === 'complete') {
            state.message = '正在下載分離後的音軌...'
          } else if (stage === 'error') {
            throw new Error(
              typeof statusMsg.message === 'string'
                ? statusMsg.message
                : '處理過程發生錯誤',
            )
          }
        } else if (msg.type === 'data') {
          const dataMsg = msg as { type: 'data'; data: unknown[] }
          if (import.meta.env.DEV) {
            console.log('[AudioSeparation] Data received:', dataMsg.data)
          }

          // The Gradio API returns an array where each element corresponds to
          // one output track. The exact shape varies by runtime version, so we
          // use a type assertion here after runtime-checking each item in
          // parseGradioResult.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const resultData = (dataMsg.data ?? []) as Array<{ url?: string; name?: string } | string | null>

          const spaceRoot = app.config?.root
          const resolvedTracks = parseGradioResult(resultData, spaceRoot)

          const tracks: SeparatedTrack[] = []

          for (const { index, trackUrl } of resolvedTracks) {
            if (import.meta.env.DEV) {
              console.log(`[AudioSeparation] Downloading track ${index} from:`, trackUrl)
            }
            try {
              const response = await fetch(trackUrl)
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
              }
              // We accept any content type here because Gradio may return
              // audio with a generic content-type like application/octet-stream.
              const contentType = response.headers.get('content-type') ?? ''
              if (import.meta.env.DEV && !contentType.startsWith('audio/')) {
                console.warn(
                  `[AudioSeparation] Track ${index} has unexpected content-type: ${contentType}`,
                )
              }
              const blob = await response.blob()
              const blobUrl = URL.createObjectURL(blob)
              tracks.push({
                name: TRACK_NAMES[index] ?? `Track ${index + 1}`,
                url: blobUrl,
                blob,
              })
            } catch (fetchErr) {
              console.error(`[AudioSeparation] Failed to download track ${index}:`, fetchErr)
            }
          }

          state.tracks = tracks
          state.status = 'done'
          state.message = '分離完成！'
          if (import.meta.env.DEV) {
            console.log('[AudioSeparation] Done. Tracks:', tracks.length)
          }
        }
      }
    } catch (err) {
      console.error('[AudioSeparation] Error:', err)
      state.status = 'error'
      state.error = err instanceof Error ? err.message : '未知錯誤，請稍後再試'
      state.message = state.error
    }
  }

  function reset() {
    // Revoke existing blob URLs to free memory
    for (const track of state.tracks) {
      URL.revokeObjectURL(track.url)
    }
    Object.assign(state, createInitialState())
  }

  return { state, separate, reset }
}
