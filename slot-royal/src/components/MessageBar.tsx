import { useGameStore } from '@/state/gameStore'

export function MessageBar() {
  const message = useGameStore((s) => s.message)
  const big = useGameStore((s) => s.messageBig)

  return (
    <div className={`msg-bar mt-3${big ? ' big-win' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
