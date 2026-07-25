import { describe, expect, it } from 'vitest'
import type { Grid, SymbolKey } from '../types'
import { evaluate } from '../evaluate'

// Construye una rejilla [reel][row] a partir de sus 3 filas visibles.
function gridFromRows(r0: SymbolKey[], r1: SymbolKey[], r2: SymbolKey[]): Grid {
  const grid: Grid = []
  for (let reel = 0; reel < 5; reel++) {
    grid.push([r0[reel]!, r1[reel]!, r2[reel]!])
  }
  return grid
}

describe('evaluate — líneas y wilds', () => {
  it('paga un trío bajo simple (3× "7" = 0.4× apuesta)', () => {
    const grid = gridFromRows(
      ['A', 'K', 'A', 'K', 'A'],
      ['7', '7', '7', 'J', 'Q'],
      ['Q', 'J', 'Q', 'J', 'Q'],
    )
    const res = evaluate(grid, 500)
    expect(res.lineWins).toHaveLength(1)
    expect(res.lineWins[0]).toMatchObject({ symbol: '7', count: 3, kind: 'symbol' })
    expect(res.totalWin).toBe(200) // 0.4 * 500
  })

  it('FIX max(wild, símbolo): [GREEN,GREEN,GREEN,5,5] paga la línea de wilds (5×), no la de "5" (2.5×)', () => {
    const grid = gridFromRows(
      ['J', 'Q', 'J', 'Q', 'J'],
      ['GREEN', 'GREEN', 'GREEN', '5', '5'],
      ['K', 'A', 'K', 'A', 'K'],
    )
    const res = evaluate(grid, 500)
    expect(res.lineWins).toHaveLength(1)
    expect(res.lineWins[0]).toMatchObject({ symbol: 'GREEN', count: 3, kind: 'wild' })
    expect(res.totalWin).toBe(2500) // GREEN[3]=5 × 500  (vs low[5]=2.5 × 500 = 1250)
  })

  it('FIX floats: redondea a entero cuando el multiplicador no divide exacto', () => {
    const grid = gridFromRows(
      ['A', 'K', 'A', 'K', 'A'],
      ['7', '7', '7', 'J', 'Q'],
      ['Q', 'J', 'Q', 'J', 'Q'],
    )
    const res = evaluate(grid, 501) // 0.4 * 501 = 200.4
    expect(res.totalWin).toBe(200)
    expect(Number.isInteger(res.totalWin)).toBe(true)
  })

  it('no paga cuando no hay 3 en línea', () => {
    const grid = gridFromRows(
      ['A', 'K', 'A', 'K', 'A'],
      ['J', 'Q', 'J', 'Q', 'J'],
      ['9', '8', '9', '8', '9'],
    )
    const res = evaluate(grid, 500)
    expect(res.totalWin).toBe(0)
    expect(res.lineWins).toHaveLength(0)
  })
})

describe('evaluate — scatter', () => {
  it('3 tréboles pagan 2× y otorgan 5 giros gratis', () => {
    const grid = gridFromRows(
      ['CLOVER', 'J', 'Q', 'J', 'Q'],
      ['A', 'CLOVER', 'K', 'A', 'K'],
      ['9', '8', 'CLOVER', '9', '8'],
    )
    const res = evaluate(grid, 500)
    expect(res.scatterCount).toBe(3)
    expect(res.scatterWin).toBe(1000) // 2 * 500
    expect(res.freeSpinsAwarded).toBe(5)
    expect(res.totalWin).toBe(1000)
  })

  it('un trébol como primer símbolo no rompe: la línea que empieza en scatter no paga', () => {
    const grid = gridFromRows(
      ['CLOVER', '7', '7', '7', '7'], // línea superior empieza en scatter
      ['A', 'K', 'A', 'K', 'A'],
      ['Q', 'J', 'Q', 'J', 'Q'],
    )
    const res = evaluate(grid, 500)
    // Solo 1 scatter → sin premio de scatter y sin línea desde la fila superior.
    expect(res.scatterCount).toBe(1)
    expect(res.lineWins.every((w) => w.lineIndex !== 1)).toBe(true)
  })
})
