import { useMutation, useQueryClient } from '@tanstack/react-query'
import { castVote, removeVote, type Game, type GamesPage } from '@/api/games'

function patchGameInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  slug: string,
  counters: { yes_votes_count: number; no_votes_count: number; net_score: number },
) {
  queryClient.setQueriesData<{ pages: GamesPage[]; pageParams: unknown[] }>(
    { queryKey: ['games'] },
    (data) => {
      if (!data) return data

      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          data: page.data.map((game: Game) => (game.slug === slug ? { ...game, ...counters } : game)),
        })),
      }
    },
  )

  queryClient.setQueryData(['game', slug], (game: { data: Game } | undefined) =>
    game ? { data: { ...game.data, ...counters } } : game,
  )
}

export function useVote(slug: string) {
  const queryClient = useQueryClient()

  const vote = useMutation({
    mutationFn: (value: 1 | -1) => castVote(slug, value),
    onSuccess: (counters) => patchGameInCache(queryClient, slug, counters),
  })

  const unvote = useMutation({
    mutationFn: () => removeVote(slug),
    onSuccess: (counters) => patchGameInCache(queryClient, slug, counters),
  })

  return { vote: vote.mutate, unvote: unvote.mutate, isVoting: vote.isPending || unvote.isPending }
}
