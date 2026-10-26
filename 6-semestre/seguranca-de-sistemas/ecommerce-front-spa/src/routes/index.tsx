import { useInfiniteQuery } from '@tanstack/react-query'
import { Link, useSearch } from '@tanstack/react-router'
import { ArrowDown, LoaderCircle } from 'lucide-react'
import { PromotionSwiper } from '../components/common/promotions/PromotionSwiper'
import { ProductCard } from '../components/common/products/card'
import { fetchProducts } from '../service/products'

export function ProductsPage() {
  const { q = '' } = useSearch({ from: '/' })
  const productsQuery = useInfiniteQuery({
    queryKey: ['products', q],
    queryFn: ({ pageParam }) => fetchProducts({ page: pageParam, queryparam: q }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.pagination.page < lastPage.pagination.total_pages ? lastPage.pagination.page + 1 : undefined,
  })
  const products = productsQuery.data?.pages.flatMap((page) => page.data) ?? []
  const total = productsQuery.data?.pages[0]?.pagination.total
  return <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-8 lg:px-8 lg:pt-12">
    <PromotionSwiper />
    <section id="produtos" className="scroll-mt-64"><div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-700">Catálogo</p><h2 className="text-3xl font-bold">{q ? `Resultados para “${q}”` : 'Produtos em destaque'}</h2>{total !== undefined && <p className="mt-1 text-sm text-text-muted">{total} itens encontrados</p>}</div>{q && <Link to="/" search={{}} hash="produtos" className="action-link">Limpar busca</Link>}</div>
      {productsQuery.isLoading && <LoadingState />}
      {productsQuery.isError && <div role="alert" className="rounded-xl bg-danger-light p-5 text-danger-dark"><p>{productsQuery.error.message}</p><button onClick={() => productsQuery.refetch()} className="mt-3 rounded-lg px-3 py-2 font-bold underline transition hover:bg-danger-dark hover:text-text-inverse">Tentar novamente</button></div>}
      {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 && <div className="rounded-xl border border-dashed border-border-strong py-20 text-center text-text-muted">Nenhum produto encontrado.</div>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      {productsQuery.hasNextPage && <button type="button" onClick={() => productsQuery.fetchNextPage()} disabled={productsQuery.isFetchingNextPage} className="mx-auto mt-12 flex items-center gap-2 rounded-xl border border-primary-300 px-5 py-3 text-sm font-bold text-primary-800 transition hover:border-primary-700 hover:bg-primary-50 disabled:opacity-60">{productsQuery.isFetchingNextPage ? <LoaderCircle className="animate-spin" size={17} /> : <ArrowDown size={17} />}Carregar mais</button>}
    </section>
  </div>
}
function LoadingState() { return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-xl bg-background-subtle" />)}</div> }