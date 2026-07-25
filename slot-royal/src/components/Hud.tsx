import { useEffect, useState } from 'react'
import { useGameStore } from '@/state/gameStore'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { countUp } from '@/animations/countUp'
import { fmt } from '@/lib/format'

export function Hud() {
  const credits = useGameStore((s) => s.credits)
  const bet = useGameStore((s) => s.bet)
  const winAmount = useGameStore((s) => s.winAmount)
  const fsWins = useGameStore((s) => s.totalFsWinAccumulated)
  const reduced = usePrefersReducedMotion()

  const [winDisplay, setWinDisplay] = useState(0)

  useEffect(() => {
    if (winAmount <= 0) {
      setWinDisplay(0)
      return
    }
    if (reduced) {
      setWinDisplay(winAmount)
      return
    }
    const tween = countUp(0, winAmount, 0.8, setWinDisplay)
    return () => {
      tween.kill()
    }
  }, [winAmount, reduced])

  return (
    <div className="mt-4 grid grid-cols-4 gap-1.5">
      <div className="hud-box" id="creditsBox">
        <div className="hud-glow" id="hudGlow" />
        <div className="hud-label">Créditos</div>
        <div className="hud-value">{fmt(credits)}</div>
      </div>
      <div className="hud-box">
        <div className="hud-label">Apuesta</div>
        <div className="hud-value">{fmt(bet)}</div>
      </div>
      <div className="hud-box win">
        <div className="hud-label">Premio</div>
        <div className="hud-value">{fmt(winDisplay)}</div>
      </div>
      <div className="hud-box fs-wins" id="fsWinsBox">
        <div className="hud-label">G. Gratis</div>
        <div className="hud-value">{fmt(fsWins)}</div>
      </div>
    </div>
  )
}
