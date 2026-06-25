import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { socialLoginUrl } from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import { DiscordIcon, GoogleIcon, SteamIcon } from '@/components/SocialIcons'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, register, loginError, registerError } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const error = mode === 'login' ? loginError : registerError

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (mode === 'login') {
      await login({ email, password })
    } else {
      await register({ name, email, password, password_confirmation: passwordConfirmation })
    }

    navigate('/')
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 rounded-surface border border-border bg-surface p-6">
        <h1 className="text-2xl font-bold tracking-tight text-primary">{t('app.name')}</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder={t('auth.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
            />
          )}
          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
          />
          <input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
          />
          {mode === 'register' && (
            <input
              type="password"
              placeholder={t('auth.password_confirmation')}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="w-full rounded-control border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
            />
          )}

          {error && <p className="text-sm text-destructive">{error.message}</p>}

          <button
            type="submit"
            className="w-full rounded-control bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {mode === 'login' ? t('nav.login') : t('auth.register')}
          </button>
        </form>

        <div className="space-y-2">
          <a
            href={socialLoginUrl('google')}
            className="flex items-center justify-center gap-2 rounded-control border border-border-strong px-3 py-2 text-center text-sm transition-colors hover:border-foreground"
          >
            <GoogleIcon />
            {t('auth.continue_with_google')}
          </a>
          <a
            href={socialLoginUrl('discord')}
            className="flex items-center justify-center gap-2 rounded-control border border-border-strong px-3 py-2 text-center text-sm transition-colors hover:border-foreground"
          >
            <DiscordIcon />
            {t('auth.continue_with_discord')}
          </a>
          <a
            href={socialLoginUrl('steam')}
            className="flex items-center justify-center gap-2 rounded-control border border-border-strong px-3 py-2 text-center text-sm transition-colors hover:border-foreground"
          >
            <SteamIcon />
            {t('auth.continue_with_steam')}
          </a>
        </div>

        <button
          type="button"
          className="w-full rounded-control border border-border-strong px-3 py-2 text-center text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? t('auth.no_account') : t('auth.have_account')}
        </button>
      </div>
    </div>
  )
}
