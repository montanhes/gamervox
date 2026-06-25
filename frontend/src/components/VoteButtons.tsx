import { useTranslation } from 'react-i18next'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useVote } from '@/hooks/useVote'

export function VoteButtons({
  slug,
  yesVotesCount,
  noVotesCount,
  netScore,
}: {
  slug: string
  yesVotesCount: number
  noVotesCount: number
  netScore: number
}) {
  const { t } = useTranslation()
  const { vote, isVoting } = useVote(slug)

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <button
        type="button"
        disabled={isVoting}
        onClick={() => vote(1)}
        aria-label={t('vote.yes')}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-1.5 font-semibold text-primary-hover transition-[transform,background-color] duration-150 ease-out hover:bg-primary/30 active:scale-90 disabled:opacity-50 motion-reduce:active:scale-100"
      >
        <ThumbsUp size={14} fill="currentColor" />
        {yesVotesCount}
      </button>

      <span className="flex-1 whitespace-nowrap rounded-lg bg-primary/20 px-3 py-1.5 text-center font-semibold text-primary-hover">
        {t('vote.net_score')}: {netScore >= 0 ? '+' : ''}
        {netScore}
      </span>

      <button
        type="button"
        disabled={isVoting}
        onClick={() => vote(-1)}
        aria-label={t('vote.no')}
        className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/20 px-3 py-1.5 font-semibold text-destructive transition-[transform,background-color] duration-150 ease-out hover:bg-destructive/30 active:scale-90 disabled:opacity-50 motion-reduce:active:scale-100"
      >
        <ThumbsDown size={14} fill="currentColor" />
        {noVotesCount}
      </button>
    </div>
  )
}
