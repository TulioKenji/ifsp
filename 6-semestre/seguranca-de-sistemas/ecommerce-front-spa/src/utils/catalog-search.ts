export type CatalogSearch = { q?: string }
// Estado de busca compartilhado por URL: header, catálogo, reload e botão Voltar.
export function catalogSearch(value: unknown): CatalogSearch {
  if (typeof value !== 'string') return {}
  const q = value.trim()
  if (!q || new TextEncoder().encode(q).length > 120 || Array.from(q).some((c) => c.charCodeAt(0) < 32 || (c.charCodeAt(0) >= 127 && c.charCodeAt(0) <= 159))) return {}
  return { q }
}
