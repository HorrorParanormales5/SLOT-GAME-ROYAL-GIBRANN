import { getSymbol } from '@/engine'

/** Renderiza un símbolo según su tier (low / mid / high-wild / scatter). */
export function GameSymbol({ symbolKey }: { symbolKey: string }) {
  const s = getSymbol(symbolKey)

  if (s.tier === 'low') return <div className="sym low">{s.label}</div>
  if (s.tier === 'mid') return <div className="sym mid">{s.label}</div>
  if (s.tier === 'high') return <div className={`sym high ${s.cls ?? ''}`} />

  return (
    <div className="sym scatter">
      <img src="/assets/img/trebol.svg" alt="Trébol" className="clover-img" draggable={false} />
    </div>
  )
}

/** Celda de la rejilla con su símbolo y estado ganador opcional. */
export function Cell({ symbolKey, win = false }: { symbolKey: string; win?: boolean }) {
  return (
    <div className={`cell${win ? ' win' : ''}`}>
      <GameSymbol symbolKey={symbolKey} />
    </div>
  )
}
