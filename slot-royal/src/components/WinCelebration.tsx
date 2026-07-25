import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { fmt } from '@/lib/format'

export type WinTier = 'big' | 'mega' | 'epic'

export interface CelebrationData {
  tier: WinTier
  amount: number
}

const LABELS: Record<WinTier, string> = {
  big: '¡GRAN PREMIO!',
  mega: '¡MEGA PREMIO!',
  epic: '¡PREMIO ÉPICO!',
}

const SIZES: Record<WinTier, string> = {
  big: 'clamp(26px, 8vw, 44px)',
  mega: 'clamp(30px, 9vw, 52px)',
  epic: 'clamp(34px, 10vw, 60px)',
}

interface Props {
  data: CelebrationData | null
  reducedMotion: boolean
  onDone: () => void
}

export function WinCelebration({ data, reducedMotion, onDone }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (!data) return
    const el = ref.current
    const hold = 1800

    if (reducedMotion || !el) {
      const t = setTimeout(() => onDoneRef.current(), hold)
      return () => clearTimeout(t)
    }

    const tl = gsap.timeline({ onComplete: () => onDoneRef.current() })
    tl.fromTo(
      el,
      { scale: 0.4, opacity: 0, rotate: -6 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: 'back.out(1.7)' },
    )
      .to(el, { scale: 1.05, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 1 })
      .to(el, { opacity: 0, scale: 0.9, duration: 0.35, ease: 'power2.in' }, `+=${hold / 1000 - 1.7}`)

    return () => {
      tl.kill()
    }
  }, [data, reducedMotion])

  if (!data) return null

  return (
    <div className="celebration" aria-live="assertive">
      <div ref={ref} className="celebration-text" style={{ fontSize: SIZES[data.tier] }}>
        {LABELS[data.tier]}
        <div className="mt-1 text-[0.5em] text-gold-light">+{fmt(data.amount)}</div>
      </div>
    </div>
  )
}
