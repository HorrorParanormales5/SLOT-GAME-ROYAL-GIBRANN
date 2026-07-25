// ============================================================
// Tipos compartidos del motor de juego (capa pura, sin DOM)
// ============================================================

export type Tier = 'low' | 'mid' | 'high' | 'scatter'

export type WildColor = 'green' | 'blue' | 'purple'

export interface SymbolDef {
  /** Clave única del símbolo (p. ej. '7', 'A', 'GREEN', 'CLOVER'). */
  key: string
  tier: Tier
  /** Texto a mostrar (números/letras); vacío para wilds y scatter con imagen. */
  label: string
  /** Peso relativo para el pool ponderado. */
  weight: number
  isWild: boolean
  /** Solo wilds: jerarquía (1=green < 2=blue < 3=purple). */
  wildRank?: number
  /** Solo wilds: clase de color para la UI. */
  cls?: WildColor
}

export type SymbolKey = string

/** Rejilla de símbolos indexada como grid[reel][row]. */
export type Grid = SymbolKey[][]

export type Difficulty = 'facil' | 'medio' | 'dificil'

/** Resultado forzado por el "algoritmo de 1000": premio, bonus o nada. */
export type Outcome = 'win' | 'bonus' | null

/** De qué forma paga una línea: por el símbolo natural o por wilds propios. */
export type WinKind = 'symbol' | 'wild'

export interface LineWin {
  lineIndex: number
  symbol: SymbolKey
  count: number
  amount: number
  kind: WinKind
}

export interface EvaluateResult {
  totalWin: number
  lineWins: LineWin[]
  /** Celdas ganadoras en formato "reel,row". */
  winningCells: Set<string>
  scatterCount: number
  scatterWin: number
  freeSpinsAwarded: number
}

export interface SpinResult extends EvaluateResult {
  grid: Grid
  outcome: Outcome
  bet: number
  isFreeSpin: boolean
}
