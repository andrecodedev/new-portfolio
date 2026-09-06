import { highlightAccents } from '../data/site'

export function AccentedText({
  body,
  accents,
}: {
  body: string
  accents: readonly string[]
}) {
  return (
    <>
      {highlightAccents(body, accents).map((part) =>
        part.accent ? (
          <strong key={part.key} className="accent-text">
            {part.text}
          </strong>
        ) : (
          <span key={part.key}>{part.text}</span>
        ),
      )}
    </>
  )
}
