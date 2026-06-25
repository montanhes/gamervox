import { useState } from 'react'
import { Link, Route, Routes, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { useAuth } from '@/hooks/useAuth'
import { useGamesInfinite } from '@/hooks/useGamesInfinite'
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

function HomePage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTag = searchParams.get('tag')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGamesInfinite(
    search,
    activeTag ? [activeTag] : [],
  )

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
  })

  const games = data?.pages.flatMap((page) => page.data) ?? []

  return (
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
  )
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/new" element={<SubmitGamePage />} />
        <Route path="/games/:slug" element={<GameDetailPage />} />
        <Route path="/me/games" element={<MyGamesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
    </>
  )
}

export default App
