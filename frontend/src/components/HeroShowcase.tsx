import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Game } from '@/api/games'

export type HeroVariant = 'crossfade' | 'collage' | 'backdrop'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function useRotation(length: number, intervalMs: number) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [timerKey, setTimerKey] = useState(0)

  useEffect(() => {
    if (reduced || length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % length), intervalMs)
    return () => clearInterval(id)
  }, [length, intervalMs, reduced, timerKey])

  const select = (i: number) => {
    setIndex(i)
    setTimerKey((k) => k + 1)
  }

  return { index: length > 0 ? index % length : 0, select }
}

function Dots({
  games,
  active,
  onSelect,
  tone = 'default',
}: {
  games: Game[]
  active: number[]
  onSelect: (i: number) => void
  tone?: 'default' | 'overlay'
}) {
  if (games.length < 2) return null

  return (
    <div className="flex items-center justify-center">
      {games.map((game, i) => {
        const isActive = active.includes(i)
        return (
          <button
            key={game.id}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={game.title}
            aria-current={isActive}
            className="group flex h-6 items-center px-1.5"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-4 bg-primary'
                  : tone === 'overlay'
                    ? 'w-1.5 bg-white/40 group-hover:bg-white/70'
                    : 'w-1.5 bg-foreground/25 group-hover:bg-foreground/50'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

export function HeroCrossfade({ games }: { games: Game[] }) {
  const { index, select } = useRotation(games.length, 6000)

  if (games.length === 0) return null
  const active = games[index]

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-surface border border-border bg-surface">
        {games.map((game, i) => (
          <img
            key={game.id}
            src={game.image_url ?? undefined}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover [transition:opacity_700ms_ease,transform_7000ms_linear] motion-reduce:[transition:opacity_700ms_ease] ${
              i === index ? 'opacity-100 scale-110 motion-reduce:scale-100' : 'opacity-0 scale-100'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <Link
          to={`/games/${active.slug}`}
          className="absolute inset-0 flex items-end p-5 text-base font-semibold text-white"
        >
          {active.title}
        </Link>
        <div className="absolute bottom-4 right-3 z-10">
          <Dots games={games} active={[index]} onSelect={select} tone="overlay" />
        </div>
      </div>
    </div>
  )
}

const COLLAGE_COLS = 3

export function HeroCollage({ games }: { games: Game[] }) {
  const reduced = usePrefersReducedMotion()
  const n = games.length
  const cols = Math.min(COLLAGE_COLS, n)
  const canRotate = n > cols
  const [base, setBase] = useState(0)
  const [sliding, setSliding] = useState(false)
  const [timerKey, setTimerKey] = useState(0)

  useEffect(() => {
    if (reduced || !canRotate) return
    const id = setInterval(() => setSliding(true), 4000)
    return () => clearInterval(id)
  }, [canRotate, reduced, timerKey])

  const finishSlide = () => {
    setBase((b) => (b + 1) % n)
    setSliding(false)
  }

  const select = (i: number) => {
    setSliding(false)
    setBase(i)
    setTimerKey((k) => k + 1)
  }

  if (cols === 0) return null

  // Um item extra além dos visíveis: é a capa que entra pela direita durante o slide.
  const trackSize = canRotate ? cols + 1 : cols
  const items = Array.from({ length: trackSize }, (_, k) => games[(base + k) % n])
  const visible = Array.from({ length: cols }, (_, k) => (base + k) % n)

  return (
    <div>
      <div className="overflow-hidden py-4">
        <div
          className={`flex ${sliding ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{
            width: `${(trackSize / cols) * 100}%`,
            transform: sliding ? `translateX(-${100 / trackSize}%)` : 'translateX(0)',
          }}
          onTransitionEnd={(e) => {
            // Hover nos cards também dispara transitionend (borbulha da escala);
            // só finaliza o slide quando a transição é da própria track.
            if (e.target === e.currentTarget) finishSlide()
          }}
        >
          {items.map((game) => (
            <div key={game.id} className="min-w-0 flex-1 px-2">
              <Link
                to={`/games/${game.slug}`}
                className="relative block aspect-[220/295] overflow-hidden rounded-surface border border-border bg-surface shadow-card-hover transition-transform duration-300 ease-out hover:scale-[1.03] motion-reduce:hover:scale-100"
              >
                <img
                  src={game.image_url ?? undefined}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <span className="line-clamp-1 text-xs font-semibold text-white">
                    {game.title}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1">
        <Dots games={games} active={visible} onSelect={select} />
      </div>
    </div>
  )
}

export function HeroBackdrop({ games }: { games: Game[] }) {
  const { index, select } = useRotation(games.length, 8000)

  if (games.length === 0) return null

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {games.map((game, i) => (
          <img
            key={game.id}
            src={game.image_url ?? undefined}
            alt=""
            className={`absolute inset-0 h-full w-full scale-110 object-cover blur-sm brightness-[0.8] transition-opacity duration-1000 ${
              i === index ? 'opacity-90' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 via-45% to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-4 z-10">
        <Dots games={games} active={[index]} onSelect={select} tone="overlay" />
      </div>
    </>
  )
}
