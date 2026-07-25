import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../rng'
import { evaluate } from '../evaluate'
import {
  buildForcedBonusGrid,
  buildForcedWinGrid,
  generateGrid,
  spin,
} from '../engine'
import { NUM_REELS, NUM_ROWS } from '../paylines'
import { CLOVER } from '../symbols'

describe('generateGrid', () => {
  it('produce una rejilla de 5×3', () => {
    const { grid } = generateGrid('medio', mulberry32(123))
    expect(grid).toHaveLength(NUM_REELS)
    for (const col of grid) expect(col).toHaveLength(NUM_ROWS)
  })

  it('es determinista con la misma semilla', () => {
    const a = generateGrid('facil', mulberry32(999)).grid
    const b = generateGrid('facil', mulberry32(999)).grid
    expect(a).toEqual(b)
  })
})

describe('buildForcedWinGrid', () => {
  it('siempre produce un premio y nunca dispara bonus (FIX scatter fantasma)', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const rng = mulberry32(seed)
      // Base con muchos tréboles para forzar el caso problemático.
      const base = Array.from({ length: NUM_REELS }, () =>
        Array.from({ length: NUM_ROWS }, () => CLOVER),
      )
      const grid = buildForcedWinGrid(base, 'facil', rng)
      const res = evaluate(grid, 500)
      expect(res.totalWin).toBeGreaterThan(0)
      expect(res.scatterCount).toBeLessThan(3)
      expect(res.freeSpinsAwarded).toBe(0)
    }
  })
})

describe('buildForcedBonusGrid', () => {
  it('coloca al menos 3 tréboles y otorga giros gratis', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const grid = buildForcedBonusGrid(
        Array.from({ length: NUM_REELS }, () => Array.from({ length: NUM_ROWS }, () => '8')),
        mulberry32(seed),
      )
      const res = evaluate(grid, 500)
      expect(res.scatterCount).toBeGreaterThanOrEqual(3)
      expect(res.freeSpinsAwarded).toBeGreaterThan(0)
    }
  })
})

describe('spin — multiplicador de giros gratis', () => {
  it('un giro gratis paga el doble que el mismo giro normal (misma semilla)', () => {
    let seed = 1
    let normal = spin({ bet: 500, difficulty: 'facil', rng: mulberry32(seed) })
    while (normal.totalWin === 0 && seed < 5000) {
      seed++
      normal = spin({ bet: 500, difficulty: 'facil', rng: mulberry32(seed) })
    }
    expect(normal.totalWin).toBeGreaterThan(0)

    const free = spin({ bet: 500, difficulty: 'facil', isFreeSpin: true, rng: mulberry32(seed) })
    expect(free.grid).toEqual(normal.grid) // misma semilla → misma rejilla
    expect(free.totalWin).toBe(normal.totalWin * 2)
  })

  it('devuelve enteros en el premio total', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 500; i++) {
      const res = spin({ bet: 500, difficulty: 'medio', rng })
      expect(Number.isInteger(res.totalWin)).toBe(true)
    }
  })
})
