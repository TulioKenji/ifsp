import { orderStatus } from '../../../utils/format'

const badge = {
  pending: 'bg-warning-light text-warning-dark', confirmed: 'bg-info-light text-info-dark',
  processing: 'bg-info-light text-info-dark', shipped: 'bg-primary-100 text-primary-800',
  delivered: 'bg-success-light text-success-dark', cancelled: 'bg-danger-light text-danger-dark',
  refunded: 'bg-border text-text-secondary',
}
export function OrderStatus({ status }: { status: keyof typeof orderStatus }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${badge[status]}`}>{orderStatus[status]}</span>
}
