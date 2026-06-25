import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { fetchMyGames } from '@/api/games'
import { StatusBadge } from '@/components/StatusBadge'

export function MyGamesList() {
  const { t } = useTranslation()

  const { data: games, isLoading } = useQuery({
    queryKey: ['me', 'games'],
    queryFn: fetchMyGames,
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
            <div className="flex flex-col items-end gap-1">
              {game.status && <StatusBadge status={game.status} />}
              {game.status === 'rejected' && game.moderation_reason && (
                <span className="text-xs text-muted-foreground" title={game.moderation_reason}>
                  {game.moderation_reason}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
