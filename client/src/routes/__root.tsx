import { createRootRoute } from "@tanstack/react-router"
import { AppLayout } from "../layouts/AppLayout"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return <AppLayout />
}
