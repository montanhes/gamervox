import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'use-debounce'
import { X } from 'lucide-react'
import { fetchTags } from '@/api/games'

const MAX_TAGS = 8
const MAX_TAG_LENGTH = 40

export function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const [debouncedInput] = useDebounce(input.trim(), 300)

  const { data: suggestions = [] } = useQuery({
    queryKey: ['tags', debouncedInput],
    queryFn: () => fetchTags(debouncedInput),
    enabled: focused && debouncedInput.length > 0,
    staleTime: 60_000,
  })

  const normalized = tags.map((tag) => tag.toLowerCase())
  const visibleSuggestions = suggestions
    .filter((suggestion) => !normalized.includes(suggestion.name.toLowerCase()))
    .slice(0, 6)

  function addTag(raw: string) {
    const tag = raw.trim().replace(/,/g, '').slice(0, MAX_TAG_LENGTH)
    if (!tag || tags.length >= MAX_TAGS || normalized.includes(tag.toLowerCase())) return
    onChange([...tags, tag])
    setInput('')
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(input)
    } else if (event.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className="relative">
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 rounded-control border border-border-strong bg-background px-2 py-1.5 transition-colors focus-within:border-primary"
      >
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-control border border-primary bg-primary/10 px-2 py-0.5 text-xs text-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              aria-label={`${t('form.remove')} ${tag}`}
              className="rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {tags.length < MAX_TAGS && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false)
              addTag(input)
            }}
            placeholder={tags.length === 0 ? t('form.tag_placeholder') : ''}
            className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {t('form.tags_hint', { max: MAX_TAGS })}
      </p>

      {focused && visibleSuggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-control border border-border-strong bg-surface shadow-card-hover">
          {visibleSuggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                // onMouseDown pra rodar antes do blur do input
                onMouseDown={(e) => {
                  e.preventDefault()
                  addTag(suggestion.name)
                }}
                className="w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-primary/10"
              >
                {suggestion.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
