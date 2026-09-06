import { useEffect, useState, type ChangeEvent } from 'react'
import { uploadPublicMedia } from '../cms/upload-image'
import { adminCopy } from './admin-copy'
import ConfirmDialog from './confirm-dialog'

type GalleryFieldProps = {
  urls: string[]
  onChange: (urls: string[]) => void
  max?: number
  accept?: string
  folder?: string
  kind?: 'image' | 'video'
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}

export default function GalleryField({
  urls,
  onChange,
  max = 1,
  accept = 'image/png,image/jpeg,image/webp,image/gif,image/avif',
  folder = 'hero',
  kind = 'image',
}: GalleryFieldProps) {
  const copy = adminCopy.dashboard
  const isVideo = kind === 'video'
  const title = isVideo ? copy.galleryVideoTitle : copy.galleryTitle
  const full = isVideo ? copy.galleryVideoFull : copy.galleryFull
  const empty = isVideo ? copy.galleryVideoEmpty : copy.galleryEmpty
  const cta = isVideo ? copy.uploadVideoCta : copy.uploadCta
  const hint = isVideo ? copy.uploadVideoHint : copy.uploadHint
  const [urlInput, setUrlInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)
  const limited = urls.slice(0, max)
  const atLimit = limited.length >= max

  useEffect(() => {
    if (urls.length > max) {
      onChange(urls.slice(0, max))
    }
  }, [max, onChange, urls])

  const addUrl = (url: string) => {
    const next = url.trim()
    if (!next) return
    if (limited.includes(next) || atLimit) return
    onChange([...limited, next].slice(0, max))
  }

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || atLimit) return

    setLoading(true)
    setError(null)
    try {
      const publicUrl = await uploadPublicMedia(file, folder)
      addUrl(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.uploadError)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUrl = () => {
    addUrl(urlInput)
    setUrlInput('')
  }

  return (
    <div className="admin__gallery">
      <span className="admin__label">{title}</span>
      <p className="admin__drop-hint">{copy.mediaRecommend}</p>

      {atLimit ? (
        <p className="admin__gallery-empty">{full}</p>
      ) : (
        <>
          <label className={`admin__drop${loading ? ' admin__drop--busy' : ''}`}>
            <input
              type="file"
              accept={accept}
              disabled={loading}
              onChange={(event) => {
                void handleUpload(event)
              }}
            />
            <span className="admin__drop-title">
              {loading ? copy.uploading : cta}
            </span>
            <span className="admin__drop-hint">{hint}</span>
          </label>

          {error ? <p className="admin__error">{error}</p> : null}

          <div className="admin__or">
            <span>{copy.orUrl}</span>
          </div>

          <div className="admin__url-row">
            <input
              className="admin__input"
              type="url"
              value={urlInput}
              placeholder={copy.urlPlaceholder}
              onChange={(event) => setUrlInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleAddUrl()
                }
              }}
            />
            <button
              className="admin__btn admin__btn--solid"
              type="button"
              disabled={!urlInput.trim()}
              onClick={handleAddUrl}
            >
              {copy.addUrl}
            </button>
          </div>
        </>
      )}

      {limited.length === 0 ? (
        <p className="admin__gallery-empty">{empty}</p>
      ) : (
        <ul className="admin__thumbs">
          {limited.map((url, index) => (
            <li key={`${url}-${index}`} className="admin__thumb">
              <span className="admin__thumb-frame">
                {isVideo || isVideoUrl(url) ? (
                  <video src={url} muted playsInline preload="metadata" />
                ) : (
                  <img
                    src={url}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.opacity = '0.3'
                    }}
                  />
                )}
              </span>
              <div className="admin__thumb-actions">
                {max > 1 && index === 0 ? (
                  <span className="admin__thumb-badge">{copy.featured}</span>
                ) : null}
                {max > 1 && index > 0 ? (
                  <button
                    type="button"
                    className="admin__icon-btn"
                    onClick={() => {
                      onChange([
                        url,
                        ...limited.filter((_, itemIndex) => itemIndex !== index),
                      ])
                    }}
                  >
                    {copy.useFeatured}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="admin__icon-btn admin__icon-btn--danger"
                  onClick={() => setPendingIndex(index)}
                >
                  {copy.removeBlock}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pendingIndex !== null ? (
        <ConfirmDialog
          title={isVideo ? copy.removeVideoTitle : copy.removeImageTitle}
          description={copy.removeMediaDesc}
          confirmLabel={copy.confirmRemove}
          onCancel={() => setPendingIndex(null)}
          onConfirm={() => {
            onChange(
              limited.filter((_, itemIndex) => itemIndex !== pendingIndex),
            )
            setPendingIndex(null)
          }}
        />
      ) : null}
    </div>
  )
}
