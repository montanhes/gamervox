import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChartNoAxesCombined, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useVote } from '@/hooks/useVote'

export function VoteButtons({
  slug,
  yesVotesCount,
  noVotesCount,
  netScore,
  leading,
}: {
  slug: string
  yesVotesCount: number
  noVotesCount: number
  netScore: number
  leading?: ReactNode
}) {
  const { t } = useTranslation()
  const { vote, isVoting } = useVote(slug)

  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <div className="flex items-center gap-1.5">
        {leading}

        <button
          type="button"
          disabled={isVoting}
          onClick={() => vote(1)}
          aria-label={t('vote.yes')}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/20 px-3 font-semibold text-primary-hover transition-[transform,background-color] duration-150 ease-out hover:bg-primary/30 active:scale-90 disabled:opacity-50 motion-reduce:active:scale-100"
        >
          <ThumbsUp size={14} fill="currentColor" />
          {yesVotesCount}
        </button>

        <button
          type="button"
          disabled={isVoting}
          onClick={() => vote(-1)}
          aria-label={t('vote.no')}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-destructive/20 px-3 font-semibold text-destructive transition-[transform,background-color] duration-150 ease-out hover:bg-destructive/30 active:scale-90 disabled:opacity-50 motion-reduce:active:scale-100"
        >
          <ThumbsDown size={14} fill="currentColor" />
          {noVotesCount}
        </button>
      </div>

      <div
        className="flex items-center justify-center gap-1.5 border-t border-white/15 pt-1.5 font-semibold text-white/90"
        aria-label={`${t('vote.net_score')}: ${netScore >= 0 ? '+' : ''}${netScore}`}
      >
        <ChartNoAxesCombined size={18} aria-hidden="true" />
        <span className="tabular-nums" aria-hidden="true">
          {netScore >= 0 ? '+' : ''}
          {netScore}
        </span>
      </div>
    </div>
  )
}
