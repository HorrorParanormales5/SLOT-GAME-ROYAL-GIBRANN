/** Formatea un número entero con separadores de miles (es-MX). */
export function fmt(n: number): string {
  return Math.round(n).toLocaleString('es-MX')
}
