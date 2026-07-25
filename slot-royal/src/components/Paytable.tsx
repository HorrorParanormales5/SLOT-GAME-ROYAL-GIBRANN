import { useState } from 'react'

function Mini({ style, children }: { style: React.CSSProperties; children?: React.ReactNode }) {
  return (
    <span
      className="mr-1.5 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px]"
      style={style}
    >
      {children}
    </span>
  )
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[#1e1a2b] py-1 text-text-soft last:border-b-0">
      <span className="flex items-center">{left}</span>
      <span>{right}</span>
    </div>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display mb-1.5 mt-2.5 text-[12px] uppercase tracking-wider text-gold-light first:mt-0">
      {children}
    </h3>
  )
}

export function Paytable() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-2.5 block w-full cursor-pointer text-center text-[11px] tracking-wide text-text-dim underline"
        aria-expanded={open}
      >
        {open ? 'Ocultar tabla de pagos' : 'Ver tabla de pagos'}
      </button>

      {open && (
        <div className="mt-2.5 rounded-xl border border-[#2c2740] bg-[#0d0b13] p-3 text-[11px]">
          <Heading>Símbolos Wilds (Comodines)</Heading>
          <Row
            left={
              <>
                <Mini style={{ background: 'radial-gradient(circle at 35% 30%,#e3c1ff,#a855f7 55%,#3d0f66)' }}>●</Mini>
                Púrpura (Wild)
              </>
            }
            right="12 / 30 / 100"
          />
          <Row
            left={
              <>
                <Mini style={{ background: 'radial-gradient(circle at 35% 30%,#a9c9ff,#3b82f6 55%,#0a2b6e)' }}>●</Mini>
                Azul (Wild)
              </>
            }
            right="8 / 20 / 60"
          />
          <Row
            left={
              <>
                <Mini style={{ background: 'radial-gradient(circle at 35% 30%,#6cf7bf,#10b981 55%,#054c37)' }}>●</Mini>
                Verde (Wild)
              </>
            }
            right="5 / 15 / 40"
          />

          <Heading>Letras (× apuesta)</Heading>
          <Row
            left={
              <>
                <Mini style={{ background: 'linear-gradient(160deg,#f4d35e,#d4af37)', color: '#2a1c05' }}>A</Mini>
                J · Q · K · A
              </>
            }
            right="1 / 3 / 8"
          />

          <Heading>Números 0, 2–9 (× apuesta)</Heading>
          <Row left="3 en línea" right="0.4×" />
          <Row left="4 en línea" right="1×" />
          <Row left="5 en línea" right="2.5×" />

          <Heading>🍀 Trébol (Scatter)</Heading>
          <Row left="3 en cualquier parte" right="2× + 5 Giros Gratis" />
          <Row left="4 en cualquier parte" right="5× + 10 Giros Gratis" />
          <Row left="5 o más en cualquier parte" right="20× + 16 Giros Gratis" />
          <p className="pt-2 text-text-dim">Durante Giros Gratis los premios pagan ×2</p>
        </div>
      )}
    </>
  )
}
