import { useState, type FormEvent } from 'react'
import type * as v from 'valibot'
import { getField, setField, validateForm } from '../utils/form-state'

// Caminhos como addresses.0.city permitem mapas/arrays; steps mantém valores ao trocar página.
export function useForm<T>({ initial, schema, steps = [] }: { initial: T; schema: v.GenericSchema<unknown, T>; steps?: string[][] }) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  function field(path: string) {
    return { name: path, value: String(getField(values, path) ?? ''), error: errors[path], onChange: (value: string) => {
      setValues((current) => setField(current, path, value))
      setErrors((current) => { const next = { ...current }; delete next[path]; return next })
    } }
  }
  function next() {
    if (steps.length === 0) return
    const result = validateForm(schema, values)
    const active = Object.fromEntries(Object.entries(result.errors).filter(([path]) => steps[step]?.some((p) => path === p || path.startsWith(p + '.'))))
    setErrors(active)
    if (Object.keys(active).length === 0) setStep((n) => Math.min(n + 1, steps.length - 1))
  }
  function submit(callback: (data: T) => void) {
    return (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const result = validateForm(schema, values)
      setErrors(result.errors)
      if (result.success) callback(result.data as T)
      else {
        const first = Object.keys(result.errors)[0]
        const index = steps.findIndex((group) => group.some((p) => first === p || first.startsWith(p + '.')))
        if (index >= 0) setStep(index)
      }
    }
  }
  return { values, errors, step, field, submit, next, back: () => setStep((n) => Math.max(0, n - 1)),
    setValue: (path: string, value: unknown) => { setValues((current) => setField(current, path, value)); setErrors((current) => { const next = { ...current }; delete next[path]; return next }) },
    append: (path: string, value: unknown, max = 20) => { setValues((current) => { const list = getField(current, path); return Array.isArray(list) && list.length < Math.min(max, 50) ? setField(current, path, [...list, value]) : current }); setErrors({}) },
    remove: (path: string, index: number) => { setValues((current) => { const list = getField(current, path); return Array.isArray(list) && Number.isInteger(index) && index >= 0 ? setField(current, path, list.filter((_, i) => i !== index)) : current }); setErrors({}) },
  }
}
