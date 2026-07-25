import type { Difficulty, Grid, Outcome, SpinResult, SymbolKey } from './types'
import type { Rng } from './rng'
import { mathRandom, pick, randomInt } from './rng'
import { CLOVER, WILD_KEYS, randomNonScatter, randomSymbol } from './symbols'
import { NUM_REELS, NUM_ROWS, PAYLINES } from './paylines'
import { DIFFICULTY, rollForcedOutcome } from './difficulty'
import { FREE_SPIN_MULTIPLIER } from './paytable'
import { evaluate } from './evaluate'

// ============================================================
// Orquestación del giro: genera la rejilla (con el "algoritmo de 1000")
// y la evalúa. Capa pura; la UI/estado consumen SpinResult.
// ============================================================

export interface SpinOptions {
  bet: number
  difficulty: Difficulty
  isFreeSpin?: boolean
  rng?: Rng
}

/** Rejilla base totalmente aleatoria (ponderada, incluye scatter). */
export function randomGrid(rng: Rng): Grid {
  const grid: Grid = []
  for (let r = 0; r < NUM_REELS; r++) {
    const col: SymbolKey[] = []
    for (let row = 0; row < NUM_ROWS; row++) col.push(randomSymbol(rng))
    grid.push(col)
  }
  return grid
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((col) => col.slice())
}

/** Sustituye cualquier trébol por un símbolo no-scatter (evita bonus accidental). */
function stripScatters(grid: Grid, rng: Rng): Grid {
  return grid.map((col) => col.map((k) => (k === CLOVER ? randomNonScatter(rng) : k)))
}

/**
 * Fuerza una línea ganadora de 3–5 símbolos.
 * Fix scatter fantasma: parte de una copia SIN tréboles, así el premio
 * forzado no dispara giros gratis por azar.
 */
export function buildForcedWinGrid(base: Grid, difficulty: Difficulty, rng: Rng): Grid {
  const g = stripScatters(base, rng)
  const symbol = pick(rng, DIFFICULTY[difficulty].luckyNumbers)
  const line = pick(rng, PAYLINES)

  const r = rng.next()
  let matchCount = 3
  if (r > 0.8) matchCount = 5
  else if (r > 0.45) matchCount = 4

  for (let i = 0; i < matchCount; i++) {
    const row = line[i]!
    // Posición 0 siempre lleva el símbolo objetivo; el resto puede mezclar wilds.
    if (i > 0 && rng.next() < 0.35) {
      g[i]![row] = pick(rng, WILD_KEYS)
    } else {
      g[i]![row] = symbol
    }
  }
  return g
}

/** Fuerza un bonus colocando 3–5 tréboles en posiciones aleatorias. */
export function buildForcedBonusGrid(base: Grid, rng: Rng): Grid {
  const g = cloneGrid(base)

  const r = rng.next()
  let count = 3
  if (r > 0.75) count = 5
  else if (r > 0.45) count = 4

  const positions = new Set<string>()
  while (positions.size < count) {
    positions.add(`${randomInt(rng, 0, NUM_REELS - 1)},${randomInt(rng, 0, NUM_ROWS - 1)}`)
  }
  for (const p of positions) {
    const [reel, row] = p.split(',').map(Number)
    g[reel!]![row!] = CLOVER
  }
  return g
}

/** Genera la rejilla final aplicando el resultado forzado si corresponde. */
export function generateGrid(difficulty: Difficulty, rng: Rng): { grid: Grid; outcome: Outcome } {
  const base = randomGrid(rng)
  const outcome = rollForcedOutcome(difficulty, rng)
  if (outcome === 'bonus') return { grid: buildForcedBonusGrid(base, rng), outcome }
  if (outcome === 'win') return { grid: buildForcedWinGrid(base, difficulty, rng), outcome }
  return { grid: base, outcome }
}

/** Ejecuta un giro completo y devuelve el resultado evaluado. */
export function spin(options: SpinOptions): SpinResult {
  const { bet, difficulty, isFreeSpin = false, rng = mathRandom } = options
  const { grid, outcome } = generateGrid(difficulty, rng)
  const base = evaluate(grid, bet)

  // Durante giros gratis los premios pagan x2.
  if (isFreeSpin && base.totalWin > 0) {
    const m = FREE_SPIN_MULTIPLIER
    return {
      ...base,
      totalWin: base.totalWin * m,
      scatterWin: base.scatterWin * m,
      lineWins: base.lineWins.map((w) => ({ ...w, amount: w.amount * m })),
      grid,
      outcome,
      bet,
      isFreeSpin,
    }
  }

  return { ...base, grid, outcome, bet, isFreeSpin }
}
