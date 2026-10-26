export function formatMoney(value: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}
export function formatDate(value: string) { return new Date(value).toLocaleString('pt-BR') }
export const orderStatus = {
  pending: 'Pendente', confirmed: 'Confirmado', processing: 'Em preparação', shipped: 'Enviado',
  delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Reembolsado',
} as const
export const statusSurface = {
  pending: 'border-warning/50 bg-warning-light/40 hover:border-warning',
  confirmed: 'border-info/40 bg-info-light/40 hover:border-info',
  processing: 'border-info/40 bg-info-light/40 hover:border-info',
  shipped: 'border-primary-300 bg-primary-50 hover:border-primary-600',
  delivered: 'border-success/50 bg-success-light/50 hover:border-success-dark',
  cancelled: 'border-danger/40 bg-danger-light/50 hover:border-danger-dark',
  refunded: 'border-border-strong bg-background-subtle hover:border-text-muted',
} satisfies Record<keyof typeof orderStatus, string>
