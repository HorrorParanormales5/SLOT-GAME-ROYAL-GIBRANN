import { useLayoutEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { mathRandom, randomSymbol } from '@/engine'
import { sound } from '@/audio/soundManager'
import { Cell } from './GameSymbol'

interface ReelProps {
  /** 3 símbolos finales visibles (de arriba a abajo). */
  symbols: string[]
  reelIndex: number
  /** Cambia en cada giro para disparar la animación. */
  spinId: number
  spinning: boolean
  winningCells: ReadonlySet<string>
  reducedMotion: boolean
  onRest: () => void
}

const LAST_REEL = 4

export function Reel({
  symbols,
  reelIndex,
  spinId,
  spinning,
  winningCells,
  reducedMotion,
  onRest,
}: ReelProps) {
  const colRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const onRestRef = useRef(onRest)
  onRestRef.current = onRest

  const fillerCount = 14 + reelIndex * 4

  // Tira de relleno regenerada en cada giro (fillers + símbolos finales).
  const stripKeys = useMemo(() => {
    const fillers = Array.from({ length: fillerCount }, () => randomSymbol(mathRandom))
    return [...fillers, ...symbols]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinId])

  useLayoutEffect(() => {
    if (spinId === 0 || !spinning) return
    const layer = layerRef.current
    const strip = stripRef.current
    const col = colRef.current
    if (!layer || !strip || !col) return

    // Movimiento reducido: sin animación, revela el resultado al instante.
    if (reducedMotion) {
      sound.reelStop(reelIndex)
      onRestRef.current()
      return
    }

    const cell = col.querySelector<HTMLElement>('.cell')
    const cellH = (cell ? cell.getBoundingClientRect().height : 58) + 6
    const distance = fillerCount * cellH

    layer.style.opacity = '1'
    gsap.set(strip, { y: -distance })

    const duration = 0.7 + reelIndex * 0.22 + Math.random() * 0.08
    const isLast = reelIndex === LAST_REEL

    const tween = gsap.to(strip, {
      y: 0,
      duration,
      ease: isLast ? 'back.out(1.15)' : 'power3.out',
      onComplete: () => {
        layer.style.opacity = '0'
        sound.reelStop(reelIndex)
        onRestRef.current()
      },
    })

    return () => {
      tween.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinId])

  return (
    <div className="reel-col" ref={colRef}>
      {symbols.map((k, row) => (
        <Cell key={row} symbolKey={k} win={winningCells.has(`${reelIndex},${row}`)} />
      ))}

      <div className="reel-spin-layer" ref={layerRef} style={{ opacity: 0 }}>
        <div className="reel-strip" ref={stripRef}>
          {stripKeys.map((k, i) => (
            <Cell key={i} symbolKey={k} />
          ))}
        </div>
      </div>
    </div>
  )
}
