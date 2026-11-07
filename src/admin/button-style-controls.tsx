import type { ButtonStyle } from '../cms/style-tokens'
import { adminCopy } from './admin-copy'
import ColorField from './color-field'
import SizePresetControls from './size-preset-controls'

type ButtonStyleControlsProps = {
  value: ButtonStyle
  onChange: (next: ButtonStyle) => void
}

export default function ButtonStyleControls({
  value,
  onChange,
}: ButtonStyleControlsProps) {
  const copy = adminCopy.dashboard
  return (
    <div className="admin-style-stack">
      <SizePresetControls
        label={copy.buttonSize}
        value={value.size}
        onChange={(size) => onChange({ ...value, size })}
      />
      <SizePresetControls
        label={copy.buttonTextSize}
        value={value.textSize}
        onChange={(textSize) => onChange({ ...value, textSize })}
      />
      <ColorField
        label={copy.textColor}
        value={value.color}
        onChange={(color) => onChange({ ...value, color })}
      />
      <ColorField
        label={copy.buttonBg}
        value={value.background}
        onChange={(background) => onChange({ ...value, background })}
      />
      <ColorField
        label={copy.buttonBorder}
        value={value.borderColor}
        onChange={(borderColor) => onChange({ ...value, borderColor })}
      />
    </div>
  )
}
