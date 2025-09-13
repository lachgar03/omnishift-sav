import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // Will be set after we wrap the app in an AuthProvider
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
