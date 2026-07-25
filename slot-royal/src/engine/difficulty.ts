import type { Difficulty, Outcome, SymbolKey } from './types'
import type { Rng } from './rng'
import { randomInt } from './rng'

// ============================================================
// Dificultad y "algoritmo de 1000"
// En cada giro se tira 1..1000; según el modo se fuerza el resultado
// a bonus (giros gratis) o a premio, o se deja al azar puro.
// ============================================================

export interface DifficultyConfig {
  label: string
  /** Símbolos que se usan al forzar un premio. */
  luckyNumbers: readonly SymbolKey[]
  /** Rango [min, max] de 1..1000 que fuerza un bonus. */
  bonusRange: readonly [number, number]
  /** Rango [min, max] de 1..1000 que fuerza un premio. */
  winRange: readonly [number, number]
}

export const DIFFICULTY: Record<Difficulty, DifficultyConfig> = {
  facil: {
    label: 'Fácil',
    luckyNumbers: ['2', '3', '4', '5', '6', '7', 'GREEN'],
    bonusRange: [1, 50],
    winRange: [51, 250],
  },
  medio: {
    label: 'Medio',
    luckyNumbers: ['0', '2', '4', '7', 'BLUE'],
    bonusRange: [1, 25],
    winRange: [26, 120],
  },
  dificil: {
    label: 'Difícil',
    luckyNumbers: ['3', '9', 'PURPLE'],
    bonusRange: [1, 10],
    winRange: [11, 50],
  },
}

/** Decide si el giro se fuerza a bonus/premio o se deja al azar (null). */
export function rollForcedOutcome(difficulty: Difficulty, rng: Rng): Outcome {
  const roll = randomInt(rng, 1, 1000)
  const d = DIFFICULTY[difficulty]
  if (roll >= d.bonusRange[0] && roll <= d.bonusRange[1]) return 'bonus'
  if (roll >= d.winRange[0] && roll <= d.winRange[1]) return 'win'
  return null
}
