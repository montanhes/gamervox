import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGamesInfinite } from '@/hooks/useGamesInfinite'
import {
  HeroBackdrop,
  HeroCollage,
  HeroCrossfade,
  type HeroVariant,
} from '@/components/HeroShowcase'
import { HeroVariantSwitcher } from '@/components/HeroVariantSwitcher'
import { DiscordIcon, InstagramIcon, XIcon, YoutubeIcon } from '@/components/SocialIcons'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { LoginPage } from '@/pages/LoginPage'
import { SubmitGamePage } from '@/pages/SubmitGamePage'
import { GameDetailPage } from '@/pages/GameDetailPage'
import { MyGamesPage } from '@/pages/MyGamesPage'
import { GameCard } from '@/components/GameCard'
import { SearchBar } from '@/components/SearchBar'
import { UserMenu } from '@/components/UserMenu'
import { ProfilePage } from '@/pages/ProfilePage'

function Header() {
  const { t } = useTranslation()
  const { user, isLoading, logout } = useAuth()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4">
      <Link to="/" className="text-xl font-bold text-primary">
        {t('app.name')}
      </Link>

      {!isLoading && (
        <nav className="flex flex-wrap items-center gap-5 text-sm">
          {user ? (
            <>
              <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
                {t('nav.home')}
              </Link>
              <Link to="/games/new" className="text-muted-foreground transition-colors hover:text-foreground">
                {t('nav.submit_game')}
              </Link>
              <Link to="/me/games" className="text-muted-foreground transition-colors hover:text-foreground">
                {t('nav.my_games')}
              </Link>
              <UserMenu user={user} onLogout={() => logout()} />
            </>
          ) : (
            <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">
              {t('nav.login')}
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}

// Trocar pelos perfis reais do Gamervox quando existirem.
const FOOTER_SOCIALS = [
  { label: 'Discord', url: 'https://discord.com', Icon: DiscordIcon },
  { label: 'X', url: 'https://x.com', Icon: XIcon },
  { label: 'Instagram', url: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'YouTube', url: 'https://youtube.com', Icon: YoutubeIcon },
]

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Link to="/" className="text-lg font-bold text-primary">
            {t('app.name')}
          </Link>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('app.tagline')}</p>
        </div>

        <div className="flex items-center gap-1">
          {FOOTER_SOCIALS.map(({ label, url, Icon }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-6 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t('app.name')}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}

function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTag = searchParams.get('tag')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGamesInfinite(
    search,
    activeTag ? [activeTag] : [],
  )

  // Query sem filtros: compartilha cache com o feed inicial e mantém o banner
  // estável enquanto o usuário busca/filtra.
  const { data: heroData } = useGamesInfinite('', [])
  const heroGames = useMemo(
    () => (heroData?.pages[0]?.data ?? []).filter((game) => game.image_url).slice(0, 6),
    [heroData],
  )

  const [heroVariant, setHeroVariant] = useState<HeroVariant>(() => {
    const saved = localStorage.getItem('hero-variant')
    return saved === 'crossfade' || saved === 'collage' || saved === 'backdrop'
      ? saved
      : 'crossfade'
  })

  const changeHeroVariant = (variant: HeroVariant) => {
    localStorage.setItem('hero-variant', variant)
    setHeroVariant(variant)
  }

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
  })

  const games = data?.pages.flatMap((page) => page.data) ?? []

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        {heroVariant === 'backdrop' && <HeroBackdrop games={heroGames} />}
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {t('home.eyebrow')}
            </p>
            <h1 className="mt-3 max-w-2xl text-5xl font-bold tracking-tighter text-foreground sm:text-6xl">
              {t('app.tagline')}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              {t('home.subtitle')}
            </p>
            <div className="mt-8">
              <Link
                to={user ? '/games/new' : '/login'}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-primary-hover active:scale-95 motion-reduce:active:scale-100"
              >
                {user ? t('home.cta_submit') : t('home.cta_login')}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {heroVariant !== 'backdrop' && heroGames.length > 0 && (
            <div className="hidden lg:block">
              {heroVariant === 'crossfade' ? (
                <HeroCrossfade games={heroGames} />
              ) : (
                <HeroCollage games={heroGames} />
              )}
            </div>
          )}
        </div>
      </section>

      <HeroVariantSwitcher variant={heroVariant} onChange={changeHeroVariant} />

      <div className="mx-auto max-w-7xl space-y-4 p-6">
        <SearchBar onSearch={setSearch} />

        {activeTag && (
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="rounded-lg border border-primary bg-transparent px-1.5 py-0.5 text-xs text-foreground transition-colors hover:border-primary-hover"
          >
            #{activeTag} ×
          </button>
        )}

        {isLoading && <p className="text-muted-foreground">{t('game.loading')}</p>}
        {!isLoading && games.length === 0 && <p className="text-muted-foreground">{t('game.empty')}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        <div ref={ref} className="h-1" />
        {isFetchingNextPage && <p className="text-center text-muted-foreground">{t('game.loading')}</p>}
      </div>
    </>
  )
}

function LocaleSync() {
  const { i18n } = useTranslation()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.locale && user.locale !== (i18n.resolvedLanguage ?? i18n.language)) {
      i18n.changeLanguage(user.locale)
    }
  }, [user?.locale, i18n])

  return null
}

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <LocaleSync />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games/new" element={<SubmitGamePage />} />
          <Route path="/games/:slug" element={<GameDetailPage />} />
          <Route path="/me/games" element={<MyGamesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
