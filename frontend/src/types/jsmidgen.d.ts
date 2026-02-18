declare module 'jsmidgen' {
  export class File {
    constructor(config?: { ticks?: number; tracks?: Track[] })
    addTrack(track: Track): this
    addTrack(): Track
    toBytes(): string
    toUint8Array(): Uint8Array
    toBlob(genericType?: boolean): Blob
  }

  export class Track {
    constructor(config?: { events?: unknown[] })
    setTempo(bpm: number, time?: number): this
    addNote(channel: number, pitch: number | string, dur: number, time?: number, velocity?: number): this
    addNoteOn(channel: number, pitch: number | string, time?: number, velocity?: number): this
    addNoteOff(channel: number, pitch: number | string, time?: number, velocity?: number): this
    setInstrument(channel: number, instrument: number, time?: number): this
    setTimeSignature(numerator: number, denominator: number, time?: number): this
    setKeySignature(accidentals: number, minor?: boolean, time?: number): this
  }
}
