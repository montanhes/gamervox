import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedCallback } from 'use-debounce'
import { Search } from 'lucide-react'

export function SearchBar({ onSearch }: { onSearch: (value: string) => void }) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')

  const debouncedSearch = useDebouncedCallback(onSearch, 400)

  useEffect(() => {
    debouncedSearch(value)
  }, [value, debouncedSearch])

  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
        <Search size={16} className="text-muted-foreground" />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('nav.search_placeholder')}
        className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none"
      />
    </div>
  )
}
