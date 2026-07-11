import { useTranslation } from 'react-i18next'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { fetchFollowing } from '@/api/games'
import { GameCard } from '@/components/GameCard'

export function FollowingPage() {
  const { t } = useTranslation()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['following'],
    queryFn: ({ pageParam }) => fetchFollowing(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor ?? undefined,
  })

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
  })

  const games = data?.pages.flatMap((page) => page.data) ?? []

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-primary">{t('nav.following')}</h1>

      {isLoading && <p className="text-muted-foreground">{t('game.loading')}</p>}
      {!isLoading && games.length === 0 && (
        <p className="text-muted-foreground">{t('game.following_empty')}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      <div ref={ref} className="h-1" />
      {isFetchingNextPage && <p className="text-center text-muted-foreground">{t('game.loading')}</p>}
    </div>
  )
}
