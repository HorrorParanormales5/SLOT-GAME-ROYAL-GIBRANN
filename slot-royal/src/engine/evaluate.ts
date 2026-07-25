import type { EvaluateResult, Grid, LineWin, SymbolKey } from './types'
import { getSymbol, isScatter, isWild, CLOVER } from './symbols'
import { NUM_REELS, NUM_ROWS, PAYLINES } from './paylines'
import {
  PAYTABLE,
  SCATTER_TRIGGER_COUNT,
  freeSpinsForScatters,
  getSymbolPayTable,
} from './paytable'

// ============================================================
// Evaluación de premios: líneas (con wilds) + scatter.
//
// Fixes respecto al prototipo original:
//  · max(wild, símbolo): una línea paga el mayor entre su interpretación
//    como símbolo natural (wilds sustituyen) y como línea de wilds propios.
//  · Redondeo a entero de cada premio → sin deriva de punto flotante.
//  · Los giros gratis se calculan aparte del multiplicador de free spins.
// ============================================================

interface Interpretation {
  amount: number
  count: number
  payKey: SymbolKey | null
}

/** Interpretación por símbolo natural: primer no-wild, wilds sustituyen. */
function symbolInterpretation(seq: readonly SymbolKey[], bet: number): Interpretation {
  const firstNonWild = seq.find((k) => !isWild(k) && !isScatter(k))
  if (!firstNonWild) return { amount: 0, count: 0, payKey: null }

  let count = 0
  for (const cur of seq) {
    if (isScatter(cur)) break
    if (isWild(cur) || cur === firstNonWild) count++
    else break
  }
  if (count < 3) return { amount: 0, count: 0, payKey: null }

  const mult = getSymbolPayTable(firstNonWild)[Math.min(count, 5)] ?? 0
  return { amount: Math.round(mult * bet), count, payKey: firstNonWild }
}

/** Interpretación por wilds propios: run de wilds consecutivos desde la izquierda. */
function wildInterpretation(seq: readonly SymbolKey[], bet: number): Interpretation {
  let count = 0
  let highestWild: SymbolKey | null = null
  for (const cur of seq) {
    if (!isWild(cur)) break
    count++
    if (!highestWild || getSymbol(cur).wildRank! > getSymbol(highestWild).wildRank!) {
      highestWild = cur
    }
  }
  if (count < 3 || !highestWild) return { amount: 0, count: 0, payKey: null }

  const mult = getSymbolPayTable(highestWild)[Math.min(count, 5)] ?? 0
  return { amount: Math.round(mult * bet), count, payKey: highestWild }
}

export function evaluate(grid: Grid, bet: number): EvaluateResult {
  let totalWin = 0
  const winningCells = new Set<string>()
  const lineWins: LineWin[] = []

  PAYLINES.forEach((line, lineIndex) => {
    const seq = line.map((row, reel) => grid[reel]![row]!)

    // Una línea que empieza en scatter no paga como línea normal.
    if (isScatter(seq[0]!)) return

    const bySymbol = symbolInterpretation(seq, bet)
    const byWild = wildInterpretation(seq, bet)

    // Se paga la interpretación de mayor valor.
    const best = byWild.amount > bySymbol.amount ? byWild : bySymbol
    const kind = best === byWild && byWild.amount > 0 ? 'wild' : 'symbol'

    if (best.amount > 0 && best.payKey) {
      totalWin += best.amount
      for (let i = 0; i < best.count; i++) {
        winningCells.add(`${i},${line[i]!}`)
      }
      lineWins.push({
        lineIndex,
        symbol: best.payKey,
        count: best.count,
        amount: best.amount,
        kind,
      })
    }
  })

  // ---------- Scatter (trébol) en cualquier posición ----------
  let scatterCount = 0
  const scatterCells: string[] = []
  for (let r = 0; r < NUM_REELS; r++) {
    for (let row = 0; row < NUM_ROWS; row++) {
      if (grid[r]![row] === CLOVER) {
        scatterCount++
        scatterCells.push(`${r},${row}`)
      }
    }
  }

  let scatterWin = 0
  let freeSpinsAwarded = 0
  if (scatterCount >= SCATTER_TRIGGER_COUNT) {
    const mult = PAYTABLE.scatter![Math.min(scatterCount, 5)] ?? PAYTABLE.scatter![3] ?? 0
    scatterWin = Math.round(mult * bet)
    totalWin += scatterWin
    scatterCells.forEach((k) => winningCells.add(k))
    freeSpinsAwarded = freeSpinsForScatters(scatterCount)
  }

  return { totalWin, lineWins, winningCells, scatterCount, scatterWin, freeSpinsAwarded }
}
