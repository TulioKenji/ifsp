export type InputMask = 'cpf' | 'phone' | 'card' | 'postalCode' | 'month' | 'year'
const digits = (s: string) => s.slice(0, 256).replace(/\D/g, '')
function group(s: string, sizes: number[], separators: string[]) {
  let out = '', offset = 0
  sizes.forEach((size, i) => { const part = s.slice(offset, offset + size); if (part) out += (i ? separators[i - 1] : '') + part; offset += size })
  return out
}
// Só formatação: os schemas e o servidor continuam validando os valores.
export function maskInput(raw: string, mask: InputMask): string {
  const s = digits(raw)
  switch (mask) {
    case 'cpf': return group(s.slice(0, 11), [3, 3, 3, 2], ['.', '.', '-'])
    case 'postalCode': return group(s.slice(0, 8), [5, 3], ['-'])
    case 'month': return s.slice(0, 2)
    case 'year': return s.slice(0, 4)
    case 'card': return /^3[47]/.test(s) ? group(s.slice(0, 15), [4, 6, 5], [' ', ' ']) : group(s.slice(0, 19), [4, 4, 4, 4, 3], [' ', ' ', ' ', ' '])
    case 'phone': {
      const international = raw.trim().startsWith('+') || (s.startsWith('55') && s.length > 11)
      if (international && !s.startsWith('55')) return '+' + s.slice(0, 13)
      const local = (international ? s.slice(2) : s).slice(0, 11)
      const prefix = international ? '+55' : ''
      if (!local) return prefix
      const subscriber = local.slice(2), split = local.length > 10 ? 5 : 4
      return prefix + (prefix ? ' ' : '') + '(' + local.slice(0, 2) + (subscriber ? ') ' + group(subscriber, [split, 4], ['-']) : '')
    }
  }
}
// A posição acompanha a quantidade de dígitos, inclusive ao colar/editar no meio.
export function maskedCursor(raw: string, cursor: number, formatted: string) {
  const count = digits(raw.slice(0, cursor)).length
  if (count === 0) return raw.trim().startsWith('+') ? Math.min(cursor, formatted.length) : 0
  let seen = 0
  for (let i = 0; i < formatted.length; i++) if (/\d/.test(formatted[i]) && ++seen === count) return i + 1
  return formatted.length
}
export function deleteMaskedSeparator(value: string, cursor: number, key: string): { raw: string; cursor: number } | undefined {
  let index = key === 'Backspace' ? cursor - 1 : cursor
  if (index < 0 || index >= value.length || /\d/.test(value[index])) return
  const direction = key === 'Backspace' ? -1 : 1
  while (index >= 0 && index < value.length && !/\d/.test(value[index])) index += direction
  if (index < 0 || index >= value.length) return
  return { raw: value.slice(0, index) + value.slice(index + 1), cursor: key === 'Backspace' ? index : cursor }
}
