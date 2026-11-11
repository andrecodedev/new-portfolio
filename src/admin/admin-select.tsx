import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { ChevronRightIcon } from './icons'

export type AdminSelectOption<T extends string = string> = {
  id: T
  label: string
  description?: string
  icon?: ReactNode
  /** Ex.: preview da fonte no label */
  previewStyle?: CSSProperties
}

type AdminSelectProps<T extends string> = {
  label?: string
  value: T
  options: AdminSelectOption<T>[]
  onChange: (next: T) => void
  placeholder?: string
}

export default function AdminSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Escolher',
}: AdminSelectProps<T>) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selected = options.find((item) => item.id === value)
  const display = selected?.label ?? placeholder

  useEffect(() => {
    if (!open) return

    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="admin__field admin-select" ref={rootRef}>
      {label ? <span className="admin__label">{label}</span> : null}
      <button
        type="button"
        className={`admin-select__trigger${open ? ' admin-select__trigger--open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="admin-select__value">
          {selected?.icon ? (
            <span className="admin-select__icon" aria-hidden="true">
              {selected.icon}
            </span>
          ) : null}
          <span className="admin-select__text" style={selected?.previewStyle}>
            {display}
          </span>
        </span>
        <span className="admin-select__chevron" aria-hidden="true">
          <ChevronRightIcon />
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          className="admin-select__list"
          role="listbox"
          aria-label={label ?? placeholder}
        >
          {options.map((option) => {
            const on = option.id === value
            return (
              <li key={option.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  className={`admin-select__option${on ? ' admin-select__option--on' : ''}`}
                  onClick={() => {
                    onChange(option.id)
                    setOpen(false)
                  }}
                >
                  {option.icon ? (
                    <span className="admin-select__icon" aria-hidden="true">
                      {option.icon}
                    </span>
                  ) : null}
                  <span className="admin-select__option-copy">
                    <span
                      className="admin-select__option-label"
                      style={option.previewStyle}
                    >
                      {option.label}
                    </span>
                    {option.description ? (
                      <em className="admin-select__option-desc">
                        {option.description}
                      </em>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
