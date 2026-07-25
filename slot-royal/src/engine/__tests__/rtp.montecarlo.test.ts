import { describe, expect, it } from 'vitest'
import type { Difficulty } from '../types'
import { mulberry32 } from '../rng'
import { spin } from '../engine'

// ============================================================
// Simulación Monte Carlo del juego base (giros pagados).
// No modela la economía completa de los giros gratis; sirve para
// vigilar RTP aproximado, frecuencia de premio y de bonus por modo.
// ============================================================

const SPINS = 100_000
const BET = 500

interface Stats {
  rtp: number
  hitRate: number
  bonusRate: number
  maxWinX: number
}

function simulate(difficulty: Difficulty, seed: number): Stats {
  const rng = mulberry32(seed)
  let totalBet = 0
  let totalPay = 0
  let hits = 0
  let bonuses = 0
  let maxWin = 0

  for (let i = 0; i < SPINS; i++) {
    const res = spin({ bet: BET, difficulty, rng })
    totalBet += BET
    totalPay += res.totalWin
    if (res.totalWin > 0) hits++
    if (res.freeSpinsAwarded > 0) bonuses++
    if (res.totalWin > maxWin) maxWin = res.totalWin
  }

  return {
    rtp: totalPay / totalBet,
    hitRate: hits / SPINS,
    bonusRate: bonuses / SPINS,
    maxWinX: maxWin / BET,
  }
}

describe('RTP Monte Carlo', () => {
  const modes: Difficulty[] = ['facil', 'medio', 'dificil']

  for (const mode of modes) {
    it(`modo ${mode}: métricas finitas y coherentes`, () => {
      const s = simulate(mode, 20240725)
      // Reporte visible en la salida de los tests.

      console.log(
        `[RTP ${mode}] rtp=${(s.rtp * 100).toFixed(1)}%  ` +
          `hit=${(s.hitRate * 100).toFixed(1)}%  ` +
          `bonus=${(s.bonusRate * 100).toFixed(2)}%  ` +
          `maxWin=${s.maxWinX.toFixed(1)}×`,
      )

      expect(Number.isFinite(s.rtp)).toBe(true)
      expect(s.rtp).toBeGreaterThan(0)
      expect(s.hitRate).toBeGreaterThan(0)
      expect(s.hitRate).toBeLessThanOrEqual(1)
    })
  }

  it('modo fácil paga más que modo difícil (mayor RTP)', () => {
    const facil = simulate('facil', 7)
    const dificil = simulate('dificil', 7)
    expect(facil.rtp).toBeGreaterThan(dificil.rtp)
  })
})
