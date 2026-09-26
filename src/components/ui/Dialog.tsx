import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'

type DialogProps = {
  open: boolean
  onClose: () => void
  /**
   * sheet  — bottom sheet on phones, right-hand drawer from tablet up
   * center — centred card
   * full   — full-screen overlay (menu, lightbox)
   */
  variant?: 'sheet' | 'center' | 'full'
  labelledBy?: string
  label?: string
  className?: string
  children: ReactNode
}

const variants = {
  sheet:
    'inset-x-0 bottom-0 top-auto w-full max-h-[min(92dvh,60rem)] rounded-t-[1.75rem] bg-paper shadow-lift open:animate-[sheet-in_0.5s_var(--ease-soft)_both] data-closing:animate-[sheet-out_0.28s_ease-in_both] md:inset-y-0 md:left-auto md:right-0 md:h-dvh md:max-h-none md:w-[31rem] md:rounded-none md:rounded-l-[1.75rem] md:open:animate-[drawer-in_0.5s_var(--ease-soft)_both] md:data-closing:animate-[drawer-out_0.28s_ease-in_both]',
  center:
    'inset-0 m-auto h-fit max-h-[92dvh] w-[min(100%-1.5rem,36rem)] rounded-[1.75rem] bg-paper shadow-lift open:animate-[zoom-in_0.35s_var(--ease-soft)_both] data-closing:animate-[fade-out_0.2s_ease_both]',
  full: 'inset-0 h-dvh w-full bg-transparent open:animate-[fade-in_0.3s_ease_both] data-closing:animate-[fade-out_0.22s_ease_both]',
}

/**
 * Native <dialog> (focus trap, Esc, top layer, inert page) with enter/exit
 * animations. Children only render while open, so closed dialogs add nothing
 * to the prerendered HTML.
 */
export function Dialog({ open, onClose, variant = 'sheet', labelledBy, label, className = '', children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [mounted, setMounted] = useState(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const openRef = useRef(open)
  openRef.current = open

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open) {
      setMounted(true)
      if (!dialog.open) {
        dialog.removeAttribute('data-closing')
        dialog.showModal()
        requestAnimationFrame(() => {
          const target = dialog.querySelector<HTMLElement>('[data-autofocus]') ?? dialog
          target.focus({ preventScroll: true })
        })
      }
      return
    }

    if (!dialog.open) return
    dialog.setAttribute('data-closing', '')
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      window.clearTimeout(timer)
      dialog.removeEventListener('animationend', onEnd)
      dialog.removeAttribute('data-closing')
      dialog.close()
      setMounted(false)
    }
    const onEnd = (e: AnimationEvent) => {
      if (e.target === dialog && !e.pseudoElement) finish()
    }
    const timer = window.setTimeout(finish, 420)
    dialog.addEventListener('animationend', onEnd)
    return () => {
      // Re-opened mid-animation: cancel the pending close.
      if (finished) return
      finished = true
      window.clearTimeout(timer)
      dialog.removeEventListener('animationend', onEnd)
      dialog.removeAttribute('data-closing')
    }
  }, [open])

  // Keep React state in sync if the browser closes the dialog on its own.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onNativeClose = () => {
      if (openRef.current) onCloseRef.current()
      setMounted(false)
    }
    const onCancel = (e: Event) => {
      e.preventDefault()
      onCloseRef.current()
    }
    dialog.addEventListener('close', onNativeClose)
    dialog.addEventListener('cancel', onCancel)
    return () => {
      dialog.removeEventListener('close', onNativeClose)
      dialog.removeEventListener('cancel', onCancel)
    }
  }, [])

  // Close on a click that starts and ends on the backdrop.
  const downOnBackdrop = useRef(false)
  const isBackdrop = (e: MouseEvent) => {
    const dialog = ref.current
    if (!dialog || e.target !== dialog) return false
    const r = dialog.getBoundingClientRect()
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-label={label}
      tabIndex={-1}
      onPointerDown={(e) => (downOnBackdrop.current = isBackdrop(e))}
      onClick={(e) => {
        if (downOnBackdrop.current && isBackdrop(e)) onClose()
        downOnBackdrop.current = false
      }}
      className={`fixed m-0 overflow-hidden border-0 p-0 text-chocolate outline-none ${variants[variant]} ${className}`}
    >
      {(open || mounted) && children}
    </dialog>
  )
}
