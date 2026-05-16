import { useSearchParams } from 'react-router-dom'
import { normalizeSearchQuery } from '@/shared/lib/search'

export function usePageSearch() {
  const [searchParams] = useSearchParams()

  const searchQuery = searchParams.get('q') ?? ''
  const normalizedQuery = normalizeSearchQuery(searchQuery)

  return {
    searchQuery,
    normalizedQuery,
    hasSearchQuery: normalizedQuery.length > 0,
  }
}
