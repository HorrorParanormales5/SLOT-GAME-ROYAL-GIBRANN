import { DIFFICULTY } from '@/engine'
import { MIN_BET, useGameStore } from '@/state/gameStore'

interface MarqueeProps {
  onSettings: () => void
  onReset: () => void
}

export function Marquee({ onSettings, onReset }: MarqueeProps) {
  const difficulty = useGameStore((s) => s.difficulty)
  const credits = useGameStore((s) => s.credits)
  const inFreeSpinsMode = useGameStore((s) => s.inFreeSpinsMode)
  const pendingFsStart = useGameStore((s) => s.pendingFsStart)

  const resetUrgent = credits < MIN_BET && !inFreeSpinsMode && !pendingFsStart

  return (
    <div className="relative pb-3 pt-1.5 text-center">
      <div className="absolute right-0 top-0 z-20 flex gap-2">
        <button className="icon-btn" onClick={onSettings} title="Configuración" aria-label="Configuración">
          ⚙
        </button>
        <button
          className={`icon-btn reset-btn${resetUrgent ? ' urgent' : ''}`}
          onClick={onReset}
          title="Reiniciar juego"
          aria-label="Reiniciar"
        >
          ⟲
        </button>
      </div>

      <h1 className="marquee-title">ROYAL CLOVER</h1>
      <div className="font-display mt-0.5 text-[11px] uppercase tracking-[0.3em] text-text-dim">
        Deluxe Slots
      </div>
      <div>
        <span className="font-display mt-2 inline-block rounded-full border border-gold-dim bg-gold/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-gold-light">
          Modo: {DIFFICULTY[difficulty].label}
        </span>
      </div>
      <div className="mt-2.5 flex justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="bulb" />
        ))}
      </div>
    </div>
  )
}
