import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ title, onClose, children, closeOnBackdrop = true, busy = false }: { title: string; onClose: () => void; children: ReactNode; closeOnBackdrop?: boolean; busy?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const previous = document.activeElement
    const element = dialog.current
    element?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { element?.close(); document.body.style.overflow = overflow; if (previous instanceof HTMLElement) previous.focus() }
  }, [])
  return <dialog ref={dialog} aria-labelledby={id} aria-busy={busy} onCancel={(e) => { e.preventDefault(); if (!busy) onClose() }} onClick={(e) => { if (closeOnBackdrop && !busy && e.target === e.currentTarget) onClose() }} className="app-modal m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-2xl border border-border bg-surface p-0 text-text-primary shadow-2xl backdrop:bg-background-dark/70 backdrop:backdrop-blur-sm">
    <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5"><h2 id={id} className="text-xl font-bold">{title}</h2><button type="button" onClick={onClose} disabled={busy} aria-label="Fechar modal" className="rounded-full p-2 text-text-muted transition hover:bg-danger-light hover:text-danger-dark focus-visible:outline-primary-600 disabled:opacity-40"><X size={20} /></button></div>
    <div className="p-6">{children}</div>
  </dialog>
}
