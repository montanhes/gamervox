import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { useAuth } from '@/hooks/useAuth'
import { MyGamesList } from '@/components/MyGamesList'
import type { User } from '@/api/auth'

function LanguageSelect({ user }: { user: User }) {
  const { t, i18n } = useTranslation()
  const { updateProfile } = useAuth()

  async function handleChange(locale: string) {
    i18n.changeLanguage(locale)
    await updateProfile({ name: user.name, locale })
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor="language" className="text-sm font-medium">
        {t('profile.language_label')}
      </label>
      <select
        id="language"
        value={i18n.resolvedLanguage ?? i18n.language}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
      >
        <option value="pt-BR">Português (Brasil)</option>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="ru">Русский</option>
        <option value="ja">日本語</option>
        <option value="ko">한국어</option>
        <option value="zh-CN">简体中文</option>
      </select>
    </div>
  )
}

function ProfileForm({ user }: { user: User }) {
  const { t, i18n } = useTranslation()
  const { updateProfile, isUpdatingProfile } = useAuth()

  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaved(false)

    try {
      await updateProfile({ name, username, locale: i18n.resolvedLanguage ?? i18n.language })
      setSaved(true)
    } catch (err) {
      const errors = isAxiosError(err) ? err.response?.data?.errors : null
      if (errors?.username?.[0]) {
        setError(errors.username[0])
      } else if (errors?.name?.[0]) {
        setError(errors.name[0])
      } else {
        setError(t('comments.error'))
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.name} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <LanguageSelect user={user} />

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            {t('profile.name_label')}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="username" className="text-sm font-medium">
            {t('profile.username_label')}
          </label>
          <div className="flex items-center overflow-hidden rounded-control border border-border-strong bg-background transition-colors focus-within:border-primary">
            <span className="pl-3 text-sm text-muted-foreground">@</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9_-]+"
              className="w-full bg-transparent px-1.5 py-2 text-sm text-foreground focus:outline-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">{t('profile.username_hint')}</p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && <p className="text-sm text-success">{t('profile.saved')}</p>}

        <button
          type="submit"
          disabled={isUpdatingProfile}
          className="rounded-control bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {t('profile.save')}
        </button>
      </form>
    </div>
  )
}

function ProfileTabs({ user }: { user: User }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'data' | 'games'>('data')

  return (
    <div className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-primary">{t('profile.title')}</h1>

      <div role="tablist" className="flex gap-1 border-b border-border">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'data'}
          onClick={() => setTab('data')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'data' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('profile.tab_data')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'games'}
          onClick={() => setTab('games')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'games' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('nav.my_games')}
        </button>
      </div>

      {tab === 'data' ? <ProfileForm key={user.id} user={user} /> : <MyGamesList />}
    </div>
  )
}

export function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return <ProfileTabs user={user} />
}
