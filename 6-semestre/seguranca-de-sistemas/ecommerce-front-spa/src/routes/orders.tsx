import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { listOrders } from '../service/orders'
import { SessionGate, ErrorMessage } from '../components/common/feedback'
import { Button } from '../components/common/Button'
import { OrderStatus } from '../components/common/orders/OrderStatus'
import { useSession } from '../hooks/useSession'
import { formatDate, formatMoney, statusSurface } from '../utils/format'

export function OrdersPage() {
  return <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-12"><h1 className="mb-6 text-3xl font-bold">Meus pedidos</h1><SessionGate><OrderList /></SessionGate></div>
}
function OrderList() {
  const [page, setPage] = useState(1)
  const session = useSession()
  const query = useQuery({ queryKey: ['orders', session.data?.id, page], queryFn: () => listOrders(page), retry: false })
  return <>
    {query.isPending && <p role="status">Carregando pedidos…</p>}
    <ErrorMessage error={query.error} />
    {query.isError && <Button tone="info" className="self-start" onClick={() => query.refetch()}>Tentar novamente</Button>}
    {query.data?.data.length === 0 && <p>Nenhum pedido nesta página. <Link to="/" className="action-link">Ver catálogo</Link></p>}
    <div className="space-y-4">{query.data?.data.map((order) => <Link key={order.id} to="/pedidos/$orderId" params={{ orderId: order.id }} className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${statusSurface[order.status]}`}>
      <div><h2 className="font-bold">Pedido {order.id.slice(0, 8)}</h2><p className="mt-1 text-sm text-text-secondary">{formatDate(order.created_at)}</p></div>
      <OrderStatus status={order.status} /><strong>{formatMoney(order.total)}</strong><span className="text-sm font-bold underline underline-offset-4">Ver detalhes →</span>
    </Link>)}</div>
    <nav aria-label="Paginação de pedidos" className="mt-auto flex items-center justify-between gap-2 pt-10">
      <Button tone="neutral" disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)}>Anterior</Button>
      <span className="text-sm text-text-secondary">Página {page} de {Math.max(1, query.data?.pagination.total_pages ?? 1)}</span><Button tone="neutral" disabled={!query.data || page >= query.data.pagination.total_pages || query.isFetching} onClick={() => setPage(page + 1)}>Próxima</Button>
    </nav>
  </>
}
