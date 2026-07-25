// ============================================================
// Sintetizador de sonido con Web Audio API.
// Genera los efectos por código (sin archivos). Diseñado para
// poder sustituirse por samples reales (Howler) en el futuro.
// ============================================================

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = false

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  // Los navegadores exigen reanudar tras interacción del usuario.
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface ToneOptions {
  freq: number
  duration: number
  type?: OscillatorType
  gain?: number
  /** Barrido de frecuencia hasta este valor. */
  sweepTo?: number
  delay?: number
}

function tone({ freq, duration, type = 'sine', gain = 0.3, sweepTo, delay = 0 }: ToneOptions) {
  const audio = ensureContext()
  if (!audio || !master || muted) return
  const t0 = audio.currentTime + delay
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), t0 + duration)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(master)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export const sound = {
  setMuted(v: boolean) {
    muted = v
  },
  isMuted() {
    return muted
  },
  /** Debe llamarse tras un gesto del usuario para desbloquear el audio. */
  unlock() {
    ensureContext()
  },
  spinStart() {
    tone({ freq: 220, duration: 0.12, type: 'square', gain: 0.12, sweepTo: 320 })
  },
  reelStop(index: number) {
    tone({ freq: 180 + index * 30, duration: 0.09, type: 'triangle', gain: 0.16 })
  },
  win() {
    tone({ freq: 523, duration: 0.14, type: 'triangle', gain: 0.22 })
    tone({ freq: 659, duration: 0.16, type: 'triangle', gain: 0.22, delay: 0.1 })
    tone({ freq: 784, duration: 0.22, type: 'triangle', gain: 0.22, delay: 0.2 })
  },
  bigWin() {
    const notes = [523, 659, 784, 1046, 1318]
    notes.forEach((f, i) => tone({ freq: f, duration: 0.28, type: 'sawtooth', gain: 0.18, delay: i * 0.09 }))
  },
  coin() {
    tone({ freq: 1046, duration: 0.06, type: 'square', gain: 0.12 })
    tone({ freq: 1568, duration: 0.08, type: 'square', gain: 0.1, delay: 0.03 })
  },
  bonus() {
    const notes = [392, 523, 659, 784, 1046]
    notes.forEach((f, i) => tone({ freq: f, duration: 0.35, type: 'triangle', gain: 0.2, delay: i * 0.12 }))
  },
  noWin() {
    tone({ freq: 200, duration: 0.14, type: 'sine', gain: 0.08, sweepTo: 140 })
  },
}
