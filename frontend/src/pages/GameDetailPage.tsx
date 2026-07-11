import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Check, Share2 } from 'lucide-react'
import { fetchGame } from '@/api/games'
import { VoteButtons } from '@/components/VoteButtons'
import { CommentSection } from '@/components/CommentSection'
import { getSocialPlatform } from '@/lib/socialPlatforms'

export function GameDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
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
    <div>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        {game.image_url && (
          <div aria-hidden="true" className="absolute inset-0">
            <img
              src={game.image_url}
              alt=""
              className="h-full w-full scale-110 object-cover blur-sm brightness-[0.7] opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/45 to-background" />
          </div>
        )}

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:py-14">
          {game.image_url && (
            <img
              src={game.image_url}
              alt={game.title}
              className="aspect-[220/295] w-56 flex-none self-start rounded-surface border border-border object-cover shadow-card-hover"
            />
          )}

          <div className="flex min-w-0 flex-col gap-4">
            {game.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {game.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/?tag=${tag.slug}`}
                    className="rounded-control border border-primary bg-background/40 px-2.5 py-0.5 text-xs text-foreground transition-colors hover:border-primary-hover"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-4xl font-bold tracking-tight">{game.title}</h1>

            <p className="text-sm text-muted-foreground">
              {t('game.by')} <span className="font-medium text-foreground">{game.user.name}</span>
            </p>

            <div className="max-w-sm">
              <VoteButtons
                slug={game.slug}
                yesVotesCount={game.yes_votes_count}
                noVotesCount={game.no_votes_count}
                netScore={game.net_score}
                size="lg"
                leading={
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label={copied ? t('game.share_copied') : t('game.share')}
                    className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-control border border-border-strong text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {copied ? <Check size={18} /> : <Share2 size={18} />}
                  </button>
                }
              />
            </div>

            <p className="max-w-[65ch] leading-relaxed">{game.description}</p>

            {game.social_links.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {game.social_links.map((link) => {
                  const { label, Icon } = getSocialPlatform(link.platform)
                  return (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-control border border-border-strong px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                      >
                        <Icon size={14} />
                        {label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="max-w-3xl">
          <CommentSection slug={game.slug} />
        </div>
      </div>
    </div>
  )
}
