import type { TextStyle } from '../cms/style-tokens'
import { adminCopy } from './admin-copy'
import ColorField from './color-field'
import SizePresetControls from './size-preset-controls'

type TextStyleControlsProps = {
  value: TextStyle
  onChange: (next: TextStyle) => void
}

export default function TextStyleControls({
  value,
  onChange,
}: TextStyleControlsProps) {
  const copy = adminCopy.dashboard
  return (
    <div className="admin-style-row">
      <SizePresetControls
        label={copy.textSize}
        value={value.size}
        onChange={(size) => onChange({ ...value, size })}
      />
      <ColorField
        label={copy.textColor}
        value={value.color}
        onChange={(color) => onChange({ ...value, color })}
      />
    </div>
  )
}
