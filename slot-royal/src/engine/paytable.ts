import type { SymbolKey } from './types'
import { getSymbol } from './symbols'

// ============================================================
// Tablas de pago (multiplicadores sobre la apuesta)
// ============================================================

/** Multiplicador por número de coincidencias (3, 4 o 5). */
export type PayTier = Record<number, number>

export const PAYTABLE: Record<string, PayTier> = {
  low: { 3: 0.4, 4: 1, 5: 2.5 },
  mid: { 3: 1, 4: 3, 5: 8 },
  GREEN: { 3: 5, 4: 15, 5: 40 },
  BLUE: { 3: 8, 4: 20, 5: 60 },
  PURPLE: { 3: 12, 4: 30, 5: 100 },
  scatter: { 3: 2, 4: 5, 5: 20 },
}

export const SCATTER_TRIGGER_COUNT = 3
export const FREE_SPIN_MULTIPLIER = 2

/** Giros gratis otorgados según número de scatters. */
export function freeSpinsForScatters(count: number): number {
  if (count >= 5) return 16
  if (count === 4) return 10
  if (count === 3) return 5
  return 0
}

/** Devuelve la tabla de pago aplicable a un símbolo. */
export function getSymbolPayTable(key: SymbolKey): PayTier {
  const s = getSymbol(key)
  if (s.tier === 'low') return PAYTABLE.low!
  if (s.tier === 'mid') return PAYTABLE.mid!
  return PAYTABLE[key]! // wilds: GREEN / BLUE / PURPLE
}
