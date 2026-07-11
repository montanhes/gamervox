import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import type { TFunction } from 'i18next'
import {
  fetchNotifications,
  markNotificationsRead,
  type AppNotification,
} from '@/api/notifications'

function notificationText(notification: AppNotification, t: TFunction) {
  const { kind, title, status, milestone } = notification.data

  if (kind === 'game_moderated') {
    return status === 'approved'
      ? t('notifications.game_approved', { title })
      : t('notifications.game_rejected', { title })
  }

  return t('notifications.milestone', { title, milestone })
}

export function NotificationBell() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 60_000,
  })

  const markRead = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications = data?.data ?? []
  const unread = data?.meta.unread_count ?? 0

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function toggle() {
    setOpen((v) => {
      const next = !v
      if (next && unread > 0) markRead.mutate()
      return next
    })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={t('notifications.title')}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-control text-muted-foreground transition-colors hover:text-foreground"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-surface border border-border-strong bg-surface shadow-card-hover">
          <p className="border-b border-border px-4 py-2.5 text-sm font-semibold">
            {t('notifications.title')}
          </p>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                {t('notifications.empty')}
              </li>
            )}
            {notifications.map((notification) => (
              <li key={notification.id} className="border-b border-border last:border-b-0">
                <Link
                  to={`/games/${notification.data.slug}`}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 text-sm leading-snug transition-colors hover:bg-background ${
                    notification.read_at ? 'text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {notificationText(notification, t)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
