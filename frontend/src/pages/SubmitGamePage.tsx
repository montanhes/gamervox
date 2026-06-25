import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitGame, type Game } from '@/api/games'

export function SubmitGamePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [similarGames, setSimilarGames] = useState<Game[] | null>(null)

  const mutation = useMutation({
    mutationFn: (confirmDuplicate: boolean) => {
      if (!image) throw new Error('image required')

      return submitGame({
        title,
        description,
        image,
        tags: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
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

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate(false)
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-primary">{t('nav.submit_game')}</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder={t('game.title')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
        />
        <textarea
          placeholder={t('game.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
        />
        <input
          type="text"
          placeholder={t('game.tags_placeholder')}
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
        />
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          required
          className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-muted-foreground file:mr-3 file:rounded-control file:border file:border-border-strong file:bg-surface file:px-3 file:py-1 file:text-sm file:text-foreground"
        />

        {mutation.isError && <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-control bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {t('nav.submit_game')}
        </button>
      </form>

      {similarGames && similarGames.length > 0 && (
        <div className="space-y-2 rounded-surface border border-border-strong bg-surface p-4">
          <p>{t('game.similar_warning')}</p>
          <ul className="list-inside list-disc text-sm">
            {similarGames.map((game) => (
              <li key={game.id}>{game.title}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => mutation.mutate(true)}
            className="rounded-control border border-border-strong px-3 py-1.5 text-sm transition-colors hover:border-foreground"
          >
            {t('game.confirm_duplicate')}
          </button>
        </div>
      )}
    </div>
  )
}
