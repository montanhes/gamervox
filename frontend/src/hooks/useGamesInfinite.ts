import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchGames } from '@/api/games'

export function useGamesInfinite(search: string, tags: string[]) {
  return useInfiniteQuery({
    queryKey: ['games', { search, tags }],
    queryFn: ({ pageParam }) => fetchGames({ cursor: pageParam, search, tags }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor ?? undefined,
  })
}
