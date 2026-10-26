import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, PackageCheck, ShoppingCart, Truck } from 'lucide-react'
import { fetchProduct } from '../service/products'
import { useCart } from '../stores/cart'
import { useCartModal } from '../stores/cart-modal'
import { formatMoney } from '../utils/format'
import { ProductGallery } from '../components/common/products/ProductGallery'
import { Button } from '../components/common/Button'
import { ErrorMessage } from '../components/common/feedback'

export function ProductDetailPage() {
  const { productId } = useParams({ from: '/produtos/$productId' })
  const query = useQuery({ queryKey: ['product-detail', productId], queryFn: () => fetchProduct(productId), retry: false })
  return <div className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-12"><nav aria-label="Navegação do produto" className="mb-7 flex flex-wrap items-center gap-2 text-sm text-text-muted"><Link to="/" className="action-link">Catálogo</Link><span aria-hidden="true">/</span><span>{query.data?.name ?? 'Produto'}</span></nav>
    {query.isPending && <div role="status" className="rounded-2xl border border-border bg-surface p-12 text-center">Carregando detalhes do produto…</div>}
    <ErrorMessage error={query.error} />{query.isError && <Button tone="info" onClick={() => query.refetch()}>Tentar novamente</Button>}
    {query.data && <ProductDetails key={query.data.id} product={query.data} />}
  </div>
}
function ProductDetails({ product }: { product: ProductDetail }) {
  const open = useCartModal((s) => s.open), cart = useCart()
  const units = cart.items.reduce((sum, i) => sum + i.quantity, 0)
  return <>
    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12"><ProductGallery name={product.name} images={product.url} />
      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-700">{product.sku ?? 'Seleção GreenStore'}</p><h1 className="text-3xl font-bold leading-tight sm:text-4xl">{product.name}</h1><p className={`mt-4 flex items-center gap-2 text-sm font-bold ${product.stock_quantity > 0 ? 'text-success-dark' : 'text-danger-dark'}`}><PackageCheck size={18} />{product.stock_quantity > 0 ? `${product.stock_quantity} unidades em estoque` : 'Produto sem estoque'}</p>
        <div className="my-7 border-y border-border py-6"><p className="text-sm text-text-muted">Preço por unidade</p><p className="mt-1 text-4xl font-bold tracking-tight text-primary-800">{formatMoney(product.price)}</p><p className="mt-3 flex items-center gap-2 text-sm text-text-secondary"><Truck size={17} />Frete grátis</p></div>
        {Object.entries(product.options).map(([key, values]) => <div key={key} className="mb-4"><h2 className="mb-2 text-sm font-bold capitalize">{key}</h2><div className="flex flex-wrap gap-2">{values.map((value) => <span key={value} className="rounded-lg border border-border bg-background-subtle px-3 py-1.5 text-sm">{value}</span>)}</div></div>)}
        <p className="mb-5 text-sm leading-6 text-text-muted">Confirme quantidade e opções no próximo passo. {units > 0 ? `Seu carrinho já tem ${units} unidade(s). Esses itens serão mantidos na compra.` : 'Você poderá escolher endereço e cartão no carrinho.'}</p>
        <div className="space-y-3"><Button className="w-full py-4" disabled={!product.active || product.stock_quantity < 1 || cart.busy} onClick={() => open({ mode: 'add', productId: product.id, afterAdd: 'checkout' })}>Comprar agora<ArrowRight size={18} /></Button><Button tone="info" className="w-full py-4" disabled={!product.active || product.stock_quantity < 1 || cart.busy} onClick={() => open({ mode: 'add', productId: product.id })}><ShoppingCart size={18} />Adicionar ao carrinho</Button></div>
      </section>
    </div>
    <section className="mt-10 rounded-3xl border border-border bg-surface p-6 sm:p-8"><h2 className="mb-4 text-2xl font-bold">Sobre o produto</h2><p className="whitespace-pre-line break-words leading-8 text-text-secondary">{product.description || 'Este produto ainda não possui uma descrição detalhada.'}</p><dl className="mt-7 grid gap-5 border-t border-border pt-6 sm:grid-cols-2"><div><dt className="text-sm text-text-muted">Código do produto</dt><dd className="mt-1 font-bold">{product.sku ?? 'Não informado'}</dd></div><div><dt className="text-sm text-text-muted">Disponibilidade</dt><dd className="mt-1 font-bold">{product.stock_quantity > 0 ? 'Disponível para pedido' : 'Indisponível'}</dd></div></dl></section>
  </>
}
