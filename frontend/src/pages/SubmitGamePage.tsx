import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Plus, X } from 'lucide-react'
import { submitGame, type Game, type SocialLinkInput } from '@/api/games'
import { TagInput } from '@/components/TagInput'
import { ImageCropInput } from '@/components/ImageCropInput'
import { SOCIAL_PLATFORMS } from '@/lib/socialPlatforms'

const TITLE_MAX = 160
const DESCRIPTION_MAX = 5000
const SOCIAL_LINKS_MAX = 10

const inputBase =
  'rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none'
const inputClass = `w-full ${inputBase}`

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null
  return <p className="mt-1 text-xs text-destructive">{messages[0]}</p>
}

export function SubmitGamePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLinkInput[]>([])
  const [similarGames, setSimilarGames] = useState<Game[] | null>(null)

  const mutation = useMutation({
    mutationFn: (confirmDuplicate: boolean) => {
      if (!image) throw new Error(t('form.image_required'))

      return submitGame({
        title,
        description,
        image,
        tags,
        social_links: socialLinks.filter((link) => link.platform.trim() && link.url.trim()),
        confirm_duplicate: confirmDuplicate,
      })
    },
    onSuccess: (result) => {
      if ('similar_games' in result) {
        setSimilarGames(result.similar_games.data)
        return
      }

      setSimilarGames(null)
      queryClient.invalidateQueries({ queryKey: ['games'] })
      navigate(`/games/${result.data.slug}`)
    },
  })

  const fieldErrors: Record<string, string[]> =
    (isAxiosError(mutation.error) && mutation.error.response?.data?.errors) || {}
  const socialErrors = Object.entries(fieldErrors)
    .filter(([key]) => key.startsWith('social_links'))
    .flatMap(([, messages]) => messages)
  const genericError =
    mutation.isError && Object.keys(fieldErrors).length === 0
      ? isAxiosError(mutation.error)
        ? mutation.error.response?.data?.message || mutation.error.message
        : (mutation.error as Error).message
      : null

  function updateSocialLink(index: number, patch: Partial<SocialLinkInput>) {
    setSocialLinks((links) =>
      links.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSimilarGames(null)
    mutation.mutate(false)
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-primary">{t('nav.submit_game')}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="game-title" className="mb-1 flex items-baseline justify-between text-sm font-medium">
            {t('game.title')}
            <span className="text-xs font-normal tabular-nums text-muted-foreground">
              {title.length}/{TITLE_MAX}
            </span>
          </label>
          <input
            id="game-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={TITLE_MAX}
            className={inputClass}
          />
          <FieldError messages={fieldErrors.title} />
        </div>

        <div>
          <label
            htmlFor="game-description"
            className="mb-1 flex items-baseline justify-between text-sm font-medium"
          >
            {t('game.description')}
            <span className="text-xs font-normal tabular-nums text-muted-foreground">
              {description.length}/{DESCRIPTION_MAX}
            </span>
          </label>
          <textarea
            id="game-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            maxLength={DESCRIPTION_MAX}
            className={inputClass}
          />
          <FieldError messages={fieldErrors.description} />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">{t('form.tags_label')}</span>
          <TagInput tags={tags} onChange={setTags} />
          <FieldError messages={fieldErrors.tags} />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">{t('form.image_label')}</span>
          <ImageCropInput onChange={setImage} />
          <FieldError messages={fieldErrors.image} />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">{t('game.social_links')}</span>
          <div className="space-y-2">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2">
                <select
                  value={link.platform}
                  onChange={(e) => updateSocialLink(i, { platform: e.target.value })}
                  required
                  className={`w-36 flex-none ${inputBase} ${link.platform ? '' : 'text-muted-foreground'}`}
                >
                  <option value="" disabled>
                    {t('form.social_platform')}
                  </option>
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSocialLink(i, { url: e.target.value })}
                  placeholder="https://"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setSocialLinks((links) => links.filter((_, idx) => idx !== i))}
                  aria-label={t('form.remove')}
                  className="flex h-9 w-9 flex-none items-center justify-center self-center rounded-control border border-border-strong text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {socialLinks.length < SOCIAL_LINKS_MAX && (
              <button
                type="button"
                onClick={() => setSocialLinks((links) => [...links, { platform: '', url: '' }])}
                className="inline-flex items-center gap-1.5 rounded-control border border-border-strong px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <Plus size={14} />
                {t('form.social_add')}
              </button>
            )}
          </div>
          {socialErrors.length > 0 && (
            <p className="mt-1 text-xs text-destructive">{socialErrors[0]}</p>
          )}
        </div>

        {genericError && <p className="text-sm text-destructive">{genericError}</p>}

        <button
          type="submit"
          disabled={mutation.isPending || !image}
          className="w-full rounded-control bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {mutation.isPending ? t('form.submitting') : t('nav.submit_game')}
        </button>
      </form>

      {similarGames && similarGames.length > 0 && (
        <div className="space-y-3 rounded-surface border border-primary bg-surface p-4">
          <p className="text-sm">{t('game.similar_warning')}</p>
          <ul className="space-y-2">
            {similarGames.map((game) => (
              <li key={game.id} className="flex items-center gap-3">
                {game.image_url && (
                  <img
                    src={game.image_url}
                    alt=""
                    className="aspect-[220/295] w-10 rounded-control border border-border object-cover"
                  />
                )}
                <span className="text-sm font-medium">{game.title}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => mutation.mutate(true)}
              disabled={mutation.isPending}
              className="rounded-control bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {t('game.confirm_duplicate')}
            </button>
            <button
              type="button"
              onClick={() => setSimilarGames(null)}
              className="rounded-control border border-border-strong px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {t('form.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
