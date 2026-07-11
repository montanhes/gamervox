import { useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { useTranslation } from 'react-i18next'
import { ImagePlus } from 'lucide-react'

// Mesma proporção dos cards do feed.
const ASPECT = 220 / 295
const OUTPUT_MAX_WIDTH = 880

async function cropToFile(src: string, area: Area): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = src
  })

  const scale = Math.min(1, OUTPUT_MAX_WIDTH / area.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(area.width * scale)
  canvas.height = Math.round(area.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('crop failed'))),
      'image/webp',
      0.9,
    )
  })
  return new File([blob], 'cover.webp', { type: 'image/webp' })
}

export function ImageCropInput({
  onChange,
  initialFile,
}: {
  onChange: (file: File | null) => void
  // Capa vinda do autofill; o componente deve ser remontado (key) quando mudar.
  initialFile?: File | null
}) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [source, setSource] = useState<string | null>(() =>
    initialFile ? URL.createObjectURL(initialFile) : null,
  )
  const [preview, setPreview] = useState<string | null>(null)
  const [cropping, setCropping] = useState(!!initialFile)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [areaPixels, setAreaPixels] = useState<Area | null>(null)

  function handleFile(file: File | null) {
    if (!file) return
    if (source) URL.revokeObjectURL(source)
    setSource(URL.createObjectURL(file))
    setCropping(true)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  async function confirmCrop() {
    if (!source || !areaPixels) return
    const file = await cropToFile(source, areaPixels)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setCropping(false)
    onChange(file)
  }

  function cancelCrop() {
    setCropping(false)
    if (!preview) {
      if (source) URL.revokeObjectURL(source)
      setSource(null)
      onChange(null)
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          handleFile(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
        className="sr-only"
      />

      {cropping && source ? (
        <div className="space-y-3 rounded-surface border border-border-strong bg-background p-3">
          <div className="relative h-80 overflow-hidden rounded-control">
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setAreaPixels(pixels)}
            />
          </div>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            {t('form.zoom')}
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[var(--primary)]"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmCrop}
              className="flex-1 rounded-control bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              {t('form.crop_confirm')}
            </button>
            <button
              type="button"
              onClick={cancelCrop}
              className="rounded-control border border-border-strong px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {t('form.cancel')}
            </button>
          </div>
        </div>
      ) : preview ? (
        <div className="flex items-start gap-4">
          <img
            src={preview}
            alt=""
            className="aspect-[220/295] w-32 rounded-surface border border-border object-cover"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setCropping(true)}
              className="rounded-control border border-border-strong px-3 py-1.5 text-sm text-foreground transition-colors hover:border-foreground"
            >
              {t('form.image_recrop')}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-control border border-border-strong px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {t('form.image_change')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-surface border border-dashed border-border-strong bg-background px-4 py-8 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <ImagePlus size={28} aria-hidden="true" />
          <span className="text-sm font-medium">{t('form.image_pick')}</span>
          <span className="text-xs">{t('form.image_hint')}</span>
        </button>
      )}
    </div>
  )
}
