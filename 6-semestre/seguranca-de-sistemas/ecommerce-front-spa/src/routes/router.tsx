import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import App from '../App'
import { ProductsPage } from './index'

const rootRoute = createRootRoute({ component: App })
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ProductsPage,
})
const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({ routeTree })