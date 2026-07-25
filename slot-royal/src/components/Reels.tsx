import { useCallback, useEffect, useMemo, useRef } from 'react'
import { NUM_REELS } from '@/engine'
import { useGameStore } from '@/state/gameStore'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Reel } from './Reel'

interface ReelsProps {
  spinId: number
  onAllRest: () => void
  onBeginFreeSpins: () => void
}

function Sparkles() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 25 }, () => {
        const size = Math.random() * 6 + 4
        return {
          left: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: `${Math.random() * 2 + 1.5}s`,
          animationDelay: `${Math.random() * 2}s`,
        }
      }),
    [],
  )
  return (
    <div className="sparkles-container" aria-hidden="true">
      {sparkles.map((s, i) => (
        <span key={i} className="sparkle" style={s} />
      ))}
    </div>
  )
}

function FsOverlay({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[18px] bg-bg-deep/75 backdrop-blur-sm">
      <button
        onClick={onBegin}
        className="font-display cursor-pointer rounded-xl border-2 border-white px-9 py-4 text-xl font-black tracking-widest text-[#2a1c05] shadow-[0_0_20px_rgba(244,211,94,0.8),0_6px_0_var(--color-gold-dim)] transition-transform hover:scale-105 active:translate-y-1"
        style={{ background: 'linear-gradient(180deg,#fff3c4 0%,var(--color-gold-light) 40%,var(--color-gold) 100%)' }}
      >
        COMENZAR
      </button>
    </div>
  )
}

export function Reels({ spinId, onAllRest, onBeginFreeSpins }: ReelsProps) {
  const grid = useGameStore((s) => s.grid)
  const spinning = useGameStore((s) => s.spinning)
  const winningCells = useGameStore((s) => s.winningCells)
  const inFreeSpinsMode = useGameStore((s) => s.inFreeSpinsMode)
  const pendingFsStart = useGameStore((s) => s.pendingFsStart)
  const reduced = usePrefersReducedMotion()

  const restCount = useRef(0)
  useEffect(() => {
    restCount.current = 0
  }, [spinId])

  const handleRest = useCallback(() => {
    restCount.current += 1
    if (restCount.current >= NUM_REELS) onAllRest()
  }, [onAllRest])

  const glow = inFreeSpinsMode || pendingFsStart

  if (!grid) return null

  return (
    <div className={`reels-frame${glow ? ' gold-glow' : ''}`}>
      {glow && <Sparkles />}
      {pendingFsStart && <FsOverlay onBegin={onBeginFreeSpins} />}

      <div className="reels-grid">
        {grid.map((col, r) => (
          <Reel
            key={r}
            symbols={col}
            reelIndex={r}
            spinId={spinId}
            spinning={spinning}
            winningCells={winningCells}
            reducedMotion={reduced}
            onRest={handleRest}
          />
        ))}
      </div>
    </div>
  )
}
