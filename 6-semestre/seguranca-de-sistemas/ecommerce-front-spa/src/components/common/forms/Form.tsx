import { useId, useLayoutEffect, useRef, type FormHTMLAttributes, type InputHTMLAttributes } from 'react'
import { maskInput, maskedCursor, deleteMaskedSeparator, type InputMask } from '../../../utils/input-masks'

export function Form(props: FormHTMLAttributes<HTMLFormElement>) { return <form {...props} noValidate /> }

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string; value: string; onChange: (value: string) => void; error?: string; options?: { value: string; label: string }[]
  mask?: InputMask
}
export function Field({ label, error, options, onChange, required, value, mask, className = '', ...props }: FieldProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null), caret = useRef<number | null>(null)
  const displayed = mask ? maskInput(value, mask) : value
  useLayoutEffect(() => { if (caret.current !== null && input.current === document.activeElement) input.current?.setSelectionRange(caret.current, caret.current); caret.current = null }, [displayed])
  function change(element: HTMLInputElement, raw: string, cursor: number) {
    if (!mask) { onChange(raw); return }
    const next = maskInput(raw, mask), position = maskedCursor(raw, cursor, next)
    caret.current = position
    element.value = next; element.setSelectionRange(position, position)
    onChange(next)
  }
  const inputClass = `mt-2 block w-full rounded-xl border bg-surface px-3.5 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary-600 focus:ring-4 focus:ring-primary-100 disabled:bg-background-subtle ${error ? 'border-danger ring-1 ring-danger-light' : 'border-border-strong hover:border-primary-400'} ${className}`
  return <div><label htmlFor={id} className="block text-sm font-bold text-text-secondary">{label}{required && <span aria-hidden="true" className="ml-1 text-danger-dark">*</span>}</label>
    {options ? <select id={id} name={props.name} value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={props.disabled} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={inputClass}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select> : <input {...props} ref={input} id={id} value={displayed} required={required} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={(e) => change(e.target, e.target.value, e.target.selectionStart ?? e.target.value.length)} onKeyDown={(e) => {
      props.onKeyDown?.(e)
      if (e.defaultPrevented || !mask || e.ctrlKey || e.metaKey || !['Backspace', 'Delete'].includes(e.key) || e.currentTarget.selectionStart !== e.currentTarget.selectionEnd) return
      const edit = deleteMaskedSeparator(displayed, e.currentTarget.selectionStart ?? 0, e.key)
      if (edit) { e.preventDefault(); change(e.currentTarget, edit.raw, edit.cursor) }
    }} className={inputClass} />}
    {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger-dark">{error}</p>}
  </div>
}
