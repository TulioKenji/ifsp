import { Search as SearchIcon } from 'lucide-react'

interface SearchProps {
	value: string
	onChange: (value: string) => void
	onSearch: () => void
	error?: string
}

export function Search({ value, onChange, onSearch, error }: SearchProps) {
	return (
		<div className="w-full">
		<div className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-2 shadow-sm">
			<SearchIcon className="ml-3 shrink-0 text-text-muted" size={20} aria-hidden="true" />
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted sm:text-base"
				placeholder="Buscar por nome, descrição ou SKU"
				aria-label="Buscar produtos"
			/>
			<button type="button" onClick={onSearch} className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-bold text-text-inverse transition hover:bg-primary-800 sm:px-6">
				Buscar
			</button>
		</div>
		{error && <p className="mt-2 text-xs text-danger-dark">{error}</p>}
		</div>
	)
}
