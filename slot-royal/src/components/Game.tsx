import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Difficulty } from '@/engine'
import { DIFFICULTY } from '@/engine'
import { useGameStore } from '@/state/gameStore'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { sound } from '@/audio/soundManager'
import { Marquee } from './Marquee'
import { FreeSpinsBanner } from './FreeSpinsBanner'
import { Reels } from './Reels'
import { Hud } from './Hud'
import { Controls } from './Controls'
import { MessageBar } from './MessageBar'
import { Paytable } from './Paytable'
import { SettingsModal } from './modals/SettingsModal'
import { ResetModal } from './modals/ResetModal'
import { WinCelebration, type CelebrationData, type WinTier } from './WinCelebration'

const AUTO_FS_DELAY = 900

function tierFor(multiple: number): WinTier {
  if (multiple >= 60) return 'epic'
  if (multiple >= 30) return 'mega'
  return 'big'
}

export function Game() {
  const [spinId, setSpinId] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [celebration, setCelebration] = useState<CelebrationData | null>(null)
  const reduced = usePrefersReducedMotion()

  const timers = useRef<number[]>([])
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }, [])

  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  // ---------- Giro ----------
  const doSpin = useCallback(() => {
    sound.unlock()
    const started = useGameStore.getState().startSpin()
    if (started) {
      sound.spinStart()
      setSpinId((id) => id + 1)
    }
  }, [])

  // ---------- Transferencia de ganancias de giros gratis ----------
  const spawnParticles = useCallback(() => {
    const src = document.getElementById('fsWinsBox')?.getBoundingClientRect()
    const dst = document.getElementById('creditsBox')?.getBoundingClientRect()
    if (!src || !dst) return
    let elapsed = 0
    const iv = window.setInterval(() => {
      elapsed += 90
      if (elapsed % 180 === 0) sound.coin()
      for (let i = 0; i < 2; i++) {
        const p = document.createElement('div')
        p.className = 'transfer-particle'
        p.textContent = Math.random() < 0.5 ? '🍀' : '🪙'
        const sx = src.left + src.width / 2 + (Math.random() * 30 - 15)
        const sy = src.top + src.height / 2 + (Math.random() * 20 - 10)
        const dx = dst.left + dst.width / 2 + (Math.random() * 30 - 15)
        const dy = dst.top + dst.height / 2 + (Math.random() * 20 - 10)
        p.style.left = `${sx}px`
        p.style.top = `${sy}px`
        p.style.setProperty('--dx', `${dx - sx}px`)
        p.style.setProperty('--dy', `${dy - sy}px`)
        document.body.appendChild(p)
        window.setTimeout(() => p.remove(), 800)
      }
      if (elapsed >= 1500) clearInterval(iv)
    }, 90)
  }, [])

  const runTransfer = useCallback(() => {
    const s = useGameStore.getState()
    const amount = s.totalFsWinAccumulated
    const startCredits = s.credits
    const glow = document.getElementById('hudGlow')

    const finish = () => {
      useGameStore.getState().setTransfer(startCredits + amount, 0)
      glow?.classList.remove('active')
      useGameStore.getState().setMessage('Fin de Giros Gratis — ¡Ganancias acreditadas!')
    }

    if (reduced || amount <= 0) {
      finish()
      return
    }

    glow?.classList.add('active')
    const proxy = { c: startCredits, f: amount }
    gsap.to(proxy, {
      c: startCredits + amount,
      f: 0,
      duration: 1.5,
      ease: 'power1.inOut',
      onUpdate: () => useGameStore.getState().setTransfer(proxy.c, proxy.f),
      onComplete: finish,
    })
    spawnParticles()
  }, [reduced, spawnParticles])

  // ---------- Al detenerse todos los rodillos ----------
  const handleAllRest = useCallback(() => {
    useGameStore.getState().settleSpin()
    const s = useGameStore.getState()

    if (s.winAmount > 0) {
      const x = s.winAmount / s.bet
      if (x >= 10) {
        sound.bigWin()
        setCelebration({ tier: tierFor(x), amount: s.winAmount })
      } else {
        sound.win()
      }
      sound.coin()
    } else if (!s.pendingFsStart) {
      sound.noWin()
    }

    if (s.pendingFsStart) {
      sound.bonus()
      return
    }
    if (s.inFreeSpinsMode && s.freeSpinsLeft > 0) {
      schedule(doSpin, AUTO_FS_DELAY)
      return
    }
    if (s.inFreeSpinsMode && s.freeSpinsLeft <= 0) {
      useGameStore.getState().endFreeSpins()
      if (useGameStore.getState().totalFsWinAccumulated > 0) {
        useGameStore.getState().setMessage('Transfiriendo ganancias de Giros Gratis…', true)
        runTransfer()
      } else {
        useGameStore.getState().setMessage('Fin de Giros Gratis — ¡buena suerte!')
      }
    }
  }, [doSpin, runTransfer, schedule])

  const handleBeginFreeSpins = useCallback(() => {
    useGameStore.getState().beginFreeSpins()
    doSpin()
  }, [doSpin])

  // ---------- Teclado: Espacio para girar ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        doSpin()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doSpin])

  // ---------- Modales ----------
  const openSettings = () => {
    const s = useGameStore.getState()
    if (s.spinning || s.inFreeSpinsMode || s.pendingFsStart) return
    setSettingsOpen(true)
  }
  const openReset = () => {
    if (useGameStore.getState().spinning) return
    setResetOpen(true)
  }
  const selectDifficulty = (d: Difficulty) => {
    useGameStore.getState().setDifficulty(d)
    useGameStore.getState().setMessage(`Modo ${DIFFICULTY[d].label} activado`)
    schedule(() => setSettingsOpen(false), 350)
  }
  const confirmReset = () => {
    useGameStore.getState().reset()
    setCelebration(null)
    setResetOpen(false)
  }

  const difficulty = useGameStore((s) => s.difficulty)

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-6">
      <div className="cabinet">
        <Marquee onSettings={openSettings} onReset={openReset} />
        <FreeSpinsBanner />

        <div className="relative">
          <Reels spinId={spinId} onAllRest={handleAllRest} onBeginFreeSpins={handleBeginFreeSpins} />
          <WinCelebration data={celebration} reducedMotion={reduced} onDone={() => setCelebration(null)} />
        </div>

        <Hud />
        <Controls onSpin={doSpin} />
        <MessageBar />
        <Paytable />

        <div className="mt-3.5 text-center text-[10px] tracking-wide text-[#4a4560]">
          Juego creado por Gibrann Abdala.
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        difficulty={difficulty}
        onSelect={selectDifficulty}
      />
      <ResetModal open={resetOpen} onOpenChange={setResetOpen} onConfirm={confirmReset} />
    </main>
  )
}
