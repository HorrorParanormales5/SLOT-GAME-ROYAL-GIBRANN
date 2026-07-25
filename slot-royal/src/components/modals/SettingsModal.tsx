import * as Dialog from '@radix-ui/react-dialog'
import type { Difficulty } from '@/engine'

interface Option {
  key: Difficulty
  title: string
  desc: string
}

const OPTIONS: Option[] = [
  { key: 'facil', title: 'Fácil', desc: 'Números de la suerte: 2, 3, 4, 5, 6, 7. Mayor probabilidad de premios y bonus.' },
  { key: 'medio', title: 'Medio', desc: 'Números de la suerte: 0, 2, 4, 7. Probabilidad equilibrada de premios y bonus.' },
  { key: 'dificil', title: 'Difícil', desc: 'Números de la suerte: 3, 9. Menor probabilidad, premios más ocasionales.' },
]

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  difficulty: Difficulty
  onSelect: (d: Difficulty) => void
}

export function SettingsModal({ open, onOpenChange, difficulty, onSelect }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          <Dialog.Title className="font-display mb-1 text-center text-base uppercase tracking-wider text-gold-light">
            Configuración
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-center text-[11px] text-text-dim">
            Elige el nivel de dificultad de pago
          </Dialog.Description>

          {OPTIONS.map((o) => (
            <button
              key={o.key}
              className={`diff-option${difficulty === o.key ? ' selected' : ''}`}
              onClick={() => onSelect(o.key)}
            >
              <div className="font-display flex items-center justify-between text-[13px] uppercase tracking-wide text-white">
                {o.title}
                <span className={difficulty === o.key ? 'text-gold-light' : 'text-transparent'}>✓</span>
              </div>
              <div className="mt-1 text-[11px] leading-relaxed text-text-dim">{o.desc}</div>
            </button>
          ))}

          <Dialog.Close asChild>
            <button className="mt-1.5 block w-full cursor-pointer rounded-[10px] border border-[#2c2740] bg-transparent px-3 py-2.5 text-[12px] uppercase tracking-wide text-text-soft hover:border-gold-dim">
              Cerrar
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
