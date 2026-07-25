import { useGameStore } from '@/state/gameStore'

export function FreeSpinsBanner() {
  const freeSpinsLeft = useGameStore((s) => s.freeSpinsLeft)
  const inFreeSpinsMode = useGameStore((s) => s.inFreeSpinsMode)
  const pendingFsStart = useGameStore((s) => s.pendingFsStart)

  const visible = (inFreeSpinsMode || pendingFsStart) && freeSpinsLeft > 0
  if (!visible) return null

  return <div className="fs-banner mb-3">🍀 GIROS GRATIS — QUEDAN {freeSpinsLeft} 🍀</div>
}
