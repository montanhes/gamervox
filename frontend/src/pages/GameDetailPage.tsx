import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Check, Share2 } from 'lucide-react'
import { fetchGame } from '@/api/games'
import { VoteButtons } from '@/components/VoteButtons'
import { CommentSection } from '@/components/CommentSection'

const DESCRIPTION_PREVIEW_LENGTH = 160

export function GameDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', slug],
    queryFn: () => fetchGame(slug!),
    enabled: !!slug,
  })

  if (isLoading) return <p className="p-6 text-muted-foreground">{t('game.loading')}</p>
  if (!game) return null

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex flex-col gap-3 sm:w-72 sm:flex-none">
            {game.image_url && (
              <img
                src={game.image_url}
                alt={game.title}
                className="aspect-[220/295] w-full rounded-surface border border-border object-cover"
              />
            )}

            <VoteButtons
              slug={game.slug}
              yesVotesCount={game.yes_votes_count}
              noVotesCount={game.no_votes_count}
              netScore={game.net_score}
              leading={
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label={copied ? t('game.share_copied') : t('game.share')}
                  className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-control border border-border-strong text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {copied ? <Check size={16} /> : <Share2 size={16} />}
                </button>
              }
            />
          </div>

          <div className="flex flex-col gap-3">
            {game.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {game.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/?tag=${tag.slug}`}
                    className="rounded-control border border-primary bg-transparent px-2.5 py-0.5 text-xs text-foreground transition-colors hover:border-primary-hover"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl font-bold uppercase tracking-tight">{game.title}</h1>

            <p className="text-sm text-muted-foreground">
              {t('game.by')} <span className="font-medium text-foreground">{game.user.name}</span>
            </p>

            <div>
              <p className={expanded ? 'max-w-[65ch]' : 'line-clamp-3 max-w-[65ch]'}>{game.description}</p>
              {game.description.length > DESCRIPTION_PREVIEW_LENGTH && (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="mt-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  {expanded ? t('game.read_less') : t('game.read_more')}
                </button>
              )}
            </div>

            {game.social_links.length > 0 && (
              <ul className="flex flex-wrap gap-3 text-sm">
                {game.social_links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noreferrer" className="text-primary underline">
                      {link.platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <CommentSection slug={game.slug} />
      </div>
    </div>
  )
}
