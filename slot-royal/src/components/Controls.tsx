import { MAX_BET, MIN_BET, useGameStore } from '@/state/gameStore'
import { fmt } from '@/lib/format'

export function Controls({ onSpin }: { onSpin: () => void }) {
  const bet = useGameStore((s) => s.bet)
  const spinning = useGameStore((s) => s.spinning)
  const inFreeSpinsMode = useGameStore((s) => s.inFreeSpinsMode)
  const pendingFsStart = useGameStore((s) => s.pendingFsStart)
  const incBet = useGameStore((s) => s.incBet)
  const decBet = useGameStore((s) => s.decBet)

  const locked = spinning || inFreeSpinsMode || pendingFsStart

  return (
    <div className="mt-3.5 flex items-center gap-2.5">
      <div className="bet-control">
        <button onClick={decBet} disabled={locked || bet <= MIN_BET} aria-label="Bajar apuesta">
          −
        </button>
        <div className="flex-1 text-center">
          <div className="font-display text-[9px] uppercase tracking-[2px] text-text-dim">Apuesta</div>
          <div className="text-[15px] font-bold text-white">{fmt(bet)}</div>
        </div>
        <button onClick={incBet} disabled={locked || bet >= MAX_BET} aria-label="Subir apuesta">
          +
        </button>
      </div>

      <button className="spin-btn" onClick={onSpin} disabled={locked} aria-label="Girar">
        GIRAR
      </button>
    </div>
  )
}
