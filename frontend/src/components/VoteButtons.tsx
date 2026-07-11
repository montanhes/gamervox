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
  size = 'sm',
}: {
  slug: string
  yesVotesCount: number
  noVotesCount: number
  netScore: number
  leading?: ReactNode
  size?: 'sm' | 'lg'
}) {
  const { t } = useTranslation()
  const { vote, isVoting } = useVote(slug)

  const lg = size === 'lg'
  const buttonBase = `inline-flex flex-1 items-center justify-center font-semibold transition-[transform,background-color] duration-150 ease-out active:scale-90 disabled:opacity-50 motion-reduce:active:scale-100 ${
    lg ? 'h-11 gap-2 rounded-lg px-4 text-sm' : 'h-9 gap-1.5 rounded-lg px-3'
  }`

  return (
    <div className={`flex flex-col ${lg ? 'gap-2 text-sm' : 'gap-1.5 text-xs'}`}>
      <div className={`flex items-center ${lg ? 'gap-2' : 'gap-1.5'}`}>
        {leading}

        <button
          type="button"
          disabled={isVoting}
          onClick={() => vote(1)}
          aria-label={t('vote.yes')}
          className={`${buttonBase} bg-primary/20 text-primary-hover hover:bg-primary/30`}
        >
          <ThumbsUp size={lg ? 16 : 14} fill="currentColor" />
          {yesVotesCount}
        </button>

        <button
          type="button"
          disabled={isVoting}
          onClick={() => vote(-1)}
          aria-label={t('vote.no')}
          className={`${buttonBase} bg-destructive/20 text-destructive hover:bg-destructive/30`}
        >
          <ThumbsDown size={lg ? 16 : 14} fill="currentColor" />
          {noVotesCount}
        </button>
      </div>

      <div
        className={`flex items-center justify-center border-t border-white/15 font-semibold text-white/90 ${
          lg ? 'gap-2 pt-2' : 'gap-1.5 pt-1.5'
        }`}
        aria-label={`${t('vote.net_score')}: ${netScore >= 0 ? '+' : ''}${netScore}`}
      >
        <ChartNoAxesCombined size={lg ? 22 : 18} aria-hidden="true" />
        <span className={`tabular-nums ${lg ? 'text-xl' : ''}`} aria-hidden="true">
          {netScore >= 0 ? '+' : ''}
          {netScore}
        </span>
      </div>
    </div>
  )
}
