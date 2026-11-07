import { useEffect, useRef, useState } from 'react'

type EditableTitleProps = {
  value: string
  fallback: string
  onChange: (next: string) => void
}

export default function EditableTitle({
  value,
  fallback,
  onChange,
}: EditableTitleProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) return
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.select()
  }, [editing])

  function startEdit() {
    setDraft(value.trim() || fallback)
    setEditing(true)
  }

  function commit() {
    const next = draft.trim()
    onChange(next === fallback ? '' : next)
    setEditing(false)
  }

  function cancel() {
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="admin__title-input"
        type="text"
        value={draft}
        aria-label={fallback}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            cancel()
          }
        }}
      />
    )
  }

  return (
    <button
      className="admin__title-edit"
      type="button"
      onClick={startEdit}
      title="Clique para editar o nome"
    >
      <h2>{value.trim() || fallback}</h2>
    </button>
  )
}
