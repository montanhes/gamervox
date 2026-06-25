import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { fetchComments, postComment } from '@/api/comments'
import { useAuth } from '@/hooks/useAuth'

export function CommentSection({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: comments } = useQuery({
    queryKey: ['comments', slug],
    queryFn: () => fetchComments(slug),
  })

  const mutation = useMutation({
    mutationFn: () => postComment(slug, body),
    onSuccess: () => {
      setBody('')
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['comments', slug] })
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.data?.errors?.body?.[0]) {
        setError(err.response.data.errors.body[0])
      } else {
        setError(t('comments.error'))
      }
    },
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('comments.title')}</h2>

      {user && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('comments.placeholder')}
            required
            rows={3}
            className="w-full rounded-control border border-border-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-control bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {t('comments.submit')}
          </button>
        </form>
      )}

      <ul className="space-y-3">
        {comments?.map((comment) => (
          <li key={comment.id} className="rounded-surface border border-border bg-surface p-3 text-sm">
            <p className="font-medium">{comment.user.name}</p>
            <p>{comment.body}</p>
          </li>
        ))}
        {comments?.length === 0 && <p className="text-sm text-muted-foreground">{t('comments.empty')}</p>}
      </ul>
    </div>
  )
}
