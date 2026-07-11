import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Bell, BellRing, Check, PartyPopper, Share2 } from 'lucide-react'
import { fetchGame, toggleFollow } from '@/api/games'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { VoteButtons } from '@/components/VoteButtons'
import { CommentSection } from '@/components/CommentSection'
import { getSocialPlatform } from '@/lib/socialPlatforms'
import { XIcon } from '@/components/SocialIcons'

export function GameDetailPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  // null = sem interação; senão, override otimista sobre o valor do servidor.
  const [followOverride, setFollowOverride] = useState<boolean | null>(null)

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', slug],
    queryFn: () => fetchGame(slug!),
    enabled: !!slug,
  })

  const following = followOverride ?? game?.followed_by_me ?? false

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(slug!),
    onMutate: () => setFollowOverride(!following),
    onSuccess: (result) => setFollowOverride(result.following),
    onError: () => setFollowOverride(null),
  })

  if (isLoading) return <p className="p-6 text-muted-foreground">{t('game.loading')}</p>
  if (!game) return null

  // Crawlers de redes sociais leem as OG tags dessa rota do backend;
  // humanos são redirecionados de volta pro SPA.
  const shareUrl = `${api.defaults.baseURL}/share/games/${game.slug}`

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

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">{game.title}</h1>
              {game.is_announced && (
                <span className="inline-flex items-center gap-1.5 rounded-control bg-announced px-2.5 py-1 text-sm font-semibold text-announced-foreground">
                  <PartyPopper size={15} aria-hidden="true" />
                  {t('game.announced')}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {t('game.by')}{' '}
              <Link
                to={`/u/${game.user.username}`}
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                {game.user.name}
              </Link>
            </p>

            <div className="max-w-sm">
              <VoteButtons
                slug={game.slug}
                yesVotesCount={game.yes_votes_count}
                noVotesCount={game.no_votes_count}
                netScore={game.net_score}
                size="lg"
                leading={
                  <>
                    <button
                      type="button"
                      onClick={handleShare}
                      aria-label={copied ? t('game.share_copied') : t('game.share')}
                      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-control border border-border-strong text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {copied ? <Check size={18} /> : <Share2 size={18} />}
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        t('vote.share_text', { title: game.title }),
                      )}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('vote.share_vote')}
                      title={t('vote.share_vote')}
                      className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-control border border-border-strong text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      <XIcon size={16} />
                    </a>
                  </>
                }
              />
            </div>

            {user && (
              <button
                type="button"
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                aria-pressed={following}
                className={`inline-flex w-fit items-center gap-2 rounded-control border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  following
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-strong text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {following ? <BellRing size={15} /> : <Bell size={15} />}
                {following ? t('game.following') : t('game.follow')}
              </button>
            )}

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
