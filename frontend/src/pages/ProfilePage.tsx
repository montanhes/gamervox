import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { useAuth } from '@/hooks/useAuth'
import { MyGamesList } from '@/components/MyGamesList'
import type { User } from '@/api/auth'

function ProfileForm({ user }: { user: User }) {
  const { t } = useTranslation()
  const { updateProfile, isUpdatingProfile } = useAuth()

  const [name, setName] = useState(user.name)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaved(false)

    try {
      await updateProfile(name)
      setSaved(true)
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.errors?.name?.[0]) {
        setError(err.response.data.errors.name[0])
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
