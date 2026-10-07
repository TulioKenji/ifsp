import { Outlet } from '@tanstack/react-router'
import { Search, ShoppingCart, UserRound } from 'lucide-react'
import logoTransparent from './assets/logo-transparent.png'

function App() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="border-b border-primary-800 bg-surface-dark">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <img src={logoTransparent} alt="GreenStore" className="h-14 w-auto object-contain" />
          <div className="flex items-center gap-2 text-text-inverse">
            <button type="button" aria-label="Buscar" className="rounded-lg p-2 transition hover:bg-surface"><Search size={20} /></button>
            <button type="button" aria-label="Minha conta" className="rounded-lg p-2 transition hover:bg-surface"><UserRound size={20} /></button>
            <button type="button" aria-label="Carrinho" className="rounded-lg p-2 transition hover:bg-surface"><ShoppingCart size={20} /></button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App
