import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchGame } from '@/api/games'
import { VoteButtons } from '@/components/VoteButtons'
import { CommentSection } from '@/components/CommentSection'

export function GameDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', slug],
    queryFn: () => fetchGame(slug!),
    enabled: !!slug,
  })

  if (isLoading) return <p className="p-6 text-muted-foreground">{t('game.loading')}</p>
  if (!game) return null

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      {game.image_url && (
        <img src={game.image_url} alt={game.title} className="w-full rounded-surface border border-border" />
      )}

      <h1 className="text-3xl font-bold tracking-tight">{game.title}</h1>

      <p className="max-w-[70ch]">{game.description}</p>

      {game.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {game.tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/?tag=${tag.slug}`}
              className="rounded-lg border border-primary bg-transparent px-1.5 py-0.5 text-xs text-foreground transition-colors hover:border-primary-hover"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {game.social_links.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">{t('game.social_links')}</h2>
          <ul className="text-sm">
            {game.social_links.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-primary underline">
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <VoteButtons
        slug={game.slug}
        yesVotesCount={game.yes_votes_count}
        noVotesCount={game.no_votes_count}
        netScore={game.net_score}
      />

      <CommentSection slug={game.slug} />
    </div>
  )
}
