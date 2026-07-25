// ============================================================
// Aleatoriedad inyectable.
// Permite tests deterministas (semilla fija) hoy y, en el futuro,
// sustituir por un RNG del servidor / provably-fair sin tocar el motor.
// ============================================================

export interface Rng {
  /** Devuelve un número en [0, 1). */
  next(): number
}

/** RNG por defecto basado en Math.random (no apto para dinero real). */
export const mathRandom: Rng = {
  next: () => Math.random(),
}

/**
 * Generador determinista mulberry32. Misma semilla → misma secuencia.
 * Usado en tests y simulaciones reproducibles.
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return {
    next() {
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
  }
}

/** Entero aleatorio en [minInclusive, maxInclusive]. */
export function randomInt(rng: Rng, minInclusive: number, maxInclusive: number): number {
  return minInclusive + Math.floor(rng.next() * (maxInclusive - minInclusive + 1))
}

/** Elige un elemento al azar de un array no vacío. */
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng.next() * arr.length)]!
}
