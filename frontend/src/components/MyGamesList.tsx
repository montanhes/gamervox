import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { fetchMyGames, requestGameReview } from '@/api/games'
import { StatusBadge } from '@/components/StatusBadge'

export function MyGamesList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: games, isLoading } = useQuery({
    queryKey: ['me', 'games'],
    queryFn: fetchMyGames,
  })

  const requestReview = useMutation({
    mutationFn: requestGameReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'games'] })
    },
  })

  return (
    <div className="space-y-4">
      {isLoading && <p className="text-muted-foreground">{t('game.loading')}</p>}
      {!isLoading && games?.length === 0 && <p className="text-muted-foreground">{t('game.empty')}</p>}

      <ul className="space-y-3">
        {games?.map((game) => (
          <li key={game.id} className="flex items-center justify-between gap-3 rounded-surface border border-border bg-surface p-3">
            <Link to={`/games/${game.slug}`} className="font-medium">
              {game.title}
            </Link>
            <div className="flex flex-col items-end gap-1.5">
              {game.status && <StatusBadge status={game.status} />}
              {game.status === 'rejected' && game.moderation_reason && (
                <span className="max-w-xs text-right text-xs text-muted-foreground" title={game.moderation_reason}>
                  {game.moderation_reason}
                </span>
              )}
              {game.status === 'rejected' && (
                <>
                  {game.manual_review_requested ? (
                    <span className="text-xs font-medium text-primary">{t('game.review_requested')}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => requestReview.mutate(game.slug)}
                      disabled={requestReview.isPending}
                      className="rounded-control border border-border-strong px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-50"
                    >
                      {t('game.request_review')}
                    </button>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
