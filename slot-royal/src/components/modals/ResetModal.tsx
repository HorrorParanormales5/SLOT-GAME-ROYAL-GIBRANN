import * as Dialog from '@radix-ui/react-dialog'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
}

export function ResetModal({ open, onOpenChange, onConfirm }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          <Dialog.Title className="font-display mb-1 text-center text-base uppercase tracking-wider text-gold-light">
            Reiniciar juego
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-center text-[11px] text-text-dim">
            Esto restablecerá tus créditos a 50,000 y la apuesta al mínimo.
          </Dialog.Description>

          <div className="flex gap-2.5">
            <Dialog.Close asChild>
              <button className="font-display flex-1 cursor-pointer rounded-[10px] border border-[#2c2740] bg-transparent px-3 py-2.5 text-[12px] uppercase tracking-wide text-text-soft">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={onConfirm}
              className="font-display flex-1 cursor-pointer rounded-[10px] border-none px-3 py-2.5 text-[12px] font-bold uppercase tracking-wide text-[#2a1c05]"
              style={{ background: 'linear-gradient(160deg,var(--color-gold-light),var(--color-gold))' }}
            >
              Reiniciar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
