import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Link, redirect } from '@tanstack/react-router'
import App from '../App'
import { catalogSearch } from '../utils/catalog-search'

const rootRoute = createRootRoute({ component: App, notFoundComponent: () => <p className="p-8">Página não encontrada. <Link to="/" className="action-link">Voltar ao catálogo</Link></p> })
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>) => catalogSearch(search.q),
  component: lazyRouteComponent(() => import('./index'), 'ProductsPage'),
})
// import() é o ponto de divisão: Vite gera chunks separados para as telas.
const accountRoute = createRoute({ getParentRoute: () => rootRoute, path: '/conta', component: lazyRouteComponent(() => import('./account'), 'AccountPage') })
const productRoute = createRoute({ getParentRoute: () => rootRoute, path: '/produtos/$productId', component: lazyRouteComponent(() => import('./product-detail'), 'ProductDetailPage') })
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cart', component: lazyRouteComponent(() => import('./cart'), 'CartPage') })
const legacyCartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/carrinho', beforeLoad: () => { throw redirect({ to: '/cart' }) } })
const ordersRoute = createRoute({ getParentRoute: () => rootRoute, path: '/pedidos', component: lazyRouteComponent(() => import('./orders'), 'OrdersPage') })
const orderRoute = createRoute({ getParentRoute: () => rootRoute, path: '/pedidos/$orderId', component: lazyRouteComponent(() => import('./order-detail'), 'OrderDetailPage') })
const routeTree = rootRoute.addChildren([indexRoute, productRoute, accountRoute, cartRoute, legacyCartRoute, ordersRoute, orderRoute])

export const router = createRouter({ routeTree })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
