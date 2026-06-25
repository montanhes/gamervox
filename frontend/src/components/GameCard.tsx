import { Link } from 'react-router-dom'
import type { Game } from '@/api/games'
import { VoteButtons } from '@/components/VoteButtons'

export function GameCard({ game }: { game: Game }) {
  return (
    <div className="group overflow-hidden rounded-surface border border-border bg-surface transition-colors duration-200 ease-out hover:border-primary">
      <Link to={`/games/${game.slug}`}>
        {game.image_url && (
          <div className="overflow-hidden">
            <img
              src={game.image_url}
              alt={game.title}
              className="aspect-video w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
            />
          </div>
        )}
        <h2 className="px-2.5 pt-3 text-sm font-semibold leading-tight">{game.title}</h2>
      </Link>

      <div className="flex flex-col gap-2.5 p-2.5 pt-2">
        {game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-border pb-2.5">
            {game.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/?tag=${tag.slug}`}
                className="rounded-lg border border-primary bg-transparent px-1.5 py-0.5 text-[0.6875rem] text-foreground transition-colors hover:border-primary-hover"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

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
