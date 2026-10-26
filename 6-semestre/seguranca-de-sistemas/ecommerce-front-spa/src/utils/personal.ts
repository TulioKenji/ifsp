export function cpfDigits(raw: string): string | undefined {
  if (raw.length > 32 || /[^\d.\- ]/.test(raw)) return
  const s = raw.replace(/\D/g, '')
  if (s.length !== 11 || /^(\d)\1+$/.test(s)) return
  for (let end = 9; end <= 10; end++) {
    let sum = 0
    for (let i = 0; i < end; i++) sum += Number(s[i]) * (end + 1 - i)
    const digit = (sum * 10) % 11
    if ((digit === 10 ? 0 : digit) !== Number(s[end])) return
  }
  return s
}
export function phoneDigits(raw: string): string | undefined {
  if (raw.length > 32 || /[^\d+()\- ]/.test(raw)) return
  if ((raw.match(/\+/g)?.length ?? 0) > 1 || (raw.includes('+') && !raw.trim().startsWith('+'))) return
  let s = raw.replace(/\D/g, '')
  if (raw.trim().startsWith('+')) { if (!raw.trim().startsWith('+55')) return; s = s.slice(2) }
  if (!/^[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/.test(s)) return
  return '+55' + s
}
export function cardBrand(raw: string): string | undefined {
  if (raw.length > 32 || /[^\d -]/.test(raw)) return
  const s = raw.replace(/[ -]/g, '')
  if (s.length < 13 || s.length > 19 || /^(\d)\1+$/.test(s)) return
  let sum = 0
  for (let i = s.length - 1; i >= 0; i--) { let n = Number(s[i]); if ((s.length - 1 - i) % 2 === 1) { n *= 2; if (n > 9) n -= 9 }; sum += n }
  if (sum % 10 !== 0) return
  if (/^4/.test(s) && [13, 16, 19].includes(s.length)) return 'Visa'
  if (s.length === 16 && ((Number(s.slice(0, 2)) >= 51 && Number(s.slice(0, 2)) <= 55) || (Number(s.slice(0, 4)) >= 2221 && Number(s.slice(0, 4)) <= 2720))) return 'Mastercard'
  if (s.length === 15 && /^3[47]/.test(s)) return 'Amex'
}
export function cardExpired(month: number, year: number, now = new Date()) { return year < now.getUTCFullYear() || (year === now.getUTCFullYear() && month < now.getUTCMonth() + 1) }
