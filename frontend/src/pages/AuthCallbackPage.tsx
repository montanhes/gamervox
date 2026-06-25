import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchMe } from '@/api/auth'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) return

    fetchMe().then((user) => {
      queryClient.setQueryData(['me'], user)
      navigate('/', { replace: true })
    })
  }, [error, navigate, queryClient])

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-destructive">{t('auth.social_login_failed')}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground">{t('auth.signing_in')}</p>
    </div>
  )
}
