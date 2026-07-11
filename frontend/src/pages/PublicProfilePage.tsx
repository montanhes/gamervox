import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Award, Compass, Library, Megaphone } from 'lucide-react'
import { fetchUserProfile } from '@/api/games'
import { GameCard } from '@/components/GameCard'

const BADGE_ICONS: Record<string, typeof Award> = {
  pioneer: Compass,
  collector: Library,
  curator: Award,
  active_voice: Megaphone,
}

export function PublicProfilePage() {
  const { t, i18n } = useTranslation()
  const { username } = useParams<{ username: string }>()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => fetchUserProfile(username!),
    enabled: !!username,
  })

  if (isLoading) return <p className="p-6 text-muted-foreground">{t('game.loading')}</p>
  if (!profile) return null

  const memberSince = new Date(profile.created_at).toLocaleDateString(i18n.language, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div className="flex flex-wrap items-center gap-5">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
            {profile.name
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('profile_public.member_since', { date: memberSince })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{profile.stats.games_count}</span>{' '}
            {t('profile_public.games')}
            {' · '}
            <span className="font-semibold text-foreground">{profile.stats.votes_count}</span>{' '}
            {t('profile_public.votes')}
          </p>
        </div>
      </div>

      {profile.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.badges.map((badge) => {
            const Icon = BADGE_ICONS[badge] ?? Award
            return (
              <span
                key={badge}
                title={t(`profile_public.badge_${badge}_desc`)}
                className="inline-flex items-center gap-1.5 rounded-control border border-primary bg-primary/10 px-3 py-1 text-sm font-medium text-foreground"
              >
                <Icon size={15} className="text-primary" aria-hidden="true" />
                {t(`profile_public.badge_${badge}`)}
              </span>
            )
          })}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('profile_public.games_title')}</h2>
        {profile.games.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('profile_public.games_empty')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {profile.games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
