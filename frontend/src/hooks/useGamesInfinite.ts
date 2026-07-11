import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchGames, type GameSort } from '@/api/games'

export function useGamesInfinite(
  search: string,
  tags: string[],
  sort: GameSort = 'top',
  announced = false,
) {
  return useInfiniteQuery({
    queryKey: ['games', { search, tags, sort, announced }],
    queryFn: ({ pageParam }) => fetchGames({ cursor: pageParam, search, tags, sort, announced }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor ?? undefined,
  })
}
