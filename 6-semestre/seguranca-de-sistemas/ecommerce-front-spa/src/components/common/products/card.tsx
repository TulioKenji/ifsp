import { ProductImage } from '../image/products'
import { ShoppingCart } from 'lucide-react'
import { useCartModal } from '../../../stores/cart-modal'
import { Button } from '../Button'
import { formatMoney } from '../../../utils/format'
import { Link } from '@tanstack/react-router'

export function ProductCard({ product }: { product: Product }) {
  const open = useCartModal((s) => s.open)
  return <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition duration-300 hover:-translate-y-1 hover:border-primary-400 hover:shadow-xl focus-within:ring-2 focus-within:ring-primary-400">
    <Link to="/produtos/$productId" params={{ productId: product.id }} aria-label={`Ver detalhes de ${product.name}`} className="flex flex-1 flex-col after:absolute after:inset-0 after:rounded-2xl">
    <div className="mb-5 aspect-4/3 overflow-hidden rounded-xl bg-background-subtle"><ProductImage product={product} className="size-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transform-none" /></div>
    <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-primary-700">{product.sku}</p>
    <h3 className="text-xl font-bold leading-tight">{product.name}</h3>
    <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">{product.description}</p>
    <div className="mt-auto pt-6"><div className="mb-4 flex items-end justify-between gap-2 border-t border-border pt-4"><p className="text-xl font-bold text-primary-800">{formatMoney(product.price)}</p><span className="text-right text-xs text-text-muted">{product.stock_quantity} em estoque</span></div></div>
    </Link>
    <div className="relative z-10"><Button className="w-full" disabled={product.stock_quantity < 1} onClick={() => open({ mode: 'add', productId: product.id })}><ShoppingCart size={17} />{product.stock_quantity > 0 ? 'Adicionar ao carrinho' : 'Sem estoque'}</Button></div>
  </article>
}
