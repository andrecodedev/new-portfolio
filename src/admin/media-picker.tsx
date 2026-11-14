import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import {
  defaultMediaLibrary,
  fetchMediaLibrary,
  uploadToMediaLibrary,
  type MediaAsset,
  type MediaLibraryPayload,
} from '../cms/media-library'
import { adminCopy } from './admin-copy'

type MediaPickerFieldProps = {
  label?: string
  urls: string[]
  onChange: (urls: string[]) => void
  max?: number
  folder?: string
  kind?: 'image' | 'video'
  recommend?: string
}

const PAGE_SIZE = 24

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}

export default function MediaPickerField({
  label,
  urls,
  onChange,
  max = 1,
  folder = 'library',
  kind = 'image',
  recommend,
}: MediaPickerFieldProps) {
  const copy = adminCopy.dashboard
  const [open, setOpen] = useState(false)
  const [library, setLibrary] = useState<MediaLibraryPayload>(defaultMediaLibrary)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const limited = urls.slice(0, max)
  const atLimit = limited.length >= max

  useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      const payload = await fetchMediaLibrary()
      if (!cancelled) setLibrary(payload)
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const items = library.items.filter((item) => {
      const video = isVideoUrl(item.url)
      if (kind === 'image' && video) return false
      if (kind === 'video' && !video) return false
      if (!q) return true
      return item.name.toLowerCase().includes(q) || item.url.toLowerCase().includes(q)
    })
    return items
  }, [kind, library.items, query])

  const visible = filtered.slice(0, visibleCount)

  const handleUpload = async (file: File | undefined) => {
    if (!file || atLimit) return
    setLoading(true)
    setError(null)
    try {
      const next = await uploadToMediaLibrary(file, library, folder)
      setLibrary(next)
      setSelected(next.items[0]?.url ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.uploadError)
    } finally {
      setLoading(false)
    }
  }

  const onFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    void handleUpload(file)
  }

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    void handleUpload(file)
  }

  const confirmAdd = () => {
    if (!selected || atLimit) return
    if (limited.includes(selected)) {
      setOpen(false)
      return
    }
    onChange([...limited, selected].slice(0, max))
    setOpen(false)
    setSelected(null)
  }

  const title = label || (kind === 'video' ? copy.galleryVideoTitle : copy.galleryTitle)

  return (
    <div className="admin__gallery">
      <span className="admin__label">{title}</span>
      {recommend ? <p className="admin__drop-hint">{recommend}</p> : null}

      <button
        type="button"
        className="admin-media-field"
        onClick={() => {
          setOpen(true)
          setVisibleCount(PAGE_SIZE)
          setQuery('')
          setSelected(null)
          setError(null)
        }}
      >
        {limited[0] ? (
          <span className="admin-media-field__preview">
            {kind === 'video' || isVideoUrl(limited[0]) ? (
              <video src={limited[0]} muted playsInline preload="metadata" />
            ) : (
              <img src={limited[0]} alt="" />
            )}
          </span>
        ) : (
          <span className="admin-media-field__empty" aria-hidden="true">
            ▭
          </span>
        )}
        <span className="admin-media-field__camera" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
            <path
              d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.2-1.6A1.5 1.5 0 0 1 10.9 4h2.2a1.5 1.5 0 0 1 1.2.4L15.5 6h2A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-7Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      </button>

      {limited.length > 0 ? (
        <div className="admin__thumb-actions" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="admin__icon-btn admin__icon-btn--danger"
            onClick={() => onChange([])}
          >
            {copy.removeBlock}
          </button>
        </div>
      ) : (
        <p className="admin__gallery-empty">
          {kind === 'video' ? copy.galleryVideoEmpty : copy.galleryEmpty}
        </p>
      )}

      {open ? (
        <div className="admin__modal">
          <div
            className="admin__dialog admin-media-modal"
            role="dialog"
            aria-modal="true"
            aria-label={copy.mediaSelectTitle}
          >
            <div className="admin-media-modal__head">
              <h2>{copy.mediaSelectTitle}</h2>
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => setOpen(false)}
              >
                {copy.closeInspector}
              </button>
            </div>

            <label
              className={`admin-media-modal__drop${loading ? ' admin__drop--busy' : ''}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDrop}
            >
              <input
                type="file"
                accept={
                  kind === 'video'
                    ? 'video/mp4,video/webm'
                    : 'image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml'
                }
                disabled={loading}
                onChange={onFileInput}
              />
              <span className="admin__drop-title">
                {loading ? copy.uploading : copy.mediaDropCta}
              </span>
              <span className="admin__drop-hint">
                {kind === 'video' ? copy.uploadVideoHint : copy.mediaDropHint}
              </span>
            </label>

            {error ? <p className="admin__error">{error}</p> : null}

            <input
              className="admin__input admin-media-modal__search"
              type="search"
              value={query}
              placeholder={copy.mediaSearch}
              onChange={(event) => {
                setQuery(event.target.value)
                setVisibleCount(PAGE_SIZE)
              }}
            />

            <div className="admin-media-modal__grid">
              {visible.map((item: MediaAsset) => (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-media-modal__item${
                    selected === item.url ? ' admin-media-modal__item--on' : ''
                  }`}
                  onClick={() => setSelected(item.url)}
                >
                  <span className="admin-media-modal__thumb">
                    {isVideoUrl(item.url) ? (
                      <video src={item.url} muted playsInline preload="metadata" />
                    ) : (
                      <img src={item.url} alt="" />
                    )}
                  </span>
                  <span className="admin-media-modal__name">{item.name}</span>
                </button>
              ))}
              {visible.length === 0 ? (
                <p className="admin__gallery-empty">{copy.mediaEmpty}</p>
              ) : null}
            </div>

            {visibleCount < filtered.length ? (
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                {copy.mediaLoadMore}
              </button>
            ) : null}

            <div className="admin__dialog-actions">
              <button
                type="button"
                className="admin__btn admin__btn--ghost"
                onClick={() => setOpen(false)}
              >
                {copy.cancel}
              </button>
              <button
                type="button"
                className="admin__btn admin__btn--solid"
                disabled={!selected || atLimit}
                onClick={confirmAdd}
              >
                {copy.mediaAdd}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
