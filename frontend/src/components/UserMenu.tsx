import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import type { User } from '@/api/auth'

export function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-2 transition-colors hover:border-border-strong"
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 w-48 rounded-surface border border-border bg-surface p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          <p className="truncate px-3 py-2 text-sm font-medium text-foreground">{user.name}</p>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-control px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            {t('nav.profile')}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="block w-full rounded-control px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
