import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Trophy } from 'lucide-react'
import { fetchCup, voteCupMatch, type CupData, type CupGame, type CupMatch } from '@/api/cup'
import { useAuth } from '@/hooks/useAuth'

function roundLabel(round: number, totalRounds: number, t: (key: string, opts?: never) => string) {
  if (round === totalRounds) return t('cup.final')
  if (round === totalRounds - 1) return t('cup.semifinals')
  return `${t('cup.round')} ${round}`
}

function MatchGameRow({
  game,
  match,
  cup,
}: {
  game: CupGame | null
  match: CupMatch
  cup: CupData
}) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => voteCupMatch(match.id, game!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cup'] }),
  })

  if (game === null) {
    return <div className="h-14 rounded-control border border-dashed border-border" />
  }

  const decided = match.winner_id !== null
  const isWinner = match.winner_id === game.id
  const votable = cup.status === 'active' && match.round === cup.current_round && !decided
  const isMyVote = match.my_vote === game.id

  return (
    <div
      className={`flex items-center gap-2 rounded-control border p-1.5 transition-colors ${
        isWinner
          ? 'border-announced bg-announced/10'
          : decided
            ? 'border-border opacity-50'
            : 'border-border'
      }`}
    >
      {game.image_url && (
        <img
          src={game.image_url}
          alt=""
          className="aspect-[220/295] w-8 flex-none rounded-sm object-cover"
        />
      )}
      <Link
        to={`/games/${game.slug}`}
        className="min-w-0 flex-1 truncate text-xs font-medium text-foreground hover:text-primary"
      >
        {game.title}
      </Link>
      <span className="flex-none text-xs tabular-nums text-muted-foreground">{game.votes}</span>
      {votable && (
        <button
          type="button"
          onClick={() => (user ? mutation.mutate() : navigate('/login'))}
          disabled={mutation.isPending}
          className={`flex-none rounded-control px-2 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
            isMyVote
              ? 'bg-primary text-white'
              : 'border border-border-strong text-muted-foreground hover:border-primary hover:text-foreground'
          }`}
        >
          {isMyVote ? t('cup.voted') : t('cup.vote')}
        </button>
      )}
      {isWinner && <Trophy size={13} className="flex-none text-announced" aria-hidden="true" />}
    </div>
  )
}

export function CupPage() {
  const { t, i18n } = useTranslation()

  const { data: cup, isLoading } = useQuery({
    queryKey: ['cup'],
    queryFn: fetchCup,
  })

  if (isLoading) return <p className="p-6 text-muted-foreground">{t('game.loading')}</p>

  if (!cup) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <h1 className="text-2xl font-bold tracking-tight text-primary">{t('cup.title')}</h1>
        <p className="mt-4 text-muted-foreground">{t('cup.empty')}</p>
      </div>
    )
  }

  const rounds = new Map<number, CupMatch[]>()
  for (const match of cup.matches) {
    rounds.set(match.round, [...(rounds.get(match.round) ?? []), match])
  }

  const finalMatch = cup.matches.find((m) => m.round === cup.total_rounds)
  const champion =
    cup.status === 'finished' && finalMatch?.winner_id
      ? [finalMatch.game_a, finalMatch.game_b].find((g) => g?.id === finalMatch.winner_id)
      : null

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-primary">{cup.name}</h1>
        {cup.status === 'active' && cup.round_ends_at && (
          <p className="text-sm text-muted-foreground">
            {t('cup.round_ends', {
              date: new Date(cup.round_ends_at).toLocaleString(i18n.language, {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
            })}
          </p>
        )}
      </div>

      {champion && (
        <div className="flex items-center gap-4 rounded-surface border border-announced bg-announced/10 p-4">
          {champion.image_url && (
            <img
              src={champion.image_url}
              alt=""
              className="aspect-[220/295] w-16 rounded-control object-cover"
            />
          )}
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-announced">
              <Trophy size={16} aria-hidden="true" />
              {t('cup.champion')}
            </p>
            <Link
              to={`/games/${champion.slug}`}
              className="text-xl font-bold text-foreground hover:text-primary"
            >
              {champion.title}
            </Link>
          </div>
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-6">
          {[...rounds.entries()].map(([round, matches]) => (
            <div key={round} className="flex w-72 flex-col">
              <h2
                className={`mb-3 text-sm font-semibold uppercase tracking-wide ${
                  round === cup.current_round && cup.status === 'active'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {roundLabel(round, cup.total_rounds, t)}
              </h2>
              <div className="flex flex-1 flex-col justify-around gap-4">
                {matches.map((match) => (
                  <div key={match.id} className="space-y-1.5 rounded-surface border border-border bg-surface p-2">
                    <MatchGameRow game={match.game_a} match={match} cup={cup} />
                    <p className="text-center text-[10px] font-semibold uppercase text-muted-foreground">
                      vs
                    </p>
                    <MatchGameRow game={match.game_b} match={match} cup={cup} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
