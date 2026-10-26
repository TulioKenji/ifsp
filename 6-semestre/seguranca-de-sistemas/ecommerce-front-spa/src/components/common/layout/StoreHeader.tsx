import { useId, useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { ArrowRight, CircuitBoard, Package, Search, ShoppingCart, TicketPercent, Truck, UserRound } from 'lucide-react'
import logo from '../../../assets/logo-transparent.png'
import { useCart } from '../../../stores/cart'
import { useSession } from '../../../hooks/useSession'
import { catalogSearch } from '../../../utils/catalog-search'

export function StoreHeader() {
  const cart = useCart(), session = useSession()
  const search = useRouterState({ select: (s) => s.location.search })
  const q = 'q' in search && typeof search.q === 'string' ? search.q : ''
  const units = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const iconLink = 'flex min-h-11 items-center gap-2 rounded-xl px-2.5 py-2 text-text-dark transition hover:bg-primary-900 hover:text-hulk focus-visible:outline-hulk'
  return <header className="sticky top-0 z-30 border-b border-primary-800 bg-surface-dark text-text-inverse shadow-lg">
    <div className="border-b border-primary-900 bg-background-dark"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2 text-[11px] sm:text-xs lg:px-8"><p className="flex items-center gap-2 text-primary-200"><Truck size={14} />Frete grátis para seu próximo upgrade</p><Link to="/" search={{}} hash="promocoes" className="hidden items-center gap-2 text-text-dark hover:text-hulk sm:flex"><TicketPercent size={14} />GREEN10: 10% OFF até R$ 50<ArrowRight size={12} /></Link></div></div>
    <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-5 py-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-6 lg:px-8">
      <Link to="/" search={{}} aria-label="GreenStore — início" className="order-1 shrink-0 rounded-lg"><img src={logo} alt="GreenStore" className="h-12 w-28 object-contain sm:h-14 sm:w-36 transition-transform duration-300 hover:scale-105 lg:w-44" /></Link>
      <div className="order-3 col-span-2 min-w-0 md:order-2 md:col-span-1"><HeaderSearch key={q} initial={q} /></div>
      <nav aria-label="Área do cliente" className="order-2 flex items-center gap-1 md:order-3">
        <Link to="/conta" className={iconLink} aria-label="Minha conta"><UserRound size={22} /><span className="hidden max-w-28 text-xs leading-5 lg:block"><span className="block truncate text-text-muted">{session.data ? `Olá, ${session.data.name.split(' ')[0]}` : 'Bem-vindo!'}</span><strong>Minha conta</strong></span></Link>
        <Link to="/pedidos" className={iconLink} aria-label="Meus pedidos"><Package size={22} /><span className="hidden text-xs leading-5 xl:block"><span className="block text-text-muted">Acompanhe</span><strong>Seus pedidos</strong></span></Link>
        <Link to="/cart" className={`${iconLink} border border-primary-800 bg-primary-900/40`} aria-label={`Carrinho com ${units} itens`}><span className="relative"><ShoppingCart size={23} /><span className="absolute -top-2 -right-2 flex min-w-4 items-center justify-center rounded-full bg-hulk px-1 text-[10px] font-bold text-primary-900">{units}</span></span><strong className="ml-1 hidden text-xs lg:block">Carrinho</strong></Link>
      </nav>
    </div>
    <nav aria-label="Navegação da loja" className="border-t border-primary-900"><div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-1.5 text-xs font-bold whitespace-nowrap sm:text-sm lg:px-6">
      <Link to="/" search={{}} hash="produtos" className="flex items-center gap-2 rounded-lg px-3 py-2 text-hulk transition hover:bg-primary-900"><CircuitBoard size={17} />Todo o catálogo</Link>
      {[{ label: 'Teclados', q: 'teclado' }, { label: 'Mouses', q: 'mouse' }, { label: 'Áudio', q: 'headset' }, { label: 'Armazenamento', q: 'ssd' }].map((item) => <Link key={item.q} to="/" search={{ q: item.q }} hash="produtos" className="rounded-lg px-3 py-2 text-text-dark hover:bg-primary-900 hover:text-hulk">{item.label}</Link>)}
      <Link to="/" search={{}} hash="promocoes" className="ml-auto flex items-center gap-2 rounded-lg px-3 py-2 text-primary-200 hover:bg-primary-900 hover:text-hulk"><TicketPercent size={16} />Cupons e vantagens</Link>
    </div></nav>
  </header>
}
function HeaderSearch({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial), [error, setError] = useState('')
  const navigate = useNavigate(), id = useId()
  function onSearch() {
    const search = catalogSearch(value)
    if (value.trim() && !search.q) { setError('Use uma busca mais curta, sem caracteres de controle.'); return }
    setError(''); void navigate({ to: '/', search, hash: 'produtos' })
  }
  return <div role="search"><label htmlFor={id} className="sr-only">Buscar produtos</label><div className={`flex overflow-hidden rounded-xl border bg-surface transition focus-within:ring-2 focus-within:ring-hulk ${error ? 'border-danger' : 'border-transparent'}`}><input id={id} type="search" value={value} onChange={(e) => { setValue(e.target.value); setError('') }} onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }} maxLength={120} placeholder="Encontre o próximo upgrade do seu setup" aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className="min-w-0 flex-1 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted" /><button type="button" onClick={onSearch} aria-label="Buscar produtos" className="bg-hulk px-4 text-primary-900 transition hover:bg-hulk-light"><Search size={21} /></button></div>{error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-danger-light">{error}</p>}</div>
}
