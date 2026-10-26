import * as v from 'valibot'
const blocked = new Set(['__proto__', 'constructor', 'prototype'])
function segments(path: string) {
  const parts = path.split('.')
  if (!path || path.length > 256 || parts.length > 8 || parts.some((s) => !s || blocked.has(s) || (/^\d+$/.test(s) && Number(s) > 49))) throw new Error('Caminho de formulário inválido')
  return parts
}
export function getField(value: unknown, path: string): unknown {
  let current = value
  for (const key of segments(path)) {
    if (!current || typeof current !== 'object' || !Object.hasOwn(current, key)) return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}
export function setField<T>(value: T, path: string, next: unknown): T {
  const parts = segments(path)
  const update = (node: unknown, depth: number): unknown => {
    const copy: Record<string, unknown> | unknown[] = Array.isArray(node) ? [...node] : typeof node === 'object' && node !== null ? { ...node } : /^\d+$/.test(parts[depth]) ? [] : {}
    const key = parts[depth]
    const source = copy as Record<string, unknown>
    source[key] = depth === parts.length - 1 ? next : update(source[key], depth + 1)
    return copy
  }
  return update(value, 0) as T
}
export function validateForm<T>(schema: v.GenericSchema<unknown, T>, values: unknown) {
  const result = v.safeParse(schema, values)
  const errors: Record<string, string> = {}
  if (!result.success) for (const issue of result.issues) {
    const path = issue.path?.map((p) => p.key).join('.') ?? '_form'
    if (!errors[path]) errors[path] = issue.message
  }
  return { errors, data: result.success ? result.output : undefined, success: result.success }
}
