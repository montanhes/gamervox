import { useTranslation } from 'react-i18next'
import { MyGamesList } from '@/components/MyGamesList'

export function MyGamesPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-primary">{t('nav.my_games')}</h1>
      <MyGamesList />
    </div>
  )
}
