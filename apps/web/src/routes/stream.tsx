import { createFileRoute } from '@tanstack/react-router'
import { StreamView } from '../components/StreamView'

type StreamSearch = {
  lang: 'zh' | 'uk'
}

export const Route = createFileRoute('/stream')({
  validateSearch: (search: Record<string, unknown>): StreamSearch => {
    // Default to 'zh' if no valid language is provided
    const lang = search.lang as 'zh' | 'uk'
    return {
      lang: (lang === 'zh' || lang === 'uk') ? lang : 'zh',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { lang } = Route.useSearch()
  return <StreamView language={lang} />
}
