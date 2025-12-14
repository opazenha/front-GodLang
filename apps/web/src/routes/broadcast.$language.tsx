import { createFileRoute } from '@tanstack/react-router'
import { BroadcastView } from '../components/BroadcastView'

export const Route = createFileRoute('/broadcast/$language')({
  component: RouteComponent,
})

function RouteComponent() {
  const { language } = Route.useParams()
  return <BroadcastView language={language} />
}