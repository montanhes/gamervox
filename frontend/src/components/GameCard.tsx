import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PartyPopper } from 'lucide-react'
import type { Game } from '@/api/games'
import { VoteButtons } from '@/components/VoteButtons'

export function GameCard({ game }: { game: Game }) {
  const { t } = useTranslation()

  return (
    <div className="group relative aspect-[220/295] overflow-hidden rounded-surface border border-border bg-surface transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary hover:shadow-card-hover motion-reduce:hover:-translate-y-0">
      <Link to={`/games/${game.slug}`} className="absolute inset-0 block" aria-hidden="true" tabIndex={-1}>
        {game.image_url && (
          <img
            src={game.image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 via-40% to-transparent" />
        <div
          aria-hidden="true"
          className="absolute -inset-y-1/2 -right-1/2 w-full rotate-[30deg] bg-[linear-gradient(to_top,rgba(255,255,255,1)_0%,transparent_20%)] opacity-0 blur-sm transition-opacity duration-500 ease-out group-hover:opacity-15 motion-reduce:group-hover:opacity-0"
        />
      </Link>

      {game.is_announced && (
        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-control bg-announced px-2 py-0.5 text-xs font-semibold text-announced-foreground">
          <PartyPopper size={12} aria-hidden="true" />
          {t('game.announced')}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
        <Link to={`/games/${game.slug}`} className="line-clamp-2 text-sm font-semibold leading-tight text-white">
          {game.title}
        </Link>

        <VoteButtons
          slug={game.slug}
          yesVotesCount={game.yes_votes_count}
          noVotesCount={game.no_votes_count}
          netScore={game.net_score}
        />
      </div>
    </div>
  )
}
