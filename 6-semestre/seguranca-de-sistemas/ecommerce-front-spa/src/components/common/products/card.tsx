import { ProductImage } from '../image/products'

export function ProductCard({ product }: { product: Product }) {
	return (
		<article className="group flex min-h-72 flex-col justify-between rounded-xl border border-border bg-surface p-5 transition hover:-translate-y-1 hover:border-border-green hover:shadow-lg">
			<div>
				<div className="mb-5 aspect-4/3 overflow-hidden rounded-lg bg-background-subtle">
					<ProductImage product={product} className="size-full object-cover transition duration-300 group-hover:scale-105" />
				</div>
				<p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-700">{product.sku}</p>
				<h3 className="text-xl font-bold leading-tight text-text-primary">{product.name}</h3>
				<p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">{product.description}</p>
			</div>
			<div className="mt-8 flex items-end justify-between gap-3 border-t border-border-subtle pt-4">
				<p className="text-lg font-bold text-primary-800">R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
				<span className="text-right text-xs text-text-muted">{product.stock_quantity} em estoque</span>
			</div>
		</article>
	)
}
