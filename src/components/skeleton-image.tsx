import { useEffect, useState } from 'react'

type SkeletonImageProps = {
  src: string
  alt?: string
  className?: string
  frameClassName?: string
}

/**
 * Mostra um shimmer no slot da mídia até a imagem carregar
 * (útil em rede lenta / celular fraco).
 */
export function SkeletonImage({
  src,
  alt = '',
  className = '',
  frameClassName = '',
}: SkeletonImageProps) {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setReady(false)
    setFailed(false)
  }, [src])

  const frameClass = [
    'media-skel',
    ready ? 'media-skel--ready' : '',
    failed ? 'media-skel--failed' : '',
    frameClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={frameClass}>
      {!ready && !failed ? (
        <span className="media-skel__pulse" aria-hidden="true" />
      ) : null}
      <img
        className={`media-skel__img${className ? ` ${className}` : ''}`}
        src={src}
        alt={alt}
        draggable={false}
        onLoad={() => setReady(true)}
        onError={() => setFailed(true)}
        ref={(node) => {
          if (!node) return
          if (node.complete && node.naturalWidth > 0) setReady(true)
        }}
      />
    </span>
  )
}
