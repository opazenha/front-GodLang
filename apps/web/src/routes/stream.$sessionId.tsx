import { createFileRoute } from '@tanstack/react-router'
import { StreamView } from '../components/StreamView'

export const Route = createFileRoute('/stream/$sessionId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { sessionId } = Route.useParams()
  return <StreamView sessionId={sessionId} />
}
