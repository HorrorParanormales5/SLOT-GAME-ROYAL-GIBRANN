import type { SymbolDef, SymbolKey } from './types'
import type { Rng } from './rng'
import { pick } from './rng'

// ============================================================
// Catálogo de símbolos (portado del prototipo original)
// ============================================================

export const CLOVER: SymbolKey = 'CLOVER'

export const SYMBOLS: Record<SymbolKey, SymbolDef> = {
  '0': { key: '0', tier: 'low', label: '0', weight: 9, isWild: false },
  '2': { key: '2', tier: 'low', label: '2', weight: 14, isWild: false },
  '3': { key: '3', tier: 'low', label: '3', weight: 13, isWild: false },
  '4': { key: '4', tier: 'low', label: '4', weight: 12, isWild: false },
  '5': { key: '5', tier: 'low', label: '5', weight: 11, isWild: false },
  '6': { key: '6', tier: 'low', label: '6', weight: 10, isWild: false },
  '7': { key: '7', tier: 'low', label: '7', weight: 9, isWild: false },
  '8': { key: '8', tier: 'low', label: '8', weight: 8, isWild: false },
  '9': { key: '9', tier: 'low', label: '9', weight: 7, isWild: false },
  J: { key: 'J', tier: 'mid', label: 'J', weight: 6, isWild: false },
  Q: { key: 'Q', tier: 'mid', label: 'Q', weight: 5, isWild: false },
  K: { key: 'K', tier: 'mid', label: 'K', weight: 4, isWild: false },
  A: { key: 'A', tier: 'mid', label: 'A', weight: 3, isWild: false },
  GREEN: { key: 'GREEN', tier: 'high', label: '', cls: 'green', weight: 2, isWild: true, wildRank: 1 },
  BLUE: { key: 'BLUE', tier: 'high', label: '', cls: 'blue', weight: 1.4, isWild: true, wildRank: 2 },
  PURPLE: { key: 'PURPLE', tier: 'high', label: '', cls: 'purple', weight: 1, isWild: true, wildRank: 3 },
  CLOVER: { key: 'CLOVER', tier: 'scatter', label: '🍀', weight: 3, isWild: false },
}

export const WILD_KEYS: readonly SymbolKey[] = ['GREEN', 'BLUE', 'PURPLE']

export function getSymbol(key: SymbolKey): SymbolDef {
  const s = SYMBOLS[key]
  if (!s) throw new Error(`Símbolo desconocido: ${key}`)
  return s
}

export function isWild(key: SymbolKey): boolean {
  return getSymbol(key).isWild
}

export function isScatter(key: SymbolKey): boolean {
  return getSymbol(key).tier === 'scatter'
}

// ---------- Pool ponderado ----------
function buildPool(includeScatter: boolean): SymbolKey[] {
  const pool: SymbolKey[] = []
  for (const [key, s] of Object.entries(SYMBOLS)) {
    if (!includeScatter && s.tier === 'scatter') continue
    const count = Math.round(s.weight * 10)
    for (let i = 0; i < count; i++) pool.push(key)
  }
  return pool
}

const POOL = buildPool(true)
const POOL_NO_SCATTER = buildPool(false)

/** Símbolo aleatorio ponderado (incluye scatter). */
export function randomSymbol(rng: Rng): SymbolKey {
  return pick(rng, POOL)
}

/** Símbolo aleatorio ponderado que nunca es scatter (para limpiar tréboles). */
export function randomNonScatter(rng: Rng): SymbolKey {
  return pick(rng, POOL_NO_SCATTER)
}
