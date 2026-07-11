import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Heart } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { type Comment, fetchComments, fetchReplies, postComment, toggleCommentLike } from '@/api/comments'
import { useAuth } from '@/hooks/useAuth'

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const secs = Math.floor(diff / 1000)
  const mins = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  if (secs < 60) return rtf.format(-secs, 'second')
  if (mins < 60) return rtf.format(-mins, 'minute')
  if (hours < 24) return rtf.format(-hours, 'hour')
  if (days < 30) return rtf.format(-days, 'day')
  return new Date(dateStr).toLocaleDateString()
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  if (url) {
    return <img src={url} alt={name} className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
  }
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
      {initials}
    </div>
  )
}

interface CommentFormProps {
  slug: string
  parentId?: number | null
  placeholder?: string
  submitLabel?: string
  onSuccess?: () => void
  autoFocus?: boolean
}

function CommentForm({ slug, parentId, placeholder, submitLabel, onSuccess, autoFocus }: CommentFormProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => postComment(slug, body, parentId),
    onSuccess: () => {
      setBody('')
      setError(null)
      if (parentId != null) {
        queryClient.invalidateQueries({ queryKey: ['replies', slug, parentId] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['comments', slug] })
      }
      onSuccess?.()
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.data?.errors?.body?.[0]) {
        setError(err.response.data.errors.body[0])
      } else {
        setError(t('comments.error'))
      }
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (body.trim()) mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? t('comments.placeholder')}
        required
        rows={3}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        className="w-full rounded-control border border-border-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={mutation.isPending || !body.trim()}
        className="rounded-control bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {submitLabel ?? t('comments.submit')}
      </button>
    </form>
  )
}

interface CommentRepliesProps {
  slug: string
  commentId: number
}

function CommentReplies({ slug, commentId }: CommentRepliesProps) {
  const { t } = useTranslation()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['replies', slug, commentId],
    queryFn: ({ pageParam }) => fetchReplies(slug, commentId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor ?? undefined,
  })

  const replies = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <div className="space-y-4 pt-1">
      {replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} slug={slug} />
      ))}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {t('comments.load_more_replies')}
        </button>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  slug: string
}

function LikeButton({ comment }: { comment: Comment }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [liked, setLiked] = useState(comment.liked_by_me)
  const [likes, setLikes] = useState(comment.likes_count)

  const mutation = useMutation({
    mutationFn: () => toggleCommentLike(comment.id),
    onMutate: () => {
      // Otimista: inverte já; rollback no erro.
      setLiked((v) => !v)
      setLikes((n) => n + (liked ? -1 : 1))
    },
    onSuccess: (result) => {
      setLiked(result.liked)
      setLikes(result.likes_count)
    },
    onError: () => {
      setLiked(comment.liked_by_me)
      setLikes(comment.likes_count)
    },
  })

  if (!user) {
    return likes > 0 ? (
      <span className="inline-flex items-center gap-1">
        <Heart size={13} aria-hidden="true" />
        {likes}
      </span>
    ) : null
  }

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      aria-label={liked ? t('comments.unlike') : t('comments.like')}
      aria-pressed={liked}
      className={`inline-flex items-center gap-1 transition-colors ${
        liked ? 'text-primary' : 'hover:text-foreground'
      }`}
    >
      <Heart size={13} fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />
      {likes > 0 && likes}
    </button>
  )
}

function CommentItem({ comment, slug }: CommentItemProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [repliesOpen, setRepliesOpen] = useState(false)

  function handleReplySuccess() {
    setShowReplyForm(false)
    setRepliesOpen(true)
  }

  return (
    <div className="flex gap-3">
      <Avatar name={comment.user.name} url={comment.user.avatar_url} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{comment.user.name}</span>
          <span>·</span>
          <time dateTime={comment.created_at}>{relativeTime(comment.created_at)}</time>
        </div>

        <p className="mt-1 text-sm leading-relaxed text-foreground">{comment.body}</p>

        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <LikeButton comment={comment} />
          {user && (
            <button
              onClick={() => setShowReplyForm((v) => !v)}
              className="transition-colors hover:text-foreground"
            >
              {t('comments.reply')}
            </button>
          )}
          {comment.replies_count > 0 && (
            <button
              onClick={() => setRepliesOpen((v) => !v)}
              className="transition-colors hover:text-foreground"
            >
              {repliesOpen
                ? t('comments.hide_replies')
                : t('comments.show_replies', { count: comment.replies_count })}
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              slug={slug}
              parentId={comment.id}
              placeholder={t('comments.reply_placeholder')}
              submitLabel={t('comments.reply_submit')}
              onSuccess={handleReplySuccess}
              autoFocus
            />
          </div>
        )}

        {repliesOpen && (
          <div className="mt-3 border-l-2 border-border pl-4">
            <CommentReplies slug={slug} commentId={comment.id} />
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentSection({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { ref: sentinelRef, inView } = useInView()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['comments', slug],
    queryFn: ({ pageParam }) => fetchComments(slug, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor ?? undefined,
  })

  const comments = data?.pages.flatMap((p) => p.data) ?? []

  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t('comments.title')}</h2>

      {user && <CommentForm slug={slug} />}

      <ul className="space-y-5">
        {comments.map((comment) => (
          <li key={comment.id}>
            <CommentItem comment={comment} slug={slug} />
          </li>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('comments.empty')}</p>
        )}
      </ul>

      {hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center py-2">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {t('comments.load_more')}
          </button>
        </div>
      )}
    </div>
  )
}
