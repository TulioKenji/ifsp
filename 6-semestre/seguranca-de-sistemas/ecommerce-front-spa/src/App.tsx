import { Outlet } from '@tanstack/react-router'
import { CartModal } from './CartModal'
import { StoreHeader } from './components/common/layout/StoreHeader'

function App() {
  return <div className="flex min-h-dvh flex-col bg-background text-text-primary"><StoreHeader /><main className="flex flex-1 flex-col"><Outlet /></main><CartModal /></div>
}
export default App