// ============================================================
// Geometría de la rejilla y líneas de pago
// ============================================================

export const NUM_REELS = 5
export const NUM_ROWS = 3

/**
 * 9 líneas de pago clásicas. Cada línea indica, por reel, el índice de fila
 * (0=arriba, 1=medio, 2=abajo).
 */
export const PAYLINES: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
]
