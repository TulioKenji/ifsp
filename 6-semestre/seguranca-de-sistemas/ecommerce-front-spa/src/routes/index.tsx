import { useInfiniteQuery } from '@tanstack/react-query'
import { ArrowDown, LoaderCircle, Sparkles } from 'lucide-react'
import * as v from 'valibot'
import { useState } from 'react'
import logoFull from '../assets/logo-full.png'
import { ProductCard } from '../components/common/products/card'
import { Search } from '../components/common/inputs'
import callApi from '../service/callApi'
import { ProductQueryParamsRequestSchema, ProductResponseSchema, ProductSearchSchema } from '../schemas/products'
import { parseForm } from '../utils/parseForm'

async function fetchProducts({ page, queryparam }: APIQueryParamsRequest): Promise<APIQueryParamsResponse<Product>> {
	const request = v.parse(ProductQueryParamsRequestSchema, { page: page ?? 1, size: 20, field: 'all', queryparam })
	const params = new URLSearchParams({ page: String(request.page), size: String(request.size), field: request.field ?? 'all' })
	if (request.queryparam) params.set('queryparam', request.queryparam)

	const result = await callApi<APIQueryParamsResponse<Product>>({ url: `products?${params}` })
	if (!result.data) throw new Error(result.error ?? 'Não foi possível carregar os produtos.')
	return v.parse(ProductResponseSchema, result.data)
}

export function ProductsPage() {
	const [inputValue, setInputValue] = useState('')
	const [search, setSearch] = useState('')
	const [searchError, setSearchError] = useState<string>()
	const productsQuery = useInfiniteQuery({
		queryKey: ['products', search],
		queryFn: ({ pageParam }) => fetchProducts({ page: pageParam, queryparam: search }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => lastPage.pagination.page < lastPage.pagination.total_pages ? lastPage.pagination.page + 1 : undefined,
	})

	const products = productsQuery.data?.pages.flatMap((page) => page.data) ?? []
	const total = productsQuery.data?.pages[0]?.pagination.total

	function handleSearch() {
		const validation = parseForm(ProductSearchSchema, { queryparam: inputValue })
		if (!validation.success) {
			setSearchError(validation.errors?.queryparam)
			return
		}
		setSearchError(undefined)
		setSearch(inputValue.trim())
	}

	return (
		<div className="mx-auto max-w-7xl px-5 pb-20 pt-8 lg:px-8 lg:pt-12">
			<section className="relative mb-12 overflow-hidden rounded-2xl bg-surface-dark px-6 py-10 text-text-inverse shadow-xl sm:px-10 lg:flex lg:min-h-80 lg:items-center lg:justify-between lg:px-16">
				<div className="relative z-10 max-w-xl">
					<p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-hulk"><Sparkles size={15} /> Tecnologia ao seu alcance</p>
					<h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Potência para o que vem pela frente.</h1>
					<p className="mt-5 max-w-lg text-base leading-7 text-text-dark">Encontre hardware, acessórios e soluções para transformar suas ideias em realidade.</p>
				</div>
				<img src={logoFull} alt="GreenStore Tecnologia ao seu alcance" className="relative z-10 mt-8 w-full max-w-sm rounded-xl object-contain lg:mt-0 lg:w-80" />
			</section>

			<section id="produtos">
				<div className="mb-5 flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
					<div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-700">Catálogo</p><h2 className="text-3xl font-bold text-text-primary">Produtos em destaque</h2>{total !== undefined && <p className="mt-1 text-sm text-text-muted">{total} itens encontrados</p>}</div>
					<div className="w-full sm:max-w-md"><Search value={inputValue} onChange={setInputValue} onSearch={handleSearch} error={searchError} /></div>
				</div>

				{productsQuery.isLoading && <LoadingState />}
				{productsQuery.isError && <p className="rounded-xl border border-danger-light bg-danger-light p-5 text-danger-dark">{productsQuery.error.message}</p>}
				{!productsQuery.isLoading && !productsQuery.isError && products.length === 0 && <EmptyState />}
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
				{productsQuery.hasNextPage && <button type="button" onClick={() => productsQuery.fetchNextPage()} disabled={productsQuery.isFetchingNextPage} className="mx-auto mt-12 flex items-center gap-2 rounded-lg border border-primary-300 px-5 py-3 text-sm font-bold text-primary-800 transition hover:border-primary-700 disabled:cursor-wait disabled:opacity-60">{productsQuery.isFetchingNextPage ? <LoaderCircle className="animate-spin" size={17} /> : <ArrowDown size={17} />} Carregar mais</button>}
			</section>
		</div>
	)
}

function LoadingState() { return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-xl bg-background-subtle" />)}</div> }
function EmptyState() { return <div className="rounded-xl border border-dashed border-border-strong py-20 text-center text-text-muted">Nenhum produto encontrado.</div> }
