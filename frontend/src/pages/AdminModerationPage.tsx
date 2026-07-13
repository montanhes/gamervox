import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { fetchAdminGames, moderateGameAdmin, type AdminGame } from '@/api/games'

function AdminGameCard({ game }: { game: AdminGame }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')

  const moderate = useMutation({
    mutationFn: (status: 'approved' | 'rejected') =>
      moderateGameAdmin(game.id, { status, reason: reason.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'games'] })
    },
  })

  return (
    <li className="space-y-3 rounded-surface border border-border bg-surface p-4">
      <div className="flex items-start gap-4">
        {game.image_url && (
          <img src={game.image_url} alt="" className="h-20 w-20 flex-shrink-0 rounded-control object-cover" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{game.title}</h3>
            {game.manual_review_requested && (
              <span className="rounded-control border border-primary px-2 py-0.5 text-xs font-semibold text-primary">
                {t('admin.manual_review_badge')}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('game.by')} {game.user.name} (@{game.user.username})
          </p>
          <p className="max-w-[65ch] whitespace-pre-line text-sm text-muted-foreground">{game.description}</p>
          {game.moderation_reason && (
            <p className="text-xs text-destructive">
              {t('admin.previous_reason')}: {game.moderation_reason}
            </p>
          )}
        </div>
      </div>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={t('admin.reason_placeholder')}
        rows={2}
        className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => moderate.mutate('approved')}
          disabled={moderate.isPending}
          className="rounded-control border border-success px-3 py-1.5 text-sm font-medium text-success transition-colors hover:bg-success/10 disabled:opacity-50"
        >
          {t('admin.approve')}
        </button>
        <button
          type="button"
          onClick={() => moderate.mutate('rejected')}
          disabled={moderate.isPending}
          className="rounded-control border border-destructive px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          {t('admin.reject')}
        </button>
      </div>
    </li>
  )
}

export function AdminModerationPage() {
  const { t } = useTranslation()
  const { user, isLoading: isLoadingUser } = useAuth()

  const { data: games, isLoading } = useQuery({
    queryKey: ['admin', 'games'],
    queryFn: fetchAdminGames,
    enabled: !!user?.is_admin,
  })

  if (!isLoadingUser && !user?.is_admin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-primary">{t('admin.moderation_title')}</h1>

      {isLoading && <p className="text-muted-foreground">{t('game.loading')}</p>}
      {!isLoading && games?.length === 0 && <p className="text-muted-foreground">{t('admin.moderation_empty')}</p>}

      <ul className="space-y-3">
        {games?.map((game) => (
          <AdminGameCard key={game.id} game={game} />
        ))}
      </ul>
    </div>
  )
}
