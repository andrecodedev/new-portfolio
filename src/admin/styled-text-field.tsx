import type { TextStyle } from '../cms/style-tokens'
import { defaultTextStyle } from '../cms/style-tokens'
import TextStyleControls from './text-style-controls'

type StyledTextFieldProps = {
  label: string
  value: string
  onChange: (next: string) => void
  textStyle?: TextStyle
  onTextStyle?: (next: TextStyle) => void
  multiline?: boolean
  rows?: number
  type?: string
  placeholder?: string
}

/** Campo de texto do CMS: sempre com tamanho + cor. */
export default function StyledTextField({
  label,
  value,
  onChange,
  textStyle,
  onTextStyle,
  multiline = false,
  rows = 3,
  type = 'text',
  placeholder,
}: StyledTextFieldProps) {
  const style = textStyle ?? defaultTextStyle()
  return (
    <div className="admin__field">
      <span className="admin__label">{label}</span>
      {multiline ? (
        <textarea
          className="admin__textarea"
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="admin__input"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {onTextStyle ? (
        <TextStyleControls value={style} onChange={onTextStyle} />
      ) : null}
    </div>
  )
}
