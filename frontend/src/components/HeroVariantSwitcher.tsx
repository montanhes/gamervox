// Seletor temporário para escolher o estilo do banner do hero.
// Remover este arquivo (e o uso em App.tsx) depois que a variante for escolhida.
import { type HeroVariant } from '@/components/HeroShowcase'

const HERO_VARIANTS: { value: HeroVariant; label: string }[] = [
  { value: 'crossfade', label: 'Crossfade' },
  { value: 'collage', label: 'Colagem' },
  { value: 'backdrop', label: 'Fundo' },
]

export function HeroVariantSwitcher({
  variant,
  onChange,
}: {
  variant: HeroVariant
  onChange: (variant: HeroVariant) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-surface border border-border-strong bg-surface p-1.5 shadow-card-hover">
      <span className="px-2 text-xs text-muted-foreground">Banner:</span>
      {HERO_VARIANTS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-control px-3 py-1.5 text-xs font-semibold transition-colors ${
            option.value === variant
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
