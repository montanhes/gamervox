import { useTranslation } from 'react-i18next'

const STATUS_CLASSES: Record<string, string> = {
  pending: 'border-border-strong text-muted-foreground',
  approved: 'border-success text-success',
  rejected: 'border-destructive text-destructive',
}

export function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const { t } = useTranslation()

  return (
    <span className={`inline-block rounded-control border bg-surface px-2.5 py-1 text-xs font-semibold tracking-wide ${STATUS_CLASSES[status]}`}>
      {t(`status.${status}`)}
    </span>
  )
}
