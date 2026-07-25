import { create } from 'zustand'
import type { Difficulty, Grid, SpinResult } from '@/engine'
import { mathRandom, randomGrid, spin } from '@/engine'

// ============================================================
// Estado del juego. La lógica de negocio (deducir apuesta, aplicar
// premios, giros gratis) vive aquí; el TIMING de las animaciones lo
// orquesta el componente Game a partir de estas acciones síncronas.
// ============================================================

export const MIN_BET = 500
export const MAX_BET = 1500
export const BET_STEP = 100
export const START_CREDITS = 50_000

const EMPTY_CELLS: ReadonlySet<string> = new Set()

interface GameState {
  // Persistente / económico
  credits: number
  bet: number
  difficulty: Difficulty

  // Ciclo de giro
  spinning: boolean
  currentSpinIsFree: boolean
  pendingResult: SpinResult | null
  grid: Grid | null

  // Giros gratis
  freeSpinsLeft: number
  inFreeSpinsMode: boolean
  pendingFsStart: boolean
  totalFsWinAccumulated: number

  // Presentación
  winAmount: number
  winningCells: ReadonlySet<string>
  message: string
  messageBig: boolean

  // Acciones
  incBet: () => void
  decBet: () => void
  setDifficulty: (d: Difficulty) => void
  setMessage: (text: string, big?: boolean) => void
  /** Prepara un giro (deduce apuesta, calcula resultado). Devuelve false si no puede. */
  startSpin: () => boolean
  /** Aplica el resultado ya calculado (premios, giros gratis). */
  settleSpin: () => void
  /** El jugador pulsó COMENZAR en la pantalla de giros gratis. */
  beginFreeSpins: () => void
  /** Cierra el modo giros gratis (antes de transferir ganancias). */
  endFreeSpins: () => void
  /** Setter usado por la animación de transferencia de saldo. */
  setTransfer: (credits: number, fsAccumulated: number) => void
  reset: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  credits: START_CREDITS,
  bet: MIN_BET,
  difficulty: 'medio',

  spinning: false,
  currentSpinIsFree: false,
  pendingResult: null,
  grid: randomGrid(mathRandom),

  freeSpinsLeft: 0,
  inFreeSpinsMode: false,
  pendingFsStart: false,
  totalFsWinAccumulated: 0,

  winAmount: 0,
  winningCells: EMPTY_CELLS,
  message: 'Ajusta tu apuesta y gira',
  messageBig: false,

  incBet: () => {
    const { spinning, inFreeSpinsMode, pendingFsStart, bet } = get()
    if (spinning || inFreeSpinsMode || pendingFsStart) return
    set({ bet: Math.min(MAX_BET, bet + BET_STEP) })
  },

  decBet: () => {
    const { spinning, inFreeSpinsMode, pendingFsStart, bet } = get()
    if (spinning || inFreeSpinsMode || pendingFsStart) return
    set({ bet: Math.max(MIN_BET, bet - BET_STEP) })
  },

  setDifficulty: (d) => set({ difficulty: d }),

  setMessage: (text, big = false) => set({ message: text, messageBig: big }),

  startSpin: () => {
    const s = get()
    if (s.spinning) return false

    const isFreeSpin = s.inFreeSpinsMode && s.freeSpinsLeft > 0
    let credits = s.credits

    if (!isFreeSpin) {
      if (credits < s.bet) {
        set({ message: 'Créditos insuficientes — pulsa Reiniciar', messageBig: false })
        return false
      }
      credits -= s.bet
    }

    const result = spin({
      bet: s.bet,
      difficulty: s.difficulty,
      isFreeSpin,
      rng: mathRandom,
    })

    set({
      credits,
      spinning: true,
      currentSpinIsFree: isFreeSpin,
      pendingResult: result,
      grid: result.grid,
      winAmount: 0,
      winningCells: EMPTY_CELLS,
      message: isFreeSpin ? 'Girando (Giro Gratis)…' : 'Girando…',
      messageBig: false,
    })
    return true
  },

  settleSpin: () => {
    const s = get()
    const r = s.pendingResult
    if (!r) return

    let credits = s.credits
    let freeSpinsLeft = s.freeSpinsLeft
    let totalFsWinAccumulated = s.totalFsWinAccumulated
    let pendingFsStart = s.pendingFsStart
    const payout = r.totalWin

    if (s.currentSpinIsFree) freeSpinsLeft--

    let message = ''
    let messageBig = false
    let winningCells: ReadonlySet<string> = EMPTY_CELLS

    if (payout > 0) {
      if (s.inFreeSpinsMode) totalFsWinAccumulated += payout
      else credits += payout
      winningCells = r.winningCells
      const bigWin = payout >= s.bet * 10
      message = bigWin ? `¡GRAN PREMIO! +${payout.toLocaleString('es-MX')}` : `¡Ganaste ${payout.toLocaleString('es-MX')}!`
      messageBig = bigWin
    } else {
      message = s.currentSpinIsFree ? 'Sin premio en este giro gratis' : 'Sin premio — ¡vuelve a intentar!'
    }

    if (r.freeSpinsAwarded > 0) {
      freeSpinsLeft += r.freeSpinsAwarded
      if (!s.inFreeSpinsMode && !pendingFsStart) {
        pendingFsStart = true
        message = `🍀 ¡CONSEGUISTE ${freeSpinsLeft} GIROS GRATIS! PRESIONA COMENZAR 🍀`
        messageBig = true
      } else {
        message = `🍀 ¡SUMAS +${r.freeSpinsAwarded} GIROS GRATIS ADICIONALES! 🍀`
        messageBig = true
      }
    }

    set({
      credits,
      freeSpinsLeft,
      totalFsWinAccumulated,
      pendingFsStart,
      spinning: false,
      winAmount: payout,
      winningCells,
      message,
      messageBig,
    })
  },

  beginFreeSpins: () => set({ pendingFsStart: false, inFreeSpinsMode: true }),

  endFreeSpins: () => set({ inFreeSpinsMode: false }),

  setTransfer: (credits, fsAccumulated) =>
    set({ credits, totalFsWinAccumulated: Math.max(0, fsAccumulated) }),

  reset: () =>
    set({
      credits: START_CREDITS,
      bet: MIN_BET,
      spinning: false,
      currentSpinIsFree: false,
      pendingResult: null,
      freeSpinsLeft: 0,
      inFreeSpinsMode: false,
      pendingFsStart: false,
      totalFsWinAccumulated: 0,
      winAmount: 0,
      winningCells: EMPTY_CELLS,
      message: 'Juego reiniciado — ¡buena suerte!',
      messageBig: false,
    }),
}))
